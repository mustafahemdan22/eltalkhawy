import { query } from './_generated/server';

async function requireAdmin(ctx: any): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q: any) => q.eq('clerkId', identity.subject)).unique();
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

    const lowStock = products.filter(
      (p) => p.isAvailable && p.variants.some((v: any) => v.stock < 10)
    ).length;

    return {
      totalProducts:   products.length,
      totalOrders:     orders.length,
      totalUsers:      users.length,
      totalPromoCodes: promos.length,
      totalRevenue,
      ordersByStatus,
      lowStockProducts: lowStock,
      recentOrders:     orders.sort((a, b) => b._creationTime - a._creationTime).slice(0, 5),
    };
  },
});
