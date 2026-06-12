'use client';

import React, { useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import SkeletonCard from '@/components/shop/SkeletonCard';
import { CATEGORIES, CATEGORY_IMAGES, withImageSize } from '@/lib/constants';
import { cn, discountedPrice } from '@/lib/utils';
import { ArrowRight, ChefHat, ArrowLeft, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/LocaleProvider';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';

const ANIMAL_SLUGS = new Set(['beef', 'buffalo', 'lamb', 'goat', 'veal']);

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function CategoriesContent() {
  const { locale, dict } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const searchQuery = searchParams.get('q') ?? '';

  // ── Convex Data Fetching ──
  const products = useQuery(api.products.list, {});
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

  const filteredProducts = useMemo(() => {
    if (!products || !searchQuery) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  if (searchQuery) {
    return (
      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-16 md:py-24">
        <div className="container-brand font-sans">
          {/* Header */}
          <div className="mb-12">
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center gap-2 text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-medium mb-6 transition-colors"
            >
              <ArrowLeft className={cn("w-4 h-4", locale === 'ar' && "rotate-180")} />
              {locale === 'ar' ? 'العودة للتصنيفات' : 'Back to Categories'}
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
              {locale === 'ar' ? `نتائج البحث عن: "${searchQuery}"` : `Search results for: "${searchQuery}"`}
            </h1>
            <p className="text-sm text-secondary mt-2">
              {products === undefined
                ? (locale === 'ar' ? 'جاري البحث في قائمة منتجاتنا...' : 'Searching our product list...')
                : (locale === 'ar'
                    ? `تم العثور على ${filteredProducts.length} منتج`
                    : `Found ${filteredProducts.length} product${filteredProducts.length === 1 ? '' : 's'}`)}
            </p>
          </div>

          {/* Product Grid */}
          {products === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {filteredProducts.map((prod) => (
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
            /* Premium Empty State */
            <div className="flex flex-col items-center justify-center text-center py-24 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto shadow-card">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <ShoppingBag className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">
                {locale === 'ar' ? 'لا توجد نتائج مطابقة' : 'No Products Found'}
              </h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-normal">
                {locale === 'ar'
                  ? 'لم نجد أي منتجات تطابق بحثك. جرب استخدام كلمات بحث مختلفة.'
                  : "We couldn't find any products matching your search query. Try typing something else."}
              </p>
              <Link
                href={`/${locale}/categories`}
                className="inline-flex items-center justify-center mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-inverse hover:bg-[var(--gold)] transition-colors"
              >
                {locale === 'ar' ? 'تصفح كل الأقسام' : 'Browse All Categories'}
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-16 md:py-24">
      <div className="container-brand font-sans">

        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
            {dict.categoriesPage.label}
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
            {dict.categoriesPage.title}
          </h1>
          <p className="text-base text-secondary mt-5 leading-relaxed font-normal">
            {dict.categoriesPage.subtitle}
          </p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {CATEGORIES.map((cat) => {
            const img = withImageSize(CATEGORY_IMAGES[cat.slug] ?? '', { width: 600 });
            const isAnimal = ANIMAL_SLUGS.has(cat.slug);

            return (
              <motion.div
                key={cat.slug}
                variants={cardVariants}
                className="group rounded-2xl bg-surface ring-1 ring-inset ring-[var(--border-muted)] overflow-hidden shadow-card hover:ring-[var(--gold)]/40 transition-all duration-300 flex flex-col h-full"
              >
                {/* Category Image Header */}
                <div className="relative aspect-[16/9] w-full bg-surface-raised overflow-hidden" data-theme="dark">
                  {img && (
                    <Image
                      src={img}
                      alt={cat.name}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/90 via-[var(--bg-base)]/40 to-transparent" />

                  {/* Icon and Titles */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                    <div>
                      <span className="text-[var(--gold)] text-2xs font-semibold tracking-widest uppercase block mb-1">
                        {cat.icon} {dict.categoriesPage.specialtyCut}
                      </span>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                        {locale === 'ar' ? cat.nameAr : cat.name}
                        <span className="font-arabic text-primary/70 text-sm font-medium">({locale === 'ar' ? cat.name : cat.nameAr})</span>
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex flex-col flex-1 gap-5">
                  <p className="text-sm text-secondary font-normal leading-relaxed line-clamp-3">
                    {locale === 'ar' ? cat.descriptionAr : cat.description}
                  </p>

                  {/* CTA Footer */}
                  <div className="mt-auto pt-5 border-t border-muted flex items-center justify-between gap-3">
                    <span className="text-2xs uppercase tracking-[0.15em] text-muted font-mono shrink-0">
                      {isAnimal
                        ? dict.categoriesPage.butcherCuts
                        : dict.categoriesPage.butcheryTag}
                    </span>
                    <Link
                      href={isAnimal ? `/${locale}/animal/${cat.slug}` : `/${locale}/categories/${cat.slug}`}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0',
                        'min-h-11 px-5 rounded-button',
                        isAnimal
                          ? 'bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] shadow-gold'
                          : 'bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] shadow-card',
                        'transition-all duration-250 ease-premium',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] focus-visible:ring-[var(--gold)]',
                      )}
                    >
                      {isAnimal && <ChefHat className="w-3.5 h-3.5" aria-hidden="true" />}
                      {isAnimal ? dict.categoriesPage.viewCuts : dict.categoriesPage.exploreSelection}
                      <ArrowRight className={cn(
                        'w-3.5 h-3.5 transition-transform duration-300',
                        'group-hover:translate-x-1',
                      )} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </main>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
        </div>
      }>
        <CategoriesContent />
      </Suspense>
      <Footer />
    </>
  );
}
