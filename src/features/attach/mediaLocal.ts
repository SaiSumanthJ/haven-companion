export async function jpegFromImage(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    return drawJpeg(image, image.width, image.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function framesFromVideo(file: File): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("That video could not be opened."));
    });
    const stamps = [0.15, 0.5, 0.85].map((part) => part * (video.duration || 1));
    const frames: string[] = [];
    for (const time of stamps) {
      video.currentTime = Math.min(time, Math.max(0, (video.duration || 1) - 0.05));
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      frames.push(drawJpeg(video, video.videoWidth, video.videoHeight));
    }
    return frames;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("That image could not be opened."));
    image.src = url;
  });
}

function drawJpeg(
  source: CanvasImageSource,
  width: number,
  height: number,
): string {
  const max = 768;
  const scale = Math.min(1, max / Math.max(width || 1, height || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round((width || 1) * scale));
  canvas.height = Math.max(1, Math.round((height || 1) * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser could not prepare the picture.");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72).split(",")[1] ?? "";
}
