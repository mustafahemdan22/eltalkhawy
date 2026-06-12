'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import ProductForm, { EMPTY_PRODUCT } from '@/components/admin/ProductForm';
import { useLocale } from '@/components/LocaleProvider';

export default function NewProductPage() {
  const { locale, dict } = useLocale();

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.products.addTitle}
        subtitle={dict.admin.products.addSubtitle}
        back={{ href: `/${locale}/admin/products`, label: dict.admin.common.back }}
      />
      <ProductForm mode="create" initial={EMPTY_PRODUCT} />
    </div>
  );
}
