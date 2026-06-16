import { mutation } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

async function requireAdmin(ctx: QueryCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Not authenticated');
  const user = await ctx.db.query('users').withIndex('by_clerkId', (q) => q.eq('clerkId', identity.subject)).unique();
  if (!user || user.role !== 'admin') throw new Error('Not authorized');
}

const IMG = {
  ribeye:    'products/ribeye_steak',
  lamb:      'products/leg_of_lamb',
  cuts:      'products/beef_tenderloin',
  minced:    'products/minced_beef',
  meat:      'products/beef_cubes',
  kofta:     'products/kofta_meat',
  burgers:   'products/beef_burger_patties',
  goat:      'products/goat_meat',
  offal:     'products/beef_liver',
  frozen:    'products/frozen_minced_beef',
  butcher:   'products/beef_brisket',
  steak:     'products/sirloin_steak',
  tbone:     'products/t_bone_steak',
  grill:     'products/sausages',
  kebab:     'products/kebab',
  chops:     'products/lamb_chops',
  frenchRibeye:      'products/french_ribeye',
  frenchTenderloin:  'products/veal_steak',
  frenchEntrecote:   'products/french_entrecote',
  frenchBavette:     'products/french_bavette',
  frenchOnglet:      'products/french_onglet',
  frenchCharolais:   'products/french_charolais',
  frenchLimousin:    'products/french_limousin',
  frenchRibs:        'products/beef_ribs',
};

/** Product payload for `ctx.db.insert('products', …)`.
 *  Mirrors Doc<'products'> minus the server-assigned `_id` and `_creationTime`. */
type ProductInsert = Omit<Doc<"products">, "_id" | "_creationTime">;

/** What each seed entry supplies — the same shape minus the fields
 *  `p()` backfills with sensible defaults. */
type ProductSeed = Omit<
  ProductInsert,
  "rating" | "reviewCount" | "nutritionInfo" | "storageInfo" | "weight" | "discount"
>;

function p(data: ProductSeed): ProductInsert {
  return {
    ...data,
    rating: 0,
    reviewCount: 0,
    nutritionInfo: null,
    storageInfo: null,
    weight: null,
    discount: null,
  };
}

export default mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx);
    /* ── BEEF ────────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'dry-aged-ribeye-steak', name: 'Dry-Aged Ribeye Steak',
      nameAr: 'ستيك ريب آي معتق',
      description: 'Premium 21-day dry-aged ribeye steak with exceptional marbling and deep, concentrated flavour.',
      descriptionAr: 'ستيك ريب آي فاخر معتق لمدة 21 يوماً يتميز بنكهة غنية ومركزة.',
      categorySlug: 'beef', subcategory: 'ribeye',
      images: [IMG.ribeye], basePrice: 720,
      variants: [
        { weight: '300g', price: 216, stock: 15 },
        { weight: '500g', price: 360, stock: 10 },
        { weight: '1kg', price: 720, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['dry-aged', 'steak', 'premium'], unit: 'kg',
      cookingTips: ['Bring to room temperature before cooking', 'Sear on high heat for 3-4 mins per side', 'Rest for 5 minutes before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'wagyu-beef-tenderloin', name: 'Wagyu Beef Tenderloin',
      nameAr: 'تندرلوين واغيو',
      description: 'Melt-in-your-mouth Wagyu tenderloin with A5 grade marbling. The ultimate luxury cut.',
      descriptionAr: 'تندرلوين واغيو يذوب في الفم مع نسبة دهون بدرجة A5. القطعة الأكثر فخامة.',
      categorySlug: 'beef', subcategory: 'tenderloin',
      images: [IMG.meat], basePrice: 1500,
      variants: [
        { weight: '250g', price: 375, stock: 8 },
        { weight: '500g', price: 750, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: false,
      tags: ['wagyu', 'tenderloin', 'luxury'], unit: 'kg',
      cookingTips: ['Do not overcook; best served rare to medium-rare', 'Season simply with coarse salt and black pepper', 'Slice against the grain for maximum tenderness'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-tenderloin', name: 'Beef Tenderloin',
      nameAr: 'فيليه بقري',
      description: 'Butter-soft beef tenderloin, hand-trimmed. Perfect for steaks, medallions, or a classic roast.',
      descriptionAr: 'فيليه بقري طري كالزبدة، منظف يدوياً. مثالي للستيك أو الشوي أو الشواء الكلاسيكي.',
      categorySlug: 'beef', subcategory: 'tenderloin',
      images: [IMG.cuts], basePrice: 850,
      variants: [
        { weight: '250g', price: 213, stock: 12 },
        { weight: '500g', price: 425, stock: 8 },
        { weight: '1kg', price: 850, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: false, isBBQ: false,
      tags: ['tenderloin', 'steak', 'premium'], unit: 'kg',
      cookingTips: ['Sear in a hot cast-iron pan', 'Cook to medium-rare for best texture', 'Let rest before slicing'],
    }));

    await ctx.db.insert('products', p({
      slug: 'prime-sirloin-steak', name: 'Prime Sirloin Steak',
      nameAr: 'ستيك سيرلوين ممتاز',
      description: 'Well-marbled sirloin cut from the primal loin. Bold beef flavour at a great value.',
      descriptionAr: 'ستيك سيرلوين ممتاز التوزيع الدهني، نكهة بقري غنية وقيمة ممتازة.',
      categorySlug: 'beef', subcategory: 'steak',
      images: [IMG.steak], basePrice: 420,
      variants: [
        { weight: '300g', price: 126, stock: 20 },
        { weight: '500g', price: 210, stock: 14 },
        { weight: '1kg', price: 420, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['sirloin', 'steak', 'grill'], unit: 'kg',
      cookingTips: ['Season generously with salt and pepper', 'Grill over high heat for perfect char', 'Serve with compound butter'],
    }));

    await ctx.db.insert('products', p({
      slug: 'premium-minced-beef', name: 'Premium Minced Beef',
      nameAr: 'لحم بقر مفروم ممتاز',
      description: 'Fresh coarse-ground beef from premium cuts. Ideal for burgers, kofta, and pasta sauces.',
      descriptionAr: 'لحم بقر مفروم طازج من قطع ممتازة. مثالي للبرجر والكفتة وصلصات المعكرونة.',
      categorySlug: 'beef', subcategory: 'minced-beef',
      images: [IMG.minced], basePrice: 185,
      variants: [
        { weight: '500g', price: 93, stock: 40 },
        { weight: '1kg', price: 185, stock: 30 },
        { weight: '2kg', price: 355, stock: 15 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['minced', 'burger', 'kofta'], unit: 'kg',
      cookingTips: ['Handle gently; do not overwork the meat', 'Season just before cooking', 'Form patties with a slight indent in the centre'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-short-ribs', name: 'Beef Short Ribs',
      nameAr: 'ضلوع بقري قصيرة',
      description: 'Meaty beef short ribs, perfect for slow braising or grilling. Rich flavour and fall-off-the-bone texture.',
      descriptionAr: 'ضلوع بقري قصيرة لحمية، مثالية للطبخ البطيء أو الشوي. نكهة غنية وقوام يذوب في الفم.',
      categorySlug: 'beef', subcategory: 'short-ribs',
      images: [IMG.frenchRibs], basePrice: 320,
      variants: [
        { weight: '500g', price: 160, stock: 12 },
        { weight: '1kg', price: 320, stock: 8 },
        { weight: '2kg', price: 620, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['ribs', 'braising', 'grill'], unit: 'kg',
      cookingTips: ['Marinate overnight for best flavour', 'Low and slow is the key for tenderness', 'Finish on a hot grill for caramelisation'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-brisket', name: 'Beef Brisket',
      nameAr: 'صدر بقري',
      description: 'Whole beef brisket, ideal for smoking, slow-roasting, or braising. Rich beefy flavour.',
      descriptionAr: 'صدر بقري كامل، مثالي للتدخين أو الشواء البطيء. نكهة لحم بقري غنية.',
      categorySlug: 'beef', subcategory: 'brisket',
      images: [IMG.butcher], basePrice: 280,
      variants: [
        { weight: '1kg', price: 280, stock: 10 },
        { weight: '2kg', price: 540, stock: 6 },
        { weight: '3kg', price: 780, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['brisket', 'smoking', 'braising'], unit: 'kg',
      cookingTips: ['Low and slow at 110°C for several hours', 'Wrap in butcher paper when the bark sets', 'Slice against the grain'],
    }));

    /* ── FRENCH BEEF ──────────────────── */

    await ctx.db.insert('products', p({
      slug: 'charolais-ribeye-steak', name: 'Charolais Ribeye Steak',
      nameAr: 'ستيك ريب آي شاروليه',
      description: 'Premium Charolais beef ribeye from France. Exceptional marbling with a delicate, buttery texture and refined beef flavour.',
      descriptionAr: 'ستيك ريب آي من أبقار شاروليه الفرنسية الفاخرة. توزيع دهني ممتاز بقوام زبيدي ونكهة لحم بقري راقية.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchCharolais], basePrice: 680,
      variants: [
        { weight: '300g', price: 204, stock: 12 },
        { weight: '500g', price: 340, stock: 8 },
        { weight: '1kg', price: 680, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['charolais', 'french', 'ribeye', 'premium'], unit: 'kg',
      cookingTips: ['Bring to room temperature 30 mins before cooking', 'Sear on high heat for 3 mins per side', 'Rest 5 minutes before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'charolais-tenderloin', name: 'Charolais Beef Tenderloin',
      nameAr: 'تندرلوين شاروليه',
      description: 'The most tender cut from French Charolais cattle. Lean, delicate, and supremely tender with a subtle sweetness.',
      descriptionAr: 'أطعم قطعة من أبقار شاروليه الفرنسية. قليلة الدهن، دقيقة، وناعمة بشكل فائق مع حلاوة خفية.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchTenderloin], basePrice: 1200,
      variants: [
        { weight: '250g', price: 300, stock: 6 },
        { weight: '500g', price: 600, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: false,
      tags: ['charolais', 'french', 'tenderloin', 'luxury'], unit: 'kg',
      cookingTips: ['Best served rare to medium-rare', 'Season simply with fleur de sel', 'Slice against the grain'],
    }));

    await ctx.db.insert('products', p({
      slug: 'limousin-entrecote', name: 'Limousin Entrecôte',
      nameAr: 'أنتركوته ليموزين',
      description: 'Classic French entrecôte from Limousin cattle. Rich, beefy flavour with beautiful marbling throughout.',
      descriptionAr: 'أنتركوته فرنسية كلاسيكية من أبقار ليموزين. نكهة لحم بقري غنية مع توزيع دهني جميل.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchEntrecote], basePrice: 580,
      variants: [
        { weight: '300g', price: 174, stock: 15 },
        { weight: '500g', price: 290, stock: 10 },
        { weight: '1kg', price: 580, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: false, isBBQ: true,
      tags: ['limousin', 'french', 'entrecote', 'steak'], unit: 'kg',
      cookingTips: ['Season 40 minutes before cooking', 'Grill over high heat for caramelization', 'Finish with herb butter'],
    }));

    await ctx.db.insert('products', p({
      slug: 'french-bavette-steak', name: 'French Bavette Steak',
      nameAr: 'ستيك بافيت فرنسي',
      description: 'Traditional French butcher\'s cut (flap steak). Long grain, intense beef flavour, perfect for bistro-style cooking.',
      descriptionAr: 'قطعة جزار فرنسية تقليدية (بافيت). ألياف طويلة، نكهة لحم بقري قوية، مثالية للطهي على طريقة البسترو.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchBavette], basePrice: 320,
      variants: [
        { weight: '300g', price: 96, stock: 20 },
        { weight: '500g', price: 160, stock: 14 },
        { weight: '1kg', price: 320, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['french', 'bavette', 'flap', 'bistro'], unit: 'kg',
      cookingTips: ['Marinate in red wine and herbs for 2+ hours', 'Cook hot and fast to medium-rare', 'Slice thinly against the grain'],
    }));

    await ctx.db.insert('products', p({
      slug: 'french-onglet-hanger', name: 'French Onglet (Hanger Steak)',
      nameAr: 'أونجليت (ستيك المعلقة)',
      description: 'The prized "butcher\'s steak" — onglet/hanger steak. One per animal, intensely flavourful with a loose, tender texture.',
      descriptionAr: 'ستيك الجزار المميز — الأونجليت. قطعة واحدة فقط في كل حيوان، نكهة قوية بشكل استثنائي وقوام طري.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchOnglet], basePrice: 420,
      variants: [
        { weight: '250g', price: 105, stock: 8 },
        { weight: '500g', price: 210, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['french', 'onglet', 'hanger', 'butcher-cut'], unit: 'kg',
      cookingTips: ['Remove the central sinew before cooking', 'Best cooked rare to medium-rare', 'Pair with shallot sauce'],
    }));

    await ctx.db.insert('products', p({
      slug: 'limousin-short-ribs', name: 'Limousin Beef Short Ribs',
      nameAr: 'ضلوع بقري ليموزين قصيرة',
      description: 'Meaty short ribs from French Limousin cattle. Incredible depth of flavour when braised — fall-off-the-bone tender.',
      descriptionAr: 'ضلوع قصيرة من أبقار ليموزين الفرنسية. عمق نكهة لا يصدق عند الطهي البطيء — يذوب من على العظم.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchRibs], basePrice: 380,
      variants: [
        { weight: '500g', price: 190, stock: 10 },
        { weight: '1kg', price: 380, stock: 6 },
        { weight: '2kg', price: 740, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['limousin', 'french', 'ribs', 'braising'], unit: 'kg',
      cookingTips: ['Marinate overnight in red wine', 'Braise at 150°C for 3-4 hours', 'Reduce braising liquid for sauce'],
    }));

    await ctx.db.insert('products', p({
      slug: 'charolais-brisket', name: 'Charolais Beef Brisket',
      nameAr: 'صدر بقري شاروليه',
      description: 'Whole brisket from French Charolais. Perfect for smoking, slow-roasting, or traditional pot-au-feu.',
      descriptionAr: 'صدر بقري كامل من شاروليه الفرنسية. مثالي للتدخين أو الشواء البطيء أو البوت-أو-فو التقليدي.',
      categorySlug: 'beef', subcategory: 'french-beef',
      images: [IMG.frenchCharolais], basePrice: 320,
      variants: [
        { weight: '1kg', price: 320, stock: 8 },
        { weight: '2kg', price: 620, stock: 5 },
        { weight: '3kg', price: 900, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['charolais', 'french', 'brisket', 'smoking'], unit: 'kg',
      cookingTips: ['Low and slow at 110°C for 8+ hours', 'Wrap in butcher paper when bark forms', 'Slice against the grain'],
    }));

    /* ── BUFFALO ──────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'buffalo-steaks', name: 'Buffalo Steaks',
      nameAr: 'ستيك جاموس',
      description: 'Lean and flavourful buffalo steaks. A local Egyptian favourite, lower in fat than beef.',
      descriptionAr: 'ستيك جاموس قليل الدهون وغني بالنكهة. المفضل لدى المصريين، أقل دهوناً من لحم البقر.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.meat], basePrice: 380,
      variants: [
        { weight: '300g', price: 114, stock: 12 },
        { weight: '500g', price: 190, stock: 8 },
        { weight: '1kg', price: 380, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['buffalo', 'steak', 'lean'], unit: 'kg',
      cookingTips: ['Cook to medium-rare to avoid dryness', 'Marinate for extra tenderness', 'Rest before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'minced-buffalo', name: 'Minced Buffalo',
      nameAr: 'لحم جاموس مفروم',
      description: 'Fresh minced buffalo meat. Leaner than beef mince with a rich, distinctive taste.',
      descriptionAr: 'لحم جاموس مفروم طازج. أقل دهوناً من لحم البقر المفروم بنكهة مميزة غنية.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.minced], basePrice: 160,
      variants: [
        { weight: '500g', price: 80, stock: 20 },
        { weight: '1kg', price: 160, stock: 15 },
        { weight: '2kg', price: 310, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['buffalo', 'minced', 'lean'], unit: 'kg',
      cookingTips: ['Add a little olive oil for moisture', 'Season well as lean meat needs more flavour', 'Great for kofta and burgers'],
    }));

    /* ── LAMB ─────────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'premium-lamb-chops', name: 'Premium Lamb Chops',
      nameAr: 'ريش ضأن فاخرة',
      description: 'Tender and juicy lamb chops, perfect for grilling or pan-searing.',
      descriptionAr: 'ريش ضأن طرية وعصارية، مثالية للشوي أو القلي في المقلاة.',
      categorySlug: 'lamb', subcategory: 'lamb-chops',
      images: [IMG.lamb], basePrice: 550,
      variants: [
        { weight: '500g', price: 275, stock: 20 },
        { weight: '1kg', price: 550, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['chops', 'grill', 'lamb'], unit: 'kg',
      cookingTips: ['Marinate with rosemary and garlic', 'Grill over medium-high heat for 3-4 mins per side', 'Rest for 3 minutes before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'whole-leg-of-lamb', name: 'Whole Leg of Lamb',
      nameAr: 'فخدة ضأن كاملة',
      description: 'Succulent whole leg of lamb, ideal for roasting. Serves a crowd.',
      descriptionAr: 'فخدة ضأن كاملة شهية، مثالية للشواء في الفرن. تكفي لتجمع كبير.',
      categorySlug: 'lamb', subcategory: 'leg',
      images: [IMG.lamb], basePrice: 420,
      variants: [
        { weight: '1kg', price: 420, stock: 8 },
        { weight: '2kg', price: 820, stock: 5 },
        { weight: '3kg', price: 1200, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['lamb', 'roast', 'whole'], unit: 'kg',
      cookingTips: ['Score the fat and rub with garlic and herbs', 'Roast at 180°C until internal temp reaches 60°C', 'Rest for 15 minutes before carving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'minced-lamb', name: 'Minced Lamb',
      nameAr: 'لحم ضأن مفروم',
      description: 'Freshly minced lamb from selected cuts. Perfect for kofta, kebabs, and shepherd\'s pie.',
      descriptionAr: 'لحم ضأن مفروم طازج من قطع مختارة. مثالي للكفتة والكباب.',
      categorySlug: 'lamb', subcategory: 'minced-lamb',
      images: [IMG.kofta], basePrice: 240,
      variants: [
        { weight: '500g', price: 120, stock: 25 },
        { weight: '1kg', price: 240, stock: 18 },
        { weight: '2kg', price: 460, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['lamb', 'minced', 'kofta', 'kebab'], unit: 'kg',
      cookingTips: ['Mix with finely chopped onion and parsley', 'Shape onto skewers for authentic kebabs', 'Grill over charcoal for best flavour'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-shoulder', name: 'Lamb Shoulder',
      nameAr: 'كتف ضأن',
      description: 'Tender lamb shoulder, perfect for slow-roasting or braising. Rich flavour.',
      descriptionAr: 'كتف ضأن طري، مثالي للشواء البطيء. نكهة غنية لا تقاوم.',
      categorySlug: 'lamb', subcategory: 'shoulder',
      images: [IMG.lamb], basePrice: 320,
      variants: [
        { weight: '1kg', price: 320, stock: 8 },
        { weight: '2kg', price: 620, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['lamb', 'shoulder', 'braising'], unit: 'kg',
      cookingTips: ['Slow-roast at 150°C for 3-4 hours', 'Season with cumin and coriander', 'Shred and serve with flatbread'],
    }));

    /* ── GOAT ─────────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'goat-meat-cuts', name: 'Goat Meat Cuts',
      nameAr: 'لحم ماعز',
      description: 'Tender goat meat cuts, lean and full of flavour. A traditional Egyptian favourite.',
      descriptionAr: 'قطع لحم ماعز طرية، قليلة الدهون وغنية بالنكهة. مفضلة تقليدياً في مصر.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.goat], basePrice: 280,
      variants: [
        { weight: '500g', price: 140, stock: 14 },
        { weight: '1kg', price: 280, stock: 8 },
        { weight: '2kg', price: 540, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['goat', 'traditional', 'lean'], unit: 'kg',
      cookingTips: ['Marinate with yoghurt and spices to tenderise', 'Slow-cook for best results', 'Pairs well with rice and herbs'],
    }));

    /* ── VEAL ─────────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'veal-escalope', name: 'Veal Escalope',
      nameAr: 'اسكالوب عجل',
      description: 'Thinly sliced veal escalopes, tender and delicate. Perfect for schnitzel or pan-frying.',
      descriptionAr: 'شرائح عجل رقيقة طرية. مثالية للشنتزل أو القلي السريع.',
      categorySlug: 'veal', subcategory: null,
      images: ['/images/products/veal_steak.png'], basePrice: 520,
      variants: [
        { weight: '400g', price: 208, stock: 10 },
        { weight: '800g', price: 416, stock: 6 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['veal', 'escalope', 'schnitzel'], unit: 'kg',
      cookingTips: ['Pound to even thickness before cooking', 'Dredge in flour, egg, and breadcrumbs', 'Fry in butter for 2-3 mins per side'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-cutlets', name: 'Veal Cutlets',
      nameAr: 'كسطليتة عجل',
      description: 'Premium veal cutlets with delicate flavour and tender texture. Bone-in for extra flavour.',
      descriptionAr: 'كسطليتة عجل فاخرة بنكهة دقيقة وقوام طري. بالعظمة لنكهة إضافية.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.meat], basePrice: 580,
      variants: [
        { weight: '500g', price: 290, stock: 10 },
        { weight: '1kg', price: 580, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: false, isBBQ: true,
      tags: ['veal', 'cutlets', 'grill'], unit: 'kg',
      cookingTips: ['Season simply with salt and pepper', 'Grill over medium heat', 'Serve with a squeeze of lemon'],
    }));

    /* ── GRILL CUTS ────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'kofta-mix', name: 'Kofta Mix (Beef & Lamb)',
      nameAr: 'كفتة مشكلة (لحم بقر وضأن)',
      description: 'Premium kofta mix, blended from beef and lamb with traditional spices. Ready for the grill.',
      descriptionAr: 'كفتة ممتازة مخلوطة من لحم البقر والضأن مع بهارات تقليدية. جاهزة للشوي.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.kofta], basePrice: 220,
      variants: [
        { weight: '500g', price: 110, stock: 30 },
        { weight: '1kg', price: 220, stock: 25 },
        { weight: '2kg', price: 420, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['kofta', 'grill', 'mix'], unit: 'kg',
      cookingTips: ['Shape onto flat skewers for even cooking', 'Grill over charcoal for authentic flavour', 'Serve with tahini sauce and bread'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-burger-patties', name: 'Beef Burger Patties',
      nameAr: 'أقراص برجر لحم بقري',
      description: 'Hand-formed beef burger patties from premium minced beef. 100% pure meat, no fillers.',
      descriptionAr: 'أقراص برجر لحم بقري مشكولة يدوياً من لحم مفروم ممتاز. 100% لحم نقي بدون إضافات.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.burgers], basePrice: 280,
      variants: [
        { weight: '4×100g', price: 112, stock: 20 },
        { weight: '8×100g', price: 224, stock: 15 },
        { weight: '12×100g', price: 336, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['burger', 'patties', 'grill'], unit: 'kg',
      cookingTips: ['Make a thumb indent in the centre to prevent doming', 'Cook on high heat for a crust', 'Only flip once'],
    }));

    /* ── ORGAN MEATS ──────────────────── */

    await ctx.db.insert('products', p({
      slug: 'beef-liver', name: 'Fresh Beef Liver',
      nameAr: 'كبدة بقري طازجة',
      description: 'Fresh beef liver, sliced and ready to cook. Rich in iron and nutrients.',
      descriptionAr: 'كبدة بقري طازجة مقطعة شرائح جاهزة للطهي. غنية بالحديد والعناصر الغذائية.',
      categorySlug: 'organ-meats', subcategory: 'liver',
      images: [IMG.offal], basePrice: 90,
      variants: [
        { weight: '500g', price: 45, stock: 20 },
        { weight: '1kg', price: 90, stock: 15 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['liver', 'organ', 'traditional'], unit: 'kg',
      cookingTips: ['Soak in milk for 30 minutes to reduce bitterness', 'Cook quickly over high heat', 'Serve with onions and lemon'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-brain', name: 'Lamb Brain',
      nameAr: 'مخ ضأن',
      description: 'Fresh lamb brains, a delicacy. Delicate texture, perfect for pan-frying or in traditional dishes.',
      descriptionAr: 'مخ ضأن طازج، من الأطعمة الفاخرة. قوام دقيق، مثالي للقلي أو في الأطباق التقليدية.',
      categorySlug: 'organ-meats', subcategory: 'brain',
      images: [IMG.offal], basePrice: 60,
      variants: [
        { weight: '250g', price: 15, stock: 10 },
        { weight: '500g', price: 30, stock: 6 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['brain', 'delicacy', 'traditional'], unit: 'kg',
      cookingTips: ['Soak in cold water to remove blood', 'Poach gently before frying', 'Coat in egg and flour for crispy texture'],
    }));

    await ctx.db.insert('products', p({
      slug: 'cow-trotters', name: 'Cow Trotters',
      nameAr: 'كوارع',
      description: 'Clean cow trotters, perfect for traditional Egyptian soups and stews. Rich in collagen.',
      descriptionAr: 'كوارع بقر نظيفة، مثالية للشوربات واليخنات المصرية التقليدية. غنية بالكولاجين.',
      categorySlug: 'organ-meats', subcategory: 'trotters',
      images: [IMG.offal], basePrice: 45,
      variants: [
        { weight: '1kg', price: 45, stock: 15 },
        { weight: '2kg', price: 85, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['trotters', 'soup', 'traditional'], unit: 'kg',
      cookingTips: ['Clean thoroughly and remove any hair', 'Boil with garlic and vinegar', 'Slow-cook for hours until tender'],
    }));

    /* ── FROZEN ────────────────────────── */

    await ctx.db.insert('products', p({
      slug: 'frozen-minced-beef', name: 'Frozen Minced Beef',
      nameAr: 'لحم بقر مفروم مجمد',
      description: 'Premium minced beef, flash-frozen at peak freshness. Convenient and long-lasting.',
      descriptionAr: 'لحم بقر مفروم ممتاز، مجمد طازجاً. مريح وطويل الصلاحية.',
      categorySlug: 'frozen', subcategory: null,
      images: [IMG.frozen], basePrice: 150,
      variants: [
        { weight: '500g', price: 75, stock: 30 },
        { weight: '1kg', price: 150, stock: 25 },
        { weight: '2kg', price: 290, stock: 15 },
      ],
      isFresh: false, isFrozen: true, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['frozen', 'minced', 'convenient'], unit: 'kg',
      cookingTips: ['Thaw in the refrigerator overnight', 'Cook thoroughly to 71°C', 'Do not refreeze after thawing'],
    }));

    await ctx.db.insert('products', p({
      slug: 'frozen-lamb-chops', name: 'Frozen Lamb Chops',
      nameAr: 'ريش ضأن مجمد',
      description: 'Premium lamb chops, flash-frozen to lock in freshness. Ready when you are.',
      descriptionAr: 'ريش ضأن فاخرة مجمدة طازجة. جاهزة عندما تريد.',
      categorySlug: 'frozen', subcategory: null,
      images: [IMG.frozen], basePrice: 480,
      variants: [
        { weight: '500g', price: 240, stock: 15 },
        { weight: '1kg', price: 480, stock: 10 },
      ],
      isFresh: false, isFrozen: true, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: false, isBBQ: true,
      tags: ['frozen', 'lamb', 'chops'], unit: 'kg',
      cookingTips: ['Thaw completely before cooking', 'Pat dry with paper towels', 'Season and grill as fresh'],
    }));

    /* ── PREMIUM CUTS ──────────────────── */

    await ctx.db.insert('products', p({
      slug: 'tomahawk-steak', name: 'Tomahawk Steak',
      nameAr: 'ستيك توماهوك',
      description: 'Showstopper bone-in ribeye with a long French-trimmed bone. 1kg of premium beef.',
      descriptionAr: 'ستيك ريب آي بالعظمة مع عظمة طويلة مشذبة. 1 كجم من لحم البقر الممتاز.',
      categorySlug: 'premium-cuts', subcategory: 'ribeye',
      images: [IMG.meat], basePrice: 950,
      variants: [
        { weight: '1kg', price: 950, stock: 4 },
        { weight: '1.5kg', price: 1425, stock: 2 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['tomahawk', 'steak', 'premium', 'showstopper'], unit: 'kg',
      cookingTips: ['Sear on all sides including the bone', 'Finish in the oven at 180°C', 'Rest for 10 minutes before serving'],
    }));

    /* ── BEEF (additional) ──────────────── */

    await ctx.db.insert('products', p({
      slug: 't-bone-steak', name: 'T-Bone Steak',
      nameAr: 'ستيك تي بون',
      description: 'Iconic T-bone steak combining the strip and tenderloin in one cut. 500g of pure satisfaction.',
      descriptionAr: 'ستيك تي بون أيقوني يجمع بين الستريب والتندرلوين في قطعة واحدة. 500 جرام من المتعة الخالصة.',
      categorySlug: 'beef', subcategory: 'steak',
      images: [IMG.tbone], basePrice: 580,
      variants: [
        { weight: '500g', price: 290, stock: 10 },
        { weight: '750g', price: 435, stock: 6 },
        { weight: '1kg', price: 580, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['t-bone', 'steak', 'premium'], unit: 'kg',
      cookingTips: ['Sear over high heat to develop a crust', 'Finish to medium-rare for best results', 'Let rest 5 minutes before carving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'porterhouse-steak', name: 'Porterhouse Steak',
      nameAr: 'ستيك بورتر هاوس',
      description: 'The king of steaks — large porterhouse with strip, tenderloin, and a signature bone.',
      descriptionAr: 'ملك الستيك — بورتر هاوس كبير يحتوي على الستريب والتندرلوين مع العظمة المميزة.',
      categorySlug: 'beef', subcategory: 'steak',
      images: [IMG.tbone], basePrice: 620,
      variants: [
        { weight: '700g', price: 434, stock: 8 },
        { weight: '1kg', price: 620, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['porterhouse', 'steak', 'premium'], unit: 'kg',
      cookingTips: ['Season 40 minutes before cooking', 'Reverse sear for thick cuts', 'Use a meat thermometer for accuracy'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-rump-steak', name: 'Beef Rump Steak',
      nameAr: 'ستيك رامب',
      description: 'Lean and flavourful rump steak. A great everyday cut with a robust beef taste.',
      descriptionAr: 'ستيك رامب قليل الدهون وغني بالنكهة. قطعة يومية رائعة بنكهة لحم بقري قوية.',
      categorySlug: 'beef', subcategory: 'steak',
      images: [IMG.steak], basePrice: 380,
      variants: [
        { weight: '300g', price: 114, stock: 18 },
        { weight: '500g', price: 190, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['rump', 'steak', 'lean'], unit: 'kg',
      cookingTips: ['Marinate to enhance tenderness', 'Cook to medium for best texture', 'Slice against the grain'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-flank-steak', name: 'Beef Flank Steak',
      nameAr: 'ستيك فلانك',
      description: 'Long, flat flank steak with bold flavour. Perfect for fajitas, stir-fry, and carving.',
      descriptionAr: 'ستيك فلانك مسطح طويل بنكهة قوية. مثالي للفاهيتا والستير فراي والتقطيع.',
      categorySlug: 'beef', subcategory: 'steak',
      images: [IMG.steak], basePrice: 340,
      variants: [
        { weight: '500g', price: 170, stock: 14 },
        { weight: '1kg', price: 340, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['flank', 'steak', 'fajitas'], unit: 'kg',
      cookingTips: ['Marinate for at least 2 hours', 'Cook hot and fast — no more than medium', 'Always slice thinly against the grain'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-chuck-cubes', name: 'Beef Chuck Cubes',
      nameAr: 'مكعبات لحم بقر',
      description: 'Boneless beef chuck cut into hearty cubes. Perfect for stews, curries, and slow-cooked dishes.',
      descriptionAr: 'لحم بقر تشاك مقطع مكعبات بدون عظم. مثالي لليخنات والكاري والطبخ البطيء.',
      categorySlug: 'beef', subcategory: null,
      images: [IMG.meat], basePrice: 220,
      variants: [
        { weight: '500g', price: 110, stock: 20 },
        { weight: '1kg', price: 220, stock: 15 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['chuck', 'stew', 'cubes'], unit: 'kg',
      cookingTips: ['Brown the cubes well before braising', 'Cook low and slow for 2-3 hours', 'Add vegetables in the last 30 minutes'],
    }));

    await ctx.db.insert('products', p({
      slug: 'oxtail', name: 'Fresh Oxtail',
      nameAr: 'ذيل الثور',
      description: 'Rich, gelatinous oxtail perfect for slow-braising into a luxurious stew. A delicacy.',
      descriptionAr: 'ذيل ثور غني بالجيلاتين، مثالي للطبخ البطيء في يخنة فاخرة. طعام شهي لا يقاوم.',
      categorySlug: 'beef', subcategory: null,
      images: [IMG.meat], basePrice: 180,
      variants: [
        { weight: '1kg', price: 180, stock: 10 },
        { weight: '2kg', price: 350, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['oxtail', 'braising', 'traditional'], unit: 'kg',
      cookingTips: ['Sear pieces before adding to liquid', 'Cook for 3-4 hours until meat falls off the bone', 'Skim fat from the surface before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-stew-meat', name: 'Beef Stew Meat',
      nameAr: 'لحم بقر للقديد',
      description: 'Pre-cut beef stew meat from premium cuts. Ready for your favourite slow-cooked recipes.',
      descriptionAr: 'لحم بقر مقطع مسبقاً للقديد من قطع ممتازة. جاهز لوصفات الطبخ البطيء المفضلة لديك.',
      categorySlug: 'beef', subcategory: null,
      images: [IMG.meat], basePrice: 240,
      variants: [
        { weight: '500g', price: 120, stock: 25 },
        { weight: '1kg', price: 240, stock: 18 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['stew', 'beef', 'traditional'], unit: 'kg',
      cookingTips: ['Pat dry before browning for better crust', 'Add red wine for depth of flavour', 'Cook until fork-tender'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-shanks', name: 'Beef Shanks',
      nameAr: 'موزة بقري',
      description: 'Rich in marrow and collagen, perfect for slow-braising and tagines.',
      descriptionAr: 'غنية بالنخاع والكولاجين، مثالية للطهي البطيء والطواجن.',
      categorySlug: 'beef', subcategory: 'beef-shanks',
      images: ['/images/products/beef_shank.png'], basePrice: 310,
      variants: [
        { weight: '1kg', price: 310, stock: 15 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['beef', 'shanks', 'stew'], unit: 'kg',
      cookingTips: ['Braise low and slow for 2-3 hours', 'Keep the bone in for marrow flavour', 'Great for traditional Egyptian tagines'],
    }));

    /* ── BUFFALO (additional) ───────────── */

    await ctx.db.insert('products', p({
      slug: 'buffalo-ribs', name: 'Buffalo Ribs',
      nameAr: 'ضلوع جاموس',
      description: 'Meaty buffalo ribs with rich, distinctive flavour. Excellent for slow cooking or grilling.',
      descriptionAr: 'ضلوع جاموس لحمية بنكهة غنية ومميزة. ممتازة للطبخ البطيء أو الشوي.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.meat], basePrice: 260,
      variants: [
        { weight: '500g', price: 130, stock: 14 },
        { weight: '1kg', price: 260, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['buffalo', 'ribs', 'grill'], unit: 'kg',
      cookingTips: ['Marinate overnight with garlic and herbs', 'Slow-grill over indirect heat', 'Finish with a glaze of honey and soy'],
    }));

    await ctx.db.insert('products', p({
      slug: 'buffalo-shank', name: 'Buffalo Shank',
      nameAr: 'ساق جاموس',
      description: 'Bone-in buffalo shank, rich in collagen. Perfect for traditional Egyptian osso buco-style dishes.',
      descriptionAr: 'ساق جاموس بالعظم، غني بالكولاجين. مثالي لأطباق أوزو بوكو المصرية التقليدية.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.butcher], basePrice: 200,
      variants: [
        { weight: '1kg', price: 200, stock: 10 },
        { weight: '2kg', price: 380, stock: 5 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['buffalo', 'shank', 'braising'], unit: 'kg',
      cookingTips: ['Brown the shanks thoroughly', 'Cook in aromatic tomato-based sauce', 'Slow-braise for 2-3 hours until tender'],
    }));

    await ctx.db.insert('products', p({
      slug: 'buffalo-liver', name: 'Buffalo Liver',
      nameAr: 'كبدة جاموس',
      description: 'Fresh buffalo liver with a milder, sweeter flavour than beef liver. A local delicacy.',
      descriptionAr: 'كبدة جاموس طازجة بنكهة أخف وألطف من كبدة البقر. طعام شهي محلي.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.offal], basePrice: 95,
      variants: [
        { weight: '500g', price: 48, stock: 18 },
        { weight: '1kg', price: 95, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['liver', 'buffalo', 'traditional'], unit: 'kg',
      cookingTips: ['Soak in milk for 30 minutes', 'Cook quickly over high heat', 'Pair with chilli and garlic'],
    }));

    await ctx.db.insert('products', p({
      slug: 'buffalo-stew', name: 'Buffalo Stew Cuts',
      nameAr: 'لحم جاموسي مكعبات',
      description: 'Premium lean chunks ideal for stews and traditional vegetable tagines.',
      descriptionAr: 'مكعبات لحم أحمر ممتازة، مثالية لليخني والطواجن البلدي بالخضار.',
      categorySlug: 'buffalo', subcategory: null,
      images: [IMG.meat], basePrice: 260,
      variants: [
        { weight: '1kg', price: 260, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['buffalo', 'stew', 'traditional'], unit: 'kg',
      cookingTips: ['Sear the meat pieces in ghee before cooking', 'Simmer on low heat with onions and spices', 'Pairs perfectly with okra or potato tagines'],
    }));

    /* ── LAMB (additional) ──────────────── */

    await ctx.db.insert('products', p({
      slug: 'lamb-ribs', name: 'Lamb Ribs',
      nameAr: 'ضلوع ضأن',
      description: 'Tender lamb ribs with a delicate balance of meat and fat. Excellent grilled or braised.',
      descriptionAr: 'ضلوع ضأن طرية بتوازن دقيق بين اللحم والدهن. ممتازة للشوي أو الطهي البطيء.',
      categorySlug: 'lamb', subcategory: 'lamb-ribs',
      images: [IMG.meat], basePrice: 380,
      variants: [
        { weight: '500g', price: 190, stock: 16 },
        { weight: '1kg', price: 380, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['ribs', 'lamb', 'grill'], unit: 'kg',
      cookingTips: ['Slow-cook first for fall-off-the-bone texture', 'Glaze with pomegranate molasses', 'Finish on a hot grill for char'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-shank', name: 'Lamb Shank',
      nameAr: 'ساق ضأن',
      description: 'Bone-in lamb shank, ideal for slow-braising. Melts off the bone with rich, deep flavours.',
      descriptionAr: 'ساق ضأن بالعظم، مثالي للطبخ البطيء. يذوب من على العظم بنكهات عميقة وغنية.',
      categorySlug: 'lamb', subcategory: null,
      images: [IMG.butcher], basePrice: 360,
      variants: [
        { weight: '1kg', price: 360, stock: 9 },
        { weight: '2kg', price: 700, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: false, isBBQ: false,
      tags: ['shank', 'lamb', 'braising'], unit: 'kg',
      cookingTips: ['Sear on all sides to lock in flavour', 'Braise at 160°C for 3 hours', 'Pair with root vegetables'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-leg-steak', name: 'Lamb Leg Steak',
      nameAr: 'ستيك فخدة ضأن',
      description: 'Sliced lamb leg steak, lean and tender. Quick to cook, full of traditional flavour.',
      descriptionAr: 'ستيك فخدة ضأن مقطع شرائح، قليل الدهون وطري. سريع الطهي بنكهة تقليدية غنية.',
      categorySlug: 'lamb', subcategory: 'leg',
      images: [IMG.steak], basePrice: 460,
      variants: [
        { weight: '500g', price: 230, stock: 14 },
        { weight: '1kg', price: 460, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['leg', 'steak', 'lamb'], unit: 'kg',
      cookingTips: ['Marinate for 1 hour in yoghurt and spices', 'Cook to medium-rare', 'Rest before slicing'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-rack', name: 'Lamb Rack',
      nameAr: 'ظهر الضأن',
      description: 'Frenched lamb rack, the showpiece of any dinner. 8 ribs of tender, rosy meat.',
      descriptionAr: 'ظهر ضأن فرنش راك، قطعة العرض لأي عشاء. 8 ضلوع من اللحم الطري الزهري.',
      categorySlug: 'lamb', subcategory: null,
      images: [IMG.lamb], basePrice: 720,
      variants: [
        { weight: '800g', price: 576, stock: 6 },
        { weight: '1.2kg', price: 864, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['rack', 'lamb', 'premium', 'special-occasion'], unit: 'kg',
      cookingTips: ['Sear the meat side first for a crust', 'Roast at 200°C for 12-15 minutes', 'Rest for 8 minutes before carving into chops'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-neck', name: 'Lamb Neck',
      nameAr: 'رقبة ضاني',
      description: 'Exceptionally rich and gelatinous cut, ideal for soups and slow-braising.',
      descriptionAr: 'قطعة غنية بالجيلاتين والنكهة، مثالية للشوربة الفاخرة والطهي البطيء.',
      categorySlug: 'lamb', subcategory: null,
      images: [IMG.meat], basePrice: 360,
      variants: [
        { weight: '1kg', price: 360, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['lamb', 'neck', 'soup'], unit: 'kg',
      cookingTips: ['Boil slowly to create a rich broth', 'Season with cardamom, mastic, and bay leaves', 'Slow-roast in the oven after boiling for a crispy exterior'],
    }));

    /* ── GOAT (additional) ──────────────── */

    await ctx.db.insert('products', p({
      slug: 'goat-chops', name: 'Goat Chops',
      nameAr: 'ريش ماعز',
      description: 'Bone-in goat chops with bold, distinctive flavour. Excellent for grilling or stewing.',
      descriptionAr: 'ريش ماعز بالعظم بنكهة قوية ومميزة. ممتازة للشوي أو الطهي.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.chops], basePrice: 320,
      variants: [
        { weight: '500g', price: 160, stock: 12 },
        { weight: '1kg', price: 320, stock: 7 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['chops', 'goat', 'grill'], unit: 'kg',
      cookingTips: ['Marinate overnight in spiced yoghurt', 'Cook over charcoal for authentic flavour', 'Serve with rice and grilled tomatoes'],
    }));

    await ctx.db.insert('products', p({
      slug: 'goat-stew', name: 'Goat Stew Meat',
      nameAr: 'لحم ماعز للقديد',
      description: 'Bone-in goat pieces cut for stew. Perfect for traditional Egyptian mhammar and tagine dishes.',
      descriptionAr: 'قطع لحم ماعز بالعظم مقطعة للقديد. مثالية لأطباق المَحمَّر والطاجين المصري التقليدي.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.meat], basePrice: 290,
      variants: [
        { weight: '500g', price: 145, stock: 16 },
        { weight: '1kg', price: 290, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['stew', 'goat', 'traditional'], unit: 'kg',
      cookingTips: ['Brown well in a hot pan', 'Add onions, garlic, and warm spices', 'Slow-cook for at least 90 minutes'],
    }));

    await ctx.db.insert('products', p({
      slug: 'goat-leg', name: 'Whole Goat Leg',
      nameAr: 'فخدة ماعز كاملة',
      description: 'Whole bone-in goat leg, ideal for special occasions. Serves 4-6 people generously.',
      descriptionAr: 'فخدة ماعز كاملة بالعظم، مثالية للمناسبات الخاصة. تكفي 4-6 أشخاص بسخاء.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.goat], basePrice: 420,
      variants: [
        { weight: '1.5kg', price: 630, stock: 5 },
        { weight: '2.5kg', price: 1050, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['leg', 'goat', 'whole'], unit: 'kg',
      cookingTips: ['Marinate for 24 hours', 'Roast at 180°C for 90 minutes', 'Baste frequently with pan juices'],
    }));

    await ctx.db.insert('products', p({
      slug: 'goat-shoulder', name: 'Goat Shoulder',
      nameAr: 'كتف ماعز',
      description: 'Tender shoulder cut, best for braising and slow cooking.',
      descriptionAr: 'كتف طري، مناسب للطهي البطيء والتسوية على نار هادئة.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.goat], basePrice: 280,
      variants: [
        { weight: '1kg', price: 280, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['goat', 'shoulder', 'traditional'], unit: 'kg',
      cookingTips: ['Marinate with garlic, vinegar, and spices', 'Slow-cook in a covered pot', 'Great for traditional goat mandi'],
    }));

    await ctx.db.insert('products', p({
      slug: 'goat-shank', name: 'Goat Shank',
      nameAr: 'موزة ماعز',
      description: 'Flavorful, slow-braising cut rich in collagen.',
      descriptionAr: 'قطعة لحم غنية بالنكهة ومثالية للتسوية البطيئة على نار هادئة.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.goat], basePrice: 310,
      variants: [
        { weight: '1kg', price: 310, stock: 8 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['goat', 'shank', 'stew'], unit: 'kg',
      cookingTips: ['Sear before braising to lock in juices', 'Braise in red sauce or broth with herbs', 'Cook until the meat easily pulls away from the bone'],
    }));

    await ctx.db.insert('products', p({
      slug: 'goat-minced', name: 'Minced Goat',
      nameAr: 'لحم ماعز مفروم',
      description: 'Lean minced goat meat, great for traditional kofta and pies.',
      descriptionAr: 'مفروم ماعز قليل الدهن، ممتاز للكفتة التقليدية والفطائر.',
      categorySlug: 'goat', subcategory: null,
      images: [IMG.minced], basePrice: 320,
      variants: [
        { weight: '1kg', price: 320, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['goat', 'minced', 'lean'], unit: 'kg',
      cookingTips: ['Mix with fats or olive oil to retain moisture', 'Season with onion, parsley, and mixed spices', 'Cook on high heat for a perfect crust'],
    }));

    /* ── VEAL (additional) ──────────────── */

    await ctx.db.insert('products', p({
      slug: 'veal-chops', name: 'Veal Chops',
      nameAr: 'ريش عجل',
      description: 'Bone-in veal chops, delicate and tender. The premium choice for a refined meal.',
      descriptionAr: 'ريش عجل بالعظم، دقيقة وطري. الاختيار الفاخر لوجبة راقية.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.chops], basePrice: 640,
      variants: [
        { weight: '500g', price: 320, stock: 8 },
        { weight: '1kg', price: 640, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: false, isBBQ: true,
      tags: ['chops', 'veal', 'premium'], unit: 'kg',
      cookingTips: ['Bring to room temperature before cooking', 'Sear quickly in a hot pan', 'Finish with butter, thyme, and lemon'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-liver', name: 'Veal Liver',
      nameAr: 'كبدة عجل',
      description: 'Premium veal liver with a delicate, mild flavour. Lighter than beef liver, exceptional when pan-fried.',
      descriptionAr: 'كبدة عجل فاخرة بنكهة خفيفة ودقيقة. ألطف من كبدة البقر، استثنائية عند القلي في المقلاة.',
      categorySlug: 'veal', subcategory: 'liver',
      images: [IMG.offal], basePrice: 220,
      variants: [
        { weight: '500g', price: 110, stock: 10 },
        { weight: '1kg', price: 220, stock: 6 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['liver', 'veal', 'delicacy'], unit: 'kg',
      cookingTips: ['Soak in milk to mellow the flavour', 'Pat dry before searing', 'Cook to medium so the centre stays rosy'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-stew', name: 'Veal Stew Meat',
      nameAr: 'لحم عجل للقديد',
      description: 'Boneless veal pieces, perfect for blanquette, veal marsala, or a delicate veal curry.',
      descriptionAr: 'قطع لحم عجل بدون عظم، مثالية للبلانكيه وفيليه مارسالا والكاري الخفيف.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.meat], basePrice: 480,
      variants: [
        { weight: '500g', price: 240, stock: 12 },
        { weight: '1kg', price: 480, stock: 7 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['stew', 'veal', 'blanquette'], unit: 'kg',
      cookingTips: ['Brown lightly to keep the meat tender', 'Deglaze with white wine for depth', 'Simmer gently until just cooked through'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-shoulder', name: 'Veal Shoulder',
      nameAr: 'كتف عجل',
      description: 'A versatile cut for roasting, stews, and everyday cooking.',
      descriptionAr: 'قطعة متعددة الاستخدامات، مناسبة للشوي واليخني والطبخ اليومي.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.meat], basePrice: 320,
      variants: [
        { weight: '1kg', price: 320, stock: 12 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['veal', 'shoulder', 'roast'], unit: 'kg',
      cookingTips: ['Roast at medium temperature to preserve tenderness', 'Baste with pan juices regularly', 'Slice thinly to serve'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-minced', name: 'Minced Veal',
      nameAr: 'لحم عجل مفروم',
      description: 'Light minced veal for burgers, kofta, and home cooking.',
      descriptionAr: 'لحم عجل مفروم خفيف، مناسب للبرجر والكفتة والطبخ المنزلي.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.minced], basePrice: 280,
      variants: [
        { weight: '1kg', price: 280, stock: 15 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['veal', 'minced', 'light'], unit: 'kg',
      cookingTips: ['Great for lighter meatballs and burgers', 'Cook gently to avoid drying out', 'Season with nutmeg and white pepper for a refined taste'],
    }));

    await ctx.db.insert('products', p({
      slug: 'veal-shanks', name: 'Veal Shank',
      nameAr: 'موزة عجل',
      description: 'Tender and rich in gelatin, perfect for Osso Buco and rich stews.',
      descriptionAr: 'طرية للغاية وغنية بالجيلاتين، مثالية لطبق الأوسوبوكو واليخني الغني.',
      categorySlug: 'veal', subcategory: null,
      images: [IMG.meat], basePrice: 380,
      variants: [
        { weight: '1kg', price: 380, stock: 10 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: false, isBBQ: false,
      tags: ['veal', 'shanks', 'osso-buco'], unit: 'kg',
      cookingTips: ['Tie with kitchen twine before cooking to retain shape', 'Braise with white wine, broth, and vegetables', 'Serve over risotto or mashed potatoes'],
    }));

    /* ── GRILL CUTS (additional) ────────── */

    await ctx.db.insert('products', p({
      slug: 'mixed-grill-pack', name: 'Mixed Grill Pack',
      nameAr: 'تشكيلة شوي مشكلة',
      description: '3kg mixed grill pack: kofta, lamb chops, chicken thighs, and beef cubes. Perfect for gatherings.',
      descriptionAr: 'تشكيلة شوي 3 كجم: كفتة، ريش ضأن، أفخاذ دجاج، مكعبات لحم. مثالية للتجمعات.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.grill], basePrice: 480,
      variants: [
        { weight: '3kg', price: 1440, stock: 8 },
        { weight: '5kg', price: 2400, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: true, isBBQ: true,
      tags: ['mixed', 'grill', 'pack', 'gathering'], unit: 'kg',
      cookingTips: ['Bring all cuts to room temperature first', 'Cook tougher cuts first on the grill', 'Rest meats for 3-5 minutes before serving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-kofta', name: 'Beef Kofta Skewers',
      nameAr: 'كفتة لحم بقري على أسياخ',
      description: 'Hand-seasoned beef kofta skewers with parsley, onion, and Egyptian spices. Ready to grill.',
      descriptionAr: 'كفتة لحم بقري متبلة يدوياً مع البقدونس والبصل والبهارات المصرية. جاهزة للشوي.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.kofta], basePrice: 240,
      variants: [
        { weight: '500g', price: 120, stock: 28 },
        { weight: '1kg', price: 240, stock: 22 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['kofta', 'beef', 'skewer'], unit: 'kg',
      cookingTips: ['Cook over medium-high heat for 4-5 minutes per side', 'Brush with oil to prevent sticking', 'Serve with tahini and pickled chillies'],
    }));

    await ctx.db.insert('products', p({
      slug: 'lamb-kofta', name: 'Lamb Kofta Skewers',
      nameAr: 'كفتة ضأن على أسياخ',
      description: 'Aromatic lamb kofta skewers with traditional Egyptian baharat spice blend.',
      descriptionAr: 'كفتة ضأن عطرية مع خلطة بهارات بحرات المصرية التقليدية.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.kofta], basePrice: 280,
      variants: [
        { weight: '500g', price: 140, stock: 24 },
        { weight: '1kg', price: 280, stock: 18 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['kofta', 'lamb', 'skewer'], unit: 'kg',
      cookingTips: ['Grill over charcoal for authentic smoky flavour', 'Turn frequently to cook evenly', 'Garnish with fresh mint and lemon'],
    }));

    await ctx.db.insert('products', p({
      slug: 'shish-tawook', name: 'Shish Tawook',
      nameAr: 'شيش طاووق',
      description: 'Marinated chicken skewers in garlic and yoghurt marinade. Traditionally grilled, juicy and tender.',
      descriptionAr: 'شيش طاووق متبّل بالثوم والزبادي. مشوي بالطريقة التقليدية، عصاري وطري.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.kebab], basePrice: 200,
      variants: [
        { weight: '500g', price: 100, stock: 25 },
        { weight: '1kg', price: 200, stock: 18 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['tawook', 'grill', 'skewer'], unit: 'kg',
      cookingTips: ['Marinate for at least 4 hours', 'Cook over high heat for 3-4 minutes per side', 'Serve with garlic sauce and pickled vegetables'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-sausages', name: 'Beef Sausages',
      nameAr: 'نقانق لحم بقري',
      description: 'Handmade beef sausages with a subtle blend of herbs and spices. Great for breakfast or grilling.',
      descriptionAr: 'نقانق لحم بقري مصنوعة يدوياً بخلطة خفيفة من الأعشاب والبهارات. رائعة للإفطار أو الشوي.',
      categorySlug: 'bbq-cuts', subcategory: null,
      images: [IMG.grill], basePrice: 180,
      variants: [
        { weight: '500g', price: 90, stock: 30 },
        { weight: '1kg', price: 180, stock: 22 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['sausage', 'beef', 'grill'], unit: 'kg',
      cookingTips: ['Pierce the casings before cooking', 'Grill over medium heat for 10-12 minutes', 'Turn frequently for even browning'],
    }));

    /* ── ORGAN MEATS (additional) ───────── */

    await ctx.db.insert('products', p({
      slug: 'beef-kidney', name: 'Beef Kidney',
      nameAr: 'كلاوي بقري',
      description: 'Fresh beef kidneys with a rich, distinctive flavour. A traditional ingredient in many cuisines.',
      descriptionAr: 'كلاوي بقري طازجة بنكهة غنية ومميزة. مكوّن تقليدي في مطابخ كثيرة.',
      categorySlug: 'organ-meats', subcategory: 'kidney',
      images: [IMG.offal], basePrice: 110,
      variants: [
        { weight: '500g', price: 55, stock: 14 },
        { weight: '1kg', price: 110, stock: 9 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['kidney', 'offal', 'traditional'], unit: 'kg',
      cookingTips: ['Soak in salted water to remove strong flavour', 'Remove the central core before cooking', 'Cook quickly over high heat'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-heart', name: 'Beef Heart',
      nameAr: 'قلب بقري',
      description: 'Lean, protein-rich beef heart. Tender when cooked properly with a deep, beefy flavour.',
      descriptionAr: 'قلب بقري قليل الدهون وغني بالبروتين. طري عند طهيه بشكل صحيح بنكهة لحمية عميقة.',
      categorySlug: 'organ-meats', subcategory: 'heart',
      images: [IMG.offal], basePrice: 130,
      variants: [
        { weight: '500g', price: 65, stock: 12 },
        { weight: '1kg', price: 130, stock: 7 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['heart', 'offal', 'grill'], unit: 'kg',
      cookingTips: ['Trim all silver skin and fat', 'Marinate for tenderness', 'Cook to medium-rare and slice thinly'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-tongue', name: 'Beef Tongue',
      nameAr: 'لسان بقري',
      description: 'Fresh beef tongue, a delicacy when slow-cooked. Tender texture and rich, distinctive taste.',
      descriptionAr: 'لسان بقري طازج، طعام شهي عند طهيه ببطء. قوام طري ونكهة مميزة غنية.',
      categorySlug: 'organ-meats', subcategory: 'tongue',
      images: [IMG.offal], basePrice: 140,
      variants: [
        { weight: '1kg', price: 140, stock: 8 },
        { weight: '1.5kg', price: 210, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['tongue', 'offal', 'delicacy'], unit: 'kg',
      cookingTips: ['Boil for 3-4 hours until tender', 'Peel the outer skin while still warm', 'Slice and serve with mustard'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-tripe', name: 'Clean Beef Tripe',
      nameAr: 'كرشة بقري نظيفة',
      description: 'Pre-cleaned beef tripe ready for cooking. Essential for traditional Egyptian kawareh and hawawshi.',
      descriptionAr: 'كرشة بقري منظفة مسبقاً وجاهزة للطبخ. أساسية للكوارع والحواوشي المصري التقليدي.',
      categorySlug: 'organ-meats', subcategory: 'tripe',
      images: [IMG.offal], basePrice: 80,
      variants: [
        { weight: '1kg', price: 80, stock: 12 },
        { weight: '2kg', price: 150, stock: 7 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['tripe', 'offal', 'traditional'], unit: 'kg',
      cookingTips: ['Pre-boil with vinegar and bay leaves', 'Slow-cook for several hours', 'Finish in a tomato and garlic sauce'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-mombar', name: 'Beef Mombar (Stuffed Intestine)',
      nameAr: 'ممبار بقري محشي',
      description: 'Beef mombar ready to cook. Stuffed with rice, herbs, and spices. A traditional Egyptian delicacy.',
      descriptionAr: 'ممبار بقري جاهز للطبخ. محشي بالأرز والأعشاب والبهارات. طعام شهي مصري تقليدي.',
      categorySlug: 'organ-meats', subcategory: 'mombar',
      images: [IMG.offal], basePrice: 150,
      variants: [
        { weight: '500g', price: 75, stock: 10 },
        { weight: '1kg', price: 150, stock: 6 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: false,
      tags: ['mombar', 'offal', 'traditional'], unit: 'kg',
      cookingTips: ['Simmer gently in broth for 45 minutes', 'Pan-fry briefly to crisp the outside', 'Serve with lemon and tahini'],
    }));

    /* ── FROZEN (additional) ────────────── */

    await ctx.db.insert('products', p({
      slug: 'frozen-kofta', name: 'Frozen Kofta Mix',
      nameAr: 'كفتة مجمدة مشكلة',
      description: 'Pre-seasoned frozen kofta mix. Convenient for quick family meals — just thaw and grill.',
      descriptionAr: 'كفتة مشكلة متبلة ومجمدة. مريحة لوجبات عائلية سريعة — تذويب وشوي فقط.',
      categorySlug: 'frozen', subcategory: null,
      images: [IMG.frozen], basePrice: 200,
      variants: [
        { weight: '500g', price: 100, stock: 35 },
        { weight: '1kg', price: 200, stock: 28 },
      ],
      isFresh: false, isFrozen: true, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['frozen', 'kofta', 'convenient'], unit: 'kg',
      cookingTips: ['Thaw overnight in the refrigerator', 'Cook directly from frozen if needed', 'Grill or pan-fry 4-5 minutes per side'],
    }));

    await ctx.db.insert('products', p({
      slug: 'frozen-burger-patties', name: 'Frozen Burger Patties',
      nameAr: 'أقراص برجر مجمدة',
      description: 'Premium frozen beef burger patties, ready to cook. 4 patties per pack.',
      descriptionAr: 'أقراص برجر لحم بقري فاخرة مجمدة، جاهزة للطبخ. 4 أقراص في كل علبة.',
      categorySlug: 'frozen', subcategory: null,
      images: [IMG.frozen], basePrice: 240,
      variants: [
        { weight: '4×100g', price: 96, stock: 25 },
        { weight: '8×100g', price: 192, stock: 18 },
      ],
      isFresh: false, isFrozen: true, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['frozen', 'burger', 'convenient'], unit: 'kg',
      cookingTips: ['Cook from frozen for best results', 'Sear 4 minutes per side', 'Top with cheese in the last minute'],
    }));

    await ctx.db.insert('products', p({
      slug: 'frozen-sausages', name: 'Frozen Beef Sausages',
      nameAr: 'نقانق لحم بقري مجمدة',
      description: 'High-quality frozen beef sausages, perfect for quick breakfasts or easy grilling.',
      descriptionAr: 'نقانق لحم بقري مجمدة عالية الجودة، مثالية لإفطار سريع أو شوي سهل.',
      categorySlug: 'frozen', subcategory: null,
      images: [IMG.frozen], basePrice: 160,
      variants: [
        { weight: '500g', price: 80, stock: 30 },
        { weight: '1kg', price: 160, stock: 22 },
      ],
      isFresh: false, isFrozen: true, isAvailable: true,
      isBestSeller: false, isPremiumCut: false, isFeatured: false, isBBQ: true,
      tags: ['frozen', 'sausage', 'breakfast'], unit: 'kg',
      cookingTips: ['Thaw in fridge overnight', 'Pan-fry or grill for 8-10 minutes', 'Pierce the casings for even cooking'],
    }));

    /* ── PREMIUM CUTS (additional) ──────── */

    await ctx.db.insert('products', p({
      slug: 'dry-aged-tomahawk', name: 'Dry-Aged Tomahawk Steak',
      nameAr: 'ستيك توماهوك معتق',
      description: '45-day dry-aged tomahawk steak. Intensely flavoured, buttery tender, and a true centrepiece.',
      descriptionAr: 'ستيك توماهوك معتق 45 يوماً. نكهة مركزة، طري كالزبدة، وقطعة العرض المثالية.',
      categorySlug: 'premium-cuts', subcategory: 'ribeye',
      images: [IMG.meat], basePrice: 1280,
      variants: [
        { weight: '1.2kg', price: 1536, stock: 3 },
        { weight: '1.8kg', price: 2304, stock: 2 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['tomahawk', 'dry-aged', 'premium', 'showstopper'], unit: 'kg',
      cookingTips: ['Bring to room temperature 90 minutes before cooking', 'Sear on all sides for a deep crust', 'Rest 15 minutes before carving'],
    }));

    await ctx.db.insert('products', p({
      slug: 'wagyu-ribeye', name: 'Wagyu Ribeye Steak',
      nameAr: 'ستيك ريب آي واغيو',
      description: 'A4-A5 grade Wagyu ribeye with legendary marbling. 300g of pure umami indulgence.',
      descriptionAr: 'ستيك ريب آي واغيو بدرجة A4-A5 مع توزيع دهني أسطوري. 300 جرام من النكهة الخالصة.',
      categorySlug: 'premium-cuts', subcategory: 'ribeye',
      images: [IMG.meat], basePrice: 1850,
      variants: [
        { weight: '300g', price: 555, stock: 6 },
        { weight: '500g', price: 925, stock: 4 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: false,
      tags: ['wagyu', 'ribeye', 'premium', 'luxury'], unit: 'kg',
      cookingTips: ['Cook simply — salt is all you need', 'Sear quickly on each side', 'Cut into cubes to share'],
    }));

    await ctx.db.insert('products', p({
      slug: 'cote-de-boeuf', name: 'Côte de Boeuf',
      nameAr: 'كوت دي بوف',
      description: 'Premium bone-in ribeye for two. 1kg of dry-aged beef with the bone left in for extra flavour.',
      descriptionAr: 'ريب آي فاخر بالعظم لشخصين. 1 كجم من اللحم المعتق مع العظمة لنكهة إضافية.',
      categorySlug: 'premium-cuts', subcategory: 'ribeye',
      images: [IMG.meat], basePrice: 1050,
      variants: [
        { weight: '1kg', price: 1050, stock: 5 },
        { weight: '1.4kg', price: 1470, stock: 3 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: false, isPremiumCut: true, isFeatured: true, isBBQ: true,
      tags: ['cote-de-boeuf', 'ribeye', 'premium', 'for-two'], unit: 'kg',
      cookingTips: ['Season generously with sea salt', 'Reverse sear at low temperature first', 'Rest 10 minutes before slicing'],
    }));

    await ctx.db.insert('products', p({
      slug: 'beef-filet-mignon', name: 'Beef Filet Mignon',
      nameAr: 'فيليه مينيون بقري',
      description: 'The most tender cut of beef, hand-cut into 200g medallions. Restaurant-quality indulgence.',
      descriptionAr: 'أكثر قطع اللحم البقري طراوة، مقطعة يدوياً إلى ميداليات 200 جرام. جودة المطاعم الفاخرة.',
      categorySlug: 'premium-cuts', subcategory: 'tenderloin',
      images: [IMG.steak], basePrice: 920,
      variants: [
        { weight: '2×200g', price: 368, stock: 10 },
        { weight: '4×200g', price: 736, stock: 6 },
      ],
      isFresh: true, isFrozen: false, isAvailable: true,
      isBestSeller: true, isPremiumCut: true, isFeatured: true, isBBQ: false,
      tags: ['filet-mignon', 'tenderloin', 'premium'], unit: 'kg',
      cookingTips: ['Pat dry and season right before cooking', 'Sear in butter with thyme and garlic', 'Cook to medium-rare for best texture'],
    }));

    return "Database seeded with 56 premium products!";
  }
});
