import { propertyAPI } from '../api';

/**
 * Upload a single file via Django backend → Cloudinary (signed, secure).
 * No unsigned preset required.
 * Returns the secure_url of the uploaded image.
 */
export async function uploadToCloudinary(file, folder = 'property_hub/properties') {
  const { data } = await propertyAPI.uploadImage(file, folder);
  return data.url;
}

/**
 * Upload multiple files via Django backend in sequence.
 * Sequential (not parallel) to avoid overwhelming the server.
 * Returns array of secure_urls.
 */
export async function uploadMultipleToCloudinary(files, folder = 'property_hub/properties') {
  const urls = [];
  for (const file of files) {
    const url = await uploadToCloudinary(file, folder);
    urls.push(url);
  }
  return urls;
}

/**
 * Optimize a Cloudinary URL — auto quality, format, and resize.
 * Safe to call on non-Cloudinary URLs (returns unchanged).
 */
export function optimizeCloudinaryUrl(url, { width, height, crop = 'fill' } = {}) {
  if (!url || !url.includes('cloudinary.com')) return url;

  // Avoid double-transforming
  if (url.includes('q_auto')) return url;

  const transformations = ['q_auto', 'f_auto'];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  return url.replace('/upload/', `/upload/${transformations.join(',')}/`);
}
