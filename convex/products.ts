import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** All products with optional filters */
export const list = query({
  args: {
    categorySlug: v.optional(v.string()),
    isFeatured:   v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isPremiumCut: v.optional(v.boolean()),
    isBBQ:        v.optional(v.boolean()),
    limit:        v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query('products').filter((q) =>
      q.eq(q.field('isAvailable'), true),
    );

    const results = await q.collect();

    let filtered = results;

    if (args.categorySlug) {
      filtered = filtered.filter((p) => p.categorySlug === args.categorySlug);
    }
    if (args.isFeatured !== undefined) {
      filtered = filtered.filter((p) => p.isFeatured === args.isFeatured);
    }
    if (args.isBestSeller !== undefined) {
      filtered = filtered.filter((p) => p.isBestSeller === args.isBestSeller);
    }
    if (args.isPremiumCut !== undefined) {
      filtered = filtered.filter((p) => p.isPremiumCut === args.isPremiumCut);
    }
    if (args.isBBQ !== undefined) {
      filtered = filtered.filter((p) => p.isBBQ === args.isBBQ);
    }
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

/** Single product by slug */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .unique();
  },
});

/** Search products by name */
export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const all = await ctx.db.query('products').collect();
    const q   = args.query.toLowerCase();
    return all
      .filter(
        (p) =>
          p.isAvailable &&
          (p.name.toLowerCase().includes(q) ||
           p.nameAr.includes(q) ||
           p.tags.some((t) => t.toLowerCase().includes(q))),
      )
      .slice(0, args.limit ?? 12);
  },
});

/** Related products (same category, exclude self) */
export const related = query({
  args: {
    productId:    v.id('products'),
    categorySlug: v.string(),
    limit:        v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query('products')
      .withIndex('by_category', (q) => q.eq('categorySlug', args.categorySlug))
      .collect();

    return products
      .filter((p) => p._id !== args.productId && p.isAvailable)
      .slice(0, args.limit ?? 6);
  },
});

/* ─────────────────────────────────────────
   MUTATIONS (admin only — no auth guard yet)
───────────────────────────────────────── */

async function requireAdmin(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q: any) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return identity.subject;
}

/** List all products including unavailable (admin only) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('products').collect();
  },
});

export const create = mutation({
  args: {
    slug:          v.string(),
    name:          v.string(),
    nameAr:        v.string(),
    description:   v.string(),
    descriptionAr: v.string(),
    categorySlug:  v.string(),
    subcategory:   v.optional(v.string()),
    images:        v.array(v.string()),
    basePrice:     v.number(),
    variants: v.array(v.object({
      weight: v.string(),
      price:  v.number(),
      stock:  v.number(),
    })),
    isFresh:      v.boolean(),
    isFrozen:     v.boolean(),
    discount:     v.optional(v.number()),
    isAvailable:  v.boolean(),
    isBestSeller: v.boolean(),
    isPremiumCut: v.boolean(),
    isFeatured:   v.boolean(),
    isBBQ:        v.boolean(),
    tags:         v.array(v.string()),
    unit:         v.string(),
    cookingTips:  v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert('products', {
      ...args,
      subcategory:   args.subcategory ?? null,
      discount:      args.discount ?? null,
      rating:        0,
      reviewCount:   0,
      nutritionInfo: null,
      storageInfo:   null,
      weight:        null,
    });
  },
});

/** Update a product (admin only) */
export const update = mutation({
  args: {
    productId:     v.id('products'),
    slug:          v.optional(v.string()),
    name:          v.optional(v.string()),
    nameAr:        v.optional(v.string()),
    description:   v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    categorySlug:  v.optional(v.string()),
    subcategory:   v.optional(v.union(v.string(), v.null())),
    images:        v.optional(v.array(v.string())),
    basePrice:     v.optional(v.number()),
    variants: v.optional(v.array(v.object({
      weight: v.string(),
      price:  v.number(),
      stock:  v.number(),
    }))),
    isFresh:      v.optional(v.boolean()),
    isFrozen:     v.optional(v.boolean()),
    discount:     v.optional(v.union(v.number(), v.null())),
    isAvailable:  v.optional(v.boolean()),
    isBestSeller: v.optional(v.boolean()),
    isPremiumCut: v.optional(v.boolean()),
    isFeatured:   v.optional(v.boolean()),
    isBBQ:        v.optional(v.boolean()),
    tags:         v.optional(v.array(v.string())),
    unit:         v.optional(v.string()),
    cookingTips:  v.optional(v.array(v.string())),
    nutritionInfo: v.optional(v.union(v.object({
      calories:     v.number(),
      protein:      v.number(),
      fat:          v.number(),
      saturatedFat: v.number(),
      sodium:       v.number(),
      per:          v.string(),
    }), v.null())),
    storageInfo: v.optional(v.union(v.string(), v.null())),
    weight:      v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { productId, ...fields } = args;
    await ctx.db.patch(productId, fields);
    return productId;
  },
});

/** Remove a product (admin only) */
export const remove = mutation({
  args: { productId: v.id('products') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.productId);
    return args.productId;
  },
});

export const updateStock = mutation({
  args: {
    productId:     v.id('products'),
    variantWeight: v.string(),
    delta:         v.number(), // negative to reduce
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error('Product not found');

    const updatedVariants = product.variants.map((v) =>
      v.weight === args.variantWeight
        ? { ...v, stock: Math.max(0, v.stock + args.delta) }
        : v,
    );

    await ctx.db.patch(args.productId, { variants: updatedVariants });
  },
});
