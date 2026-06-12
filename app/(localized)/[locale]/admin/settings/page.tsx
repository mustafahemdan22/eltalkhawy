'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { FormField } from '@/components/admin/FormField';
import { FormInput } from '@/components/admin/FormInput';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

const FIELDS = ['siteName', 'contactEmail', 'contactPhone', 'address', 'currency', 'deliveryNote'] as const;
type FieldKey = typeof FIELDS[number];

const DEFAULTS: Record<FieldKey, string> = {
  siteName: '', contactEmail: '', contactPhone: '',
  address: '', currency: 'EGP', deliveryNote: '',
};

function pickValues(raw: Record<string, string | undefined> | undefined): Record<FieldKey, string> {
  if (!raw) return DEFAULTS;
  return {
    siteName:     raw.siteName     ?? DEFAULTS.siteName,
    contactEmail: raw.contactEmail ?? DEFAULTS.contactEmail,
    contactPhone: raw.contactPhone ?? DEFAULTS.contactPhone,
    address:      raw.address      ?? DEFAULTS.address,
    currency:     raw.currency     ?? DEFAULTS.currency,
    deliveryNote: raw.deliveryNote ?? DEFAULTS.deliveryNote,
  };
}

export default function AdminSettingsPage() {
  const { dict } = useLocale();
  const { showToast } = useToast();
  const settings = useQuery(api.settings.getAll);
  const setMany = useMutation(api.settings.setMany);

  // Seed values from the first non-undefined settings response. After that, user
  // edits are kept locally until they save (no cascading re-seeds).
  const [values, setValues] = useState<Record<FieldKey, string>>(() => pickValues(settings));
  const [saving, setSaving] = useState(false);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setMany({ values: FIELDS.map((k) => ({ key: k, value: values[k] })) });
      showToast(dict.admin.settings.saved, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.settings.title}
        subtitle={dict.admin.settings.subtitle}
      />

      <form
        key={settings ? 'loaded' : 'loading'}
        onSubmit={onSave}
        className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6 flex flex-col gap-5"
      >
        <p className="text-2xs text-[var(--text-secondary)] border-s-2 border-[var(--gold-border)] ps-3">
          {dict.admin.settings.help}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={dict.admin.settings.fields.siteName}>
            <FormInput
              value={values.siteName}
              onChange={(e) => setValues((v) => ({ ...v, siteName: e.target.value }))}
            />
          </FormField>
          <FormField label={dict.admin.settings.fields.contactEmail}>
            <FormInput
              type="email"
              value={values.contactEmail}
              onChange={(e) => setValues((v) => ({ ...v, contactEmail: e.target.value }))}
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.settings.fields.contactPhone}>
            <FormInput
              type="tel"
              value={values.contactPhone}
              onChange={(e) => setValues((v) => ({ ...v, contactPhone: e.target.value }))}
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.settings.fields.currency}>
            <FormInput
              value={values.currency}
              onChange={(e) => setValues((v) => ({ ...v, currency: e.target.value.toUpperCase() }))}
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.settings.fields.address} className="md:col-span-2">
            <FormInput
              value={values.address}
              onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
            />
          </FormField>
          <FormField label={dict.admin.settings.fields.deliveryNote} className="md:col-span-2">
            <FormInput
              value={values.deliveryNote}
              onChange={(e) => setValues((v) => ({ ...v, deliveryNote: e.target.value }))}
            />
          </FormField>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-subtle)]">
          <Button type="submit" variant="gold" size="md" loading={saving} iconLeft={!saving ? <Save className="h-4 w-4" /> : undefined}>
            {saving ? dict.admin.common.saving : dict.admin.common.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
