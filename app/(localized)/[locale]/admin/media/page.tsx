'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import MediaUploader from '@/components/admin/MediaUploader';
import { FormInput } from '@/components/admin/FormInput';
import { FormSelect } from '@/components/admin/FormSelect';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Search, ImageIcon, Copy, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type MediaItem = {
  _id:        Id<'media'>;
  storageId:  Id<'_storage'>;
  filename:   string;
  mimeType:   string;
  size:       number;
  folder:     'products' | 'banners' | 'categories' | 'general';
  altText:    string | null;
  _creationTime: number;
};

type Folder = 'products' | 'banners' | 'categories' | 'general';

export default function AdminMediaPage() {
  const { dict } = useLocale();
  const { showToast } = useToast();
  const media = useQuery(api.media.list, {});
  const removeMedia = useMutation(api.media.remove);

  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState<'' | Folder>('');
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!media) return undefined;
    const q = search.trim().toLowerCase();
    return media.filter((m) => {
      if (folder && m.folder !== folder) return false;
      if (q && !m.filename.toLowerCase().includes(q) && !(m.altText ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [media, search, folder]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isEmpty = !media || (filtered && filtered.length === 0 && !search && !folder);

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.media.title}
        subtitle={dict.admin.media.subtitle}
      />

      {/* Uploader */}
      <div className="mb-6">
        <MediaUploader folder="general" />
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <div className="md:col-span-8 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
          <FormInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.admin.media.searchPlaceholder}
            className="ps-10"
          />
        </div>
        <div className="md:col-span-4">
          <FormSelect
            value={folder}
            onChange={(e) => setFolder(e.target.value as '' | Folder)}
            options={[
              { value: '',           label: dict.admin.media.folderAll },
              { value: 'products',   label: dict.admin.media.folderProducts },
              { value: 'banners',    label: dict.admin.media.folderBanners },
              { value: 'categories', label: dict.admin.media.folderCategories },
              { value: 'general',    label: dict.admin.media.folderGeneral },
            ]}
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<ImageIcon className="h-7 w-7" aria-hidden />}
          title={dict.admin.media.empty}
        />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered?.map((m) => (
            <MediaCard
              key={m._id}
              item={m}
              onCopy={async (url) => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopiedId(m._id);
                  showToast(dict.admin.media.urlCopied, 'success');
                  setTimeout(() => setCopiedId(null), 1500);
                } catch {
                  showToast(dict.admin.common.error, 'error');
                }
              }}
              copied={copiedId === m._id}
              onDelete={() => setPendingDelete(m)}
              formatSize={formatSize}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={dict.admin.media.delete}
        description={`${dict.admin.confirm.deleteDesc} (${pendingDelete?.filename ?? ''})`}
        confirmText={dict.admin.common.delete}
        cancelText={dict.admin.common.cancel}
        destructive
        loading={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          try {
            await removeMedia({ mediaId: pendingDelete._id });
            showToast(dict.admin.media.toast.deleted, 'success');
            setPendingDelete(null);
          } catch (err) {
            showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function MediaCard({
  item, onCopy, copied, onDelete, formatSize,
}: {
  item: MediaItem;
  onCopy: (url: string) => void;
  copied: boolean;
  onDelete: () => void;
  formatSize: (b: number) => string;
}) {
  const { locale, dict } = useLocale();
  const url = useQuery(api.media.url, { storageId: item.storageId });
  return (
    <li
      className={cn(
        'group relative aspect-square overflow-hidden rounded-card',
        'border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]',
      )}
    >
      {url ? (
        <Image
          src={url}
          alt={item.altText ?? item.filename}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-[var(--text-secondary)] animate-spin" aria-hidden />
        </div>
      )}

      {/* Top-left: folder pill */}
      <span
        className={cn(
          'absolute top-1.5 start-1.5 inline-flex items-center rounded-pill px-2 py-0.5',
          'text-2xs font-bold uppercase tracking-wider',
          'bg-[var(--bg-overlay)]/70 backdrop-blur-sm text-white',
        )}
      >
        {item.folder === 'products' ? dict.admin.media.folderProducts
         : item.folder === 'banners' ? dict.admin.media.folderBanners
         : item.folder === 'categories' ? dict.admin.media.folderCategories
         : dict.admin.media.folderGeneral}
      </span>

      {/* Bottom: filename + actions */}
      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-[var(--bg-overlay)]/95 to-transparent">
        <p className="text-2xs text-white font-mono truncate mb-1 px-0.5">
          {item.filename}
        </p>
        <p className="text-2xs text-white/60 font-mono px-0.5 mb-1.5">{formatSize(item.size)}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => url && onCopy(url)}
            disabled={!url}
            className="flex-1 inline-flex items-center justify-center h-7 rounded-button bg-white/15 hover:bg-white/25 text-white text-2xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {copied ? <span>{locale === 'ar' ? '✓ تم النسخ' : '✓ Copied'}</span> : <Copy className="h-3 w-3" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-7 w-7 inline-flex items-center justify-center rounded-button bg-red-500/80 hover:bg-red-500 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}
