import { internalQuery } from './_generated/server';

/** Inspect what the first product and first category look like in the DB */
export const inspect = internalQuery({
  handler: async (ctx) => {
    const product  = await ctx.db.query('products').first();
    const category = await ctx.db.query('categories').first();
    return {
      product:  product  ? { slug: product.slug,   images: product.images }              : null,
      category: category ? { slug: category.slug,  bannerImage: category.bannerImage }   : null,
    };
  },
});
