import { Id } from '../convex/_generated/dataModel';
import { ProductCard } from './product';

/* ─────────────────────────────────────────
   CART TYPES
───────────────────────────────────────── */
export type CartItem = {
  productId:     Id<'products'>;
  variantWeight: string;
  quantity:      number;
  price:         number;         // price at time of add
  product:       ProductCard;    // denormalized for display
};

export type Cart = {
  _id:    Id<'cart'>;
  userId: string;
  items:  CartItem[];
};

export type CartSummary = {
  subtotal:      number;
  deliveryCost:  number;
  discount:      number;
  promoDiscount: number;
  total:         number;
  itemCount:     number;
  isFreeDelivery:boolean;
};

/* ─────────────────────────────────────────
   WISHLIST TYPES
───────────────────────────────────────── */
export type Wishlist = {
  _id:        Id<'wishlist'>;
  userId:     string;
  productIds: Id<'products'>[];
};
