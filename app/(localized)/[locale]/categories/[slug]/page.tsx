'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import SkeletonCard from '@/components/shop/SkeletonCard';
import SortBar from '@/components/shop/SortBar';
import { CATEGORIES, CATEGORY_IMAGES, withImageSize, type SortValue } from '@/lib/constants';
import { cn, discountedPrice } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import { ArrowLeft, Sparkles, ChefHat } from 'lucide-react';

interface StaticCategory {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  image: string;
  subcategories?: { slug: string; name: string; nameAr: string }[];
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function CategoryDetailPage({ params, searchParams }: PageProps) {
  const { slug } = React.use(params);
  const searchParamsResolved = React.use(searchParams);
  const initialSub = typeof searchParamsResolved.sub === 'string' ? searchParamsResolved.sub : 'all';

  const router = useRouter();
  const { user } = useUser();
  const { locale, dict } = useLocale();

  // Find Category info
  const categoryInfo = useMemo(() => {
    return CATEGORIES.find((cat) => cat.slug === slug) as StaticCategory | undefined;
  }, [slug]);

  // Local States
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSub);
  const [sortBy, setSortBy] = useState<SortValue>('featured');

  // ── Convex Data Fetching ──
  const products = useQuery(api.products.list, { categorySlug: slug });
  
  const wishlistItems = useQuery(
    api.wishlist.get,
    user ? { userId: user.id } : 'skip'
  );

  // ── Mutations ──
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);
  const addToCartMutation = useMutation(api.cart.add);

  const handleToggleWishlist = async (productId: string) => {
    if (!user) {
      router.push(`/${locale}/sign-in`);
      return;
    }
    await toggleWishlistMutation({ userId: user.id, productId: productId as Id<"products"> });
  };

  const handleAddToCart = async (productId: string, weight: string, quantity: number) => {
    const product = products?.find((p) => p._id === productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.weight === weight) ?? product.variants[0];
    const finalPrice = product.discount
      ? discountedPrice(variant.price, product.discount)
      : variant.price;

    if (user) {
      await addToCartMutation({
        userId: user.id,
        productId: productId as Id<"products">,
        variantWeight: weight,
        quantity,
        price: finalPrice,
      });
    } else {
      // Local storage fallback for guest cart
      const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      const existingIdx = guestCart.findIndex(
        (item: { productId: string; variantWeight: string; quantity: number; price: number }) => item.productId === productId && item.variantWeight === weight
      );
      if (existingIdx > -1) {
        guestCart[existingIdx].quantity += quantity;
      } else {
        guestCart.push({ productId, variantWeight: weight, quantity, price: finalPrice });
      }
      localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('storage'));
    }

    // Open the cart drawer
    window.dispatchEvent(new Event('open-cart'));
  };

  // Wishlist set lookups
  const wishlistedProductIds = useMemo(() => {
    if (!wishlistItems) return new Set<string>();
    return new Set(wishlistItems.map((item) => item._id));
  }, [wishlistItems]);

  // Filter & Sort Products
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let list = [...products];

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case 'price-asc':
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestsellers':
        list.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return b.rating - a.rating;
        });
        break;
      default:
        // Featured / default list order
        break;
    }

    return list;
  }, [products, selectedSubcategory, sortBy]);

  if (!categoryInfo) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center font-sans">
          <div className="text-center p-8 rounded-2xl bg-surface border border-muted max-w-md shadow-card">
            <h1 className="font-display text-2xl font-bold text-primary">
              {dict.categoryDetail.notFoundTitle}
            </h1>
            <p className="text-sm text-secondary mt-2 font-normal">
              {dict.categoryDetail.notFoundDesc}
            </p>
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center justify-center gap-2 mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-inverse hover:bg-[var(--gold)] transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", locale === 'ar' && "rotate-180")} />
              {dict.categoryDetail.backToCategories}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryImg = withImageSize(CATEGORY_IMAGES[slug] ?? 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6', { width: 1200 });
  const subcats = categoryInfo.subcategories ?? [];

  return (
    <>
      <Navbar />

      {/* Hero Category Banner */}
      <section data-theme="dark" className="relative w-full h-[300px] md:h-[400px] bg-base flex items-center overflow-hidden font-sans">
        <Image
          src={categoryImg}
          alt={categoryInfo.name}
          fill
          priority
          className="object-cover opacity-35"
        />
        {/* Soft elegant gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-base)]/80 via-transparent to-transparent" />

        <div className="container-brand relative z-10">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted font-semibold mb-8">
              <Link href={`/${locale}`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">
                {dict.categoryDetail.home}
              </Link>
              <span>/</span>
              <Link href={`/${locale}/categories`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">
                {dict.categoryDetail.categories}
              </Link>
              <span>/</span>
              <span className="text-[var(--gold)]">{locale === 'ar' ? categoryInfo.nameAr : categoryInfo.name}</span>
            </div>

            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {categoryInfo.icon} {dict.categoryDetail.premiumCut}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary flex items-baseline gap-4 flex-wrap">
              {locale === 'ar' ? categoryInfo.nameAr : categoryInfo.name}
              <span className="font-arabic text-secondary text-xl font-medium tracking-normal">({locale === 'ar' ? categoryInfo.name : categoryInfo.nameAr})</span>
            </h1>
            <p className="text-base md:text-base text-secondary mt-5 leading-relaxed font-normal font-sans max-w-xl">
              {locale === 'ar' ? categoryInfo.descriptionAr : categoryInfo.description}
            </p>

            {/* Animal cut catalogue link */}
            {['beef', 'buffalo', 'lamb', 'goat', 'veal'].includes(slug) && (
              <Link
                href={`/${locale}/animal/${slug}`}
                className="inline-flex items-center gap-2 mt-6 h-11 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20 border border-[var(--gold)]/20 hover:border-[var(--gold)]/40 transition-all"
              >
                <ChefHat className="w-3.5 h-3.5" />
                {dict.categoryDetail.browseCutGuide}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <main id="main-content" className="bg-[var(--bg-base)] pb-24 md:pb-32 font-sans">
        <div className="container-brand">

          {/* Subcategory Chips */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-6 border-b border-muted mb-6">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={cn(
                'h-11 px-6 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
                selectedSubcategory === 'all'
                    ? 'bg-[var(--gold)] border-[var(--gold)] text-inverse font-bold shadow-gold'
                    : 'bg-surface border-muted text-secondary hover:text-primary hover:border-[var(--gold)]/50'
                )}
            >
              {locale === 'ar' ? `كل ${categoryInfo.nameAr}` : `All ${categoryInfo.name}`}
            </button>
            {subcats.map((sub: { slug: string; name: string; nameAr: string }) => (
              <button
                key={sub.slug}
                onClick={() => setSelectedSubcategory(sub.slug)}
                className={cn(
                  'h-11 px-6 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
                  selectedSubcategory === sub.slug
                    ? 'bg-[var(--gold)] border-[var(--gold)] text-inverse font-bold shadow-gold'
                    : 'bg-surface border-muted text-secondary hover:text-primary hover:border-[var(--gold)]/50'
                )}
              >
                {locale === 'ar' ? sub.nameAr : sub.name} <span className="font-arabic text-3xs font-normal">({locale === 'ar' ? sub.name : sub.nameAr})</span>
              </button>
            ))}
          </div>

          {/* Sort Bar */}
          <div className="mb-10">
            <SortBar
              productCount={filteredAndSortedProducts.length}
              selectedSort={sortBy}
              onSelectSort={setSortBy}
              onOpenMobileFilters={() => {
                /* No-op on this page — subcategory chips act as filters */
              }}
            />
          </div>

          {/* Product Grid */}
          {products === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {filteredAndSortedProducts.map((prod) => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  isInWishlist={wishlistedProductIds.has(prod._id)}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            (() => {
              const isFiltered = selectedSubcategory !== 'all';
              return (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex flex-col items-center justify-center text-center py-20 md:py-24 px-4 rounded-2xl bg-surface border border-[var(--border-subtle)] max-w-lg mx-auto shadow-card"
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--gold-subtle)]/40 border border-[var(--gold-border)]/40 flex items-center justify-center mb-5">
                    <Sparkles className="w-7 h-7 text-[var(--gold)]" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-primary">
                    {isFiltered
                      ? dict.categoryDetail.emptyFilteredTitle
                      : dict.categoryDetail.emptyTitle}
                  </h3>
                  <p className="text-sm text-secondary max-w-md mt-2.5 leading-relaxed font-normal">
                    {isFiltered
                      ? dict.categoryDetail.emptyFilteredDesc.replace(
                          '{category}',
                          locale === 'ar' ? categoryInfo.nameAr : categoryInfo.name,
                        )
                      : dict.categoryDetail.emptyDesc}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {isFiltered ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategory('all')}
                          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] shadow-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
                        >
                          {dict.categoryDetail.clearFilters}
                        </button>
                        <Link
                          href={`/${locale}/categories`}
                          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
                        >
                          {dict.categoryDetail.browseAll}
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/${locale}/categories`}
                        className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] shadow-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
                      >
                        {dict.categoryDetail.exploreCatalog}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
