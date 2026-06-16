import crypto from 'crypto';

export type UploadModule = 'products' | 'categories' | 'users' | 'banners' | 'general';

/**
 * Slugifies a given filename to make it SEO and URL friendly.
 * Example: "Premium Wagyu Beef.jpg" -> "premium-wagyu-beef"
 */
export function slugifyFilename(filename: string): string {
  // Remove extension if present for slugification
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  return nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/[\s-]+/g, '-') // Replace spaces and repeated dashes with a single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

/**
 * Generates a unique, SEO-friendly Cloudinary Public ID and full folder path.
 * 
 * @param module - The module folder (e.g. products, categories)
 * @param originalFilename - The original uploaded file name
 * @returns { folderPath, publicId }
 */
export function generateCloudinaryPath(module: UploadModule, originalFilename: string) {
  const slugified = slugifyFilename(originalFilename);
  // Generate a short 6-character random hex to prevent collisions
  const uniqueId = crypto.randomBytes(3).toString('hex');
  
  const folderPath = `eltalkhawy/${module}`;
  // Example publicId: eltalkhawy/products/premium-wagyu-beef-a1b2c3
  const publicId = `${folderPath}/${slugified}-${uniqueId}`;
  
  return {
    folderPath,
    publicId,
  };
}
