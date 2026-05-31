import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/* ─────────────────────────────────────────
   QUERIES
───────────────────────────────────────── */

/** Get the shopping cart for a user */
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!cart) {
      return { items: [] };
    }

    // Populate product details for the frontend
    const populatedItems = [];
    for (const item of cart.items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        populatedItems.push({
          ...item,
          product,
        });
      }
    }

    return {
      _id: cart._id,
      userId: cart.userId,
      items: populatedItems,
    };
  },
});

/* ─────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────── */

/** Add a product variant to user's cart */
export const add = mutation({
  args: {
    userId:        v.string(),
    productId:     v.id('products'),
    variantWeight: v.string(),
    quantity:      v.number(),
    price:         v.number(),
  },
  handler: async (ctx, args) => {
    const existingCart = await ctx.db
      .query('cart')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!existingCart) {
      // Create new cart
      return await ctx.db.insert('cart', {
        userId: args.userId,
        items: [
          {
            productId:     args.productId,
            variantWeight: args.variantWeight,
            quantity:      args.quantity,
            price:         args.price,
          },
        ],
      });
    }

    // Cart exists, check if item with same variant already exists
    const items = [...existingCart.items];
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === args.productId &&
        item.variantWeight === args.variantWeight,
    );

    if (existingIndex > -1) {
      // Increment quantity
      items[existingIndex].quantity += args.quantity;
      // Update price snapshot to latest
      items[existingIndex].price = args.price;
    } else {
      // Add new item
      items.push({
        productId:     args.productId,
        variantWeight: args.variantWeight,
        quantity:      args.quantity,
        price:         args.price,
      });
    }

    await ctx.db.patch(existingCart._id, { items });
    return existingCart._id;
  },
});

/** Update the quantity of a specific item in the cart */
export const updateQuantity = mutation({
  args: {
    userId:        v.string(),
    productId:     v.id('products'),
    variantWeight: v.string(),
    quantity:      v.number(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!cart) throw new Error('Cart not found');

    const items = cart.items.map((item) => {
      if (item.productId === args.productId && item.variantWeight === args.variantWeight) {
        return { ...item, quantity: Math.max(1, args.quantity) };
      }
      return item;
    });

    await ctx.db.patch(cart._id, { items });
    return cart._id;
  },
});

/** Remove a specific item variant from the cart */
export const remove = mutation({
  args: {
    userId:        v.string(),
    productId:     v.id('products'),
    variantWeight: v.string(),
  },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (!cart) return null;

    const filteredItems = cart.items.filter(
      (item) =>
        !(item.productId === args.productId && item.variantWeight === args.variantWeight),
    );

    await ctx.db.patch(cart._id, { items: filteredItems });
    return cart._id;
  },
});

/** Clear user's cart */
export const clear = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cart = await ctx.db
      .query('cart')
      .withIndex('by_userId', (q) => q.eq('userId', args.userId))
      .unique();

    if (cart) {
      await ctx.db.patch(cart._id, { items: [] });
    }
  },
});
