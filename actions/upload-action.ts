'use server';

import { uploadImage, deleteImage, UploadResult } from '@/lib/cloudinary-server';
import { UploadModule } from '@/lib/upload-utils';

export type UploadActionResponse = {
  success: boolean;
  result?: UploadResult;
  error?: string;
};

/**
 * Server Action to handle image uploads from client components.
 * 
 * @param formData - FormData containing the 'file' and 'module' (e.g. 'products')
 * @returns UploadActionResponse
 */
export async function uploadImageAction(formData: FormData): Promise<UploadActionResponse> {
  try {
    const file = formData.get('file') as File | null;
    const uploadModule = formData.get('module') as UploadModule | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    if (!uploadModule) {
      return { success: false, error: 'No module provided (e.g., "products", "categories")' };
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call server-side upload utility
    const result = await uploadImage(buffer, uploadModule, file.name);

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error('Upload Action Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Server Action to delete an image by publicId.
 * 
 * @param publicId - The Cloudinary public ID of the image
 * @returns boolean
 */
export async function deleteImageAction(publicId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!publicId) {
      return { success: false, error: 'No publicId provided' };
    }

    const isDeleted = await deleteImage(publicId);

    if (isDeleted) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to delete image' };
    }
  } catch (error) {
    console.error('Delete Action Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown delete error',
    };
  }
}

/**
 * Server Action to replace an existing image.
 * Deletes the old image and uploads the new one.
 * 
 * @param formData - FormData containing 'file', 'module', and 'oldPublicId'
 * @returns UploadActionResponse
 */
export async function replaceImageAction(formData: FormData): Promise<UploadActionResponse> {
  const oldPublicId = formData.get('oldPublicId') as string | null;
  
  // First, upload the new image
  const uploadResponse = await uploadImageAction(formData);

  // If upload was successful and there was an old image, delete the old one
  if (uploadResponse.success && oldPublicId) {
    // We don't await the delete so it doesn't block the UI returning the new image
    deleteImageAction(oldPublicId).catch(console.error);
  }

  return uploadResponse;
}
