"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { ReflectionModal } from "./ReflectionModal";
import { BatchReflectionModal } from "./BatchReflectionModal";

export type ReflectionPoint = {
  time: number; // seconds
  topic: string;
};

type Props = {
  videoId: string;
  reflectionPoints: ReflectionPoint[];
  studentId: string;
  chapterId?: string | null;
};

export function ReflectionVideoPlayer({
  videoId,
  reflectionPoints,
  studentId,
  chapterId,
}: Props) {
  const [showReflection, setShowReflection] = useState(false);
  const [currentReflection, setCurrentReflection] =
    useState<ReflectionPoint | null>(null);
  const [videoPaused, setVideoPaused] = useState(false);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const containerId = useId().replace(/:/g, "-") || "youtube-player";
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTriggeredRef = useRef<number[]>([]);
  const onReadyFiredRef = useRef(false);
  const videoPausedRef = useRef(false);

  // Debug logging: only update React state for important events (not every state change or tick)
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[ReflectionVideoPlayer] ${timestamp}: ${message}`);
  }, []);

  const handleReflectionPoint = useCallback((reflection: ReflectionPoint) => {
    videoPausedRef.current = true;
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
    setVideoPaused(true);
    setCurrentReflection(reflection);
    setIsBatchMode(false);
    setShowReflection(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const lastPolledTimeRef = useRef<number>(0);

  const startPolling = useCallback(() => {
    addDebugLog("Starting time polling");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initialize lastPolledTime with current player time to avoid false positives on initial load
    if (playerRef.current?.getCurrentTime) {
      lastPolledTimeRef.current = playerRef.current.getCurrentTime();
    }

    intervalRef.current = setInterval(() => {
      if (!playerRef.current?.getCurrentTime) return;
      const currentTime = playerRef.current.getCurrentTime();

      // Use ref to avoid re-renders and stale closure; don't trigger when modal is open or paused
      if (videoPausedRef.current) {
        // Keep updating lastPolledTime even while paused to avoid jumps when resuming
        lastPolledTimeRef.current = currentTime;
        return;
      }

      const previousTime = lastPolledTimeRef.current;

      const nextReflection = reflectionPoints.find((point) => {
        if (lastTriggeredRef.current.includes(point.time)) return false;

        // Case 1: Point is extremely close to current time (normal playback trigger)
        // using a slightly wider window (1s) for safety
        const isClose = Math.abs(currentTime - point.time) < 1.0;

        // Case 2: User skipped over the point (Seek forward detection)
        // We were at 'previousTime', now at 'currentTime', and 'point.time' is in between.
        // Also ensure we are actually moving forward (previousTime < currentTime)
        const isSkippedOver =
          previousTime < currentTime && // Moving forward
          point.time > previousTime &&  // Was ahead of us
          point.time <= currentTime;    // Is now behind us (or equal)

        const shouldTrigger = isClose || isSkippedOver;

        if (shouldTrigger) {
          lastTriggeredRef.current = [...lastTriggeredRef.current, point.time];
        }
        return shouldTrigger;
      });

      lastPolledTimeRef.current = currentTime;

      if (nextReflection) {
        addDebugLog(`🎯 Reflection at ${nextReflection.time}s - "${nextReflection.topic}"`);
        handleReflectionPoint(nextReflection);
      }
    }, 500); // Polling slightly faster for better responsiveness
  }, [reflectionPoints, handleReflectionPoint, addDebugLog]);

  const tryStartPlaybackAndPolling = useCallback(() => {
    if (onReadyFiredRef.current) return;
    onReadyFiredRef.current = true;
    videoPausedRef.current = false;
    addDebugLog("✅ Player ready, starting playback");
    try {
      if (playerRef.current?.playVideo) {
        playerRef.current.playVideo();
      }
      startPolling();
    } catch (error) {
      addDebugLog(`❌ Error starting playback: ${error}`);
    }
  }, [startPolling, addDebugLog]);

  const initializePlayer = useCallback(() => {
    // Container div must exist (YouTube API will create iframe inside it)
    const container = document.getElementById(containerId);
    if (!container) {
      addDebugLog("⚠️ Player container not in DOM, retrying in 100ms...");
      setTimeout(() => {
        if (document.getElementById(containerId)) {
          initializePlayer();
        } else {
          addDebugLog("❌ Container still not available after retry");
        }
      }, 100);
      return;
    }

    if (typeof window === "undefined" || !window.YT?.Player) {
      addDebugLog("⚠️ YouTube API not ready yet");
      return;
    }

    if (playerRef.current) {
      addDebugLog("⚠️ Player already initialized, skipping");
      return;
    }

    onReadyFiredRef.current = false;
    addDebugLog("Creating YouTube player (div container)...");
    try {
      // Pass container ID string so YouTube API creates iframe inside it (onReady fires reliably)
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        events: {
          onReady: (event: any) => {
            addDebugLog("✅ Player onReady fired");
            tryStartPlaybackAndPolling();
          },
          onStateChange: (event: any) => {
            // Ref only — no setState to avoid re-renders and flicker during playback
            if (event.data === window.YT.PlayerState.PLAYING) {
              videoPausedRef.current = false;
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              videoPausedRef.current = true;
            }
          },
          onError: (event: any) => {
            addDebugLog(`❌ Player error: ${event.data}`);
          },
        },
      });
      addDebugLog("Player instance created successfully");

      // Fallback: if onReady doesn't fire within 2.5s (e.g. strict mode / timing), start anyway
      setTimeout(() => {
        if (!onReadyFiredRef.current && playerRef.current) {
          addDebugLog("⚠️ onReady did not fire, using fallback start");
          tryStartPlaybackAndPolling();
        }
      }, 2500);
    } catch (error) {
      addDebugLog(`❌ Error creating player: ${error}`);
    }
  }, [videoId, containerId, addDebugLog, tryStartPlaybackAndPolling]);

  // Initialize YouTube player (run once per videoId)
  useEffect(() => {
    addDebugLog(`Initializing videoId: ${videoId}`);

    let mounted = true;

    const cleanupPlayer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (playerRef.current?.destroy) {
        try {
          playerRef.current.destroy();
        } catch (_) { }
        playerRef.current = null;
      }
      onReadyFiredRef.current = false;
    };

    if (playerRef.current) {
      cleanupPlayer();
    }
    lastTriggeredRef.current = [];

    const handleDevPause = (_event: CustomEvent) => {
      if (!playerRef.current?.pauseVideo || videoPausedRef.current) return;
      videoPausedRef.current = true;
      playerRef.current.pauseVideo();
      setVideoPaused(true);
      setCurrentReflection({
        time: playerRef.current.getCurrentTime?.() ?? 0,
        topic: "Manual Dev Pause - Testing",
      });
      setIsBatchMode(true);
      setShowReflection(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    window.addEventListener("devPauseRequest", handleDevPause as EventListener);

    if (typeof window === "undefined" || !window.YT?.Player) {
      addDebugLog("Loading YouTube API...");
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (existingScript) {
        const checkInterval = setInterval(() => {
          if (mounted && window.YT?.Player) {
            clearInterval(checkInterval);
            setTimeout(() => mounted && initializePlayer(), 100);
          }
        }, 100);
        const t = setTimeout(() => clearInterval(checkInterval), 10000);
        return () => {
          mounted = false;
          clearTimeout(t);
          clearInterval(checkInterval);
          cleanupPlayer();
          window.removeEventListener("devPauseRequest", handleDevPause as EventListener);
        };
      }
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      const originalCb = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (originalCb) originalCb();
        if (mounted) setTimeout(() => initializePlayer(), 100);
      };
    } else {
      setTimeout(() => mounted && initializePlayer(), 100);
    }

    return () => {
      mounted = false;
      cleanupPlayer();
      window.removeEventListener("devPauseRequest", handleDevPause as EventListener);
    };
  }, [videoId, reflectionPoints.length, initializePlayer, addDebugLog]);


  const handleReflectionComplete = useCallback(() => {
    setShowReflection(false);
    setVideoPaused(false);
    setCurrentReflection(null);
    videoPausedRef.current = false;

    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    }
    setTimeout(() => startPolling(), 800);
  }, [startPolling]);

  const triggerDevPause = useCallback(() => {
    if (!playerRef.current?.pauseVideo || videoPausedRef.current) return;
    try {
      videoPausedRef.current = true;
      playerRef.current.pauseVideo();
      setVideoPaused(true);
      setCurrentReflection({
        time: playerRef.current.getCurrentTime?.() ?? 0,
        topic: "Manual Dev Pause - Testing",
      });
      setShowReflection(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (_) { }
  }, []);

  return (
    <div className="space-y-4 w-full max-w-full p-0">
      {/* Debug Panel - theme-aware for dark mode */}
      <div className="mb-3 p-3 rounded-lg border bg-muted/50 border-border">
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <h3 className="font-mono text-sm font-bold">🐛 Debug Panel</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={triggerDevPause}
              className="text-xs px-3 py-1.5 bg-amber-500 text-amber-950 rounded hover:bg-amber-400 font-medium dark:bg-amber-500 dark:text-amber-950"
              title="Pause video now and open reflection modal (for testing)"
            >
              Dev: Trigger pause
            </button>
            <button
              type="button"
              onClick={() => setDebugLogs([])}
              className="text-xs px-2 py-1 rounded border bg-background hover:bg-muted border-border"
            >
              Clear Logs
            </button>
          </div>
        </div>
        <div className="text-xs font-mono p-2 rounded border bg-background border-border h-28 overflow-y-auto">
          {debugLogs.length === 0 ? (
            <div className="text-muted-foreground">No logs yet...</div>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="border-b border-border/50 pb-1 last:border-0">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative aspect-video max-w-full bg-black rounded-lg overflow-hidden">
        <div
          id={containerId}
          className="w-full h-full min-h-[200px]"
        />
      </div>

      {showReflection && (
        isBatchMode ? (
          <BatchReflectionModal
            chapterId={chapterId!}
            currentTime={currentReflection?.time ?? 0}
            onComplete={handleReflectionComplete}
          />
        ) : (
          currentReflection && (
            <ReflectionModal
              reflection={currentReflection}
              studentId={studentId}
              onComplete={handleReflectionComplete}
              chapterId={chapterId}
              previousTime={(() => {
                // Find index of current point in sorted array
                // reflectionPoints are typically passed sorted, but let's be safe or just use findIndex
                // If points are not sorted, this might be tricky. Let's assume sorted or sort them once?
                // The prompt says "previous timestamp", so chronologically previous.
                const sorted = [...reflectionPoints].sort((a, b) => a.time - b.time);
                const idx = sorted.findIndex(p => Math.abs(p.time - currentReflection.time) < 0.1);
                if (idx > 0 && sorted[idx - 1]) {
                  return sorted[idx - 1].time;
                }
                return 0;
              })()}
            />
          )
        )
      )}
    </div>
  );
}
