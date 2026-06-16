import { internalMutation } from './_generated/server';

export const migrateImages = internalMutation({
  handler: async (ctx) => {
    let updatedProducts = 0;
    let updatedCategories = 0;

    // 1. Update products
    const products = await ctx.db.query('products').collect();
    for (const product of products) {
      let changed = false;
      const newImages = product.images.map((img) => {
        if (img.startsWith('/images/products/')) {
          changed = true;
          // Extract filename without extension
          const filename = img.split('/').pop()?.split('.')[0];
          return `products/${filename}`;
        }
        return img;
      });

      if (changed) {
        await ctx.db.patch(product._id, { images: newImages });
        updatedProducts++;
      }
    }

    // 2. Update categories
    const categories = await ctx.db.query('categories').collect();
    for (const category of categories) {
      let changed = false;
      const updates: any = {};

      if (category.bannerImage && category.bannerImage.startsWith('/images/categories/')) {
        changed = true;
        const filename = category.bannerImage.split('/').pop()?.split('.')[0];
        updates.bannerImage = `categories/${filename}`;
      }

      if (category.icon && category.icon.startsWith('/images/categories/')) {
        changed = true;
        const filename = category.icon.split('/').pop()?.split('.')[0];
        updates.icon = `categories/${filename}`;
      }

      if (changed) {
        await ctx.db.patch(category._id, updates);
        updatedCategories++;
      }
    }

    // 3. Update settings hero image
    const settings = await ctx.db.query('settings').collect();
    let updatedSettings = 0;
    for (const setting of settings) {
      if (setting.key === 'heroImage' && setting.value === '/hero_premium_meat.png') {
        await ctx.db.patch(setting._id, { value: 'hero/hero_premium_meat' });
        updatedSettings++;
      }
    }

    return {
      success: true,
      updatedProducts,
      updatedCategories,
      updatedSettings,
    };
  },
});
