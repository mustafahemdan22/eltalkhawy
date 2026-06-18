import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\GRREN TEC\\.gemini\\antigravity-ide\\brain\\7476f2fa-4e43-4a23-aed8-7682f4d041fd';
const publicDir = 'public';

// 1. Copy generated category banners
const categoryBanners = {
  'beef_banner_1781664924370.png': 'beef_banner.png',
  'lamb_banner_1781664942156.png': 'lamb_banner.png',
  'buffalo_banner_1781664957992.png': 'buffalo_banner.png',
  'veal_banner_1781664974604.png': 'veal_banner.png',
  'goat_banner_1781664997951.png': 'goat_banner.png',
  'premium_cuts_banner_1781665015134.png': 'premium_cuts_banner.png',
  'organ_banner_1781665030025.png': 'organ_banner.png',
  'frozen_banner_1781665047964.png': 'frozen_banner.png',
  'offers_banner_1781665075214.png': 'offers_banner.png'
};

console.log('📂 Copying generated category banners...');
const categoriesDestDir = path.join(publicDir, 'images', 'categories');
if (!fs.existsSync(categoriesDestDir)) {
  fs.mkdirSync(categoriesDestDir, { recursive: true });
}

for (const [srcName, destName] of Object.entries(categoryBanners)) {
  const srcPath = path.join(brainDir, srcName);
  const destPath = path.join(categoriesDestDir, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  Copied: ${srcName} -> ${destName}`);
  } else {
    console.error(`  Source not found: ${srcPath}`);
  }
}

// 2. Rename existing product images to standard lowercase SEO-friendly names
const productsDir = path.join(publicDir, 'images', 'products');

const renames = {
  'french_charolais.png': 'beef_french-charolais.png',
  'french_bavette.png': 'beef_french-bavette.png',
  'french_entrecote.png': 'beef_french-entrecote.png',
  'french_limousin.png': 'beef_french-limousin.png',
  'french_onglet.png': 'beef_french-onglet.png',
  'french_ribeye.png': 'beef_french-ribeye.png',
  'kebab.png': 'bbq_kebab.png',
  'kofta_meat.png': 'bbq_kofta-meat.png',
  'leg_of_lamb.png': 'lamb_leg-of-lamb.png',
  'minced_beef.png': 'beef_minced.png',
  'ribeye_steak.png': 'beef_ribeye-steak.png',
  'sausages.png': 'bbq_sausages.png',
  'sirloin_steak.png': 'beef_sirloin-steak.png',
  't_bone_steak.png': 'beef_t-bone-steak.png',
  'tomahawk_steak.png': 'premium_tomahawk-steak.png',
  'placeholder.png': 'general_placeholder.png',

  // Rename pexels files to descriptive product images
  'pexels-1433506698-35435758.jpg': 'organ_beef-mombar.jpg',
  'pexels-domenico-scaglione-276311971-28881691.jpg': 'organ_cow-trotters.jpg',
  'pexels-filirovska-8251005.jpg': 'organ_beef-kidney.jpg',
  'pexels-jstevepham-35834168.jpg': 'organ_lamb-brain.jpg',
  'pexels-lebele-20187068.jpg': 'organ_beef-tripe.jpg',
  'pexels-luis-kuthe-3099301-18973339.jpg': 'organ_beef-heart.jpg',
  'pexels-luisbecerrafotografo-5774158.jpg': 'organ_beef-tongue.jpg',
  'pexels-nadin-sh-78971847-15307375.jpg': 'beef_wagyu-tenderloin.jpg',
  'pexels-rickie-tom-schunemann-67502904-8444102.jpg': 'premium_dry-aged-tomahawk.jpg',
  'pexels-satmar-meats-2152826192-33157191.jpg': 'premium_wagyu-ribeye.jpg',
  'pexels-shliftik-7333264.jpg': 'premium_cote-de-boeuf.jpg'
};

console.log('\n📂 Renaming product images on disk...');
for (const [oldName, newName] of Object.entries(renames)) {
  const oldPath = path.join(productsDir, oldName);
  const newPath = path.join(productsDir, newName);
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`  ✅ Renamed: ${oldName} -> ${newName}`);
  } else {
    console.log(`  ⚠️ File already renamed or not found: ${oldName}`);
  }
}

// 3. Delete the duplicate pexels-filirovska-8251005 (1).jpg if it exists
const duplicatePath = path.join(productsDir, 'pexels-filirovska-8251005 (1).jpg');
if (fs.existsSync(duplicatePath)) {
  fs.unlinkSync(duplicatePath);
  console.log('\n🗑️ Deleted duplicate file pexels-filirovska-8251005 (1).jpg');
}

console.log('\n🎉 Image organization completed successfully!');
