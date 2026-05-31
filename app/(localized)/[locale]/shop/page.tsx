'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import FilterSidebar from '@/components/shop/FilterSidebar';
import SortBar from '@/components/shop/SortBar';
import SkeletonCard from '@/components/shop/SkeletonCard';
import { cn } from '@/lib/utils';
import { Search as SearchIcon, ShoppingBag } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { locale, dict } = useLocale();

  // ── URL Query Parsing ──
  const categoryParam = searchParams.get('category') ?? '';
  const searchParam = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? 'featured';

  // ── Convex Data Fetching ──
  const products = useQuery(api.products.list, {});
  const categories = useQuery(api.categories.list);
  const wishlistItems = useQuery(
    api.wishlist.get,
    user ? { userId: user.id } : 'skip'
  );

  // ── Local Filter States ──
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [sortOption, setSortOption] = useState(sortParam);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [states, setStates] = useState({
    fresh: false,
    frozen: false,
    premium: false,
    bestseller: false,
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);

  // Sync state with URL params when they change
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setSortOption(sortParam);
  }, [sortParam]);

  // ── Wishlist & Cart Mutations ──
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
      // Local storage fallback if guest
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
      // Trigger cart updates globally
      window.dispatchEvent(new Event('storage'));
    }
    
    // Open the cart drawer
    window.dispatchEvent(new Event('open-cart'));
  };

  // Helper to update URL params cleanly
  const updateURL = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/${locale}/shop?${params.toString()}`);
  };

  const handleSelectCategory = (catSlug: string) => {
    setSelectedCategory(catSlug);
    updateURL('category', catSlug);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL('q', searchQuery);
  };

  const handleSelectSort = (sortVal: string) => {
    setSortOption(sortVal);
    updateURL('sort', sortVal);
  };

  const handleClearAll = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setStates({ fresh: false, frozen: false, premium: false, bestseller: false });
    setPriceRange([0, 2000]);
    router.push(`/${locale}/shop`);
  };

  // ── Wishlist Set lookup helper ──
  const wishlistedProductIds = useMemo(() => {
    if (!wishlistItems) return new Set<string>();
    return new Set(wishlistItems.map((item) => item._id));
  }, [wishlistItems]);

  // ── Filtering & Sorting Logic ──
  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let list = [...products];

    // Category Filter
    if (selectedCategory) {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // State checkboxes
    if (states.fresh) list = list.filter((p) => p.isFresh);
    if (states.frozen) list = list.filter((p) => p.isFrozen);
    if (states.premium) list = list.filter((p) => p.isPremiumCut);
    if (states.bestseller) list = list.filter((p) => p.isBestSeller);

    // Price range filter
    list = list.filter((p) => {
      // Find lowest variant price after discount
      const lowestPrice = p.variants.reduce((min, curr) => {
        const pAfterD = p.discount ? curr.price * (1 - p.discount / 100) : curr.price;
        return pAfterD < min ? pAfterD : min;
      }, Infinity);
      return lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
    });

    // Sorting
    switch (sortOption) {
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
        list.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'featured':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [products, selectedCategory, searchQuery, states, priceRange, sortOption]);

  const isLoading = products === undefined;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)]">
        {/* Banner Section */}
        <section className="relative py-16 md:py-20 bg-surface border-b border-muted text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[var(--gold)]/2 blur-[100px] rounded-full pointer-events-none" />
          <div className="container-brand relative z-10">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-6">
              {dict.shop.craftedFresh}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              {dict.shop.title}
            </h1>
            <p className="text-base text-secondary mt-4 max-w-xl mx-auto leading-relaxed">
              {dict.shop.subtitle}
            </p>

            {/* In-banner Search bar */}
            <form onSubmit={handleSearchSubmit} className="mt-10 max-w-lg mx-auto relative flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={dict.shop.searchPlaceholder}
                  className={cn(
                    'w-full h-12 ps-11 pe-4 rounded-button text-sm font-sans',
                    'bg-base border border-muted',
                    'text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)]',
                    'transition-all duration-300',
                  )}
                />
              </div>
              <button
                type="submit"
                className="h-12 px-6 rounded-button text-sm font-semibold bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] transition-colors uppercase tracking-wider cursor-pointer"
              >
                {dict.shop?.search || 'Search'}
              </button>
            </form>
          </div>
        </section>

        {/* Main Grid Section */}
        <section className="container-brand py-16 md:py-20">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* Sidebar Filters */}
            <FilterSidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              selectedStates={states}
              onChangeStates={setStates}
              priceRange={priceRange}
              onChangePriceRange={setPriceRange}
              onClearAll={handleClearAll}
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
            />

            {/* Products Layout */}
            <div className="flex-1 w-full flex flex-col gap-8">
              
              {/* Sort Bar */}
              <SortBar
                productCount={filteredAndSortedProducts.length}
                selectedSort={sortOption}
                onSelectSort={handleSelectSort}
                onOpenMobileFilters={() => setMobileFiltersOpen(true)}
              />

              {/* Grid content */}
              {isLoading ? (
                // Shimmer cards loading state
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredAndSortedProducts.length > 0 ? (
                // Product Grid
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7">
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
                // Empty state
                <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted">
                  <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-primary">{dict.shop?.emptyTitle || 'No Cuts Found'}</h3>
                  <p className="text-sm text-secondary max-w-xs mt-2 font-sans font-light">
                    {dict.shop?.emptyDescription || "We couldn't find any products matching your current search criteria. Try adjusting your filters."}
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="mt-6 h-12 px-7 rounded-button text-sm font-semibold border border-[var(--gold-border)] text-[var(--gold)] hover:bg-[var(--gold-subtle)] transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {dict.shop?.clearAllFilters || 'Clear All Filters'}
                  </button>
                </div>
              )}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
