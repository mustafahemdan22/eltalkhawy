'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { motion } from 'framer-motion';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CutCard from '@/components/shop/CutCard';
import { CATEGORIES, CATEGORY_IMAGES, withImageSize } from '@/lib/constants';
import { ANIMAL_CUTS } from '@/lib/animal-cuts';
import { cn, discountedPrice } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import {
  ArrowLeft, ArrowRight, ChefHat, Shield, Droplets, Loader2,
} from 'lucide-react';

/* ── Hero images per animal (sourced from the shared CATEGORY_IMAGES map) ── */
const HERO_IMAGES: Record<string, string> = Object.fromEntries(
  ['beef', 'buffalo', 'lamb', 'goat', 'veal'].map((slug) => [
    slug,
    withImageSize(CATEGORY_IMAGES[slug] ?? '', { width: 1400 }),
  ]),
);

/* ── Animals eligible for cut catalogue ── */
const ANIMAL_SLUGS = new Set(['beef', 'buffalo', 'lamb', 'goat', 'veal']);

/* ── List for cross-navigation ── */
const ANIMAL_LIST = ['beef', 'buffalo', 'lamb', 'goat', 'veal'];

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

interface PageProps {
  params: Promise<{ animal: string }>;
}

export default function AnimalPage({ params }: PageProps) {
  const { animal } = React.use(params);
  const { user } = useUser();
  const { locale, dict } = useLocale();
  const isRtl = locale === 'ar';

  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  /* ── Category info from CATEGORIES constant ── */
  const animalInfo = CATEGORIES.find((c) => c.slug === animal);
  const isValidAnimal = animalInfo !== undefined && ANIMAL_SLUGS.has(animal);

  /* ── Dynamic document title ── */
  useEffect(() => {
    const name = isRtl ? animalInfo?.nameAr : animalInfo?.name;
    if (name) document.title = `${name} Cuts | El Talkhawy`;
  }, [animalInfo, isRtl]);

  /* ── Cut catalogue for this animal ── */
  const cuts = useMemo(() => ANIMAL_CUTS[animal] ?? [], [animal]);

  /* ── Price range ── */
  const priceRange = useMemo(() => {
    const prices = cuts.map((c) => c.price).filter(Boolean) as number[];
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [cuts]);

  /* ── Other animals for cross-navigation ── */
  const otherAnimals = useMemo(() => {
    return ANIMAL_LIST.filter((s) => s !== animal)
      .map((s) => CATEGORIES.find((c) => c.slug === s))
      .filter(Boolean)
      .slice(0, 3);
  }, [animal]);

  /* ── Convex real products (skip if unrecognized animal) ── */
  const dbProducts = useQuery(
    api.products.list,
    isValidAnimal ? {} : 'skip',
  );

  /* ── Build a fast map: slug → product ── */
  const productMap = useMemo(() => {
    if (!dbProducts) return null;
    const map = new Map<string, (typeof dbProducts)[number]>();
    for (const p of dbProducts) {
      map.set(p.slug, p);
    }
    return map;
  }, [dbProducts]);

  /* ── Cart mutation ── */
  const addToCartMutation = useMutation(api.cart.add);

  const handleAddToCart = useCallback(async (productId: string, weight: string) => {
    const product = dbProducts?.find((p) => p._id === productId);
    if (!product) return;

    setAddingToCartId(productId);

    const variant = product.variants.find((v) => v.weight === weight) ?? product.variants[0];
    const finalPrice = product.discount
      ? discountedPrice(variant.price, product.discount)
      : variant.price;

    if (user) {
      await addToCartMutation({
        userId: user.id,
        productId: productId as Id<'products'>,
        variantWeight: weight,
        quantity: 1,
        price: finalPrice,
      });
    } else {
      const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      const existingIdx = guestCart.findIndex(
        (item: { productId: string; variantWeight: string }) =>
          item.productId === productId && item.variantWeight === weight,
      );
      if (existingIdx > -1) {
        guestCart[existingIdx].quantity += 1;
      } else {
        guestCart.push({ productId, variantWeight: weight, quantity: 1, price: finalPrice });
      }
      localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('storage'));
    }

    setTimeout(() => setAddingToCartId(null), 1500);
    window.dispatchEvent(new Event('open-cart'));
  }, [dbProducts, user, addToCartMutation]);

  /* ── 404: Unknown animal ── */
  if (!isValidAnimal) {
    return (
      <>
        <Navbar />
        <main id="main-content" className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center font-sans">
          <div className="text-center p-8 rounded-2xl bg-surface border border-muted max-w-md shadow-card">
            <h1 className="font-display text-2xl font-bold text-primary">
              {dict.animalPage.notFoundTitle}
            </h1>
            <p className="text-sm text-secondary mt-2 font-normal">
              {dict.animalPage.notFoundDesc}
            </p>
            <Link
              href={`/${locale}/categories`}
              className={cn(
                'inline-flex items-center justify-center gap-2 mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider',
                'bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] transition-colors',
              )}
            >
              <ArrowLeft className={cn('w-4 h-4', isRtl && 'rotate-180')} />
              {dict.animalPage.backToCategories}
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const heroImg = HERO_IMAGES[animal] ?? HERO_IMAGES.beef;
  const cutCount = cuts.length;
  const productCount = productMap?.size ?? 0;

  return (
    <>
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section data-theme="dark" className="relative w-full min-h-[320px] md:min-h-[420px] flex items-center overflow-hidden font-sans bg-[var(--bg-base)]">
        <Image
          src={heroImg}
          alt={isRtl ? animalInfo.nameAr : animalInfo.name}
          fill
          priority
          className="object-cover opacity-30 md:opacity-35"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
        <div className={cn(
          'absolute inset-0',
          isRtl
            ? 'bg-gradient-to-l from-[var(--bg-base)]/90 via-transparent to-transparent'
            : 'bg-gradient-to-r from-[var(--bg-base)]/90 via-transparent to-transparent',
        )} />

        <div className="relative z-10 container-brand w-full">
          <div className={cn('max-w-2xl', isRtl && 'mr-auto text-right')}>
            <nav aria-label="Breadcrumb" className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted font-semibold mb-6 md:mb-8">
              <Link href={`/${locale}`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">
                {dict.categoryDetail.home}
              </Link>
              <span className="text-muted/40" aria-hidden="true">/</span>
              <Link href={`/${locale}/categories`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">
                {dict.categoryDetail.categories}
              </Link>
              <span className="text-muted/40" aria-hidden="true">/</span>
              <span className="text-[var(--gold)]" aria-current="page">
                {isRtl ? animalInfo.nameAr : animalInfo.name}
              </span>
            </nav>

            <span className="text-[var(--gold)] text-xs font-semibold tracking-[0.2em] uppercase block mb-3">
              {animalInfo.icon} {dict.animalPage.premiumCuts}
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
              {isRtl ? animalInfo.nameAr : animalInfo.name}
            </h1>
            <p className="font-arabic text-base md:text-lg text-secondary mt-2 font-normal">
              {isRtl ? animalInfo.name : animalInfo.nameAr}
            </p>

            <p className="text-sm md:text-base text-secondary mt-4 max-w-lg leading-relaxed font-normal">
              {isRtl ? animalInfo.descriptionAr : animalInfo.description}
            </p>

            <div className={cn('flex flex-wrap gap-6 mt-6', isRtl && 'flex-row-reverse')}>
              <div className="flex items-center gap-2">
                <ChefHat className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                <span className="text-xs font-mono text-muted">
                  {cutCount} {dict.animalPage.cuts}
                </span>
              </div>
              {priceRange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">
                    {isRtl
                      ? `${priceRange.min} – ${priceRange.max} ج.م`
                      : `EGP ${priceRange.min} – ${priceRange.max}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                <span className="text-xs font-mono text-muted">
                  {dict.animalPage.freshDaily}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                <span className="text-xs font-mono text-muted">
                  {dict.animalPage.localFarmMeat}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CUTS GRID ── */}
      <main id="main-content" className="bg-[var(--bg-base)] min-h-screen py-14 md:py-20 font-sans">
        <div className="container-brand">
          {/* Section header */}
          <div className={cn('flex items-center justify-between mb-10', isRtl && 'flex-row-reverse')}>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
                {dict.animalPage.cutsCollection.replace('{name}', isRtl ? animalInfo.nameAr : animalInfo.name)}
              </h2>
              <p className="text-sm text-secondary mt-1 font-normal">
                {dict.animalPage.selectFrom.replace('{name}', isRtl ? animalInfo.nameAr : animalInfo.name)}
              </p>
            </div>
            <span className="text-sm font-mono text-muted border border-muted bg-surface rounded-full px-4 py-1.5 shrink-0">
              {cutCount} {dict.animalPage.cuts}
              {productCount > 0 && (
                <span className="text-[var(--gold)] ms-1">· {productCount} {dict.animalPage.inStock}</span>
              )}
            </span>
          </div>

          {/* Loading skeleton */}
          {dbProducts === undefined ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {Array.from({ length: Math.min(cutCount || 4, 8) }).map((_, i) => (
                <div key={i} className="bg-surface rounded-2xl overflow-hidden border border-muted animate-pulse">
                  <div className="aspect-[4/3] bg-surface-raised" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-1/3 rounded bg-surface-raised" />
                    <div className="h-5 w-3/4 rounded bg-surface-raised" />
                    <div className="h-4 w-1/2 rounded bg-surface-raised" />
                    <div className="h-8 w-full rounded bg-surface-raised mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : cuts.length > 0 ? (
            <>
              {/* Cut grid with staggered animations */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
              >
                {cuts.map((cut, idx) => {
                  const matchingProduct = cut.productSlug && productMap
                    ? productMap.get(cut.productSlug) ?? null
                    : null;

                  return (
                    <motion.div key={cut.slug} variants={cardVariants}>
                      <CutCard
                        cut={cut}
                        locale={locale}
                        product={matchingProduct ? {
                          _id: matchingProduct._id,
                          slug: matchingProduct.slug,
                          isAvailable: matchingProduct.isAvailable,
                          isFresh: matchingProduct.isFresh,
                          isFrozen: matchingProduct.isFrozen,
                          isPremiumCut: matchingProduct.isPremiumCut,
                          discount: matchingProduct.discount,
                          variants: matchingProduct.variants,
                        } : null}
                        onAddToCart={handleAddToCart}
                        isAdding={addingToCartId === matchingProduct?._id}
                        priority={idx < 4}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Attribution note + browse all link */}
              <div className={cn('mt-10 flex items-center justify-center gap-4 flex-wrap', isRtl && 'flex-row-reverse')}>
                {productCount === 0 && (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-muted text-xs text-muted font-mono">
                    <Loader2 className="w-3.5 h-3.5 text-[var(--gold)]" aria-hidden="true" />
                    {dict.animalPage.pricesLive}
                  </div>
                )}
                <Link
                  href={`/${locale}/categories/${animal}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-11 rounded-full bg-[var(--gold)]/10 text-[var(--gold)] hover:bg-[var(--gold)]/20 border border-[var(--gold)]/20 hover:border-[var(--gold)]/40 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  {dict.animalPage.viewAllProducts}
                  <ArrowRight className={cn('w-3.5 h-3.5', isRtl && 'rotate-180')} />
                </Link>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto">
              <span className="text-5xl mb-4 block opacity-30">{animalInfo.icon}</span>
              <h3 className="font-display text-xl font-bold text-primary">
                {dict.animalPage.noCutsYet}
              </h3>
              <p className="text-sm text-secondary mt-2 max-w-xs font-normal">
                {dict.animalPage.noCutsDesc}
              </p>
              <Link
                href={`/${locale}/categories`}
                className="inline-flex items-center justify-center mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-inverse hover:bg-[var(--gold)] transition-colors"
              >
                {dict.animalPage.browseShop}
              </Link>
            </div>
          )}

          {/* ── CROSS-ANIMAL NAVIGATION ── */}
          {cuts.length > 0 && otherAnimals.length > 0 && (
            <section className="mt-20 md:mt-28 pt-14 md:pt-20 border-t border-muted">
              <div className="text-center mb-10">
                <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-3">
                  {dict.animalPage.discoverMore}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary">
                  {dict.animalPage.exploreOtherMeats}
                </h2>
                <p className="text-sm text-secondary mt-2 font-normal">
                  {dict.animalPage.browseOtherSelections}
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
              >
                {otherAnimals.map((other) => {
                  if (!other) return null;
                  const img = HERO_IMAGES[other.slug] ?? heroImg;
                  return (
                    <motion.div key={other.slug} variants={cardVariants}>
                      <Link
                        href={`/${locale}/animal/${other.slug}`}
                        className="group block relative rounded-2xl overflow-hidden bg-surface ring-1 ring-inset ring-[var(--border-muted)] hover:ring-[var(--gold)]/40 transition-all duration-300 h-full"
                      >
                        <div className="relative aspect-[16/9] overflow-hidden" data-theme="dark">
                          <Image
                            src={img}
                            alt={isRtl ? other.nameAr : other.name}
                            fill
                            sizes="(max-width:768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/90 via-[var(--bg-base)]/40 to-transparent" />
                          <div className="absolute bottom-4 left-5 right-5">
                            <span className="text-[var(--gold)] text-2xs font-semibold tracking-widest uppercase block mb-1">
                              {other.icon}
                            </span>
                            <h3 className="font-display text-lg md:text-xl font-bold text-primary">
                              {isRtl ? other.nameAr : other.name}
                            </h3>
                          </div>
                        </div>
                        <div className="p-5 flex items-center justify-between">
                          <span className="text-xs text-muted font-mono">
                            {(ANIMAL_CUTS[other.slug]?.length ?? 0)} {dict.animalPage.cuts}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-[var(--gold)] font-semibold uppercase tracking-wider transition-transform duration-300 group-hover:translate-x-1">
                            {dict.animalPage.browse}
                            <ArrowRight className={cn('w-3 h-3', isRtl && 'rotate-180')} />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
