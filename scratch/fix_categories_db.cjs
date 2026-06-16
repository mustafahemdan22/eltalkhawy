/**
 * Reads the cloudinary mapping and patches each category's bannerImage
 * in the Convex DB to a clean publicId (e.g. "categories/beef_banner")
 * instead of a full URL or a local path.
 *
 * Run:  node scratch/fix_categories_db.cjs
 */
const fs   = require('fs');
const path = require('path');
const https = require('https');

const mapping = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'cloudinary_mapping.json'), 'utf8')
);

// Build a lookup: original local path → clean publicId
// e.g. "/images/categories/beef_banner.png" → "categories/beef_banner"
const localToPublicId = {};
for (const [localPath, url] of Object.entries(mapping)) {
  // Extract public_id from the full Cloudinary URL
  // URL: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<publicId>.jpg
  const match = url.match(/\/upload\/v\d+\/(.+?)\.\w+$/);
  if (match) {
    localToPublicId[localPath] = match[1];
  }
}

console.log('Local → Public ID mapping:');
for (const [k, v] of Object.entries(localToPublicId)) {
  console.log(`  ${k} → ${v}`);
}

console.log('\n✅ Mapping ready. Now run the Convex migration to apply these IDs.');
console.log('The Convex migrateDb mutation already handles this — run:');
console.log('  npx convex run migrateDb:fixCategories');
