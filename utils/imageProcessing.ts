/**
 * Reads a File object and returns a base64 string.
 */
export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsDataURL(file);
  });
};

/**
 * Converts an image (HTMLImageElement) to black and white using Canvas API.
 * Uses the luminosity method: 0.21 R + 0.72 G + 0.07 B
 */
export const convertToBlackAndWhite = (
  img: HTMLImageElement, 
  canvas: HTMLCanvasElement
): string => {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Could not get canvas context");

  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  // Draw original image
  ctx.drawImage(img, 0, 0);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Iterate through every pixel (R, G, B, Alpha)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Luminosity formula for natural grayscale
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
    // Alpha (data[i+3]) remains unchanged
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
};