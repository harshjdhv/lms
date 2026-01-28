export function getEmbedUrl(url: string | null): string | null {
  if (!url) return null;

  // Handle YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId = "";
    if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0] || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1] || "";
    } else if (url.includes("embed/")) {
      return url;
    }
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Handle Vimeo
  if (url.includes("vimeo.com")) {
    const vimeoId = url.split("vimeo.com/")[1];
    return `https://player.vimeo.com/video/${vimeoId}`;
  }

  return url;
}
