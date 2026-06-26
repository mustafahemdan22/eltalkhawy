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
  deliveryMin: 2000,
  deliveryCost: 50,
  vatRate: 0.14,
} as const;

export const NAV_LINKS = [
  { label: 'Home', labelAr: 'الرئيسية', href: '/' },
  { label: 'Categories', labelAr: 'التصنيفات', href: '/categories' },
  { label: 'About Us', labelAr: 'من نحن', href: '/about' },
  { label: 'Contact', labelAr: 'تواصل معنا', href: '/contact' },
  { label: 'Orders', labelAr: 'طلباتي', href: '/orders' },

] as const;

export const CATEGORIES = [
  {
    slug: 'beef',
    name: 'Beef',
    nameAr: 'لحم بقري',
    description: 'Fresh beef cuts prepared daily.',
    descriptionAr: 'قطعيات لحم بقري طازجة يتم تجهيزها يوميًا.',
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

    subcategories: [],
  },
  {
    slug: 'lamb',
    name: 'Lamb',
    nameAr: 'لحم ضاني',
    description: 'Fresh lamb cuts for everyday cooking and special meals.',
    descriptionAr: 'قطعيات لحم ضاني طازجة للطبخ اليومي والعزومات.',

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

    subcategories: [],
  },
  {
    slug: 'veal',
    name: 'Veal',
    nameAr: 'لحم عجل',
    description: 'Tender veal cuts for a softer, lighter taste.',
    descriptionAr: 'قطعيات لحم عجل طرية بطعم خفيف.',
    subcategories: [],
  },
  {
    slug: 'bbq-cuts',
    name: 'Grill Cuts',
    nameAr: 'قطعيات الشوي',
    description: 'Ready-to-grill cuts including kofta, burgers, ribs, and more.',
    descriptionAr: 'قطعيات جاهزة للشوي مثل الكفتة والبرجر والريش وغيرها.',
    subcategories: [],
  },
  {
    slug: 'premium-cuts',
    name: 'Premium Cuts',
    nameAr: 'قطعيات مميزة',
    description: 'Selected cuts for special meals and premium cooking.',

    descriptionAr: 'قطعيات مختارة للوجبات المميزة والطهي الخاص.',

    subcategories: [],
  },
  {
    slug: 'organ-meats',
    name: 'Offal & Organ Meats',
    nameAr: 'أحشاء ومشتقات',
    description: 'Fresh traditional organ meats prepared daily.',
    descriptionAr: 'أحشاء ومشتقات طازجة يتم تجهيزها يوميًا.',

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
    subcategories: [],
  },
  {
    slug: 'offers',
    name: 'Offers',
    nameAr: 'العروض',
    description: 'Bundles and special deals for better value.',
    descriptionAr: 'عروض وباكدجات خاصة بأفضل قيمة.',
    subcategories: [],
  },
] as const;

export const WEIGHT_OPTIONS = [ '500g', '1kg', '1.5kg', '2kg'] as const;

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
  beef: 'eltalkhawy/categories/beef/banner',
  buffalo: 'eltalkhawy/categories/buffalo/banner',
  lamb: 'eltalkhawy/categories/lamb/banner',
  goat: 'eltalkhawy/categories/goat/banner',
  veal: 'eltalkhawy/categories/veal/banner',
  'bbq-cuts': 'eltalkhawy/categories/bbq-cuts/banner',
  'premium-cuts': 'eltalkhawy/categories/premium-cuts/banner',
  'organ-meats': 'eltalkhawy/categories/organ-meats/banner',
  frozen: 'eltalkhawy/categories/frozen/banner',
  offers: 'eltalkhawy/categories/offers/banner',
};

export function withImageSize(
  publicId: string,
  opts: { width?: number; height?: number; quality?: number | 'auto'; crop?: 'fill' | 'fit' | 'scale' } = {},
): string {
  if (!publicId) return '';
  if (publicId.startsWith('http')) return publicId;

  const { width, height, quality = 'auto', crop = 'fill' } = opts;
  const transformations: string[] = [];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push(`c_${crop}`);
  transformations.push(`g_auto`);
  transformations.push(`f_auto`);

  const transformStr = transformations.join(',');
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dfq1xxerr'}/image/upload/${transformStr}/${publicId}`;
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