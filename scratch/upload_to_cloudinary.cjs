const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse .env.local manually
const envPath = 'd:/next-react/eltalkhawy/.env.local';
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) env[key.trim()] = rest.join('=').trim();
});

const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

const BASE_DIR = 'd:/next-react/eltalkhawy/public/images';
const PRODUCTS_DIR = path.join(BASE_DIR, 'products');
const CATEGORIES_DIR = path.join(BASE_DIR, 'categories');
const MAPPING_FILE = 'd:/next-react/eltalkhawy/scratch/cloudinary_mapping.json';

async function uploadFile(filePath, folder) {
  const fileName = path.parse(filePath).name;
  const publicId = `${folder}/${fileName}`;
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Sign the request
  const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

  const fileData = fs.readFileSync(filePath);
  const blob = new Blob([fileData], { type: 'image/png' }); // Assuming png

  const formData = new FormData();
  formData.append('file', blob, path.basename(filePath));
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('public_id', publicId);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.secure_url;
  } catch (err) {
    console.error(`Error uploading ${filePath}:`, err);
    throw err;
  }
}

async function run() {
  const mapping = {};
  
  if (fs.existsSync(PRODUCTS_DIR)) {
    const products = fs.readdirSync(PRODUCTS_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
    for (const file of products) {
      const filePath = path.join(PRODUCTS_DIR, file);
      const url = await uploadFile(filePath, 'products');
      mapping[`/images/products/${file}`] = url;
      console.log(`Uploaded ${file} -> ${url}`);
    }
  }

  if (fs.existsSync(CATEGORIES_DIR)) {
    const categories = fs.readdirSync(CATEGORIES_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
    for (const file of categories) {
      const filePath = path.join(CATEGORIES_DIR, file);
      const url = await uploadFile(filePath, 'categories');
      mapping[`/images/categories/${file}`] = url;
      console.log(`Uploaded ${file} -> ${url}`);
    }
  }

  const scratchDir = path.dirname(MAPPING_FILE);
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
  console.log('Upload complete! Mapping saved to', MAPPING_FILE);
}

run().catch(console.error);
