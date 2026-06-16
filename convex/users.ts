import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const upsertFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.union(v.string(), v.null()),
    imageUrl: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
    if (!adminEmail) {
      console.warn(
        "ADMIN_BOOTSTRAP_EMAIL is not set in Convex environment variables. " +
        "Set it via: npx convex env set ADMIN_BOOTSTRAP_EMAIL <email>"
      );
    }
    const isBootstrapEmail =
      !!adminEmail &&
      args.email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

    if (existingUser) {
      const patch: Partial<Doc<"users">> = {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      };
      if (isBootstrapEmail && existingUser.role !== 'admin') {
        patch.role = 'admin';
      }
      await ctx.db.patch(existingUser._id, patch);
    } else {
      await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        role: isBootstrapEmail ? 'admin' : 'customer',
      });
    }
  },
});

/**
 * Secure client-callable user sync.
 * Derives identity entirely from ctx.auth — no client-supplied userId/email.
 * Primary method for syncing Clerk users to Convex (no webhook required).
 */
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkId = identity.subject;
    const email = identity.email ?? "";
    const name = identity.name ?? null;
    const imageUrl = identity.pictureUrl ?? null;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .unique();

    const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const isBootstrapEmail =
      !!adminEmail &&
      !!email &&
      email.trim().toLowerCase() === adminEmail.trim().toLowerCase();

    if (existingUser) {
      const patch: Partial<Doc<"users">> = { email, name, imageUrl };
      if (isBootstrapEmail && existingUser.role !== "admin") {
        patch.role = "admin";
      }
      await ctx.db.patch(existingUser._id, patch);
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      imageUrl,
      role: isBootstrapEmail ? "admin" : "customer",
    });
  },
});

export const deleteFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.delete(existingUser._id);
    }
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const isAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    return user?.role === 'admin';
  },
});
export const hasAnyAdmin = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("users").collect();
    return all.some((u) => u.role === 'admin');
  },
});

/** Bootstrap the first admin using a secret key from env. */
export const bootstrap = mutation({
  args: {
    bootstrapKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');

    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    if (existingAdmins.length > 0) throw new Error('An admin already exists');

    const expected = process.env.ADMIN_BOOTSTRAP_KEY;
    if (!expected) throw new Error('ADMIN_BOOTSTRAP_KEY not configured');
    if (args.bootstrapKey !== expected) throw new Error('Invalid bootstrap key');

    // Rate limit: track attempts in a separate table
    const recentAttempt = await ctx.db
      .query("bootstrapAttempts")
      .filter((q) => q.gt(q.field("at"), Date.now() - 5 * 60 * 1000))
      .unique();
    if (recentAttempt) throw new Error('Too many attempts, try again in 5 minutes');

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error('User not found in database');

    await ctx.db.patch(user._id, { role: 'admin' });

    // Log the bootstrap attempt
    await ctx.db.insert("bootstrapAttempts", {
      clerkId: identity.subject,
      userId: user._id,
      at: Date.now(),
      success: true,
    });

    return true;
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!user || user.role !== 'admin') throw new Error('Not authorized');
    return await ctx.db.query('users').collect();
  },
});

/** List all users with order count + total spend (admin only). */
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const caller = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!caller || caller.role !== 'admin') throw new Error('Not authorized');

    const [users, orders] = await Promise.all([
      ctx.db.query('users').collect(),
      ctx.db.query('orders').collect(),
    ]);

    const byUser = new Map<string, { ordersCount: number; totalSpent: number; lastOrderAt: number | null }>();
    for (const o of orders) {
      if (!o.userId) continue;
      const cur = byUser.get(o.userId) ?? { ordersCount: 0, totalSpent: 0, lastOrderAt: null };
      cur.ordersCount += 1;
      if (o.status !== 'cancelled') cur.totalSpent += o.total;
      if (cur.lastOrderAt === null || o._creationTime > cur.lastOrderAt) {
        cur.lastOrderAt = o._creationTime;
      }
      byUser.set(o.userId, cur);
    }

    return users
      .map((u) => {
        const stats = byUser.get(u.clerkId) ?? { ordersCount: 0, totalSpent: 0, lastOrderAt: null };
        return {
          _id: u._id,
          clerkId: u.clerkId,
          name: u.name,
          email: u.email,
          imageUrl: u.imageUrl,
          role: u.role,
          createdAt: u._creationTime,
          ordersCount: stats.ordersCount,
          totalSpent: stats.totalSpent,
          lastOrderAt: stats.lastOrderAt,
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const setRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('customer'), v.literal('admin')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const caller = await ctx.db
      .query('users')
      .withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject))
      .unique();
    if (!caller || caller.role !== 'admin') throw new Error('Not authorized');
    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});
