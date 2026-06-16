import { env } from 'process';

const CLOUD_NAME = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dfq1xxerr';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop' | 'limit';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  dpr?: number | 'auto';
  effect?: string;
  background?: string;
  radius?: number | 'max';
  overlay?: string;
  underlay?: string;
  angle?: number;
  border?: { width: number; color: string };
  flags?: string;
  fetchFormat?: 'auto';
  responsive?: boolean;
};

const DEFAULT_QUALITY = 'auto';
const DEFAULT_FORMAT = 'auto';

function buildTransformationString(options: CloudinaryTransformOptions): string {
  const parts: string[] = [];

  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.quality !== undefined) parts.push(`q_${options.quality}`);
  if (options.format) parts.push(`f_${options.format}`);
  if (options.crop) parts.push(`c_${options.crop}`);
  if (options.gravity) parts.push(`g_${options.gravity}`);
  if (options.dpr) parts.push(`dpr_${options.dpr}`);
  if (options.effect) parts.push(`e_${options.effect}`);
  if (options.background) parts.push(`b_${options.background}`);
  if (options.radius !== undefined) parts.push(`r_${options.radius}`);
  if (options.overlay) parts.push(`l_${options.overlay}`);
  if (options.underlay) parts.push(`u_${options.underlay}`);
  if (options.angle !== undefined) parts.push(`a_${options.angle}`);
  if (options.border) parts.push(`bo_${options.border.width}px_solid_${options.border.color}`);
  if (options.flags) parts.push(`fl_${options.flags}`);
  if (options.fetchFormat) parts.push(`f_${options.fetchFormat}`);

  if (options.responsive) {
    parts.push('c_limit');
  }

  return parts.join(',');
}

export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!publicId) return '';
  if (publicId.startsWith('http')) return publicId;

  const transformation = buildTransformationString({
    quality: DEFAULT_QUALITY,
    format: DEFAULT_FORMAT,
    ...options,
  });

  const publicIdClean = publicId.startsWith('/') ? publicId.slice(1) : publicId;
  return `${BASE_URL}/${transformation}/${publicIdClean}`;
}

export function getCloudinarySrcSet(
  publicId: string,
  widths: number[],
  options: Omit<CloudinaryTransformOptions, 'width'> = {}
): string {
  return widths
    .map((w) => `${getCloudinaryUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(', ');
}

export function getCloudinarySizes(
  breakpoints: { maxWidth: string; size: string }[]
): string {
  return breakpoints.map((bp) => `(${bp.maxWidth}) ${bp.size}`).join(', ');
}

export const CLOUDINARY_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'fill' as const, gravity: 'auto' as const },
  small: { width: 300, height: 300, crop: 'fill' as const, gravity: 'auto' as const },
  medium: { width: 600, height: 600, crop: 'fill' as const, gravity: 'auto' as const },
  large: { width: 1200, height: 1200, crop: 'fill' as const, gravity: 'auto' as const },
  hero: { width: 1920, height: 1080, crop: 'fill' as const, gravity: 'auto' as const },
  productCard: { width: 600, height: 700, crop: 'fill' as const, gravity: 'auto' as const },
  productDetail: { width: 800, height: 900, crop: 'fill' as const, gravity: 'auto' as const },
  categoryBanner: { width: 1200, height: 600, crop: 'fill' as const, gravity: 'auto' as const },
  adminPreview: { width: 400, height: 400, crop: 'fit' as const },
} as const;

export function getPresetUrl(publicId: string, preset: keyof typeof CLOUDINARY_PRESETS): string {
  return getCloudinaryUrl(publicId, CLOUDINARY_PRESETS[preset]);
}

export function extractPublicId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

export function getOptimizedUrl(
  publicId: string,
  width?: number,
  height?: number
): string {
  return getCloudinaryUrl(publicId, {
    width,
    height,
    crop: width && height ? 'fill' : 'limit',
    gravity: 'auto',
    quality: 'auto',
    format: 'auto',
  });
}