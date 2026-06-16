'use client';

import React, { useState, useRef } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { uploadImageAction, deleteImageAction } from '@/actions/upload-action';
import { UploadModule } from '@/lib/upload-utils';
import type { UploadResult } from '@/lib/cloudinary-server';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MultiImageUploadProps {
  module: UploadModule;
  onUploadSuccess?: (results: UploadResult[]) => void;
  onUploadError?: (error: string) => void;
  onImagesChange?: (urls: string[]) => void;
  defaultImages?: string[];
  className?: string;
  maxFiles?: number;
}

export function MultiImageUpload({
  module,
  onUploadSuccess,
  onUploadError,
  onImagesChange,
  defaultImages = [],
  className,
  maxFiles = 5,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<{ url: string; isUploading: boolean; publicId?: string }[]>(
    defaultImages.map((url) => ({ url, isUploading: false }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxFiles) {
      onUploadError?.(`You can only upload up to ${maxFiles} images.`);
      return;
    }

    // Add local previews
    const newPreviewImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      isUploading: true,
      file,
    }));

    setImages((prev) => [...prev, ...newPreviewImages.map(img => ({ url: img.url, isUploading: true }))]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const uploadedResults: UploadResult[] = [];
    let hasError = false;

    // Upload files sequentially or use Promise.all. Using sequential for simpler error handling and rate limits
    for (const item of newPreviewImages) {
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('module', module);

        const response = await uploadImageAction(formData);

        if (response.success && response.result) {
          uploadedResults.push(response.result);
          // Update the specific image state
          setImages((prev) =>
            prev.map((img) =>
              img.url === item.url
                ? { url: response.result!.url, isUploading: false, publicId: response.result!.publicId }
                : img
            )
          );
        } else {
          hasError = true;
          onUploadError?.(response.error || 'Failed to upload an image');
          // Remove the failed image from preview
          setImages((prev) => prev.filter((img) => img.url !== item.url));
        }
      } catch (err) {
        hasError = true;
        onUploadError?.(err instanceof Error ? err.message : 'Unknown upload error');
        setImages((prev) => prev.filter((img) => img.url !== item.url));
      }
    }

    if (!hasError && uploadedResults.length > 0) {
      onUploadSuccess?.(uploadedResults);
    }
    
    // Call the change handler with all current valid URLs
    setImages(current => {
       const validUrls = current.filter(i => !i.isUploading).map(i => i.url);
       onImagesChange?.(validUrls);
       return current;
    });
  };

  const handleRemove = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    
    // Optionally delete from Cloudinary if it has a publicId
    if (imageToRemove.publicId) {
      // Background delete without blocking UI
      deleteImageAction(imageToRemove.publicId).catch(console.error);
    }

    setImages((prev) => {
      const newImages = prev.filter((_, idx) => idx !== indexToRemove);
      onImagesChange?.(newImages.filter(i => !i.isUploading).map(i => i.url));
      return newImages;
    });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.url}
            className="relative aspect-square rounded-xl overflow-hidden border border-border group bg-muted/30 flex items-center justify-center"
          >
            {image.isUploading ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : null}
            
            <Image
              src={image.url}
              alt={`Upload ${index + 1}`}
              fill
              className={cn("object-cover", image.isUploading && "opacity-50")}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {!image.isUploading && (
              <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-sm"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {images.length < maxFiles && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-xl hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Plus className="w-8 h-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground font-medium">Add Image</span>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        multiple
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        You can upload up to {maxFiles} images. (PNG, JPG, WEBP up to 5MB each)
      </p>
    </div>
  );
}
