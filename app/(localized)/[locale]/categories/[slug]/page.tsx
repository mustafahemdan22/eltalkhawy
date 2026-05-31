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
import { CATEGORIES } from '@/lib/constants';
import { cn, cloudinaryUrl } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';
import { ArrowLeft, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_IMAGES: Record<string, string> = {
  'beef':          'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=80',
  'buffalo':       'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1200&q=80',
  'lamb':          'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=1200&q=80',
  'goat':          'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=1200&q=80',
  'veal':          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
  'bbq-cuts':      'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1200&q=80',
  'premium-cuts':  'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=1200&q=80',
  'organ-meats':   'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200&q=80',
  'frozen':        'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=1200&q=80',
  'offers':        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1200&q=80',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryDetailPage({ params }: PageProps) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { user } = useUser();
  const { locale } = useLocale();

  // Find Category info
  const categoryInfo = useMemo(() => {
    return CATEGORIES.find((cat) => cat.slug === slug) as any;
  }, [slug]);

  // Local States
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');

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
      router.push('/sign-in');
      return;
    }
    await toggleWishlistMutation({ userId: user.id, productId: productId as any });
  };

  const handleAddToCart = async (productId: string, weight: string, quantity: number) => {
    const product = products?.find((p) => p._id === productId);
    if (!product) return;

    const variant = product.variants.find((v) => v.weight === weight) ?? product.variants[0];
    const finalPrice = product.discount
      ? variant.price * (1 - product.discount / 100)
      : variant.price;

    if (user) {
      await addToCartMutation({
        userId: user.id,
        productId: productId as any,
        variantWeight: weight,
        quantity,
        price: finalPrice,
      });
    } else {
      // Local storage fallback for guest cart
      const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      const existingIdx = guestCart.findIndex(
        (item: any) => item.productId === productId && item.variantWeight === weight
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
      case 'price-asc':
        list.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        list.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
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
        <main className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center font-sans">
          <div className="text-center p-8 rounded-2xl bg-surface border border-muted max-w-md shadow-sm">
            <h1 className="font-display text-2xl font-bold text-primary">Category Not Found</h1>
            <p className="text-sm text-secondary mt-2 font-light">
              The specialty category you are looking for does not exist or has been retired.
            </p>
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center justify-center gap-2 mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-inverse hover:bg-[var(--gold)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Categories
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const categoryImg = CATEGORY_IMAGES[slug] ?? 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=1200&q=80';
  const subcats = 'subcategories' in categoryInfo ? categoryInfo.subcategories : [];

  return (
    <>
      <Navbar />

      {/* Hero Category Banner */}
      <section className="relative w-full h-[300px] md:h-[400px] bg-base flex items-center overflow-hidden font-sans">
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
              <Link href={`/${locale}`} className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/${locale}/categories`} className="hover:text-primary transition-colors">Categories</Link>
              <span>/</span>
              <span className="text-[var(--gold)]">{locale === 'ar' ? categoryInfo.nameAr : categoryInfo.name}</span>
            </div>

            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {categoryInfo.icon} Butcher Premium Cut
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary flex items-baseline gap-4 flex-wrap">
              {locale === 'ar' ? categoryInfo.nameAr : categoryInfo.name}
              <span className="font-arabic text-secondary text-xl font-medium tracking-normal">({locale === 'ar' ? categoryInfo.name : categoryInfo.nameAr})</span>
            </h1>
            <p className="text-base md:text-base text-secondary mt-5 leading-relaxed font-light font-sans max-w-xl">
              {locale === 'ar' ? categoryInfo.descriptionAr || categoryInfo.description : categoryInfo.description}
            </p>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <main className="bg-[var(--bg-base)] pb-24 md:pb-32 font-sans">
        <div className="container-brand">

          {/* Subcategory & Sort Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-y border-muted mb-12">
            
            {/* Subcategory Chips */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth w-full md:flex-1 min-w-0 pr-4 md:pr-0">
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={cn(
                  'h-11 px-6 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap',
                  selectedSubcategory === 'all'
                      ? 'bg-[var(--gold)] border-[var(--gold)] text-inverse font-bold'
                      : 'bg-surface border-muted text-secondary hover:text-primary hover:border-[var(--gold)]/50'
                  )}
                >
                  All Premium Cuts
                </button>
                {subcats.map((sub: any) => (
                  <button
                    key={sub.slug}
                    onClick={() => setSelectedSubcategory(sub.slug)}
                    className={cn(
                      'h-11 px-6 rounded-full text-sm font-semibold uppercase tracking-wider border transition-all cursor-pointer whitespace-nowrap',
                      selectedSubcategory === sub.slug
                        ? 'bg-[var(--gold)] border-[var(--gold)] text-inverse font-bold'
                        : 'bg-surface border-muted text-secondary hover:text-primary hover:border-[var(--gold)]/50'
                  )}
                >
                  {locale === 'ar' ? sub.nameAr : sub.name} <span className="font-arabic text-3xs font-light">({locale === 'ar' ? sub.name : sub.nameAr})</span>
                </button>
              ))}
            </div>

            {/* Simple Sort Bar */}
            <div className="flex items-center gap-4 shrink-0 self-end md:self-auto select-none">
              <span className="text-sm uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--gold)]" /> Sort By
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={cn(
                    'h-11 px-5 rounded-button text-sm font-semibold uppercase tracking-wider',
                  'bg-surface border border-muted text-primary',
                  'focus:outline-none focus:border-[var(--gold)]',
                  'cursor-pointer transition-colors duration-300'
                )}
              >
                <option value="featured">Featured Collection</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Rating Log</option>
              </select>
            </div>

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
            // Premium Empty State
            <div className="flex flex-col items-center justify-center text-center py-24 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <Sparkles className="w-7 h-7 text-[var(--gold)] animate-pulse" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">Boutique Selection Empty</h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-light">
                Our master butchers have not categorized any items in this specialty cut category yet. Browse our full shop to see today's fresh arrivals.
              </p>
              <Link
                href={`/${locale}/shop`}
                className="inline-flex items-center justify-center mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider bg-[var(--gold)] text-inverse hover:bg-[var(--gold)] transition-colors"
              >
                Explore General Catalog
              </Link>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
