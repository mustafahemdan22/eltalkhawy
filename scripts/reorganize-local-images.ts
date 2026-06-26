import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const CATEGORIES_DIR = path.join(IMAGES_DIR, 'categories');

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

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function findLocalProductFile(oldImgPath: string): string | null {
  const basename = oldImgPath.replace(/^products\//, '').replace(/^organ\//, '').replace(/^premium\//, '');
  const possiblePaths = [
    path.join(IMAGES_DIR, 'products', `${basename}.png`),
    path.join(IMAGES_DIR, 'products', `${basename}.jpg`),
    path.join(IMAGES_DIR, 'products', `${basename}.jpeg`),
    path.join(IMAGES_DIR, 'products', `${basename}.webp`),
    path.join(IMAGES_DIR, 'products', `${oldImgPath.replace(/\//g, '_')}.png`),
    path.join(IMAGES_DIR, 'products', `${oldImgPath.replace(/\//g, '_')}.jpg`),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function reorganize() {
  console.log('🚀 Starting local images reorganization...');

  // 1. Move Category Banners
  console.log('\n📂 Moving Category Banners...');
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
    const oldPath = path.join(CATEGORIES_DIR, filename);
    if (fs.existsSync(oldPath)) {
      const ext = path.extname(filename);
      const newDir = path.join(CATEGORIES_DIR, slug);
      ensureDir(newDir);
      const newPath = path.join(newDir, `banner${ext}`);
      
      console.log(`  ➡️ Moving: ${filename} -> categories/${slug}/banner${ext}`);
      fs.renameSync(oldPath, newPath);
    }
  }

  // 2. Move Placeholders and General Assets
  console.log('\n📂 Moving General Assets & Placeholders...');
  ensureDir(path.join(IMAGES_DIR, 'general'));

  const generalAssets = [
    { old: path.join(IMAGES_DIR, 'products', 'placeholder.png'), new: path.join(IMAGES_DIR, 'general', 'placeholder.png') },
    { old: path.join(IMAGES_DIR, 'products', 'general_placeholder.png'), new: path.join(IMAGES_DIR, 'general', 'general-placeholder.png') },
    { old: path.join(IMAGES_DIR, 'products', 'beef_placeholder.png'), new: path.join(IMAGES_DIR, 'general', 'beef-placeholder.png') },
    { old: path.join(IMAGES_DIR, 'products', 'lamb_placeholder.png'), new: path.join(IMAGES_DIR, 'general', 'lamb-placeholder.png') },
  ];

  for (const asset of generalAssets) {
    if (fs.existsSync(asset.old)) {
      console.log(`  ➡️ Moving: ${path.basename(asset.old)} -> general/${path.basename(asset.new)}`);
      fs.renameSync(asset.old, asset.new);
    }
  }

  // 3. Move Product Images
  console.log('\n📂 Moving Product Images...');
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

  const movedProducts = new Set<string>();

  while ((match = insertRegex.exec(seedContent)) !== null) {
    const block = match[1];
    
    const slugMatch = block.match(/slug:\s*'([^']+)'/);
    const catMatch = block.match(/categorySlug:\s*'([^']+)'/);
    const subMatch = block.match(/subcategory:\s*(?:'([^']+)'|null)/);
    const imgMatch = block.match(/images:\s*\[([^\]]+)\]/);

    if (slugMatch && catMatch) {
      const slug = slugMatch[1];
      const category = catMatch[1];
      const subcategory = subMatch && subMatch[1] ? subMatch[1] : null;
      let rawImage = imgMatch ? imgMatch[1].trim() : '';

      if (rawImage && !movedProducts.has(slug)) {
        movedProducts.add(slug);
        
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
            const ext = path.extname(localPath);
            const targetDir = subcategory
              ? path.join(CATEGORIES_DIR, category, subcategory, 'products', slug, 'images')
              : path.join(CATEGORIES_DIR, category, 'products', slug, 'images');
            
            ensureDir(targetDir);
            const targetFile = path.join(targetDir, `1${ext}`);
            
            totalCount++;
            console.log(`  ➡️ Moving: ${path.basename(localPath)} -> categories/${category}/${subcategory ? subcategory + '/' : ''}products/${slug}/images/1${ext}`);
            fs.renameSync(localPath, targetFile);
            successCount++;
          }
        }
      }
    }
  }

  console.log(`\n🎉 Reorganization complete! Moved ${successCount}/${totalCount} product images.`);
}

reorganize().catch(console.error);
