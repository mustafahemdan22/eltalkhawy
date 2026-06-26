import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'general';
    const category = formData.get('category') as string || '';
    const subcategory = formData.get('subcategory') as string || '';
    const productId = formData.get('productId') as string || '';
    const imageIndex = formData.get('index') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const cleanFilename = toKebabCase(file.name.replace(/\.[^/.]+$/, ''));
    let publicId = '';

    if (folder === 'products') {
      if (category && productId) {
        const cleanCat = toKebabCase(category);
        const cleanSub = subcategory ? toKebabCase(subcategory) : '';
        const cleanProd = toKebabCase(productId);
        const indexSuffix = imageIndex ? `-${toKebabCase(imageIndex)}` : '';
        
        if (cleanSub) {
          publicId = `eltalkhawy/categories/${cleanCat}/${cleanSub}/products/${cleanProd}${indexSuffix}`;
        } else {
          publicId = `eltalkhawy/categories/${cleanCat}/products/${cleanProd}${indexSuffix}`;
        }
      } else {
        publicId = `eltalkhawy/products/${cleanFilename}`;
      }
    } else if (folder === 'categories' || folder === 'banners') {
      if (category) {
        const cleanCat = toKebabCase(category);
        publicId = `eltalkhawy/categories/${cleanCat}/banner`;
      } else {
        publicId = `eltalkhawy/categories/${cleanFilename}`;
      }
    } else {
      publicId = `eltalkhawy/general/${cleanFilename}`;
    }

    const result = await new Promise<{ public_id: string; secure_url: string; width: number; height: number; format: string; bytes: number }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: 'image',
          overwrite: false,
          unique_filename: true,
          use_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as typeof result);
          else reject(new Error('Upload failed'));
        }
      ).end(buffer);
    });

    return NextResponse.json({
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}