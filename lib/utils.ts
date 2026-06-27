import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCloudinaryUrl, CLOUDINARY_PRESETS } from './cloudinary';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format price in EGP */
export function formatPrice(
  price: number,
  locale: 'en' | 'ar' = 'en',
  currency = 'EGP',
) {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/** Calculate discount price */
export function discountedPrice(price: number, discountPercent: number) {
  return price - (price * discountPercent) / 100;
}

/**
 * Apply a product-level discount percent to a single variant price.
 * Returns the variant price when there is no discount.
 * Accepts a generic variant shape so the helper works with both
 * `ProductVariant` and any future derived type.
 */
export function discountedVariantPrice<P, V extends { price: number }>(
  product: P & { discount?: number | null },
  variant: V,
): number {
  const discount = product.discount ?? 0;
  if (!discount) return variant.price;
  return discountedPrice(variant.price, discount);
}

/** Truncate text */
export function truncate(text: string, length: number) {
  return text.length > length ? text.slice(0, length) + '…' : text;
}

/** Slugify a string */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Generate Cloudinary image URL with transformations */
export function cloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
    preset?: keyof typeof CLOUDINARY_PRESETS;
  } = {},
): string {
  if (!publicId) return '';
  if (publicId.startsWith('http')) return publicId;

  const { preset, ...transformOptions } = options;

  if (preset && CLOUDINARY_PRESETS[preset]) {
    return getCloudinaryUrl(publicId, { ...CLOUDINARY_PRESETS[preset], ...transformOptions });
  }

  return getCloudinaryUrl(publicId, transformOptions);
}



/** Format a date */
export function formatDate(date: string | number, locale: 'en' | 'ar' = 'en') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/** Get stars array for rating */
export function getStars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => {
    if (i + 1 <= rating) return 'full';
    if (i + 0.5 <= rating) return 'half';
    return 'empty';
  });
}

/** Clamp a number between min and max */
export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

/** Parse weight string (e.g. "500g", "1kg", "1.5kg") to numeric value in grams */
export function parseWeight(weightStr: string): number {
  const clean = weightStr.toLowerCase().trim();
  if (clean.endsWith('kg')) {
    return parseFloat(clean.replace('kg', '')) * 1000;
  }
  if (clean.endsWith('g')) {
    return parseFloat(clean.replace('g', ''));
  }
  return parseFloat(clean) || 500;
}

/** Format weight in grams to string representation (e.g. "500g", "1kg", "1.5kg") */
export function formatWeight(weightInGrams: number): string {
  if (weightInGrams < 1000) {
    return `${weightInGrams}g`;
  }
  const kgValue = weightInGrams / 1000;
  return `${kgValue}kg`;
}
