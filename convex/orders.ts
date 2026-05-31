import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** Get single order by ID */
export const get = query({
  args: { orderId: v.id('orders') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

/** Get single order by order number */
export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('orders')
      .withIndex('by_orderNumber', (q) => q.eq('orderNumber', args.orderNumber))
      .unique();
  },
});

/** List all orders (admin only) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db.query('users').withIndex('by_clerkId', (q: any) => q.eq('clerkId', identity.subject)).unique();
    if (!user || user.role !== 'admin') throw new Error('Not authorized');

    return await ctx.db.query('orders').collect().then((orders) =>
      orders.sort((a, b) => b._creationTime - a._creationTime)
    );
  },
});

/** List all orders for a specific user, sorted from newest to oldest */
export const listUserOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .collect();

    // Sort descending by _creationTime
    return orders.sort((a, b) => b._creationTime - a._creationTime);
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Create a new order, deplete stocks, and clear cart */
export const create = mutation({
  args: {
    userId:       v.union(v.string(), v.null()),
    guestEmail:   v.union(v.string(), v.null()),
    items: v.array(v.object({
      productId:     v.id('products'),
      productName:   v.string(),
      variantWeight: v.string(),
      quantity:      v.number(),
      unitPrice:     v.number(),
      totalPrice:    v.number(),
    })),
    deliveryAddress: v.object({
      fullName:  v.string(),
      phone:     v.string(),
      address:   v.string(),
      area:      v.string(),
      city:      v.string(),
      notes:     v.union(v.string(), v.null()),
    }),
    subtotal:      v.number(),
    deliveryCost:  v.number(),
    discount:      v.number(),
    promoDiscount: v.number(),
    total:         v.number(),
    promoCode:     v.union(v.string(), v.null()),
    paymentMethod: v.union(
      v.literal('cash'),
      v.literal('card'),
      v.literal('wallet'),
    ),
    notes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    // Validate stock before creating order
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productName} not found`);
      }
      const variant = product.variants.find((v) => v.weight === item.variantWeight);
      if (!variant) {
        throw new Error(`Variant ${item.variantWeight} not found for ${item.productName}`);
      }
      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.productName} (${item.variantWeight}): ` +
          `requested ${item.quantity}, available ${variant.stock}`,
        );
      }
    }

    // Generate unique order number
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ET-${dateCode}-${rand}`;

    // 1. Create order
    const orderId = await ctx.db.insert('orders', {
      ...args,
      orderNumber,
      status: 'pending',
    });

    // 2. Deplete product stocks
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        const updatedVariants = product.variants.map((v) => {
          if (v.weight === item.variantWeight) {
            return { ...v, stock: v.stock - item.quantity };
          }
          return v;
        });
        await ctx.db.patch(item.productId, { variants: updatedVariants });
      }
    }

    // 3. Increment promo code usage if applied
    if (args.promoCode) {
      const promo = await ctx.db
        .query('promoCodes')
        .withIndex('by_code', (q) => q.eq('code', args.promoCode!))
        .unique();
      if (promo) {
        await ctx.db.patch(promo._id, { currentUses: (promo.currentUses ?? 0) + 1 });
      }
    }

    // 4. Clear user cart if not guest
    if (args.userId) {
      const cart = await ctx.db
        .query('cart')
        .withIndex('by_userId', (q) => q.eq('userId', args.userId!))
        .unique();

      if (cart) {
        await ctx.db.patch(cart._id, { items: [] });
      }
    }

    return { orderId, orderNumber };
  },
});

/** Update order status (Admin) */
export const updateStatus = mutation({
  args: {
    orderId: v.id('orders'),
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipped'),
      v.literal('delivered'),
      v.literal('cancelled'),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Not authenticated');
    const user = await ctx.db.query('users').withIndex('by_clerkId', (q: any) => q.eq('clerkId', identity.subject)).unique();
    if (!user || user.role !== 'admin') throw new Error('Not authorized');

    await ctx.db.patch(args.orderId, { status: args.status });
    return args.orderId;
  },
});
