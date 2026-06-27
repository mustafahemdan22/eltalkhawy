import fs from 'fs';
const file = 'convex/seedCategories.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\/banner/g, '/category');
fs.writeFileSync(file, content);
console.log('Updated seedCategories.ts');
