export const SITE_CONFIG = {
  name: 'El Talkhawy',
  nameAr: 'جزارة ومشويات الطلخاوي',
  tagline: 'Fresh Local Meat & Grill Cuts Since 1993',
  taglineAr: 'لحوم بلدي طازجة وقطعيات شوي منذ 1993',
  description:
    'El Talkhawy offers fresh local meat, grill cuts, and butcher-prepared selections with trusted quality and fast service in Alexandria.',
  descriptionAr:
    'تقدم جزارة ومشويات الطلخاوي لحومًا بلدية طازجة وقطعيات شوي وتجهيزات مختارة بعناية، بجودة موثوقة وخدمة سريعة في الإسكندرية.',
  phone: '17407',
  email: 'info@eltalkhawy.com',
  address: 'Alexandria, Egypt',
  branches: [
    {
      name: 'Bytash Branch 1',
      nameAr: 'فرع البيطاش ١',
      address: '76 Main Bytash St., opposite Mostafa Mahmoud Primary School',
      addressAr: '76 شارع البيطاش الرئيسي، أمام مدرسة الشهيد مصطفى محمود الابتدائية',
    },
    {
      name: 'Bytash Branch 2',
      nameAr: 'فرع البيطاش ٢',
      address: 'Main Bytash St., opposite Banque Misr',
      addressAr: 'شارع البيطاش الرئيسي، أمام بنك مصر',
    },
    {
      name: 'Sidi Beshr Branch',
      nameAr: 'فرع سيدي بشر',
      address: '119 Gamal Abdel Nasser St., next to El-Zarani Car Care',
      addressAr: '119 شارع جمال عبد الناصر، بجوار الزراني لصيانة السيارات',
    },
  ],
  socials: {
    instagram: 'https://instagram.com/eltalkhawy',
    facebook: 'https://facebook.com/eltalkhawy',
    tiktok: 'https://tiktok.com/@eltalkhawy',
    whatsapp: 'https://wa.me/2017407',
  },
  cloudinaryCloud: 'el-talkhawy',
  deliveryMin: 2000,
  deliveryCost: 50,
  vatRate: 0.14,
} as const;

export const NAV_LINKS = [
  { label: 'Home', labelAr: 'الرئيسية', href: '/' },
  { label: 'Categories', labelAr: 'التصنيفات', href: '/categories' },
  { label: 'About Us', labelAr: 'من نحن', href: '/about' },
  { label: 'Contact', labelAr: 'تواصل معنا', href: '/contact' },
] as const;

export const CATEGORIES = [
  {
    slug: 'beef',
    name: 'Beef',
    nameAr: 'لحم بقري',
    description: 'Fresh beef cuts prepared daily.',
    descriptionAr: 'قطعيات لحم بقري طازجة يتم تجهيزها يوميًا.',
    icon: '🥩',
    image: 'el-talkhawy/categories/beef-banner',
    subcategories: [
      { slug: 'ribeye', name: 'Ribeye', nameAr: 'ريب آي' },
      { slug: 'tenderloin', name: 'Tenderloin', nameAr: 'تندرلوين' },
      { slug: 'minced-beef', name: 'Minced Beef', nameAr: 'لحم بقري مفروم' },
      { slug: 'steak', name: 'Beef Steak', nameAr: 'ستيك بقري' },
      { slug: 'liver', name: 'Beef Liver', nameAr: 'كبدة بقري' },
      { slug: 'brisket', name: 'Brisket', nameAr: 'بريسكت بقري' },
      { slug: 'short-ribs', name: 'Short Ribs', nameAr: 'شورت ريبس بقري' },
    ],
  },
  {
    slug: 'buffalo',
    name: 'Buffalo',
    nameAr: 'لحم جاموسي',
    description: 'Fresh buffalo meat with a rich local taste.',
    descriptionAr: 'لحم جاموسي طازج بطعم بلدي غني.',
    icon: '🐃',
    image: 'el-talkhawy/categories/buffalo-banner',
    subcategories: [],
  },
  {
    slug: 'lamb',
    name: 'Lamb',
    nameAr: 'لحم ضاني',
    description: 'Fresh lamb cuts for everyday cooking and special meals.',
    descriptionAr: 'قطعيات لحم ضاني طازجة للطبخ اليومي والعزومات.',
    icon: '🐑',
    image: 'el-talkhawy/categories/lamb-banner',
    subcategories: [
      { slug: 'lamb-chops', name: 'Lamb Chops', nameAr: 'ريش ضاني' },
      { slug: 'leg', name: 'Leg of Lamb', nameAr: 'فخذة ضاني' },
      { slug: 'shoulder', name: 'Lamb Shoulder', nameAr: 'كتف ضاني' },
      { slug: 'lamb-ribs', name: 'Lamb Ribs', nameAr: 'ضلوع ضاني' },
      { slug: 'minced-lamb', name: 'Minced Lamb', nameAr: 'لحم ضاني مفروم' },
    ],
  },
  {
    slug: 'goat',
    name: 'Goat',
    nameAr: 'لحم ماعز',
    description: 'Lean local goat meat with a distinctive flavour.',
    descriptionAr: 'لحم ماعز بلدي قليل الدهن بطعم مميز.',
    icon: '🐐',
    image: 'el-talkhawy/categories/goat-banner',
    subcategories: [],
  },
  {
    slug: 'veal',
    name: 'Veal',
    nameAr: 'لحم عجل',
    description: 'Tender veal cuts for a softer, lighter taste.',
    descriptionAr: 'قطعيات لحم عجل طرية بطعم خفيف.',
    icon: '🐄',
    image: 'el-talkhawy/categories/veal-banner',
    subcategories: [],
  },
  {
    slug: 'bbq-cuts',
    name: 'Grill Cuts',
    nameAr: 'قطعيات الشوي',
    description: 'Ready-to-grill cuts including kofta, burgers, ribs, and more.',
    descriptionAr: 'قطعيات جاهزة للشوي مثل الكفتة والبرجر والريش وغيرها.',
    icon: '🔥',
    image: 'el-talkhawy/categories/bbq-banner',
    subcategories: [],
  },
  {
    slug: 'premium-cuts',
    name: 'Premium Cuts',
    nameAr: 'قطعيات مميزة',
    description: 'Selected cuts for special meals and premium cooking.',
    descriptionAr: 'قطعيات مختارة للوجبات المميزة والطهي الخاص.',
    icon: '⭐',
    image: 'el-talkhawy/categories/premium-cuts-banner',
    subcategories: [],
  },
  {
    slug: 'organ-meats',
    name: 'Offal & Organ Meats',
    nameAr: 'أحشاء ومشتقات',
    description: 'Fresh traditional organ meats prepared daily.',
    descriptionAr: 'أحشاء ومشتقات طازجة يتم تجهيزها يوميًا.',
    icon: '🫀',
    image: 'el-talkhawy/categories/organ-banner',
    subcategories: [
      { slug: 'liver', name: 'Liver', nameAr: 'كبدة' },
      { slug: 'brain', name: 'Brain', nameAr: 'مخ' },
      { slug: 'trotters', name: 'Trotters', nameAr: 'كوارع' },
      { slug: 'kidney', name: 'Kidney', nameAr: 'كلاوي' },
      { slug: 'heart', name: 'Heart', nameAr: 'قلب' },
      { slug: 'tongue', name: 'Tongue', nameAr: 'لسان' },
      { slug: 'tripe', name: 'Tripe', nameAr: 'كرشة' },
      { slug: 'mombar', name: 'Mombar', nameAr: 'ممبار' },
    ],
  },
  {
    slug: 'frozen',
    name: 'Frozen Products',
    nameAr: 'منتجات مجمدة',
    description: 'Frozen selections packed for quality and convenience.',
    descriptionAr: 'منتجات مجمدة بجودة عالية وسهولة في الاستخدام.',
    icon: '❄️',
    image: 'el-talkhawy/categories/frozen-banner',
    subcategories: [],
  },
  {
    slug: 'offers',
    name: 'Offers',
    nameAr: 'العروض',
    description: 'Bundles and special deals for better value.',
    descriptionAr: 'عروض وباكدجات خاصة بأفضل قيمة.',
    icon: '🏷️',
    image: 'el-talkhawy/categories/offers-banner',
    subcategories: [],
  },
] as const;

export const WEIGHT_OPTIONS = ['250g', '500g', '1kg', '1.5kg', '2kg'] as const;

export const ORDER_STATUS = {
  pending: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'warning' },
  confirmed: { label: 'Confirmed', labelAr: 'تم التأكيد', color: 'success' },
  processing: { label: 'Preparing', labelAr: 'جاري التجهيز', color: 'frozen' },
  shipped: { label: 'Out for Delivery', labelAr: 'خرج للتوصيل', color: 'fresh' },
  delivered: { label: 'Delivered', labelAr: 'تم التسليم', color: 'success' },
  cancelled: { label: 'Cancelled', labelAr: 'تم الإلغاء', color: 'error' },
} as const;

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured', labelAr: 'مميزة', descKey: 'featured', icon: 'Sparkles' },
  { value: 'newest', label: 'Newest', labelAr: 'الأحدث', descKey: 'newest', icon: 'Clock' },
  { value: 'price-asc', label: 'Price: Low to High', labelAr: 'السعر: الأقل أولًا', descKey: 'priceAsc', icon: 'ArrowUpNarrowWide' },
  { value: 'price-desc', label: 'Price: High to Low', labelAr: 'السعر: الأعلى أولًا', descKey: 'priceDesc', icon: 'ArrowDownNarrowWide' },
  { value: 'rating', label: 'Top Rated', labelAr: 'الأعلى تقييمًا', descKey: 'rating', icon: 'Star' },
  { value: 'bestsellers', label: 'Best Sellers', labelAr: 'الأكثر مبيعًا', descKey: 'bestsellers', icon: 'Flame' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const CATEGORY_IMAGES: Record<string, string> = {
  beef: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f',
  buffalo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd',
  lamb: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617',
  goat: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98',
  veal: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64',
  'bbq-cuts': 'https://images.unsplash.com/photo-1544025162-d76694265947',
  'premium-cuts': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6',
  'organ-meats': 'https://images.unsplash.com/photo-1529042410759-befb1204b468',
  frozen: 'https://images.unsplash.com/photo-1572441713132-51c75654db73',
  offers: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b',
};

export function withImageSize(
  src: string,
  opts: { width?: number; quality?: number } = {},
): string {
  if (!src) return src;
  if (src.includes('res.cloudinary.com')) return src;
  const w = opts.width ?? 1200;
  const q = opts.quality ?? 80;
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}w=${w}&q=${q}`;
}

export const TRUST_FEATURES = [
  {
    icon: 'Truck',
    title: 'Fast Delivery',
    titleAr: 'توصيل سريع',
    description: 'Quick local delivery that helps keep your order fresh.',
    descriptionAr: 'توصيل سريع داخل منطقتك مع الحفاظ على جودة الطلب.',
  },
  {
    icon: 'Shield',
    title: 'Fresh Daily Preparation',
    titleAr: 'تجهيز طازج يوميًا',
    description: 'Our cuts are prepared daily with care and hygiene.',
    descriptionAr: 'يتم تجهيز الطلبات يوميًا بعناية واهتمام بالنظافة والجودة.',
  },
  {
    icon: 'Award',
    title: 'Trusted Quality',
    titleAr: 'جودة موثوقة',
    description: 'We select our products carefully to maintain consistent quality.',
    descriptionAr: 'نختار منتجاتنا بعناية لنحافظ على مستوى ثابت من الجودة.',
  },
  {
    icon: 'RotateCcw',
    title: 'Helpful Support',
    titleAr: 'خدمة عملاء سريعة',
    description: 'Our team is ready to help with orders, questions, and special requests.',
    descriptionAr: 'فريقنا جاهز لمساعدتك في الطلبات والاستفسارات والطلبات الخاصة.',
  },
] as const;

export const STARTERS = [
  { id: 'soup-trotters', name: 'Trotters Soup', nameAr: 'شوربة كوارع', price: 45 },
  { id: 'soup-orzo', name: 'Orzo Soup', nameAr: 'شوربة لسان عصفور', price: 30 },
  { id: 'salad-green', name: 'Green Salad', nameAr: 'سلطة خضراء', price: 15 },
  { id: 'salad-tahini', name: 'Tahini Salad', nameAr: 'سلطة طحينة', price: 15 },
] as const;