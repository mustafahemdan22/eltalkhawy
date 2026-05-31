import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** List all reviews for a product */
export const list = query({
  args: { productId: v.id('products'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query('reviews')
      .withIndex('by_productId', (q) => q.eq('productId', args.productId))
      .collect();

    // Sort descending by _creationTime
    const sorted = reviews.sort((a, b) => b._creationTime - a._creationTime);

    if (args.limit) {
      return sorted.slice(0, args.limit);
    }
    return sorted;
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Add a new product review and update product average rating */
export const add = mutation({
  args: {
    productId: v.id('products'),
    userId:    v.string(),
    userName:  v.string(),
    userImage: v.union(v.string(), v.null()),
    rating:    v.number(), // 1 to 5
    comment:   v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Verify if user already reviewed this product to avoid duplicates
    const existing = await ctx.db
      .query('reviews')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();

    const alreadyReviewed = existing.some((r) => r.productId === args.productId);
    if (alreadyReviewed) {
      throw new Error('You have already reviewed this product.');
    }

    // 2. Insert new review
    const reviewId = await ctx.db.insert('reviews', {
      ...args,
      verified: true, // simplified verification logic
    });

    // 3. Recalculate average rating & review count for the product
    const product = await ctx.db.get(args.productId);
    if (product) {
      const allProductReviews = await ctx.db
        .query('reviews')
        .withIndex('by_productId', (q) => q.eq('productId', args.productId))
        .collect();

      const reviewCount = allProductReviews.length;
      const sum = allProductReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = reviewCount > 0 ? parseFloat((sum / reviewCount).toFixed(1)) : 0;

      await ctx.db.patch(args.productId, {
        rating: averageRating,
        reviewCount: reviewCount,
      });
    }

    return reviewId;
  },
});
