import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

/** Generate Cloudinary URL with transforms */
export function cloudinaryUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'pad';
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif';
    gravity?: 'auto' | 'face' | 'center';
  } = {},
) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
  } = options;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'el-talkhawy';
  const transforms: string[] = [];

  if (width)   transforms.push(`w_${width}`);
  if (height)  transforms.push(`h_${height}`);
  if (gravity) transforms.push(`g_${gravity}`);
  transforms.push(`c_${crop}`, `q_${quality}`, `f_${format}`);

  const transformStr = transforms.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
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
