'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import ProductCard from '@/components/shop/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useLocale } from '@/components/LocaleProvider';

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function BestSellers() {
  const { locale, dict } = useLocale();
  const { user } = useUser();
  const router = useRouter();
  const products = useQuery(api.products.list, { isBestSeller: true });
  const addToCartMutation = useMutation(api.cart.add);
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);

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
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) { router.push('/sign-in'); return; }
    await toggleWishlistMutation({ userId: user.id, productId: productId as any });
  };

  return (
    <section
      className="section-gap bg-surface/50"
      aria-labelledby="bestsellers-heading"
    >
      <div className="container-brand">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="section-label text-[var(--gold)] mb-4 block">{dict.home?.bestSellers.label}</span>
            <h2
              id="bestsellers-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-primary"
            >
              {dict.home?.bestSellers.title}
            </h2>
            <p className="mt-3 text-base text-secondary max-w-md leading-relaxed">
              {dict.home?.bestSellers.subtitle}
            </p>
          </div>
          <Link
            href={`/${locale}/shop?sort=bestsellers`}
            className="flex items-center gap-2 text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-medium transition-colors whitespace-nowrap shrink-0"
            aria-label="View all best sellers"
          >
            {dict.home?.bestSellers.viewAll} <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
          </Link>
        </div>

        {/* Grid */}
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
