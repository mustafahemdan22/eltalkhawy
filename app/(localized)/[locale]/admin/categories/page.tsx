'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/admin/FormField';
import { FormInput } from '@/components/admin/FormInput';
import { FormTextarea } from '@/components/admin/FormTextarea';
import FormToggle from '@/components/admin/FormToggle';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Plus, Tags, Edit, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Cat = {
  _id:        Id<'categories'>;
  slug:       string;
  name:       string;
  nameAr:     string;
  description:string;
  bannerImage:string;
  icon:       string;
  order:      number;
  isActive:   boolean;
};

export default function AdminCategoriesPage() {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const categories = useQuery(api.categories.listAll);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const removeCategory = useMutation(api.categories.remove);

  const [editing, setEditing] = useState<Cat | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Cat | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns: DataTableColumn<Cat>[] = [
    {
      key: 'category',
      header: dict.admin.categories.table.category,
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-button text-lg bg-[var(--bg-surface-raised)]"
            aria-hidden
          >
            {c.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {locale === 'ar' ? c.nameAr : c.name}
            </p>
            <p className="text-2xs text-[var(--text-secondary)] truncate">
              {locale === 'ar' ? c.name : c.nameAr}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'slug',
      header: dict.admin.categories.table.slug,
      render: (c) => <span className="font-mono text-xs text-[var(--text-secondary)]">{c.slug}</span>,
      hideOn: 'md',
    },
    {
      key: 'order',
      header: dict.admin.categories.table.order,
      align: 'center',
      render: (c) => <span className="font-mono text-sm">{c.order}</span>,
      hideOn: 'sm',
    },
    {
      key: 'status',
      header: dict.admin.categories.table.status,
      render: (c) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-wider',
            c.isActive
              ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/30'
              : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', c.isActive ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]')} aria-hidden />
          {c.isActive ? dict.admin.categories.form.isActive : (locale === 'ar' ? 'مخفي' : 'Hidden')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: dict.admin.common.actions,
      align: 'end',
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(c)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden md:inline">{dict.admin.common.edit}</span>
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(c)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const isEmpty = categories && categories.length === 0;

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.categories.title}
        subtitle={dict.admin.categories.subtitle}
        actions={
          <Button
            variant="gold"
            size="md"
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => setCreating(true)}
          >
            {dict.admin.categories.addCategory}
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<Tags className="h-7 w-7" aria-hidden />}
          title={dict.admin.categories.empty}
          action={
            <Button
              variant="gold"
              size="md"
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={() => setCreating(true)}
            >
              {dict.admin.categories.addCategory}
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} rows={categories} rowKey={(c) => c._id} />
      )}

      {(creating || editing) && (
        <CategoryFormModal
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await updateCategory({ id: editing._id, ...values });
                showToast(dict.admin.categories.toast.updated, 'success');
              } else {
                await createCategory(values);
                showToast(dict.admin.categories.toast.created, 'success');
              }
              setCreating(false);
              setEditing(null);
            } catch (err) {
              showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
            }
          }}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={dict.admin.confirm.deleteTitle}
        description={`${dict.admin.confirm.deleteDesc} (${pendingDelete ? (locale === 'ar' ? pendingDelete.nameAr : pendingDelete.name) : ''})`}
        confirmText={dict.admin.common.delete}
        cancelText={dict.admin.common.cancel}
        destructive
        loading={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          try {
            await removeCategory({ id: pendingDelete._id });
            showToast(dict.admin.categories.toast.deleted, 'success');
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

interface CategoryFormModalProps {
  initial?: Cat;
  onClose:  () => void;
  onSubmit: (values: { slug: string; name: string; nameAr: string; description: string; bannerImage: string; icon: string; order: number; isActive: boolean }) => Promise<void>;
}

function CategoryFormModal({ initial, onClose, onSubmit }: CategoryFormModalProps) {
  const { dict } = useLocale();
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [nameAr, setNameAr] = useState(initial?.nameAr ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [bannerImage, setBannerImage] = useState(initial?.bannerImage ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? '🥩');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ slug, name, nameAr, description, bannerImage, icon, order, isActive });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--bg-overlay)]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-raised">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
            {initial ? dict.admin.categories.editCategory : dict.admin.categories.addCategory}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={dict.admin.categories.form.name} required>
              <FormInput value={name} onChange={(e) => setName(e.target.value)} required />
            </FormField>
            <FormField label={dict.admin.categories.form.nameAr} required>
              <FormInput value={nameAr} onChange={(e) => setNameAr(e.target.value)} required dir="rtl" />
            </FormField>
          </div>
          <FormField label={dict.admin.categories.form.slug} required>
            <FormInput
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              required
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.categories.form.description}>
            <FormTextarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label={dict.admin.categories.form.icon}>
              <FormInput value={icon} onChange={(e) => setIcon(e.target.value)} />
            </FormField>
            <FormField label={dict.admin.categories.form.order}>
              <FormInput
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                dir="ltr"
              />
            </FormField>
            <FormField label={dict.admin.categories.form.isActive}>
              <div className="h-11 flex items-center">
                <FormToggle checked={isActive} onChange={setIsActive} />
              </div>
            </FormField>
          </div>
          <FormField label={dict.admin.categories.form.bannerImage}>
            <FormInput
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://..."
              dir="ltr"
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              {dict.admin.common.cancel}
            </Button>
            <Button type="submit" variant="gold" size="md" loading={saving}>
              {saving ? dict.admin.common.saving : dict.admin.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
