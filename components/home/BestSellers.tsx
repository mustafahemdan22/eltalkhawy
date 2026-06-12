'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import ProductCard from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useLocale } from '@/components/LocaleProvider';
import { cn, discountedPrice } from '@/lib/utils';

export default function BestSellers() {
  const { locale, dict } = useLocale();
  const { user } = useUser();
  const router = useRouter();
  const products = useQuery(api.products.list, { isBestSeller: true });
  const addToCartMutation = useMutation(api.cart.add);
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
  const cardVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

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
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) { router.push(`/${locale}/sign-in`); return; }
    await toggleWishlistMutation({ userId: user.id, productId: productId as Id<"products"> });
  };

  return (
    <section
      className="section-gap bg-surface/50"
      aria-labelledby="bestsellers-heading"
    >
      <div className="container-brand">
        {/* Header — standardized pattern */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id="bestsellers-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-primary"
            >
              {dict.home?.bestSellers.title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-secondary">
              {dict.home?.bestSellers.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/categories`}
            className={cn(
              'inline-flex items-center gap-2 min-h-11 px-4 rounded-button text-sm font-semibold',
              'text-[var(--gold)] hover:text-[var(--gold-hover)] hover:bg-[var(--gold-subtle)]/40',
              'transition-colors whitespace-nowrap shrink-0 self-start sm:self-end',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
            )}
            aria-label={locale === 'ar' ? 'عرض كل المنتجات' : 'View all products'}
          >
            {dict.home?.bestSellers.viewAll}
            <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
          </Link>
        </div>

        {/* Grid — uniform 2/3/4 cols, consistent gap-5 md:gap-6 */}
        {products === undefined ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? null : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6"
          >
            {products.map((product, i) => (
              <motion.div key={product._id} variants={cardVariants}>
                <ProductCard
                  product={product}
                  priority={i < 4}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
