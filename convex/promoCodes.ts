import { v } from 'convex/values';
import { query, mutation, QueryCtx } from './_generated/server';

async function requireAdmin(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return identity.subject;
}

/** List all promo codes (admin only) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query('promoCodes').collect();
  },
});

/** Get a promo code by code string (public — used at checkout) */
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('promoCodes')
      .withIndex('by_code', (q) => q.eq('code', args.code))
      .unique();
  },
});

/** Create a promo code (admin only) */
export const create = mutation({
  args: {
    code:          v.string(),
    discountType:  v.union(v.literal('percentage'), v.literal('fixed')),
    discountValue: v.number(),
    minOrder:      v.optional(v.union(v.number(), v.null())),
    maxUses:       v.optional(v.union(v.number(), v.null())),
    expiresAt:     v.optional(v.union(v.number(), v.null())),
    isActive:      v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert('promoCodes', {
      code:          args.code,
      discountType:  args.discountType,
      discountValue: args.discountValue,
      minOrder:      args.minOrder ?? null,
      maxUses:       args.maxUses ?? null,
      currentUses:   0,
      expiresAt:     args.expiresAt ?? null,
      isActive:      args.isActive,
    });
  },
});

/** Update a promo code (admin only) */
export const update = mutation({
  args: {
    promoId:       v.id('promoCodes'),
    code:          v.optional(v.string()),
    discountType:  v.optional(v.union(v.literal('percentage'), v.literal('fixed'))),
    discountValue: v.optional(v.number()),
    minOrder:      v.optional(v.union(v.number(), v.null())),
    maxUses:       v.optional(v.union(v.number(), v.null())),
    expiresAt:     v.optional(v.union(v.number(), v.null())),
    isActive:      v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { promoId, ...fields } = args;
    await ctx.db.patch(promoId, fields);
    return promoId;
  },
});

/** Delete a promo code (admin only) */
export const remove = mutation({
  args: { promoId: v.id('promoCodes') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.promoId);
    return args.promoId;
  },
});
