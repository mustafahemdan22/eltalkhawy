'use client';

import { useCallback, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';
import { UploadCloud, X, Loader2 } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

export type MediaFolder = 'products' | 'banners' | 'categories' | 'general';

interface MediaUploaderProps {
  folder?: MediaFolder;
  multiple?: boolean;
  accept?: string;
  className?: string;
  onUploaded?: (mediaId: string) => void;
}

export default function MediaUploader({
  folder = 'general',
  multiple = true,
  className,
  onUploaded,
}: MediaUploaderProps) {
  const { showToast } = useToast();
  const { dict } = useLocale();

  const generateUploadUrl = useMutation(api.media.generateUploadUrl);
  const saveMedia = useMutation(api.media.save);

  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<Array<{
    name: string; progress: number; status: 'pending' | 'uploading' | 'done' | 'error';
  }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      const valid = list.filter((f) => {
        if (!ALLOWED.has(f.type)) {
          showToast(dict.admin.media.toast.wrongType, 'error');
          return false;
        }
        if (f.size > MAX_FILE_SIZE) {
          showToast(dict.admin.media.toast.tooLarge, 'error');
          return false;
        }
        return true;
      });
      if (!valid.length) return;

      setUploads((u) => [
        ...u,
        ...valid.map((f) => ({ name: f.name, progress: 0, status: 'pending' as const })),
      ]);

      for (const file of valid) {
        setUploads((u) => {
          const i = u.findIndex((x) => x.name === file.name && x.status === 'pending');
          if (i === -1) return u;
          const next = [...u];
          next[i] = { ...next[i], status: 'uploading', progress: 30 };
          return next;
        });

        try {
          const postUrl = await generateUploadUrl();
          const res = await fetch(postUrl, {
            method: 'POST',
            headers: { 'Content-Type': file.type },
            body: file,
          });
          if (!res.ok) throw new Error('Upload failed');
          const { storageId } = (await res.json()) as { storageId: string };

          setUploads((u) => {
            const next = [...u];
            const i = next.findIndex((x) => x.name === file.name && x.status === 'uploading');
            if (i !== -1) next[i] = { ...next[i], progress: 80 };
            return next;
          });

          const mediaId = await saveMedia({
            storageId: storageId as never,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            folder,
          });

          setUploads((u) => {
            const next = [...u];
            const i = next.findIndex((x) => x.name === file.name);
            if (i !== -1) next[i] = { ...next[i], progress: 100, status: 'done' };
            return next;
          });

          onUploaded?.(mediaId);
          showToast(`${dict.admin.media.toast.uploaded}: ${file.name}`, 'success');
          // Auto-clear success rows after 2.5s
          setTimeout(() => {
            setUploads((u) => u.filter((x) => x.name !== file.name || x.status !== 'done'));
          }, 2500);
        } catch {
          setUploads((u) => {
            const next = [...u];
            const i = next.findIndex((x) => x.name === file.name);
            if (i !== -1) next[i] = { ...next[i], status: 'error' };
            return next;
          });
          showToast(`${dict.admin.common.error}: ${file.name}`, 'error');
        }
      }
    },
    [folder, generateUploadUrl, saveMedia, showToast, dict, onUploaded],
  );

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label={dict.admin.media.upload}
        className={cn(
          'group flex flex-col items-center justify-center text-center',
          'min-h-[180px] px-6 py-10 rounded-card border-2 border-dashed cursor-pointer',
          'transition-all duration-200',
          isDragging
            ? 'border-[var(--gold)] bg-[var(--gold-subtle)]/30'
            : 'border-[var(--border-default)] bg-[var(--bg-surface-raised)]/40 hover:border-[var(--gold-border)] hover:bg-[var(--gold-subtle)]/10',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gold-subtle)]/50 text-[var(--gold)] group-hover:scale-110 transition-transform">
          <UploadCloud className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-3 font-semibold text-[var(--text-primary)]">
          {isDragging ? dict.admin.media.dropHere : dict.admin.media.upload}
        </p>
        <p className="mt-1 text-2xs text-[var(--text-secondary)] max-w-sm">
          {dict.admin.media.uploadHelp}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((u, i) => (
            <li
              key={`${u.name}-${i}`}
              className={cn(
                'flex items-center gap-3 rounded-button border px-3 py-2 text-xs',
                u.status === 'error'
                  ? 'border-red-500/40 bg-red-500/5 text-red-500'
                  : u.status === 'done'
                    ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-500'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-secondary)]',
              )}
            >
              {u.status === 'uploading' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
              ) : u.status === 'done' ? (
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
              ) : u.status === 'error' ? (
                <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : null}
              <span className="truncate flex-1 font-mono">{u.name}</span>
              {u.status === 'uploading' && (
                <div className="w-24 h-1 bg-[var(--bg-surface-raised)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--gold)] transition-all"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}
              <span className="text-2xs uppercase tracking-wider font-semibold">
                {u.status === 'uploading' ? dict.admin.media.uploading
                 : u.status === 'done'     ? '✓'
                 : u.status === 'error'    ? dict.admin.common.error
                 : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
