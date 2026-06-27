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

interface UploadResult {
  localPath: string;
  publicId: string;
  url: string;
  success: boolean;
  error?: string;
}



async function uploadFile(localPath: string, publicId: string): Promise<UploadResult> {
  try {
    const result = await new Promise<{ public_id: string; secure_url: string; width: number; height: number; format: string; bytes: number }>((resolve, reject) => {
      cloudinary.uploader.upload(
        localPath,
        {
          public_id: publicId,
          overwrite: false,
          unique_filename: false,
          use_filename: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as typeof result);
          else reject(new Error('Upload failed - no result'));
        }
      );
    });

    return {
      localPath,
      publicId: result.public_id,
      url: result.secure_url,
      success: true,
    };
  } catch (error) {
    return {
      localPath,
      publicId,
      url: '',
      success: false,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

async function migrate() {
  console.log('🚀 Starting Cloudinary migration...');
  console.log(`📁 Public directory: ${PUBLIC_DIR}`);
  
  const results: UploadResult[] = [];
  
  // 1. Upload category banners
  console.log('\n📂 Uploading category banners...');
  const categoriesDir = path.join(PUBLIC_DIR, 'images', 'categories');
  if (fs.existsSync(categoriesDir)) {
    const files = fs.readdirSync(categoriesDir);
    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;
      
      const localPath = path.join(categoriesDir, file);
      const publicId = `categories/${file.replace(/\.[^/.]+$/, '')}`;
      
      console.log(`  ⬆️  Uploading: ${file} -> ${publicId}`);
      const result = await uploadFile(localPath, publicId);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✅ Success: ${result.url}`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }
  }
  
  // 2. Upload product images
  console.log('\n📂 Uploading product images...');
  const productsDir = path.join(PUBLIC_DIR, 'images', 'products');
  if (fs.existsSync(productsDir)) {
    const files = fs.readdirSync(productsDir);
    for (const file of files) {
      if (!file.match(/\.(png|jpg|jpeg|webp)$/i)) continue;
      
      const localPath = path.join(productsDir, file);
      const publicId = `products/${file.replace(/\.[^/.]+$/, '')}`;
      
      console.log(`  ⬆️  Uploading: ${file} -> ${publicId}`);
      const result = await uploadFile(localPath, publicId);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✅ Success: ${result.url}`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }
  }
  
  // 3. Upload hero image
  console.log('\n📂 Uploading hero image...');
  const heroPath = path.join(PUBLIC_DIR, 'hero_premium_meat.png');
  if (fs.existsSync(heroPath)) {
    const publicId = 'hero/hero_premium_meat';
    console.log(`  ⬆️  Uploading: hero_premium_meat.png -> ${publicId}`);
    const result = await uploadFile(heroPath, publicId);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Success: ${result.url}`);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  }
  
  // 4. Upload convex.svg
  console.log('\n📂 Uploading convex.svg...');
  const convexPath = path.join(PUBLIC_DIR, 'convex.svg');
  if (fs.existsSync(convexPath)) {
    const publicId = 'general/convex';
    console.log(`  ⬆️  Uploading: convex.svg -> ${publicId}`);
    const result = await uploadFile(convexPath, publicId);
    results.push(result);
    
    if (result.success) {
      console.log(`  ✅ Success: ${result.url}`);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  }
  
  // Summary
  console.log('\n📊 Migration Summary:');
  console.log('====================');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed uploads:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.localPath}: ${r.error}`);
    });
  }
  
  const mapping = results.reduce((acc, r) => {
    const relativePath = path.relative(PUBLIC_DIR, r.localPath).replace(/\\/g, '/');
    acc[relativePath] = {
      publicId: r.publicId,
      url: r.url,
      success: r.success,
    };
    return acc;
  }, {} as Record<string, { publicId: string; url: string; success: boolean }>);
  
  const mappingPath = path.join(__dirname, '..', 'cloudinary-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n💾 Mapping saved to: ${mappingPath}`);
  
  console.log('\n🎉 Migration complete!');
}

migrate().catch(console.error);