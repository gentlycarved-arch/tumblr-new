// Color extraction utility using k-means clustering
export interface Color {
  r: number;
  g: number;
  b: number;
  hex: string;
  proportion: number; // 0-1, how dominant this color is
}

// Convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(x => Math.round(x).toString(16).padStart(2, '0'))
    .join('');
}

// Calculate color distance
function colorDistance(c1: Color, c2: Color): number {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

// Extract pixels from image
function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Scale down for performance
  const maxSize = 200;
  const scale = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// K-means clustering for color extraction
export function extractColors(img: HTMLImageElement, numColors: number = 8): Color[] {
  const imageData = getImageData(img);
  const pixels: Color[] = [];

  // Sample pixels (skip some for performance)
  for (let i = 0; i < imageData.data.length; i += 16) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];

    // Skip transparent pixels
    if (a < 128) continue;

    pixels.push({
      r,
      g,
      b,
      hex: rgbToHex(r, g, b),
      proportion: 0,
    });
  }

  if (pixels.length === 0) {
    return [];
  }

  // Initialize centroids randomly
  const centroids: Color[] = [];
  for (let i = 0; i < numColors; i++) {
    const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
    centroids.push({ ...randomPixel, proportion: 0 });
  }

  // K-means iterations
  const maxIterations = 10;
  let clusters: Color[][] = Array.from({ length: numColors }, () => []);

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign pixels to nearest centroid
    clusters = Array.from({ length: numColors }, () => []);

    for (const pixel of pixels) {
      let minDist = Infinity;
      let closestCentroid = 0;

      for (let i = 0; i < centroids.length; i++) {
        const dist = colorDistance(pixel, centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          closestCentroid = i;
        }
      }

      clusters[closestCentroid].push(pixel);
    }

    // Update centroids
    for (let i = 0; i < centroids.length; i++) {
      if (clusters[i].length === 0) continue;

      const sumR = clusters[i].reduce((sum, p) => sum + p.r, 0);
      const sumG = clusters[i].reduce((sum, p) => sum + p.g, 0);
      const sumB = clusters[i].reduce((sum, p) => sum + p.b, 0);
      const count = clusters[i].length;

      centroids[i].r = Math.round(sumR / count);
      centroids[i].g = Math.round(sumG / count);
      centroids[i].b = Math.round(sumB / count);
      centroids[i].hex = rgbToHex(centroids[i].r, centroids[i].g, centroids[i].b);
    }
  }

  // Calculate proportions based on cluster sizes
  const totalPixels = pixels.length;
  for (let i = 0; i < centroids.length; i++) {
    centroids[i].proportion = clusters[i].length / totalPixels;
  }

  // Filter out empty clusters and sort by proportion (most dominant first)
  return centroids
    .filter((_, i) => clusters[i].length > 0)
    .sort((a, b) => b.proportion - a.proportion);
}