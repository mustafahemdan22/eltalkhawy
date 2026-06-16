'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { uploadImageAction } from '@/actions/upload-action';
import { UploadModule } from '@/lib/upload-utils';
import type { UploadResult } from '@/lib/cloudinary-server';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
  module: UploadModule;
  onUploadSuccess?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  onRemove?: () => void;
  defaultImage?: string;
  className?: string;
  label?: string;
  helpText?: string;
  isUploadingProp?: boolean;
}

export function ImageUpload({
  module,
  onUploadSuccess,
  onUploadError,
  onRemove,
  defaultImage,
  className,
  label = 'Click to upload an image',
  helpText = 'PNG, JPG, WEBP up to 5MB',
  isUploadingProp = false,
}: ImageUploadProps) {
  const [internalUploading, setInternalUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = internalUploading || isUploadingProp;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create local preview immediately for better UX
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setInternalUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', module);

      const response = await uploadImageAction(formData);

      if (response.success && response.result) {
        setPreviewUrl(response.result.url);
        onUploadSuccess?.(response.result);
      } else {
        const errorMsg = response.error || 'Upload failed';
        onUploadError?.(errorMsg);
        setPreviewUrl(defaultImage || null); // Revert on failure
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      onUploadError?.(errorMsg);
      setPreviewUrl(defaultImage || null);
    } finally {
      setInternalUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset input so the same file can be uploaded again if needed
      }
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed rounded-xl overflow-hidden transition-all duration-300',
        previewUrl
          ? 'border-border/50 bg-background'
          : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 cursor-pointer',
        className
      )}
      onClick={() => !previewUrl && !isUploading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        disabled={isUploading}
      />

      {isUploading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <span className="text-sm font-medium text-foreground">Uploading...</span>
        </div>
      )}

      {previewUrl ? (
        <div className="relative w-full h-full min-h-[200px] group flex items-center justify-center bg-muted/30">
          <Image
            src={previewUrl}
            alt="Upload preview"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-3 bg-destructive text-destructive-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-full bg-muted mb-4 group-hover:bg-primary/10 transition-colors">
            <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">
            {label}
          </p>
          <p className="text-xs text-muted-foreground">
            {helpText}
          </p>
        </div>
      )}
    </div>
  );
}
