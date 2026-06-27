import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const OLD_IMAGES_DIR = path.join(PUBLIC_DIR, 'images', 'categories');
const NEW_BASE_DIR = path.join(PUBLIC_DIR, 'eltalkhawy', 'categories');

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function convertToWebp(inputPath: string, outputPath: string) {
  try {
    ensureDir(path.dirname(outputPath));
    await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath);
    console.log(`✅ Converted: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error);
  }
}

async function copyAsWebp(inputPath: string, outputPath: string) {
  try {
    ensureDir(path.dirname(outputPath));
    fs.copyFileSync(inputPath, outputPath);
    console.log(`✅ Copied: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error copying ${inputPath}:`, error);
  }
}

async function processDirectory(dir: string, currentCategory: string | null = null) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const category = currentCategory || entry.name;
      
      if (entry.name === 'products') {
        const productSlugs = fs.readdirSync(fullPath, { withFileTypes: true });
        for (const slugDir of productSlugs) {
          if (slugDir.isDirectory()) {
            const slug = slugDir.name;
            const imgPathsToCheck = [
              path.join(fullPath, slug, 'images'),
              path.join(fullPath, slug)
            ];

            for (const imgPath of imgPathsToCheck) {
              if (fs.existsSync(imgPath)) {
                const imgFiles = fs.readdirSync(imgPath).filter(f => /\.(png|jpe?g|webp)$/i.test(f));
                if (imgFiles.length > 0) {
                  const firstImgPath = path.join(imgPath, imgFiles[0]);
                  
                  // Convert 1st image
                  const destFile1 = path.join(NEW_BASE_DIR, category, 'products', slug, `1.webp`);
                  await convertToWebp(firstImgPath, destFile1);

                  // Convert or duplicate 2nd image
                  const destFile2 = path.join(NEW_BASE_DIR, category, 'products', slug, `2.webp`);
                  if (imgFiles.length > 1) {
                    const secondImgPath = path.join(imgPath, imgFiles[1]);
                    await convertToWebp(secondImgPath, destFile2);
                  } else {
                    // Duplicate 1st image as 2nd image
                    await copyAsWebp(destFile1, destFile2);
                  }
                  break; // found images, skip other paths
                }
              }
            }
          }
        }
      } else {
        await processDirectory(fullPath, category);
      }
    } else {
      if (entry.name.startsWith('banner') && currentCategory) {
        const destFile = path.join(NEW_BASE_DIR, currentCategory, 'category.webp');
        await convertToWebp(fullPath, destFile);
      }
    }
  }
}

async function run() {
  console.log('🚀 Starting Cloudinary structure migration (with slugs & 2 images)...');
  
  if (!fs.existsSync(OLD_IMAGES_DIR)) {
    console.error('❌ Could not find old images directory:', OLD_IMAGES_DIR);
    return;
  }

  ensureDir(NEW_BASE_DIR);
  await processDirectory(OLD_IMAGES_DIR);

  console.log(`\n🎉 Reorganization complete!`);
}

run().catch(console.error);
