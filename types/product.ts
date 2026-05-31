import { Id } from '../convex/_generated/dataModel';

/* ─────────────────────────────────────────
   PRODUCT TYPES
───────────────────────────────────────── */
export type WeightOption = {
  weight: string;   // e.g. "500g"
  price: number;
  stock: number;
};

export type NutritionInfo = {
  calories:    number;
  protein:     number;
  fat:         number;
  saturatedFat:number;
  sodium:      number;
  per:         string;  // e.g. "per 100g"
};

export type ProductVariant = {
  weight: string;
  price:  number;
  stock:  number;
};

export type Product = {
  _id:           Id<'products'>;
  _creationTime: number;
  slug:          string;
  name:          string;
  nameAr:        string;
  description:   string;
  descriptionAr: string;
  categorySlug:  string;
  subcategory:   string | null;
  images:        string[];          // Cloudinary public IDs
  basePrice:     number;
  variants:      ProductVariant[];
  isFresh:       boolean;
  isFrozen:      boolean;
  discount:      number | null;     // percentage
  rating:        number;            // 0–5
  reviewCount:   number;
  isAvailable:   boolean;
  isBestSeller:  boolean;
  isPremiumCut:  boolean;
  isFeatured:    boolean;
  nutritionInfo: NutritionInfo | null;
  storageInfo:   string | null;
  cookingTips:   string[];
  tags:          string[];
};

export type ProductCard = Pick<
  Product,
  | '_id'
  | 'slug'
  | 'name'
  | 'nameAr'
  | 'images'
  | 'basePrice'
  | 'variants'
  | 'isFresh'
  | 'isFrozen'
  | 'discount'
  | 'rating'
  | 'reviewCount'
  | 'isAvailable'
  | 'isBestSeller'
  | 'isPremiumCut'
>;

/* ─────────────────────────────────────────
   CATEGORY TYPES
───────────────────────────────────────── */
export type Category = {
  _id:         Id<'categories'>;
  slug:        string;
  name:        string;
  nameAr:      string;
  description: string;
  bannerImage: string;   // Cloudinary public ID
  icon:        string;
  order:       number;
  productCount?: number;
};

/* ─────────────────────────────────────────
   FILTER TYPES
───────────────────────────────────────── */
export type ProductFilters = {
  category?:    string;
  subcategory?: string;
  isFresh?:     boolean;
  isFrozen?:    boolean;
  minPrice?:    number;
  maxPrice?:    number;
  minRating?:   number;
  inStock?:     boolean;
  tags?:        string[];
};

export type SortOption =
  | 'featured'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'bestsellers';

/* ─────────────────────────────────────────
   REVIEW TYPES
───────────────────────────────────────── */
export type Review = {
  _id:           Id<'reviews'>;
  _creationTime: number;
  productId:     Id<'products'>;
  userId:        string;
  userName:      string;
  userImage:     string | null;
  rating:        number;
  comment:       string;
  verified:      boolean;
};
