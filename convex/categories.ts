import { query, mutation, QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
}

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** List all active categories sorted by order (public) */
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

/** List all categories including inactive (admin only) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query('categories')
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

/** Single category by id (admin only) */
export const get = query({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

/* ─────────────────────────────────────────
   MUTATIONS (admin only)
───────────────────────────────────────── */

/** Create or upsert by slug (admin only) */
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
    await requireAdmin(ctx);
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

/** Update category fields (admin only) */
export const update = mutation({
  args: {
    id:          v.id('categories'),
    slug:        v.optional(v.string()),
    name:        v.optional(v.string()),
    nameAr:      v.optional(v.string()),
    description: v.optional(v.string()),
    bannerImage: v.optional(v.string()),
    icon:        v.optional(v.string()),
    order:       v.optional(v.number()),
    isActive:    v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

/** Delete category (admin only) */
export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
