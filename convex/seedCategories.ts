import { internalMutation } from './_generated/server';

/**
 * Seeds the categories table with all 10 shop categories,
 * using Cloudinary public IDs for bannerImage.
 *
 * Run: npx convex run --prod seedCategories:run
 */
export const run = internalMutation({
  handler: async (ctx) => {
    // Wipe existing categories first to avoid duplicates
    const existing = await ctx.db.query('categories').collect();
    for (const c of existing) {
      await ctx.db.delete(c._id);
    }

    const categories = [
      {
        slug:        'beef',
        name:        'Beef',
        nameAr:      'لحم بقري',
        description: 'Premium cuts of beef — from everyday essentials to luxury steaks and French imports.',
        bannerImage: 'categories/beef_banner',
        icon:        'categories/beef_banner',
        order:       1,
        isActive:    true,
      },
      {
        slug:        'lamb',
        name:        'Lamb',
        nameAr:      'لحم ضأن',
        description: 'Fresh and frozen lamb — chops, leg, shoulder, minced, and more.',
        bannerImage: 'categories/lamb_banner',
        icon:        'categories/lamb_banner',
        order:       2,
        isActive:    true,
      },
      {
        slug:        'buffalo',
        name:        'Buffalo',
        nameAr:      'لحم جاموس',
        description: 'Lean, flavourful buffalo — a traditional Egyptian favourite.',
        bannerImage: 'categories/buffalo_banner',
        icon:        'categories/buffalo_banner',
        order:       3,
        isActive:    true,
      },
      {
        slug:        'veal',
        name:        'Veal',
        nameAr:      'لحم عجل',
        description: 'Tender veal cuts — escalope, cutlets, and more.',
        bannerImage: 'categories/veal_banner',
        icon:        'categories/veal_banner',
        order:       4,
        isActive:    true,
      },
      {
        slug:        'goat',
        name:        'Goat',
        nameAr:      'لحم ماعز',
        description: 'Fresh goat cuts — lean, flavourful, and traditionally prepared.',
        bannerImage: 'categories/goat_banner',
        icon:        'categories/goat_banner',
        order:       5,
        isActive:    true,
      },
      {
        slug:        'bbq-cuts',
        name:        'BBQ & Grill',
        nameAr:      'مشويات',
        description: 'Ready-to-grill cuts — kofta, sausages, burger patties, and kebabs.',
        bannerImage: 'categories/bbq_banner',
        icon:        'categories/bbq_banner',
        order:       6,
        isActive:    true,
      },
      {
        slug:        'premium-cuts',
        name:        'Premium Cuts',
        nameAr:      'قطع مميزة',
        description: 'The finest cuts — tomahawk, Wagyu, Côte de Boeuf, and dry-aged selections.',
        bannerImage: 'categories/premium_cuts_banner',
        icon:        'categories/premium_cuts_banner',
        order:       7,
        isActive:    true,
      },
      {
        slug:        'organ-meats',
        name:        'Organ Meats',
        nameAr:      'أحشاء',
        description: 'Fresh liver, kidney, heart, tongue, tripe, and more.',
        bannerImage: 'categories/organ_banner',
        icon:        'categories/organ_banner',
        order:       8,
        isActive:    true,
      },
      {
        slug:        'frozen',
        name:        'Frozen',
        nameAr:      'مجمدات',
        description: 'Flash-frozen for freshness — convenient and long-lasting.',
        bannerImage: 'categories/frozen_banner',
        icon:        'categories/frozen_banner',
        order:       9,
        isActive:    true,
      },
      {
        slug:        'offers',
        name:        'Offers',
        nameAr:      'عروض',
        description: 'Special deals and seasonal offers — updated weekly.',
        bannerImage: 'categories/offers_banner',
        icon:        'categories/offers_banner',
        order:       10,
        isActive:    true,
      },
    ];

    for (const category of categories) {
      await ctx.db.insert('categories', category);
    }

    return { success: true, inserted: categories.length };
  },
});
