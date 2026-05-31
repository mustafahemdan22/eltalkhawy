import { mutation } from "./_generated/server";

const IMG = {
  ribeye:    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  lamb:      'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80',
  cuts:      'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
  minced:    'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80',
  meat:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  kofta:     'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
  burgers:   'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80',
  goat:      'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600&q=80',
  offal:     'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80',
  frozen:    'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&q=80',
  butcher:   'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
};

function p(data: any) {
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
      images: [IMG.cuts], basePrice: 1500,
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
      images: [IMG.ribeye], basePrice: 420,
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
      images: [IMG.meat], basePrice: 320,
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
      images: [IMG.meat], basePrice: 520,
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

    return "Database seeded with 23 premium products!";
  }
});
