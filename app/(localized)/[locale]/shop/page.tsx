'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FilterSidebar from '@/components/shop/FilterSidebar';
import ProductCard from '@/components/shop/ProductCard';
import SkeletonCard from '@/components/shop/SkeletonCard';
import SortBar from '@/components/shop/SortBar';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { SORT_OPTIONS, type SortValue } from '@/lib/constants';
import { cn, discountedPrice } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Search, Sparkles, X } from 'lucide-react';

const MAX_FILTER_PRICE = 2000;

function readBooleanParam(value: string | null) {
  return value === '1';
}

function readMaxPriceParam(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return MAX_FILTER_PRICE;
  }

  return Math.min(MAX_FILTER_PRICE, Math.floor(parsed));
}

function isSortValue(value: string): value is SortValue {
  return SORT_OPTIONS.some((option) => option.value === value);
}

function ShopContent() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Read search query & filters from URL
  const searchQuery = searchParams.get('q') ?? '';
  const categorySlug = searchParams.get('category') ?? '';
  const rawSortBy = searchParams.get('sort') ?? 'featured';
  const sortBy = isSortValue(rawSortBy) ? rawSortBy : 'featured';
  const selectedStates = useMemo(
    () => ({
      fresh: readBooleanParam(searchParams.get('fresh')),
      frozen: readBooleanParam(searchParams.get('frozen')),
      premium: readBooleanParam(searchParams.get('premium')),
      bestseller: readBooleanParam(searchParams.get('bestseller')),
    }),
    [searchParams]
  );
  const maxPrice = useMemo(
    () => readMaxPriceParam(searchParams.get('maxPrice')),
    [searchParams]
  );
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(categorySlug) ||
    sortBy !== 'featured' ||
    selectedStates.fresh ||
    selectedStates.frozen ||
    selectedStates.premium ||
    selectedStates.bestseller ||
    maxPrice < MAX_FILTER_PRICE;

  // ── Pagination Hook ──
  const { page, limit, setPage, setLimit, replacePagination } = usePagination({
    defaultPage: 1,
    defaultLimit: 12,
    scrollToTop: true,
  });

  // ── Convex Data Fetching ──
  const paginatedData = useQuery(api.products.listPaginated, {
    page,
    limit,
    categorySlug: categorySlug || undefined,
    searchQuery: searchQuery || undefined,
    sortBy,
    includeFresh: selectedStates.fresh || undefined,
    includeFrozen: selectedStates.frozen || undefined,
    includePremiumCut: selectedStates.premium || undefined,
    includeBestSeller: selectedStates.bestseller || undefined,
    maxPrice: maxPrice < MAX_FILTER_PRICE ? maxPrice : undefined,
  });

  const wishlistItems = useQuery(
    api.wishlist.get,
    user ? { userId: user.id } : 'skip'
  );

  // ── Mutations ──
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);
  const addToCartMutation = useMutation(api.cart.add);

  // Wishlist set lookups
  const wishlistedProductIds = useMemo(() => {
    if (!wishlistItems) return new Set<string>();
    return new Set(wishlistItems.map((item) => item._id));
  }, [wishlistItems]);

  useEffect(() => {
    if (!paginatedData) return;

    if (paginatedData.page !== page || paginatedData.limit !== limit) {
      replacePagination(paginatedData.page, paginatedData.limit);
    }
  }, [limit, page, paginatedData, replacePagination]);

  useEffect(() => {
    if (!isMobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFiltersOpen]);

  const updateSearchParams = (
    updates: Record<string, string | null>,
    options?: { method?: 'push' | 'replace'; scroll?: boolean }
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('page');

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    const method = options?.method ?? 'push';
    const scroll = options?.scroll ?? false;

    router[method](nextUrl, { scroll });
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      router.push(`/${locale}/sign-in`);
      return;
    }
    await toggleWishlistMutation({
      userId: user.id,
      productId: productId as Id<'products'>,
    });
  };

  const handleAddToCart = async (
    productId: string,
    weight: string,
    quantity: number
  ) => {
    if (!paginatedData) return;
    const product = paginatedData.data.find((p) => p._id === productId);
    if (!product) return;

    const variant =
      product.variants.find((v) => v.weight === weight) ?? product.variants[0];
    const finalPrice = product.discount
      ? discountedPrice(variant.price, product.discount)
      : variant.price;

    if (user) {
      await addToCartMutation({
        userId: user.id,
        productId: productId as Id<'products'>,
        variantWeight: weight,
        quantity,
        price: finalPrice,
      });
    } else {
      // Local storage fallback for guest cart
      const guestCart = JSON.parse(
        localStorage.getItem('et_guest_cart') ?? '[]'
      );
      const existingIdx = guestCart.findIndex(
        (item: {
          productId: string;
          variantWeight: string;
          quantity: number;
          price: number;
        }) => item.productId === productId && item.variantWeight === weight
      );
      if (existingIdx > -1) {
        guestCart[existingIdx].quantity += quantity;
      } else {
        guestCart.push({
          productId,
          variantWeight: weight,
          quantity,
          price: finalPrice,
        });
      }
      localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('storage'));
    }

    // Open the cart drawer
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleFilterUpdate = (key: string, value: string | null) => {
    updateSearchParams({ [key]: value });
  };

  const handleStateFiltersChange = (states: typeof selectedStates) => {
    updateSearchParams({
      fresh: states.fresh ? '1' : null,
      frozen: states.frozen ? '1' : null,
      premium: states.premium ? '1' : null,
      bestseller: states.bestseller ? '1' : null,
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    updateSearchParams(
      {
        maxPrice: range[1] < MAX_FILTER_PRICE ? String(range[1]) : null,
      },
      { method: 'replace' }
    );
  };

  const handleSearchChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = String(formData.get('search') ?? '').trim();
    handleFilterUpdate('q', q);
  };

  const handleClearFilters = () => {
    setIsMobileFiltersOpen(false);
    updateSearchParams(
      {
        q: null,
        category: null,
        sort: null,
        fresh: null,
        frozen: null,
        premium: null,
        bestseller: null,
        maxPrice: null,
      },
      { scroll: true }
    );
  };


  return (
    <main
      id="main-content"
      className="min-h-screen bg-[var(--bg-base)] py-16 md:py-24 font-sans text-[var(--text-primary)]"
    >
      <div className="container-brand">
        {/* Header Title */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
            {dict.shop?.craftedFresh || 'Crafted Fresh Daily'}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
            {dict.shop?.title || 'The Master Cut Catalog'}
          </h1>
          <p className="text-base text-secondary mt-5 leading-relaxed font-normal max-w-2xl mx-auto">
            {dict.shop?.subtitle ||
              'Explore our selection of prime beef, lamb, veal, and specialty cuts prepared by our master butchers.'}
          </p>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="mb-10 flex flex-col gap-6">
          {/* Search form */}
          <form
            onSubmit={handleSearchChange}
            className="relative w-full max-w-xl mx-auto"
          >
            <div className="relative flex items-center">
              <Search
                className="absolute start-4 w-5 h-5 text-[var(--text-secondary)]"
                aria-hidden="true"
              />
              <input
                key={searchQuery}
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder={
                  dict.shop?.searchPlaceholder ||
                  'Search for ribeye, minced beef, lamb ribs...'
                }
                className={cn(
                  'w-full min-h-12 ps-12 pe-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm font-normal text-[var(--text-primary)] transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/50 focus:border-[var(--gold)]'
                )}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleFilterUpdate('q', null)}
                  className="absolute end-4 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Sort bar */}
          <SortBar
            productCount={paginatedData?.total ?? 0}
            selectedSort={sortBy}
            onSelectSort={(val) => handleFilterUpdate('sort', val)}
            onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            hasActiveFilters={hasActiveFilters}
            onClearAllFilters={handleClearFilters}
          />
        </div>

        {/* Product Grid and Pagination */}
        {paginatedData === undefined ? (
          /* Loading State: Skeleton Cards */
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <FilterSidebar
              selectedCategory={categorySlug}
              onSelectCategory={(slug) => handleFilterUpdate('category', slug || null)}
              selectedStates={selectedStates}
              onChangeStates={handleStateFiltersChange}
              priceRange={[0, maxPrice]}
              onChangePriceRange={handlePriceRangeChange}
              onClearAll={handleClearFilters}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
            />
            <div className="flex-1 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
              {[...Array(limit)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : paginatedData.data.length > 0 ? (
          /* Success State: Show Cards + Pagination */
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <FilterSidebar
              selectedCategory={categorySlug}
              onSelectCategory={(slug) => handleFilterUpdate('category', slug || null)}
              selectedStates={selectedStates}
              onChangeStates={handleStateFiltersChange}
              priceRange={[0, maxPrice]}
              onChangePriceRange={handlePriceRangeChange}
              onClearAll={handleClearFilters}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
            />

            <div className="flex-1 flex flex-col gap-10 min-w-0">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
                {paginatedData.data.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    isInWishlist={wishlistedProductIds.has(prod._id)}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                page={page}
                limit={limit}
                total={paginatedData.total}
                totalPages={paginatedData.totalPages}
                onPageChange={setPage}
                onLimitChange={setLimit}
                limitOptions={[12, 24, 48]}
                className="mt-6"
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <FilterSidebar
              selectedCategory={categorySlug}
              onSelectCategory={(slug) => handleFilterUpdate('category', slug || null)}
              selectedStates={selectedStates}
              onChangeStates={handleStateFiltersChange}
              priceRange={[0, maxPrice]}
              onChangePriceRange={handlePriceRangeChange}
              onClearAll={handleClearFilters}
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
            />

            <div
              role="status"
              aria-live="polite"
              className="flex-1 flex flex-col items-center justify-center text-center py-20 md:py-24 px-4 rounded-xl bg-surface border border-[var(--border-subtle)] max-w-3xl mx-auto shadow-card"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--gold-subtle)]/40 border border-[var(--gold-border)]/40 flex items-center justify-center mb-5">
                <Sparkles
                  className="w-7 h-7 text-[var(--gold)]"
                  aria-hidden="true"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-primary">
                {dict.shop?.emptyTitle || 'No Cuts Found'}
              </h3>
              <p className="text-sm text-secondary max-w-md mt-2.5 leading-relaxed font-normal">
                {hasActiveFilters
                  ? dict.shop?.emptyDescription ||
                    "We couldn't find any products matching your current criteria. Try adjusting your filters."
                  : locale === 'ar'
                    ? 'لا توجد منتجات معروضة للبيع حالياً.'
                    : 'No products are currently available in the storefront.'}
              </p>
              <div className="mt-6">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] shadow-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
                  >
                    {dict.shop?.clearAllFilters || 'Clear All Filters'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
          </div>
        }
      >
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
