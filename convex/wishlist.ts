import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** Get the full wishlist with product details for a user */
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query('wishlist')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!wishlist || !wishlist.productIds.length) {
      return [];
    }

    const products = [];
    for (const pId of wishlist.productIds) {
      const product = await ctx.db.get(pId);
      if (product && product.isAvailable) {
        products.push(product);
      }
    }

    return products;
  },
});

/** Check if a product is in a user's wishlist */
export const isInWishlist = query({
  args: { userId: v.string(), productId: v.id('products') },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query('wishlist')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!wishlist) return false;

    return wishlist.productIds.includes(args.productId);
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Toggle adding/removing a product from user's wishlist */
export const toggle = mutation({
  args: { userId: v.string(), productId: v.id('products') },
  handler: async (ctx, args) => {
    const wishlist = await ctx.db
      .query('wishlist')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!wishlist) {
      // Create new wishlist with this product
      return await ctx.db.insert('wishlist', {
        userId: args.userId,
        productIds: [args.productId],
      });
    }

    // Toggle product ID in the array
    const productIds = [...wishlist.productIds];
    const index = productIds.indexOf(args.productId);

    if (index > -1) {
      // Remove it
      productIds.splice(index, 1);
    } else {
      // Add it
      productIds.push(args.productId);
    }

    await ctx.db.patch(wishlist._id, { productIds });
    return wishlist._id;
  },
});
