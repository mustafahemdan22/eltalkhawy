'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import SkeletonCard from '@/components/shop/SkeletonCard';
import { Button } from '@/components/ui/Button';
import { Heart, ShoppingBag } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const { user, isLoaded: authLoaded } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();

  const wishlistItems = useQuery(api.wishlist.get, user ? { userId: user.id } : 'skip');
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);
  const addToCartMutation = useMutation(api.cart.add);

  const handleToggleWishlist = async (productId: string) => {
    if (!user) return;
    await toggleWishlistMutation({ userId: user.id, productId: productId as any });
  };

  const handleAddToCart = async (productId: string, weight: string, quantity: number) => {
    if (!wishlistItems) return;
    const product = wishlistItems.find((p) => p._id === productId);
    if (!product) return;
    const variant = product.variants.find((v) => v.weight === weight) ?? product.variants[0];
    const finalPrice = product.discount ? variant.price * (1 - product.discount / 100) : variant.price;

    if (user) {
      await addToCartMutation({ userId: user.id, productId: productId as any, variantWeight: weight, quantity, price: finalPrice });
    } else {
      const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      const existingIdx = guestCart.findIndex((item: any) => item.productId === productId && item.variantWeight === weight);
      if (existingIdx > -1) guestCart[existingIdx].quantity += quantity;
      else guestCart.push({ productId, variantWeight: weight, quantity, price: finalPrice });
      localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('storage'));
    }
    window.dispatchEvent(new Event('open-cart'));
  };

  const isLoading = authLoaded === false || (user && wishlistItems === undefined);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-base py-14 md:py-20">
        <div className="container-brand">
          <div className="text-center mb-14">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {dict.wishlist?.yourFavorites || 'Your Favorites'}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-4">
              <Heart className="w-6 h-6 text-[var(--brand)] fill-current" />
              {dict.wishlist?.title || 'Wishlist'}
            </h1>
            <p className="text-base text-secondary mt-3 max-w-sm mx-auto leading-relaxed font-sans font-light">
              {dict.wishlist?.subtitle || 'Your privately reserved cuts.'}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <Heart className="w-7 h-7 text-[var(--brand)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">{dict.wishlist?.privateWishlist || 'Private Wishlist'}</h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-sans font-light">
                {dict.wishlist?.signInDescription || 'Sign in to access your wishlist.'}
              </p>
              <Button onClick={() => router.push('/sign-in')} className="mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider cursor-pointer">
                {dict.wishlist?.signInButton || 'Sign In'}
              </Button>
            </div>
          ) : wishlistItems && wishlistItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
              {wishlistItems.map((prod) => (
                <ProductCard key={prod._id} product={prod} isInWishlist={true} onAddToCart={handleAddToCart} onToggleWishlist={handleToggleWishlist} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <ShoppingBag className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">{dict.wishlist?.emptyTitle || 'Wishlist is Empty'}</h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-sans font-light">
                {dict.wishlist?.emptyDescription || 'Explore our selection to start your list.'}
              </p>
              <Button onClick={() => router.push(`/${locale}/shop`)} className="mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider cursor-pointer">
                {dict.wishlist?.goToCatalog || 'Go to Catalog'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
