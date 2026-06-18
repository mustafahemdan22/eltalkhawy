import { query, mutation, QueryCtx } from './_generated/server';
import { v } from 'convex/values';
import { paginationArgs, paginateList } from './pagination';

function getStartingPrice(product: {
  basePrice: number;
  discount?: number | null;
  variants: Array<{ price: number }>;
}) {
  const lowestVariantPrice =
    product.variants.length > 0
      ? Math.min(...product.variants.map((variant) => variant.price))
      : product.basePrice;

  if (!product.discount) {
    return lowestVariantPrice;
  }

  return lowestVariantPrice * (1 - product.discount / 100);
}

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
    const q = ctx.db.query('products').filter((q) =>
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

/** Paginated list of products with filters, search, and sorting */
export const listPaginated = query({
  args: {
    categorySlug: v.optional(v.string()),
    searchQuery:  v.optional(v.string()),
    sortBy:       v.optional(v.string()),
    isFeatured:   v.optional(v.boolean()),
    isBBQ:        v.optional(v.boolean()),
    includeBestSeller: v.optional(v.boolean()),
    includePremiumCut: v.optional(v.boolean()),
    includeFresh:      v.optional(v.boolean()),
    includeFrozen:     v.optional(v.boolean()),
    maxPrice:     v.optional(v.number()),
    ...paginationArgs,
  },
  handler: async (ctx, args) => {
    const queryBuilder = ctx.db.query('products');
    let products = await queryBuilder
      .filter((q) => q.eq(q.field('isAvailable'), true))
      .collect();

    if (args.categorySlug) {
      products = products.filter((p) => p.categorySlug === args.categorySlug);
    }
    if (args.isFeatured !== undefined) {
      products = products.filter((p) => p.isFeatured === args.isFeatured);
    }
    if (args.isBBQ !== undefined) {
      products = products.filter((p) => p.isBBQ === args.isBBQ);
    }

    if (args.includeFresh || args.includeFrozen) {
      products = products.filter((p) => {
        if (args.includeFresh && p.isFresh) {
          return true;
        }

        if (args.includeFrozen && p.isFrozen) {
          return true;
        }

        return false;
      });
    }

    if (args.includePremiumCut || args.includeBestSeller) {
      products = products.filter((p) => {
        if (args.includePremiumCut && p.isPremiumCut) {
          return true;
        }

        if (args.includeBestSeller && p.isBestSeller) {
          return true;
        }

        return false;
      });
    }

    if (args.searchQuery) {
      const q = args.searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (args.maxPrice !== undefined) {
      const maxPrice = args.maxPrice;
      products = products.filter((p) => getStartingPrice(p) <= maxPrice);
    }

    switch (args.sortBy) {
      case 'newest':
        products.sort((a, b) => b._creationTime - a._creationTime);
        break;
      case 'price-asc':
        products.sort((a, b) => getStartingPrice(a) - getStartingPrice(b));
        break;
      case 'price-desc':
        products.sort((a, b) => getStartingPrice(b) - getStartingPrice(a));
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestsellers':
        products.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return b.rating - a.rating;
        });
        break;
      default:
        break;
    }

    return paginateList(products, args.page, args.limit);
  },
});

/** Single product by slug */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('products')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
  },
});

/** Single product by id (admin only) */
export const get = query({
  args: { id: v.id('products') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
    if (!user || user.role !== 'admin') throw new Error('Not authorized');
    return await ctx.db.get(args.id);
  },
});

/** Lightweight admin/global search across products + orders (admin only). */
export const globalSearch = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
    if (!user || user.role !== 'admin') throw new Error('Not authorized');

    const q = args.query.trim().toLowerCase();
    if (q.length < 2) return { products: [], orders: [] };

    const lim = args.limit ?? 5;

    const allProducts = await ctx.db.query('products').collect();
    const products = allProducts
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.nameAr.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      )
      .slice(0, lim)
      .map((p) => ({
        _id:        p._id,
        slug:       p.slug,
        name:       p.name,
        nameAr:     p.nameAr,
        images:     p.images,
        basePrice:  p.basePrice,
        isAvailable:p.isAvailable,
      }));

    const allOrders = await ctx.db.query('orders').collect();
    const orders = allOrders
      .filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.deliveryAddress.fullName.toLowerCase().includes(q) ||
        o.deliveryAddress.phone.toLowerCase().includes(q)
      )
      .slice(0, lim)
      .map((o) => ({
        _id:             o._id,
        orderNumber:     o.orderNumber,
        total:           o.total,
        status:          o.status,
        _creationTime:   o._creationTime,
        customerName:    o.deliveryAddress.fullName,
      }));

    return { products, orders };
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

/** Per-category product stats (count + price range). Used by home/cards. */
export const categoryStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query('products')
      .filter((q) => q.eq(q.field('isAvailable'), true))
      .collect();

    const buckets = new Map<
      string,
      { count: number; minPrice: number; maxPrice: number }
    >();

    for (const p of all) {
      const minVariantPrice = Math.min(...p.variants.map((v) => v.price));
      const discounted = p.discount
        ? minVariantPrice * (1 - p.discount / 100)
        : minVariantPrice;
      const entry = buckets.get(p.categorySlug);
      if (!entry) {
        buckets.set(p.categorySlug, {
          count: 1,
          minPrice: discounted,
          maxPrice: discounted,
        });
      } else {
        entry.count += 1;
        entry.minPrice = Math.min(entry.minPrice, discounted);
        entry.maxPrice = Math.max(entry.maxPrice, discounted);
      }
    }

    return Array.from(buckets.entries()).map(([slug, stats]) => ({
      slug,
      ...stats,
    }));
  },
});

/* ─────────────────────────────────────────
   MUTATIONS (admin only — no auth guard yet)
───────────────────────────────────────── */

async function requireAdmin(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return identity.subject;
}

/** List all products including unavailable (admin only) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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

/** Set stock for a specific variant to an absolute value (admin only). */
export const setStock = mutation({
  args: {
    productId:     v.id('products'),
    variantWeight: v.string(),
    stock:         v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error('Product not found');

    const stock = Math.max(0, Math.floor(args.stock));
    const updatedVariants = product.variants.map((v) =>
      v.weight === args.variantWeight ? { ...v, stock } : v,
    );

    await ctx.db.patch(args.productId, { variants: updatedVariants });
    return stock;
  },
});
