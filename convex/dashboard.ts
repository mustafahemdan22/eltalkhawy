import { query, QueryCtx } from './_generated/server';
import { v } from 'convex/values';

async function requireAdmin(ctx: QueryCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
  return identity.subject;
}

/** Dashboard stats (admin only) */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const [products, orders, users, promos] = await Promise.all([
      ctx.db.query('products').collect(),
      ctx.db.query('orders').collect(),
      ctx.db.query('users').collect(),
      ctx.db.query('promoCodes').collect(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const ordersByStatus = {
      pending:    orders.filter((o) => o.status === 'pending').length,
      confirmed:  orders.filter((o) => o.status === 'confirmed').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      shipped:    orders.filter((o) => o.status === 'shipped').length,
      delivered:  orders.filter((o) => o.status === 'delivered').length,
      cancelled:  orders.filter((o) => o.status === 'cancelled').length,
    };

    const lowStockProducts = products
      .filter((p) => p.isAvailable && p.variants.some((v) => v.stock < 10))
      .slice(0, 8)
      .map((p) => ({
        _id: p._id,
        slug: p.slug,
        name: p.name,
        nameAr: p.nameAr,
        images: p.images,
        variants: p.variants,
        minStock: Math.min(...p.variants.map((v) => v.stock)),
      }));

    return {
      totalProducts:   products.length,
      totalOrders:     orders.length,
      totalUsers:      users.length,
      totalPromoCodes: promos.length,
      totalRevenue,
      ordersByStatus,
      lowStockProducts,
      lowStockCount: lowStockProducts.length,
      recentOrders:   orders.sort((a, b) => b._creationTime - a._creationTime).slice(0, 5),
    };
  },
});

/** Sales by day for the last 14 days (admin only) */
export const salesTrend = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const window = args.days ?? 14;
    const cutoff = Date.now() - window * 24 * 60 * 60 * 1000;
    const orders = await ctx.db.query('orders').collect();
    const buckets = new Map<string, { revenue: number; orders: number }>();
    for (let i = window - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { revenue: 0, orders: 0 });
    }
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      if (o._creationTime < cutoff) continue;
      const key = new Date(o._creationTime).toISOString().slice(0, 10);
      const b = buckets.get(key);
      if (b) {
        b.revenue += o.total;
        b.orders += 1;
      }
    }
    return Array.from(buckets.entries()).map(([date, b]) => ({
      date,
      revenue: b.revenue,
      orders: b.orders,
    }));
  },
});

/** Top selling products by quantity (admin only) */
export const topProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const orders = await ctx.db.query('orders').collect();
    const counts = new Map<string, { productId: string; productName: string; productNameAr: string; productSlug: string; image: string | null; quantity: number; revenue: number }>();
    for (const o of orders) {
      if (o.status === 'cancelled') continue;
      for (const it of o.items) {
        const cur = counts.get(it.productId) ?? {
          productId: it.productId,
          productName: it.productName,
          productNameAr: it.productName,
          productSlug: '',
          image: null,
          quantity: 0,
          revenue: 0,
        };
        cur.quantity += it.quantity;
        cur.revenue += it.totalPrice;
        counts.set(it.productId, cur);
      }
    }
    const list = Array.from(counts.values());
    const products = await ctx.db.query('products').collect();
    const byId = new Map(products.map((p) => [p._id, p]));
    for (const row of list) {
      const p = byId.get(row.productId as never);
      if (p) {
        row.productSlug = p.slug;
        row.productName = p.name;
        row.productNameAr = p.nameAr;
        row.image = p.images[0] ?? null;
      }
    }
    return list
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, args.limit ?? 5);
  },
});
