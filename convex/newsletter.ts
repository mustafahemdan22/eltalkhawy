import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const subscribe = mutation({
  args: {
    email:  v.string(),
    locale: v.union(v.literal('en'), v.literal('ar')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('newsletterSubscribers')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (existing) {
      if (!existing.isActive) {
        await ctx.db.patch(existing._id, { isActive: true });
      }
      return { status: 'already_subscribed' as const };
    }

    await ctx.db.insert('newsletterSubscribers', {
      email:        args.email,
      locale:       args.locale,
      subscribedAt: Date.now(),
      isActive:     true,
    });
    return { status: 'subscribed' as const };
  },
});
