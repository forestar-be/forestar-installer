/**
 * Compresses an image dataURL to reduce file size
 * @param dataURL - The original image data URL
 * @param maxWidth - Maximum width for the compressed image (default: 400)
 * @param maxHeight - Maximum height for the compressed image (default: 200)
 * @param quality - JPEG compression quality 0-1 (default: 0.7)
 * @returns Promise<string> - Compressed image data URL
 */
export function compressImage(
  dataURL: string,
  maxWidth: number = 400,
  maxHeight: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Fill with white background (important for signatures)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Draw the resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataURL);
      } else {
        resolve(dataURL); // Fallback to original if compression fails
      }
    };

    img.onerror = () => {
      resolve(dataURL); // Fallback to original if loading fails
    };

    img.src = dataURL;
  });
}

/**
 * Gets the approximate size of a data URL in bytes
 * @param dataURL - The data URL to measure
 * @returns number - Approximate size in bytes
 */
export function getDataURLSize(dataURL: string): number {
  // Remove the data URL prefix and calculate base64 size
  const base64String = dataURL.split(',')[1] || '';
  return Math.round((base64String.length * 3) / 4);
}

/**
 * Formats bytes to human readable string
 * @param bytes - Number of bytes
 * @returns string - Formatted size (e.g., "1.2 KB", "3.4 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
