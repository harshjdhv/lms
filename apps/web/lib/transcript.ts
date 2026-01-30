/**
 * Transcript helpers: URL classification, STT job submission, and segment normalizers.
 * Used by /api/reflection/transcript and webhook for captionless (direct media URL) transcription.
 */

export type TranscriptSegment = { start: number; text: string };

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /^([a-zA-Z0-9_-]{11})$/,
];

const DIRECT_MEDIA_EXTENSIONS = /\.(mp4|mp3|m4a|webm|wav|ogg|mpeg)(\?|$)/i;
const BLOB_STORAGE_HOSTS = [
  "blob.vercel-storage.com",
  "s3.amazonaws.com",
  "r2.cloudflarestorage.com",
];

export function extractVideoId(urlOrId: string): string | null {
  if (!urlOrId?.trim()) return null;
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = urlOrId.trim().match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * True if URL looks like a direct media file (e.g. .mp4, .mp3) or known storage host.
 */
export function isDirectMediaUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    const u = new URL(url.trim());
    if (DIRECT_MEDIA_EXTENSIONS.test(u.pathname)) return true;
    const host = u.hostname.toLowerCase();
    if (BLOB_STORAGE_HOSTS.some((h) => host === h || host.endsWith("." + h)))
      return true;
    return false;
  } catch {
    return false;
  }
}

/** Normalize Deepgram callback/response to our segment shape. Deepgram uses seconds for start/end. */
export function normalizeDeepgramSegments(body: {
  results?: {
    channels?: Array<{
      alternatives?: Array<{ transcript?: string; words?: Array<{ word: string; start: number; end: number }> }>;
      utterances?: Array<{ start: number; end: number; transcript: string }>;
    }>;
    utterances?: Array<{ start: number; end: number; transcript: string }>;
  };
}): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const utterances =
    body.results?.channels?.[0]?.utterances ??
    body.results?.utterances ??
    (body.results?.channels?.[0]?.alternatives?.[0] as { words?: Array<{ word: string; start: number; end: number }> } | undefined)?.words
      ? (() => {
          const words = (body.results?.channels?.[0]?.alternatives?.[0] as { words?: Array<{ word: string; start: number; end: number }> })?.words ?? [];
          if (words.length === 0) return [];
          const first = words[0];
          if (!first) return [];
          const out: Array<{ start: number; end: number; transcript: string }> = [];
          let cur = { start: first.start, end: first.end, text: first.word };
          for (let i = 1; i < words.length; i++) {
            const w = words[i];
            if (!w) continue;
            if (w.start - cur.end < 1) {
              cur.end = w.end;
              cur.text += " " + w.word;
            } else {
              out.push({ start: cur.start, end: cur.end, transcript: cur.text });
              cur = { start: w.start, end: w.end, text: w.word };
            }
          }
          out.push({ start: cur.start, end: cur.end, transcript: cur.text });
          return out;
        })()
      : [];

  if (Array.isArray(utterances) && utterances.length > 0) {
    for (const u of utterances) {
      const start = typeof u.start === "number" ? u.start : 0;
      const text = (typeof (u as { transcript?: string }).transcript === "string"
        ? (u as { transcript: string }).transcript
        : (u as { text?: string }).text ?? ""
      ).trim();
      if (text) segments.push({ start, text });
    }
  }

  const alt = body.results?.channels?.[0]?.alternatives?.[0];
  if (segments.length === 0 && alt) {
    const a = alt as { transcript?: string; words?: Array<{ word: string; start: number }> };
    if (a.transcript?.trim()) {
      segments.push({ start: 0, text: a.transcript.trim() });
    } else if (Array.isArray(a.words) && a.words.length > 0) {
      for (const w of a.words) {
        const start = typeof w.start === "number" ? w.start : 0;
        const text = (w as { word?: string }).word ?? "";
        if (text.trim()) segments.push({ start, text: text.trim() });
      }
    }
  }

  return segments.sort((a, b) => a.start - b.start);
}

/** AssemblyAI: start/end are in milliseconds. Prefer utterances, else words aggregated into phrases. */
export function normalizeAssemblyAISegments(body: {
  utterances?: Array<{ start: number; end: number; text: string }>;
  words?: Array<{ start: number; end: number; text: string }>;
  text?: string;
}): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];

  if (Array.isArray(body.utterances) && body.utterances.length > 0) {
    for (const u of body.utterances) {
      const startMs = typeof u.start === "number" ? u.start : 0;
      const start = startMs / 1000;
      const text = (u.text ?? "").trim();
      if (text) segments.push({ start, text });
    }
    return segments.sort((a, b) => a.start - b.start);
  }

  if (Array.isArray(body.words) && body.words.length > 0) {
    const gapMs = 800;
    const w0 = body.words[0];
    if (!w0) return segments;
    let cur = {
      start: w0.start / 1000,
      text: (w0.text ?? "").trim(),
    };
    for (let i = 1; i < body.words.length; i++) {
      const w = body.words[i];
      const prev = body.words[i - 1];
      if (!w || !prev) continue;
      const prevEnd = prev.end;
      if (w.start - prevEnd <= gapMs && cur.text) {
        cur.text += " " + (w.text ?? "").trim();
      } else {
        if (cur.text) segments.push({ ...cur });
        cur = { start: w.start / 1000, text: (w.text ?? "").trim() };
      }
    }
    if (cur.text) segments.push(cur);
    return segments.sort((a, b) => a.start - b.start);
  }

  if (typeof body.text === "string" && body.text.trim()) {
    segments.push({ start: 0, text: body.text.trim() });
  }
  return segments;
}

export type SttProvider = "deepgram" | "assemblyai";

function getSttProvider(): SttProvider | null {
  const provider = process.env.TRANSCRIPT_STT_PROVIDER?.toLowerCase();
  if (provider === "deepgram" && process.env.DEEPGRAM_API_KEY) return "deepgram";
  if (provider === "assemblyai" && process.env.ASSEMBLYAI_API_KEY) return "assemblyai";
  if (process.env.DEEPGRAM_API_KEY) return "deepgram";
  if (process.env.ASSEMBLYAI_API_KEY) return "assemblyai";
  return null;
}

export function getTranscriptWebhookBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return base.replace(/\/$/, "");
}

/**
 * Submit a Deepgram pre-recorded transcription job with callback.
 * Returns request_id (job id) on success.
 */
export async function submitDeepgramJob(
  mediaUrl: string,
  callbackUrl: string,
  _metadata?: { chapterId: string }
): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_API_KEY not configured");

  const params = new URLSearchParams({
    callback: callbackUrl,
    utterances: "true",
    smart_format: "true",
  });

  const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url: mediaUrl }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Deepgram API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { request_id?: string };
  const requestId = data.request_id;
  if (!requestId) throw new Error("Deepgram did not return request_id");
  return requestId;
}

/**
 * Submit an AssemblyAI transcript job with webhook_url.
 * Returns transcript id (job id) on success.
 */
export async function submitAssemblyAIJob(
  mediaUrl: string,
  webhookUrl: string,
  _metadata?: { chapterId: string }
): Promise<string> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error("ASSEMBLYAI_API_KEY not configured");

  const res = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      audio_url: mediaUrl,
      webhook_url: webhookUrl,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AssemblyAI API error: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { id?: string };
  const id = data.id;
  if (!id) throw new Error("AssemblyAI did not return transcript id");
  return id;
}

/**
 * Submit STT job for direct media URL. Uses configured provider (Deepgram or AssemblyAI).
 * Returns { provider, jobId }.
 */
export async function submitSttJob(
  mediaUrl: string,
  chapterId: string
): Promise<{ provider: SttProvider; jobId: string }> {
  const provider = getSttProvider();
  if (!provider) throw new Error("No STT provider configured (set DEEPGRAM_API_KEY or ASSEMBLYAI_API_KEY)");

  const base = getTranscriptWebhookBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_APP_URL or VERCEL_URL required for webhook");

  const webhookUrl = `${base}/api/reflection/transcript/webhook?provider=${provider}&chapterId=${encodeURIComponent(chapterId)}`;

  if (provider === "deepgram") {
    const jobId = await submitDeepgramJob(mediaUrl, webhookUrl, { chapterId });
    return { provider: "deepgram", jobId };
  }
  const jobId = await submitAssemblyAIJob(mediaUrl, webhookUrl, { chapterId });
  return { provider: "assemblyai", jobId };
}

export function isSttConfigured(): boolean {
  return getSttProvider() !== null;
}
