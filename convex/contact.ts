import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const send = mutation({
  args: {
    name:    v.string(),
    email:   v.string(),
    message: v.string(),
    locale:  v.union(v.literal('en'), v.literal('ar')),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('contactMessages', {
      name:      args.name,
      email:     args.email,
      message:   args.message,
      locale:    args.locale,
      createdAt: Date.now(),
      isRead:    false,
    });
    return { status: 'sent' as const };
  },
});
