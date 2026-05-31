import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** List all active categories sorted by order */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('categories')
      .filter((q) => q.eq(q.field('isActive'), true))
      .collect()
      .then((cats) => cats.sort((a, b) => a.order - b.order));
  },
});

/** Single category by slug */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('categories')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Admin only creation */
export const create = mutation({
  args: {
    slug:        v.string(),
    name:        v.string(),
    nameAr:      v.string(),
    description: v.string(),
    bannerImage: v.string(),
    icon:        v.string(),
    order:       v.number(),
    isActive:    v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('categories')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert('categories', args);
  },
});
