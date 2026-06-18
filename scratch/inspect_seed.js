import fs from 'fs';
import path from 'path';

const seedPath = 'convex/seed.ts';
const content = fs.readFileSync(seedPath, 'utf8');

// Match ctx.db.insert('products', p({ ... }))
const regex = /ctx\.db\.insert\('products',\s*p\(\{([\s\S]*?)\}\)\)/g;
let match;
const products = [];

while ((match = regex.exec(content)) !== null) {
  const body = match[1];
  const slugMatch = /slug:\s*'([^']+)'/.exec(body);
  const nameMatch = /name:\s*'([^']+)'/.exec(body);
  const categoryMatch = /categorySlug:\s*'([^']+)'/.exec(body);
  const subcategoryMatch = /subcategory:\s*([^,]+)/.exec(body);
  const imagesMatch = /images:\s*\[([^\]]+)\]/.exec(body);
  const basePriceMatch = /basePrice:\s*(\d+)/.exec(body);

  if (slugMatch && nameMatch) {
    products.push({
      slug: slugMatch[1],
      name: nameMatch[1],
      category: categoryMatch ? categoryMatch[1] : 'unknown',
      subcategory: subcategoryMatch ? subcategoryMatch[1].trim() : 'none',
      images: imagesMatch ? imagesMatch[1].trim() : 'none',
      price: basePriceMatch ? parseInt(basePriceMatch[1], 10) : 0,
    });
  }
}

console.log(JSON.stringify(products, null, 2));
