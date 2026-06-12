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

/** Public — read a single setting by key. */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();
    return row?.value ?? null;
  },
});

/** Public — read all settings as a plain object. */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('settings').collect();
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Upsert a single setting (admin only). */
export const set = mutation({
  args: {
    key:   v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query('settings')
      .withIndex('by_key', (q) => q.eq('key', args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
      return existing._id;
    }
    return await ctx.db.insert('settings', { key: args.key, value: args.value });
  },
});

/** Bulk upsert (admin only). */
export const setMany = mutation({
  args: {
    values: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const ids: string[] = [];
    for (const { key, value } of args.values) {
      const existing = await ctx.db
        .query('settings')
        .withIndex('by_key', (q) => q.eq('key', key))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, { value });
        ids.push(existing._id);
      } else {
        const id = await ctx.db.insert('settings', { key, value });
        ids.push(id);
      }
    }
    return ids;
  },
});
