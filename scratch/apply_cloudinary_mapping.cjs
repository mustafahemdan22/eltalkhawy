const fs = require('fs');

const MAPPING_FILE = 'd:/next-react/eltalkhawy/scratch/cloudinary_mapping.json';
const SEED_FILE = 'd:/next-react/eltalkhawy/convex/seed.ts';
const ANIMAL_CUTS_FILE = 'd:/next-react/eltalkhawy/lib/animal-cuts.ts';
const CONSTANTS_FILE = 'd:/next-react/eltalkhawy/lib/constants.ts';

if (!fs.existsSync(MAPPING_FILE)) {
  console.error('Mapping file not found:', MAPPING_FILE);
  process.exit(1);
}

const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));

const files = [SEED_FILE, ANIMAL_CUTS_FILE, CONSTANTS_FILE];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    for (const [localPath, cloudinaryUrl] of Object.entries(mapping)) {
      // Replace instances of the local path with the cloudinary URL.
      // E.g. '/images/products/ribeye_steak.png' -> 'https://res.cloudinary.com/...'
      const regex = new RegExp(localPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (regex.test(content)) {
        content = content.replace(regex, cloudinaryUrl);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

console.log('Finished applying Cloudinary URLs to the codebase.');
