import { internalMutation } from './_generated/server';

// Helper to extract a clean Cloudinary public ID from either:
// - a local path:          /images/categories/beef_banner.png → categories/beef_banner
// - a full Cloudinary URL: https://res.cloudinary.com/.../products/beef_brisket.jpg → products/beef_brisket
// - already a public ID:   products/beef_brisket → products/beef_brisket (unchanged)
function toPublicId(value: string, defaultFolder: string): string | null {
  if (!value) return null;

  // Already a clean public ID (no slashes from a URL, no leading slash)
  if (!value.startsWith('http') && !value.startsWith('/') && value.includes('/')) {
    return value; // e.g. "products/beef_brisket" — already correct
  }

  // Full Cloudinary URL
  if (value.includes('res.cloudinary.com')) {
    const match = value.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    return match ? match[1] : null;
  }

  // Local path: /images/products/beef_brisket.png
  if (value.startsWith('/images/')) {
    const filename = value.split('/').pop()?.replace(/\.[^/.]+$/, '');
    if (!filename) return null;
    return `${defaultFolder}/${filename}`;
  }

  // /hero_premium_meat.png
  if (value.startsWith('/')) {
    const filename = value.split('/').pop()?.replace(/\.[^/.]+$/, '');
    if (!filename) return null;
    return `${defaultFolder}/${filename}`;
  }

  return null;
}

/** Migrate all products' image arrays to Cloudinary public IDs */
export const migrateImages = internalMutation({
  handler: async (ctx) => {
    let updatedProducts  = 0;
    let updatedCategories = 0;
    let updatedSettings  = 0;

    // ── 1. Products ──────────────────────────────────────────
    const products = await ctx.db.query('products').collect();
    for (const product of products) {
      let changed = false;
      const newImages = product.images.map((img) => {
        const pid = toPublicId(img, 'products');
        if (pid && pid !== img) { changed = true; return pid; }
        return img;
      });
      if (changed) {
        await ctx.db.patch(product._id, { images: newImages });
        updatedProducts++;
      }
    }

    // ── 2. Categories ─────────────────────────────────────────
    const categories = await ctx.db.query('categories').collect();
    for (const category of categories) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = {};

      const banner = toPublicId(category.bannerImage, 'categories');
      if (banner && banner !== category.bannerImage) updates.bannerImage = banner;

      const icon = category.icon ? toPublicId(category.icon, 'categories') : null;
      if (icon && icon !== category.icon) updates.icon = icon;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(category._id, updates);
        updatedCategories++;
      }
    }

    // ── 3. Settings (hero image) ──────────────────────────────
    const settings = await ctx.db.query('settings').collect();
    for (const setting of settings) {
      if (setting.key === 'heroImage') {
        const pid = toPublicId(setting.value, 'hero');
        if (pid && pid !== setting.value) {
          await ctx.db.patch(setting._id, { value: pid });
          updatedSettings++;
        }
      }
    }

    return { success: true, updatedProducts, updatedCategories, updatedSettings };
  },
});
