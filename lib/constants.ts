import { Id } from '../convex/_generated/dataModel';

/* ─────────────────────────────────────────
   SITE CONFIG
───────────────────────────────────────── */
export const SITE_CONFIG = {
  name:        'El Talkhawy',
  nameAr:      'جزارة ومشويات الطلخاوي',
  tagline:     'Premium Local Meat & Grills Since 1993',
  taglineAr:   'أجود اللحوم البلدي والمشويات منذ أكثر من ٣٠ عامًا',
  description: 'With over 30 years of culinary heritage, El Talkhawy offers a curated selection of premium local fresh meats and ready-to-grill cuts in Egypt.',
  descriptionAr: 'بخبرة تمتد لأكثر من ٣٠ عامًا، تقدم جزارة ومشويات الطلخاوي أجود أنواع اللحوم البلدي الطازجة وقطعيات الشوي المتميزة في مصر.',
  phone:       '17407', // Hotline
  email:       'info@eltalkhawy.com',
  address:     'Alexandria, Egypt',
  branches: [
    {
      name: 'First Branch (Bytash 1)',
      nameAr: 'الفرع الأول (البيطاش ١)',
      address: '76 Main Bytash Street, in front of Martyr Mostafa Mahmoud Primary School (featuring Al-Marbouaa)',
      addressAr: '76 شارع البيطاش الرئيسي، أمام مدرسة الشهيد مصطفى محمود الابتدائية (فرع المربوعة)',
    },
    {
      name: 'Second Branch (Bytash 2)',
      nameAr: 'الفرع الثاني (البيطاش ٢)',
      address: 'Main Bytash Street, in front of Banque Misr',
      addressAr: 'شارع البيطاش الرئيسي، أمام بنك مصر',
    },
    {
      name: 'Third Branch (Sidi Beshr)',
      nameAr: 'الفرع الثالث (سيدي بشر)',
      address: '119 Gamal Abdel Nasser Street, next to El-Zarani Car Care (before Mohamed Naguib intersection)',
      addressAr: '119 شارع جمال عبد الناصر، بجوار الزراني لصيانة السيارات (قبل إشارة محمد نجيب)',
    }
  ],
  socials: {
    instagram: 'https://instagram.com/eltalkhawy',
    facebook:  'https://facebook.com/eltalkhawy',
    tiktok:    'https://tiktok.com/@eltalkhawy',
    whatsapp:  'https://wa.me/2017407', // Just placeholder if not provided
  },
  cloudinaryCloud: 'el-talkhawy',
  deliveryMin:  200,   // EGP minimum order for free delivery
  deliveryCost: 50,    // EGP delivery fee
  vatRate:      0.14,  // 14% Egypt VAT
} as const;

/* ─────────────────────────────────────────
   NAVIGATION
───────────────────────────────────────── */
export const NAV_LINKS = [
  { label: 'Home',       labelAr: 'الرئيسية',   href: '/' },
  { label: 'Shop',       labelAr: 'المتجر',      href: '/shop' },
  { label: 'Categories', labelAr: 'التصنيفات',   href: '/categories' },
  { label: 'About',      labelAr: 'عن المتجر',   href: '/about' },
  { label: 'Contact',    labelAr: 'تواصل معنا',  href: '/contact' },
] as const;

/* ─────────────────────────────────────────
   CATEGORIES
───────────────────────────────────────── */
export const CATEGORIES = [
  {
    slug:        'beef',
    name:        'Beef',
    nameAr:      'لحم بقري',
    description: 'Premium cuts of fresh and tender beef, prepared daily.',
    descriptionAr: 'قطع ممتازة من اللحم البقري الطازج والمعتق',
    icon:        '🥩',
    image:       'el-talkhawy/categories/beef-banner',
    subcategories: [
      { slug: 'ribeye',       name: 'Ribeye',      nameAr: 'ريب آي' },
      { slug: 'tenderloin',   name: 'Tenderloin',  nameAr: 'تندرلوين' },
      { slug: 'minced-beef',  name: 'Minced Beef', nameAr: 'لحم بقري مفروم' },
      { slug: 'steak',        name: 'Steak',       nameAr: 'ستيك' },
      { slug: 'liver',        name: 'Liver',       nameAr: 'كبدة بقري' },
      { slug: 'brisket',      name: 'Brisket',     nameAr: 'بريسكت' },
      { slug: 'short-ribs',   name: 'Short Ribs',  nameAr: 'ريش بقري قصيرة' },
    ],
  },
  {
    slug:        'buffalo',
    name:        'Buffalo',
    nameAr:      'لحم جاموس',
    description: 'Fresh local buffalo meat, highly valued for its rich flavor.',
    descriptionAr: 'لحم جاموس طازج، من المفضلات المحلية في مصر',
    icon:        '🐃',
    image:       'el-talkhawy/categories/buffalo-banner',
    subcategories: [],
  },
  {
    slug:        'lamb',
    name:        'Lamb',
    nameAr:      'لحم ضأن',
    description: 'Tender and succulent local lamb, perfect for authentic recipes.',
    descriptionAr: 'تشكيلة من لحم الضأن الطري والشهي',
    icon:        '🐑',
    image:       'el-talkhawy/categories/lamb-banner',
    subcategories: [
      { slug: 'lamb-chops',   name: 'Lamb Chops',   nameAr: 'ريش ضأن' },
      { slug: 'leg',          name: 'Leg',           nameAr: 'فخذة ضأن' },
      { slug: 'shoulder',     name: 'Shoulder',      nameAr: 'كتف ضأن' },
      { slug: 'lamb-ribs',    name: 'Ribs',          nameAr: 'ضلوع ضأن' },
      { slug: 'minced-lamb',  name: 'Minced Lamb',   nameAr: 'لحم ضأن مفروم' },
    ],
  },
  {
    slug:        'goat',
    name:        'Goat',
    nameAr:      'لحم ماعز',
    description: 'Quality local goat meat, lean and flavorful.',
    descriptionAr: 'لحم ماعز بلدي طازج، يتميز بمذاقه الغني وقلة الدهون',
    icon:        '🐐',
    image:       'el-talkhawy/categories/goat-banner',
    subcategories: [],
  },
  {
    slug:        'veal',
    name:        'Veal',
    nameAr:      'لحم عجل',
    description: 'Delicate and premium cuts of fresh local veal.',
    descriptionAr: 'قطعيات طرية وفاخرة من لحم العجل البلدي',
    icon:        '🐄',
    image:       'el-talkhawy/categories/veal-banner',
    subcategories: [],
  },
  {
    slug:        'bbq-cuts',
    name:        'Grill Cuts',
    nameAr:      'قطع وتجهيزات الشوي',
    description: 'Premium ready-to-grill cuts including kofta, ribs, burgers, and special blends.',
    descriptionAr: 'قطع ممتازة محضرة للشوي: كفتة، ريبس، برجر، وخلطات الشوي',
    icon:        '🥩',
    image:       'el-talkhawy/categories/bbq-banner',
    subcategories: [],
  },
  {
    slug:        'premium-cuts',
    name:        'Premium Cuts',
    nameAr:      'قطع فاخرة',
    description: 'Specially selected premium cuts for gourmet cooking and occasions.',
    descriptionAr: 'أفخر قطعيات اللحوم المنتقاة بعناية للمناسبات والطهي المتميز',
    icon:        '⭐',
    image:       'el-talkhawy/categories/premium-cuts-banner',
    subcategories: [],
  },
  {
    slug:        'organ-meats',
    name:        'Organ Meats',
    nameAr:      'أحشاء ومشتقات',
    description: 'Fresh selection of traditional offal cuts, prepared daily.',
    descriptionAr: 'تشكيلة من الأحشاء والمنتجات الشعبية',
    icon:        '🫀',
    image:       'el-talkhawy/categories/organ-banner',
    subcategories: [
      { slug: 'liver',    name: 'Liver',   nameAr: 'كبدة بلدي' },
      { slug: 'brain',    name: 'Brain',   nameAr: 'مخ بلدي' },
      { slug: 'trotters', name: 'Trotters',nameAr: 'كوارع بلدي' },
      { slug: 'kidney',   name: 'Kidney',  nameAr: 'كلاوي' },
      { slug: 'heart',    name: 'Heart',   nameAr: 'قلب' },
      { slug: 'tongue',   name: 'Tongue',  nameAr: 'لسان' },
      { slug: 'tripe',    name: 'Tripe',   nameAr: 'كرشة' },
      { slug: 'mombar',   name: 'Mombar',  nameAr: 'ممبار' },
    ],
  },
  {
    slug:        'frozen',
    name:        'Frozen Products',
    nameAr:      'منتجات مجمدة',
    description: 'High-quality frozen meat selections, packed under strict safety standards.',
    descriptionAr: 'تشكيلة من اللحوم والمنتجات المجمدة بجودة عالية ومعايير سلامة دقيقة',
    icon:        '❄️',
    image:       'el-talkhawy/categories/frozen-banner',
    subcategories: [],
  },

  {
    slug:        'offers',
    name:        'Offers',
    nameAr:      'العروض',
    description: 'Exclusive bundles and promotions for the best value.',
    descriptionAr: 'أفضل العروض والخصومات على تشكيلاتنا المتنوعة',
    icon:        '🏷️',
    image:       'el-talkhawy/categories/offers-banner',
    subcategories: [],
  },
] as const;

/* ─────────────────────────────────────────
   WEIGHT OPTIONS (shared defaults)
───────────────────────────────────────── */
export const WEIGHT_OPTIONS = [
  '250g',
  '500g',
  '1kg',
  '1.5kg',
  '2kg',
] as const;

/* ─────────────────────────────────────────
   ORDER STATUS LABELS
───────────────────────────────────────── */
export const ORDER_STATUS = {
  pending:    { label: 'Pending',    labelAr: 'قيد الانتظار', color: 'warning' },
  confirmed:  { label: 'Confirmed',  labelAr: 'مؤكد',         color: 'success' },
  processing: { label: 'Processing', labelAr: 'جاري التجهيز', color: 'frozen'  },
  shipped:    { label: 'Shipped',    labelAr: 'تم الشحن',     color: 'fresh'   },
  delivered:  { label: 'Delivered',  labelAr: 'تم التسليم',   color: 'success' },
  cancelled:  { label: 'Cancelled',  labelAr: 'ملغى',         color: 'error'   },
} as const;

/* ─────────────────────────────────────────
   SORT OPTIONS
───────────────────────────────────────── */
export const SORT_OPTIONS = [
  { value: 'featured',      label: 'Featured',        labelAr: 'مميزة' },
  { value: 'newest',        label: 'Newest',          labelAr: 'الأحدث' },
  { value: 'price-asc',     label: 'Price: Low–High', labelAr: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc',    label: 'Price: High–Low', labelAr: 'السعر: من الأعلى إلى الأقل' },
  { value: 'rating',        label: 'Top Rated',       labelAr: 'الأعلى تقييماً' },
  { value: 'bestsellers',   label: 'Best Sellers',    labelAr: 'الأكثر مبيعاً' },
] as const;

/* ─────────────────────────────────────────
   TRUST FEATURES (Why Choose Us)
───────────────────────────────────────── */
export const TRUST_FEATURES = [
  {
    icon:        'Truck',
    title:       'Fast Local Delivery',
    titleAr:     'توصيل سريع داخل منطقتك',
    description: 'Reliable and temperature-controlled delivery to keep your order fresh.',
    descriptionAr: 'توصيل موثوق مع عناية كاملة للحفاظ على طلبك طازجًا',
  },
  {
    icon:        'Shield',
    title:       'Freshly Prepared Daily',
    titleAr:     'تجهيز يومي طازج',
    description: 'All meat cuts are prepared daily under clean and strict hygiene standards.',
    descriptionAr: 'يتم تجهيز اللحوم يوميًا بعناية لضمان الجودة والطزاجة',
  },
  {
    icon:        'Award',
    title:       'Trusted Quality',
    titleAr:     'جودة موثوقة',
    description: 'Carefully selected products to ensure the quality and taste our customers expect.',
    descriptionAr: 'نختار منتجاتنا بعناية لنقدم الجودة والطعم الذي يتوقعه عملاؤنا',
  },
  {
    icon:        'RotateCcw',
    title:       'Helpful Customer Service',
    titleAr:     'خدمة عملاء سريعة',
    description: 'Our dedicated team is ready to assist you with orders, inquiries, and custom cuts.',
    descriptionAr: 'فريقنا جاهز لمساعدتك في الطلبات والاستفسارات واختيار المنتج المناسب',
  },
] as const;

