function drawToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
  max: number,
  mime: string,
  quality: number,
) {
  const scale = Math.min(1, max / Math.max(width, height, 1));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read this image.");
  ctx.drawImage(source, 0, 0, w, h);
  return canvas.toDataURL(mime, quality);
}

export async function readImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image is too large (max 10 MB).");
  }
  const bitmap = await createImageBitmap(file);
  let quality = 0.8;
  let data = drawToDataUrl(
    bitmap,
    bitmap.width,
    bitmap.height,
    1400,
    "image/jpeg",
    quality,
  );
  while (data.length > 520_000 && quality > 0.42) {
    quality -= 0.12;
    data = drawToDataUrl(
      bitmap,
      bitmap.width,
      bitmap.height,
      1100,
      "image/jpeg",
      quality,
    );
  }
  bitmap.close();
  return data;
}

export async function readLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  if (file.size > 4 * 1024 * 1024) {
    throw new Error("Logo is too large (max 4 MB).");
  }
  const bitmap = await createImageBitmap(file);
  let data = drawToDataUrl(
    bitmap,
    bitmap.width,
    bitmap.height,
    480,
    "image/png",
    0.92,
  );
  if (data.length > 360_000) {
    data = drawToDataUrl(
      bitmap,
      bitmap.width,
      bitmap.height,
      360,
      "image/jpeg",
      0.82,
    );
  }
  bitmap.close();
  return data;
}
