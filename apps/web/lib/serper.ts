export const SERPER_API_KEY = process.env.SERPER_API_KEY;

type SerperResourceType = "search" | "images" | "videos";

export interface SerperResult {
  title?: string;
  link: string;
  imageUrl?: string; // For images
  snippet?: string; // For search/text
  source?: string;
}

export async function searchSerper(
  query: string,
  type: SerperResourceType = "search",
  limit: number = 2,
): Promise<SerperResult[]> {
  if (!process.env.SERPER_API_KEY) {
    console.warn("SERPER_API_KEY is not set.");
    return [];
  }

  const baseUrl = "https://google.serper.dev";
  const url = `${baseUrl}/${type}`;

  const data = JSON.stringify({
    q: query,
    gl: "us", // Start with US for broader English results, or 'in' as requested
    num: limit,
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Normalize results
    if (type === "images") {
      return (result.images || []).map((img: any) => ({
        title: img.title,
        link: img.link, // clicking the image goes here
        imageUrl: img.imageUrl, // valid display url
        source: img.source,
        width: img.width,
        height: img.height,
      }));
    } else if (type === "videos") {
      return (result.videos || []).map((vid: any) => ({
        title: vid.title,
        link: vid.link,
        imageUrl: vid.imageUrl, // thumbnail
        snippet: vid.snippet,
        source: vid.channel || vid.source,
      }));
    } else {
      // Search
      return (result.organic || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
    }
  } catch (error) {
    console.error("Serper search failed:", error);
    return [];
  }
}
