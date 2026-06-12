import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  /* ──────────────────────────────────────
     USERS
     Synced from Clerk via webhook
  ────────────────────────────────────── */
  users: defineTable({
    clerkId:   v.string(),
    email:     v.string(),
    name:      v.union(v.string(), v.null()),
    imageUrl:  v.union(v.string(), v.null()),
    role:      v.union(v.literal('customer'), v.literal('admin')),
  })
    .index('by_clerkId', ['clerkId']),

  /* ──────────────────────────────────────
     CATEGORIES
  ────────────────────────────────────── */
  categories: defineTable({
    slug:        v.string(),
    name:        v.string(),
    nameAr:      v.string(),
    description: v.string(),
    bannerImage: v.string(),   // Cloudinary public ID
    icon:        v.string(),
    order:       v.number(),
    isActive:    v.boolean(),
  })
    .index('by_slug',  ['slug'])
    .index('by_order', ['order']),

  /* ──────────────────────────────────────
     PRODUCTS
  ────────────────────────────────────── */
  products: defineTable({
    slug:          v.string(),
    name:          v.string(),
    nameAr:        v.string(),
    description:   v.string(),
    descriptionAr: v.string(),
    categorySlug:  v.string(),
    subcategory:   v.union(v.string(), v.null()),
    images:        v.array(v.string()),  // Cloudinary public IDs
    basePrice:     v.number(),           // in EGP
    variants: v.array(v.object({
      weight: v.string(),
      price:  v.number(),
      stock:  v.number(),
    })),
    isFresh:      v.boolean(),
    isFrozen:     v.boolean(),
    discount:     v.union(v.number(), v.null()), // percentage 0-100
    rating:       v.number(),
    reviewCount:  v.number(),
    isAvailable:  v.boolean(),
    isBestSeller: v.boolean(),
    isPremiumCut: v.boolean(),
    isFeatured:   v.boolean(),
    isBBQ:        v.boolean(),
    nutritionInfo: v.union(
      v.object({
        calories:     v.number(),
        protein:      v.number(),
        fat:          v.number(),
        saturatedFat: v.number(),
        sodium:       v.number(),
        per:          v.string(),
      }),
      v.null(),
    ),
    storageInfo: v.union(v.string(), v.null()),
    cookingTips: v.array(v.string()),
    tags:        v.array(v.string()),
    weight:      v.union(v.string(), v.null()), // default display weight
    unit:        v.string(),  // 'g', 'kg'
  })
    .index('by_slug',         ['slug'])
    .index('by_category',     ['categorySlug'])
    .index('by_bestseller',   ['isBestSeller'])
    .index('by_featured',     ['isFeatured'])
    .index('by_premium',      ['isPremiumCut'])
    .index('by_bbq',          ['isBBQ'])
    .index('by_available',    ['isAvailable']),

  /* ──────────────────────────────────────
     CART
     One cart per user (upsert pattern)
  ────────────────────────────────────── */
  cart: defineTable({
    userId: v.string(),  // Clerk userId
    items: v.array(v.object({
      productId:     v.id('products'),
      variantWeight: v.string(),
      quantity:      v.number(),
      price:         v.number(),  // snapshot at add time
      isGrilled:     v.optional(v.boolean()),
      grillComment:  v.optional(v.string()),
      starterName:   v.optional(v.string()),
      starterPrice:  v.optional(v.number()),
    })),
  })
    .index('by_userId', ['userId']),

  /* ──────────────────────────────────────
     WISHLIST
     One wishlist per user
  ────────────────────────────────────── */
  wishlist: defineTable({
    userId:     v.string(),
    productIds: v.array(v.id('products')),
  })
    .index('by_userId', ['userId']),

  /* ──────────────────────────────────────
     ORDERS
  ────────────────────────────────────── */
  orders: defineTable({
    userId:       v.union(v.string(), v.null()),  // null for guest
    guestEmail:   v.union(v.string(), v.null()),
    orderNumber:  v.string(),  // e.g. "ORD-2024-00142"
    items: v.array(v.object({
      productId:     v.id('products'),
      productSlug:   v.optional(v.string()),  // snapshot — for direct product links
      productName:   v.string(),       // snapshot
      variantWeight: v.string(),
      quantity:      v.number(),
      unitPrice:     v.number(),
      totalPrice:    v.number(),
      isGrilled:     v.optional(v.boolean()),
      grillComment:  v.optional(v.string()),
      starterName:   v.optional(v.string()),
      starterPrice:  v.optional(v.number()),
    })),
    status: v.union(
      v.literal('pending'),
      v.literal('confirmed'),
      v.literal('processing'),
      v.literal('shipped'),
      v.literal('delivered'),
      v.literal('cancelled'),
    ),
    deliveryAddress: v.object({
      fullName:  v.string(),
      phone:     v.string(),
      address:   v.string(),
      area:      v.string(),
      city:      v.string(),
      notes:     v.union(v.string(), v.null()),
    }),
    subtotal:      v.number(),
    deliveryCost:  v.number(),
    discount:      v.number(),
    promoDiscount: v.number(),
    total:         v.number(),
    promoCode:     v.union(v.string(), v.null()),
    paymentMethod: v.union(
      v.literal('cash'),
      v.literal('card'),
      v.literal('wallet'),
    ),
    notes: v.union(v.string(), v.null()),
    statusHistory: v.optional(v.array(v.object({
      status: v.union(
        v.literal('pending'),
        v.literal('confirmed'),
        v.literal('processing'),
        v.literal('shipped'),
        v.literal('delivered'),
        v.literal('cancelled'),
      ),
      at: v.number(),
    }))),
  })
    .index('by_userId',      ['userId'])
    .index('by_orderNumber', ['orderNumber']),

  /* ──────────────────────────────────────
     REVIEWS
  ────────────────────────────────────── */
  reviews: defineTable({
    productId:  v.id('products'),
    userId:     v.string(),
    userName:   v.string(),
    userImage:  v.union(v.string(), v.null()),
    rating:     v.number(),
    comment:    v.string(),
    verified:   v.boolean(),  // verified purchase
  })
    .index('by_productId',       ['productId'])
    .index('by_userId',          ['userId'])
    .index('by_product_rating',  ['productId', 'rating']),

  /* ──────────────────────────────────────
     PROMO CODES
  ────────────────────────────────────── */
  promoCodes: defineTable({
    code:           v.string(),
    discountType:   v.union(v.literal('percentage'), v.literal('fixed')),
    discountValue:  v.number(),
    minOrder:       v.union(v.number(), v.null()),
    maxUses:        v.union(v.number(), v.null()),
    currentUses:    v.number(),
    expiresAt:      v.union(v.number(), v.null()),
    isActive:       v.boolean(),
  })
    .index('by_code', ['code']),

  /* ──────────────────────────────────────
     MEDIA (Convex file storage)
     Owner-uploaded images (product photos,
     banners, etc.) — referenced by storageId
  ────────────────────────────────────── */
  media: defineTable({
    storageId: v.id('_storage'),         // Convex file storage ID
    filename:  v.string(),               // original filename
    mimeType:  v.string(),               // image/png, image/jpeg, image/webp
    size:      v.number(),               // bytes
    altText:   v.union(v.string(), v.null()),
    folder:    v.union(v.literal('products'), v.literal('banners'), v.literal('categories'), v.literal('general')),
    uploadedBy: v.union(v.id('users'), v.null()),
  })
    .index('by_folder', ['folder']),

  /* ──────────────────────────────────────
     SETTINGS (singleton — _id: 'site')
   ────────────────────────────────────── */
  settings: defineTable({
    key:   v.string(),
    value: v.string(),
  })
    .index('by_key', ['key']),

  /* ──────────────────────────────────────
     NEWSLETTER SUBSCRIBERS
   ────────────────────────────────────── */
  newsletterSubscribers: defineTable({
    email:       v.string(),
    locale:      v.union(v.literal('en'), v.literal('ar')),
    subscribedAt: v.number(),
    isActive:    v.boolean(),
  })
    .index('by_email', ['email']),

  /* ──────────────────────────────────────
     CONTACT MESSAGES
   ────────────────────────────────────── */
  contactMessages: defineTable({
    name:      v.string(),
    email:     v.string(),
    message:   v.string(),
    locale:    v.union(v.literal('en'), v.literal('ar')),
    createdAt: v.number(),
    isRead:    v.boolean(),
  })
    .index('by_created', ['createdAt']),

});
