import 'server-only';
import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { generateCloudinaryPath, UploadModule } from './upload-utils';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

/**
 * Uploads a file buffer to Cloudinary
 * 
 * @param buffer - The file buffer to upload
 * @param module - The module folder (e.g., 'products', 'categories')
 * @param originalFilename - The original file name for SEO-friendly slugification
 * @returns UploadResult
 */
export async function uploadImage(
  buffer: Buffer,
  module: UploadModule,
  originalFilename: string
): Promise<UploadResult> {
  const { folderPath, publicId } = generateCloudinaryPath(module, originalFilename);

  const options: UploadApiOptions = {
    public_id: publicId,
    folder: folderPath,
    // Automatically determine the optimal format and quality for delivery
    format: 'auto',
    quality: 'auto',
    resource_type: 'image',
    use_filename: false,
    unique_filename: false, // We're handling uniqueness in generateCloudinaryPath
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result: UploadApiResponse | undefined) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary upload failed: No result returned'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    // Write the buffer to the stream and end it
    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary
 * 
 * @param publicId - The public ID of the image to delete
 * @returns boolean indicating success
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error);
    return false;
  }
}
