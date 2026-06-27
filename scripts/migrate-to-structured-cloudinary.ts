import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load .env.local variables
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...rest] = trimmed.split('=');
      if (key && rest.length > 0) {
        process.env[key.trim()] = rest.join('=').trim();
      }
    });
  }
} catch (e) {
  console.warn('Failed to load .env.local manually:', e);
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dfq1xxerr',
  api_key: process.env.CLOUDINARY_API_KEY ?? '948429683924197',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? 'BH5h1qMFJSXkDYE0i9ts4pPJWyQ',
});

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const IMG: Record<string, string> = {
  ribeye:    'products/beef_ribeye-steak',
  lamb:      'products/lamb_leg-of-lamb',
  cuts:      'products/beef_tenderloin',
  minced:    'products/beef_minced',
  meat:      'products/beef_cubes',
  kofta:     'products/bbq_kofta-meat',
  burgers:   'products/beef_burger_patties',
  goat:      'products/goat_meat',
  offal:     'products/beef_liver',
  frozen:    'products/frozen_minced_beef',
  butcher:   'products/beef_brisket',
  steak:     'products/beef_sirloin-steak',
  tbone:     'products/beef_t-bone-steak',
  grill:     'products/bbq_sausages',
  kebab:     'products/bbq_kebab',
  chops:     'products/lamb_chops',
  frenchRibeye:      'products/beef_french-ribeye',
  frenchTenderloin:  'products/veal_steak',
  frenchEntrecote:   'products/beef_french-entrecote',
  frenchBavette:     'products/beef_french-bavette',
  frenchOnglet:      'products/beef_french-onglet',
  frenchCharolais:   'products/beef_french-charolais',
  frenchLimousin:    'products/beef_french-limousin',
  frenchRibs:        'products/beef_ribs',
};

async function uploadFile(localPath: string, publicId: string): Promise<boolean> {
  try {
    await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        localPath,
        {
          public_id: publicId,
          overwrite: true,
          unique_filename: false,
          use_filename: false,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    console.log(`  ✅ Uploaded: ${path.basename(localPath)} -> ${publicId}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Failed: ${path.basename(localPath)} -> ${publicId}`, error);
    return false;
  }
}

function findLocalProductFile(oldPublicId: string): string | null {
  const basename = oldPublicId.replace(/^products\//, '').replace(/^organ\//, '').replace(/^premium\//, '');
  const possiblePaths = [
    path.join(PUBLIC_DIR, 'images', 'products', `${basename}.png`),
    path.join(PUBLIC_DIR, 'images', 'products', `${basename}.jpg`),
    path.join(PUBLIC_DIR, 'images', 'products', `${basename}.jpeg`),
    path.join(PUBLIC_DIR, 'images', 'products', `${basename}.webp`),
    path.join(PUBLIC_DIR, 'images', 'products', `${oldPublicId.replace(/\//g, '_')}.png`),
    path.join(PUBLIC_DIR, 'images', 'products', `${oldPublicId.replace(/\//g, '_')}.jpg`),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function migrate() {
  console.log('🚀 Starting Cloudinary structured migration...');

  // 1. Upload category banners
  console.log('\n📂 Uploading Category Banners...');
  const categoryBanners: Record<string, string> = {
    beef: 'beef_banner.png',
    lamb: 'lamb_banner.png',
    buffalo: 'buffalo_banner.png',
    veal: 'veal_banner.png',
    goat: 'goat_banner.png',
    'bbq-cuts': 'bbq_banner.png',
    'premium-cuts': 'premium_cuts_banner.png',
    'organ-meats': 'organ_banner.png',
    frozen: 'frozen_banner.png',
    offers: 'offers_banner.png'
  };

  for (const [slug, filename] of Object.entries(categoryBanners)) {
    const localPath = path.join(PUBLIC_DIR, 'images', 'categories', filename);
    if (fs.existsSync(localPath)) {
      const publicId = `eltalkhawy/categories/${slug}/banner`;
      await uploadFile(localPath, publicId);
    } else {
      console.warn(`  ⚠️ Category file not found: ${localPath}`);
    }
  }

  // 2. Upload Placeholders & Hero & Convex Logo
  console.log('\n📂 Uploading General Assets & Placeholders...');
  const generalAssets = [
    { local: path.join(PUBLIC_DIR, 'images', 'products', 'placeholder.png'), target: 'eltalkhawy/general/placeholder' },
    { local: path.join(PUBLIC_DIR, 'images', 'products', 'beef_placeholder.png'), target: 'eltalkhawy/general/beef-placeholder' },
    { local: path.join(PUBLIC_DIR, 'images', 'products', 'lamb_placeholder.png'), target: 'eltalkhawy/general/lamb-placeholder' },
    { local: path.join(PUBLIC_DIR, 'hero_premium_meat.png'), target: 'eltalkhawy/general/hero-premium-meat' },
    { local: path.join(PUBLIC_DIR, 'convex.svg'), target: 'eltalkhawy/general/convex' },
  ];

  for (const asset of generalAssets) {
    if (fs.existsSync(asset.local)) {
      await uploadFile(asset.local, asset.target);
    } else {
      console.warn(`  ⚠️ General asset not found: ${asset.local}`);
    }
  }

  // 3. Parse and upload product images
  console.log('\n📂 Uploading Product Images...');
  const seedFile = path.join(__dirname, '..', 'convex', 'seed.ts');
  if (!fs.existsSync(seedFile)) {
    console.error('❌ seed.ts not found! Cannot parse products.');
    return;
  }

  const seedContent = fs.readFileSync(seedFile, 'utf8');
  const insertRegex = /await ctx\.db\.insert\('products', p\(\{([\s\S]*?)\}\)\);/g;
  let match;
  let successCount = 0;
  let totalCount = 0;

  while ((match = insertRegex.exec(seedContent)) !== null) {
    const block = match[1];
    
    // Extract slug
    const slugMatch = block.match(/slug:\s*'([^']+)'/);
    // Extract categorySlug
    const catMatch = block.match(/categorySlug:\s*'([^']+)'/);
    // Extract subcategory (either 'string' or null)
    const subMatch = block.match(/subcategory:\s*(?:'([^']+)'|null)/);
    // Extract images (e.g. [IMG.ribeye] or ['products/buffalo_steak'])
    const imgMatch = block.match(/images:\s*\[([^\]]+)\]/);

    if (slugMatch && catMatch) {
      const slug = slugMatch[1];
      const category = catMatch[1];
      const subcategory = subMatch && subMatch[1] ? subMatch[1] : null;
      const rawImage = imgMatch ? imgMatch[1].trim() : '';

      if (rawImage) {
        // Resolve image string
        let oldImgPath = '';
        if (rawImage.startsWith('IMG.')) {
          const key = rawImage.replace('IMG.', '');
          oldImgPath = IMG[key] || '';
        } else {
          oldImgPath = rawImage.replace(/['"]/g, '');
        }

        if (oldImgPath) {
          const localPath = findLocalProductFile(oldImgPath);
          if (localPath) {
            const targetPublicId = subcategory
              ? `eltalkhawy/categories/${category}/${subcategory}/products/${slug}`
              : `eltalkhawy/categories/${category}/products/${slug}`;
            
            totalCount++;
            const ok = await uploadFile(localPath, targetPublicId);
            if (ok) successCount++;
          } else {
            console.warn(`  ⚠️ Local file not found for public ID: ${oldImgPath} (product: ${slug})`);
          }
        }
      }
    }
  }

  console.log(`\n🎉 Migration complete! Success: ${successCount}/${totalCount}`);
}

migrate().catch(console.error);
