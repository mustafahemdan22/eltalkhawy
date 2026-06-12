'use client';

import { use, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductForm, { EMPTY_PRODUCT, type ProductFormState } from '@/components/admin/ProductForm';
import type { Id } from '@/convex/_generated/dataModel';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const { locale, dict } = useLocale();

  const product = useQuery(api.products.get, { id: id as Id<'products'> });

  const initial: ProductFormState = useMemo(() => {
    if (!product) return EMPTY_PRODUCT;
    return {
      slug:           product.slug,
      name:           product.name,
      nameAr:         product.nameAr,
      description:    product.description,
      descriptionAr:  product.descriptionAr,
      categorySlug:   product.categorySlug,
      subcategory:    product.subcategory ?? '',
      basePrice:      product.basePrice,
      discount:       product.discount ?? '',
      unit:           product.unit,
      weight:         product.weight ?? '',
      storageInfo:    product.storageInfo ?? '',
      cookingTips:    product.cookingTips.join('\n'),
      tags:           product.tags.join(', '),
      isFresh:        product.isFresh,
      isFrozen:       product.isFrozen,
      isAvailable:    product.isAvailable,
      isBestSeller:   product.isBestSeller,
      isPremiumCut:   product.isPremiumCut,
      isFeatured:     product.isFeatured,
      isBBQ:          product.isBBQ,
      images:         product.images,
      variants:       product.variants,
      nutrition:      product.nutritionInfo ?? EMPTY_PRODUCT.nutrition,
    };
  }, [product]);

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.products.editTitle}
        subtitle={dict.admin.products.editSubtitle}
        back={{ href: `/${locale}/admin/products`, label: dict.admin.common.back }}
      />
      {product === undefined ? (
        <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-sm text-[var(--text-secondary)]">
          {dict.admin.common.loading}
        </div>
      ) : product === null ? (
        <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-sm text-[var(--text-secondary)]">
          {dict.admin.common.error}
        </div>
      ) : (
        <ProductForm
          mode="edit"
          productId={product._id}
          initial={initial}
          key={product._id}
        />
      )}
    </div>
  );
}
