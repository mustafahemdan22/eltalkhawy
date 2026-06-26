'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import { FormField } from '@/components/admin/FormField';
import { FormInput } from '@/components/admin/FormInput';
import { FormTextarea } from '@/components/admin/FormTextarea';
import { FormSelect } from '@/components/admin/FormSelect';
import FormToggle from '@/components/admin/FormToggle';
import FormImagePicker from '@/components/admin/FormImagePicker';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Id } from '@/convex/_generated/dataModel';

type Variant = { weight: string; price: number; stock: number };
type Nutrition = {
  calories: number; protein: number; fat: number; saturatedFat: number; sodium: number; per: string;
};

export interface ProductFormState {
  slug:           string;
  name:           string;
  nameAr:         string;
  description:    string;
  descriptionAr:  string;
  categorySlug:   string;
  subcategory:    string;
  basePrice:      number;
  discount:       number | '';
  unit:           string;
  weight:         string;
  storageInfo:    string;
  cookingTips:    string;
  tags:           string;
  isFresh:        boolean;
  isFrozen:       boolean;
  isAvailable:    boolean;
  isBestSeller:   boolean;
  isPremiumCut:   boolean;
  isFeatured:     boolean;
  isBBQ:          boolean;
  images:         string[];
  variants:       Variant[];
  nutrition:      Nutrition;
}

export const EMPTY_PRODUCT: ProductFormState = {
  slug: '', name: '', nameAr: '', description: '', descriptionAr: '',
  categorySlug: '', subcategory: '',
  basePrice: 0, discount: '',
  unit: 'kg', weight: '',
  storageInfo: '', cookingTips: '', tags: '',
  isFresh: true, isFrozen: false, isAvailable: true,
  isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
  images: [],
  variants: [{ weight: '1kg', price: 0, stock: 0 }],
  nutrition: { calories: 0, protein: 0, fat: 0, saturatedFat: 0, sodium: 0, per: '100g' },
};

interface ProductFormProps {
  initial?: ProductFormState;
  productId?: Id<'products'>;
  mode: 'create' | 'edit';
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function ProductForm({ initial = EMPTY_PRODUCT, productId, mode }: ProductFormProps) {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  const [state, setState] = useState<ProductFormState>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof ProductFormState>(k: K, v: ProductFormState[K]) =>
    setState((s) => ({ ...s, [k]: v }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!state.name.trim()) e.name = dict.admin.products.errors.nameRequired;
    if (!SLUG_RE.test(state.slug)) e.slug = dict.admin.products.errors.slugInvalid;
    if (state.basePrice <= 0 || !Number.isFinite(state.basePrice)) e.basePrice = dict.admin.products.errors.priceInvalid;
    if (state.discount !== '' && (Number(state.discount) < 0 || Number(state.discount) > 100)) e.discount = dict.admin.products.errors.discountInvalid;
    if (!state.categorySlug) e.categorySlug = dict.admin.products.errors.categoryRequired;
    if (!state.variants.length) e.variants = dict.admin.products.errors.variantRequired;
    if (!state.images.length) e.images = dict.admin.products.errors.imageRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        slug:          state.slug,
        name:          state.name.trim(),
        nameAr:        state.nameAr.trim(),
        description:   state.description.trim(),
        descriptionAr: state.descriptionAr.trim(),
        categorySlug:  state.categorySlug,
        subcategory:   state.subcategory || undefined,
        images:        state.images,
        basePrice:     Number(state.basePrice),
        discount:      state.discount === '' ? undefined : Number(state.discount),
        unit:          state.unit,
        weight:        state.weight || undefined,
        storageInfo:   state.storageInfo || undefined,
        cookingTips:   state.cookingTips.split('\n').map((s) => s.trim()).filter(Boolean),
        tags:          state.tags.split(',').map((s) => s.trim()).filter(Boolean),
        isFresh:       state.isFresh,
        isFrozen:      state.isFrozen,
        isAvailable:   state.isAvailable,
        isBestSeller:  state.isBestSeller,
        isPremiumCut:  state.isPremiumCut,
        isFeatured:    state.isFeatured,
        isBBQ:         state.isBBQ,
        variants:      state.variants.map((v) => ({ weight: v.weight, price: Number(v.price), stock: Number(v.stock) })),
        nutritionInfo: state.nutrition.calories || state.nutrition.protein || state.nutrition.fat
          ? { ...state.nutrition }
          : undefined,
      };

      if (mode === 'create') {
        await createProduct(payload);
        showToast(dict.admin.products.toast.created, 'success');
      } else if (productId) {
        await updateProduct({ productId, ...payload });
        showToast(dict.admin.products.toast.updated, 'success');
      }
      router.push(`/${locale}/admin/products`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Category options are derived inside the section, fetched live.
  const categoryOptions = useCategoriesAsOptions();

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {/* Basics */}
      <Section title={dict.admin.products.form.sectionBasics}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={dict.admin.products.form.name} required error={errors.name}>
            <FormInput
              value={state.name}
              onChange={(e) => set('name', e.target.value)}
              invalid={!!errors.name}
            />
          </FormField>
          <FormField label={dict.admin.products.form.nameAr} required>
            <FormInput
              value={state.nameAr}
              onChange={(e) => set('nameAr', e.target.value)}
              dir="rtl"
            />
          </FormField>
          <FormField
            label={dict.admin.products.form.slug}
            required
            help={dict.admin.products.form.slugHelp}
            error={errors.slug}
          >
            <FormInput
              value={state.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase())}
              invalid={!!errors.slug}
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.products.form.category} required error={errors.categorySlug}>
            <FormSelect
              value={state.categorySlug}
              onChange={(e) => set('categorySlug', e.target.value)}
              options={categoryOptions}
              placeholder={dict.admin.products.form.category}
              invalid={!!errors.categorySlug}
            />
          </FormField>
          <FormField label={dict.admin.products.form.subcategory}>
            <FormInput
              value={state.subcategory}
              onChange={(e) => set('subcategory', e.target.value)}
            />
          </FormField>
          <FormField label={dict.admin.products.form.description}>
            <FormTextarea
              value={state.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
            />
          </FormField>
          <FormField label={dict.admin.products.form.descriptionAr}>
            <FormTextarea
              value={state.descriptionAr}
              onChange={(e) => set('descriptionAr', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </FormField>
        </div>
      </Section>

      {/* Pricing & Stock */}
      <Section title={dict.admin.products.form.sectionPricing}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={dict.admin.products.form.basePrice} required error={errors.basePrice}>
            <FormInput
              type="number"
              min="0"
              step="0.01"
              value={state.basePrice}
              onChange={(e) => set('basePrice', Number(e.target.value))}
              invalid={!!errors.basePrice}
              dir="ltr"
            />
          </FormField>
          <FormField
            label={dict.admin.products.form.discount}
            help={dict.admin.products.form.discountHelp}
            error={errors.discount}
          >
            <FormInput
              type="number"
              min="0"
              max="100"
              value={state.discount}
              onChange={(e) => set('discount', e.target.value === '' ? '' : Number(e.target.value))}
              invalid={!!errors.discount}
              dir="ltr"
            />
          </FormField>
          <FormField label={dict.admin.products.form.unit}>
            <FormSelect
              value={state.unit}
              onChange={(e) => set('unit', e.target.value)}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'g',  label: 'g'  },
                { value: 'piece', label: 'piece' },
              ]}
            />
          </FormField>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {dict.admin.products.form.variants}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              iconLeft={<Plus className="h-3.5 w-3.5" />}
              onClick={() => set('variants', [...state.variants, { weight: '500g', price: 0, stock: 0 }])}
            >
              {dict.admin.products.form.addVariant}
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {state.variants.map((v, i) => (
              <li
                key={i}
                className="grid grid-cols-12 gap-2 items-end rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/40 p-3"
              >
                <div className="col-span-4">
                  <FormField label={dict.admin.products.form.variantWeight}>
                    <FormInput
                      value={v.weight}
                      onChange={(e) => {
                        const next = [...state.variants];
                        next[i] = { ...v, weight: e.target.value };
                        set('variants', next);
                      }}
                    />
                  </FormField>
                </div>
                <div className="col-span-3">
                  <FormField label={dict.admin.products.form.variantPrice}>
                    <FormInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={v.price}
                      onChange={(e) => {
                        const next = [...state.variants];
                        next[i] = { ...v, price: Number(e.target.value) };
                        set('variants', next);
                      }}
                      dir="ltr"
                    />
                  </FormField>
                </div>
                <div className="col-span-4">
                  <FormField label={dict.admin.products.form.variantStock}>
                    <FormInput
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => {
                        const next = [...state.variants];
                        next[i] = { ...v, stock: Number(e.target.value) };
                        set('variants', next);
                      }}
                      dir="ltr"
                    />
                  </FormField>
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => set('variants', state.variants.filter((_, idx) => idx !== i))}
                    disabled={state.variants.length === 1}
                    className="inline-flex h-11 w-full items-center justify-center rounded-button text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={dict.admin.products.form.removeVariant}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {errors.variants && <p className="mt-1.5 text-2xs text-red-500">{errors.variants}</p>}
        </div>
      </Section>

      {/* Attributes & Toggles */}
      <Section title={dict.admin.products.form.sectionAttributes}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <ToggleRow
            label={dict.admin.products.form.isAvailable}
            checked={state.isAvailable}
            onChange={(v) => set('isAvailable', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isFresh}
            checked={state.isFresh}
            onChange={(v) => set('isFresh', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isFrozen}
            checked={state.isFrozen}
            onChange={(v) => set('isFrozen', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isFeatured}
            checked={state.isFeatured}
            onChange={(v) => set('isFeatured', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isBestSeller}
            checked={state.isBestSeller}
            onChange={(v) => set('isBestSeller', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isPremiumCut}
            checked={state.isPremiumCut}
            onChange={(v) => set('isPremiumCut', v)}
          />
          <ToggleRow
            label={dict.admin.products.form.isBBQ}
            checked={state.isBBQ}
            onChange={(v) => set('isBBQ', v)}
          />
        </div>
      </Section>

      {/* Images */}
      <Section title={dict.admin.products.form.sectionImages}>
        <FormField label={dict.admin.products.form.images} help={dict.admin.products.form.imagesHelp} error={errors.images}>
          <FormImagePicker
            value={state.images}
            onChange={(urls) => set('images', urls)}
            folder="products"
            maxItems={8}
            category={state.categorySlug}
            subcategory={state.subcategory}
            productId={state.slug}
          />
        </FormField>
      </Section>

      {/* Meta */}
      <Section title={dict.admin.products.form.sectionMeta}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={dict.admin.products.form.storageInfo}>
            <FormTextarea
              value={state.storageInfo}
              onChange={(e) => set('storageInfo', e.target.value)}
              rows={2}
            />
          </FormField>
          <FormField label={dict.admin.products.form.cookingTips}>
            <FormTextarea
              value={state.cookingTips}
              onChange={(e) => set('cookingTips', e.target.value)}
              rows={3}
            />
          </FormField>
          <FormField label={dict.admin.products.form.tags}>
            <FormInput
              value={state.tags}
              onChange={(e) => set('tags', e.target.value)}
            />
          </FormField>
          <FormField label={dict.admin.products.form.weight}>
            <FormInput
              value={state.weight}
              onChange={(e) => set('weight', e.target.value)}
            />
          </FormField>
        </div>
      </Section>

      {/* Actions */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 -mb-6 lg:-mb-8 mt-4 bg-[var(--bg-base)]/95 backdrop-blur-sm border-t border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-end gap-2.5">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.back()}
        >
          {dict.admin.common.cancel}
        </Button>
        <Button
          type="submit"
          variant="gold"
          size="md"
          loading={saving}
        >
          {saving ? dict.admin.common.saving : dict.admin.common.save}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={cn('flex items-center justify-between rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/30 px-4 py-3')}>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
      <FormToggle checked={checked} onChange={onChange} />
    </div>
  );
}

// Inline hook to convert categories query to <FormSelectOption[]>.
function useCategoriesAsOptions() {
  const { locale } = useLocale();
  const categories = useQuery(api.categories.listAll);
  return [
    { value: '', label: locale === 'ar' ? 'اختر تصنيفاً' : 'Select a category' },
    ...(categories?.map((c) => ({
      value: c.slug,
      label: locale === 'ar' ? c.nameAr : c.name,
    })) ?? []),
  ];
}
