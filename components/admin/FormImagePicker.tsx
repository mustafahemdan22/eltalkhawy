'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useToast } from '@/components/ui/Toast';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';
import { X, Link as LinkIcon, Library, Plus, Loader2 } from 'lucide-react';
import MediaUploader from './MediaUploader';
import type { Id } from '@/convex/_generated/dataModel';

interface FormImagePickerProps {
  value:        string[];                          // array of URLs
  onChange:     (urls: string[]) => void;
  maxItems?:    number;
  help?:        string;
  folder?:      'products' | 'banners' | 'categories' | 'general';
}

export default function FormImagePicker({
  value,
  onChange,
  maxItems = 8,
  help,
  folder = 'products',
}: FormImagePickerProps) {
  const { showToast } = useToast();
  const { locale, dict } = useLocale();

  const [showLibrary, setShowLibrary] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Subscribe to media list so we can preview library items by storageId.
  const mediaList = useQuery(api.media.list, { folder });

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (value.includes(url)) {
      showToast(locale === 'ar' ? 'تمت الإضافة بالفعل' : 'Already added', 'info');
      return;
    }
    if (value.length >= maxItems) return;
    onChange([...value, url]);
    setUrlInput('');
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Existing images */}
      {value.length > 0 && (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-card',
                'border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]',
                i === 0 && 'ring-2 ring-[var(--gold)]',
              )}
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 start-1.5 inline-flex items-center rounded-pill bg-[var(--gold)] text-[var(--gold-fg)] px-2 py-0.5 text-2xs font-bold uppercase tracking-wider">
                  ★
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 p-1.5 bg-[var(--bg-overlay)]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="h-7 w-7 rounded-button bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                  aria-label="Move left"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="h-7 w-7 rounded-button bg-red-500/80 hover:bg-red-500 text-white inline-flex items-center justify-center"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  className="h-7 w-7 rounded-button bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                  aria-label="Move right"
                >
                  ›
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add by URL */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            placeholder="https://images.example.com/photo.jpg"
            className="h-11 w-full ps-10 pe-3 rounded-button bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40"
            disabled={value.length >= maxItems}
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim() || value.length >= maxItems}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-button text-sm font-semibold border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          URL
        </button>
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          disabled={value.length >= maxItems}
          className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-button text-sm font-semibold bg-[var(--bg-surface-raised)] border border-[var(--gold-border)] text-[var(--gold)] hover:bg-[var(--gold-subtle)] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <Library className="h-4 w-4" aria-hidden />
          {dict.admin.media.title}
        </button>
      </div>

      {help && <p className="text-2xs text-[var(--text-secondary)]">{help}</p>}
      <p className="text-2xs text-[var(--text-secondary)]">
        {value.length} / {maxItems}
      </p>

      {/* Media Library modal */}
      {showLibrary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={dict.admin.media.title}
        >
          <button
            type="button"
            className="absolute inset-0 bg-[var(--bg-overlay)]/70 backdrop-blur-sm"
            onClick={() => setShowLibrary(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-raised flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
              <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">
                {dict.admin.media.title}
              </h2>
              <button
                type="button"
                onClick={() => setShowLibrary(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="overflow-y-auto p-5 flex flex-col gap-5">
              <MediaUploader
                folder={folder}
                onUploaded={() => {
                  /* list query auto-refreshes */
                }}
              />

              {mediaList === undefined ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-5 w-5 text-[var(--gold)] animate-spin" aria-hidden />
                </div>
              ) : mediaList.length === 0 ? (
                <p className="text-center text-sm text-[var(--text-secondary)] py-12">
                  {dict.admin.media.empty}
                </p>
              ) : (
                <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaList.map((m) => (
                    <MediaLibraryItem
                      key={m._id}
                      storageId={m.storageId}
                      filename={m.filename}
                      onPick={async (url) => {
                        if (value.includes(url)) {
                          showToast(locale === 'ar' ? 'تمت الإضافة بالفعل' : 'Already added', 'info');
                          return;
                        }
                        if (value.length >= maxItems) return;
                        onChange([...value, url]);
                        showToast(dict.admin.media.toast.uploaded, 'success');
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MediaLibraryItem({
  storageId,
  filename,
  onPick,
}: {
  storageId: string;
  filename:  string;
  onPick:    (url: string) => void;
}) {
  const { locale } = useLocale();
  const url = useQuery(api.media.url, { storageId: storageId as Id<'_storage'> });
  const [copied, setCopied] = useState(false);

  return (
    <li className="group relative aspect-square overflow-hidden rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]">
      {url ? (
        <Image
          src={url}
          alt={filename}
          fill
          sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 200px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-[var(--bg-surface-raised)]" />
      )}
      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-[var(--bg-overlay)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <button
          type="button"
          onClick={() => url && onPick(url)}
          disabled={!url}
          className="flex-1 inline-flex items-center justify-center h-7 rounded-button bg-[var(--gold)] text-[var(--gold-fg)] text-2xs font-bold uppercase tracking-wider hover:bg-[var(--gold-hover)]"
        >
          {locale === 'ar' ? 'إضافة' : 'Add'}
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!url) return;
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch { /* ignore */ }
          }}
          disabled={!url}
          className="h-7 w-7 inline-flex items-center justify-center rounded-button bg-white/10 hover:bg-white/20 text-white"
          aria-label="Copy URL"
          title="Copy URL"
        >
          {copied ? '✓' : '⧉'}
        </button>
      </div>
    </li>
  );
}
