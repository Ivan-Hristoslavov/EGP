import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateImageFile, processImageFile } from "@/lib/image-utils";

/** Server-side HEIC to JPEG using heic-decode + jpeg-js (Supabase does not accept image/heic). */
async function convertHeicBufferToJpeg(inputBuffer: Buffer | Uint8Array): Promise<Buffer> {
  const uint8 = inputBuffer instanceof Uint8Array ? inputBuffer : new Uint8Array(inputBuffer);
  if (uint8.length < 12) {
    throw new Error("File too small to be a valid HEIC image");
  }
  const decode = (await import("heic-decode")).default;
  const jpegJs = (await import("jpeg-js")).encode;
  const { width, height, data } = await decode({ buffer: uint8 });
  const encoded = jpegJs({ data, width, height }, 85);
  return Buffer.from(encoded.data);
}

function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif") || file.type === "image/heic" || file.type === "image/heif";
}

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

// POST - Upload before and after images for gallery
export async function POST(request: NextRequest) {
  try {
    console.log('Gallery upload API called');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Supabase Service Key:', supabaseServiceKey ? 'Set' : 'Missing');
    
    // Check if environment variables are properly set
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: "Server configuration error - missing environment variables" },
        { status: 500 }
      );
    }
    
    const formData = await request.formData();
    
    const beforeImage = formData.get('beforeImage') as File | null;
    const afterImage = formData.get('afterImage') as File | null;
    
    console.log('Form data received:', {
      beforeImage: beforeImage ? { name: beforeImage.name, size: beforeImage.size, type: beforeImage.type } : null,
      afterImage: afterImage ? { name: afterImage.name, size: afterImage.size, type: afterImage.type } : null
    });
    
    if (!beforeImage && !afterImage) {
      console.log('No images provided');
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const results: { beforeUrl?: string; afterUrl?: string } = {};

    // Process before image
    if (beforeImage && beforeImage.size > 0) {
      console.log('Processing before image:', beforeImage.name);
      
      try {
        const validation = validateImageFile(beforeImage, 10);
        if (!validation.isValid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        
        const arrayBuffer = await beforeImage.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let buffer = Buffer.from(bytes);
        let contentType: string;
        let baseName: string;
        
        if (isHeicFile(beforeImage)) {
          console.log('Converting HEIC to JPEG (server):', beforeImage.name);
          try {
            buffer = await convertHeicBufferToJpeg(bytes);
          } catch (heicError) {
            const msg = heicError instanceof Error ? heicError.message : String(heicError);
            console.warn('Server HEIC conversion failed:', msg);
            return NextResponse.json(
              { error: 'HEIC conversion failed. Please use a JPEG/PNG image, or try again in Chrome/Firefox (they convert HEIC in the browser).' },
              { status: 400 }
            );
          }
          contentType = 'image/jpeg';
          baseName = beforeImage.name.replace(/\.[^.]+$/i, '').replace(/[^a-zA-Z0-9.-]/g, '_') + '.jpg';
        } else {
          const processedImage = await processImageFile(beforeImage, 10);
          buffer = Buffer.from(await processedImage.file.arrayBuffer());
          contentType = processedImage.finalType;
          baseName = processedImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        }
        
        const timestamp = Date.now();
        const filename = `before_${timestamp}_${baseName}`;
        
        console.log('Uploading before image as:', filename);
        
        const { data: bucketTest, error: bucketError } = await supabase.storage
          .from('egp')
          .list('', { limit: 1 });
        
        if (bucketError) {
          console.error('Bucket access test failed:', bucketError);
          return NextResponse.json(
            { error: `Storage bucket access error: ${bucketError.message}` },
            { status: 500 }
          );
        }
        
        const { data, error } = await supabase.storage
          .from('egp')
          .upload(filename, buffer, {
            contentType,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error for before image:', error);
          return NextResponse.json(
            { error: `Failed to upload before image: ${error.message}` },
            { status: 500 }
          );
        }

        console.log('Before image uploaded successfully:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('egp')
          .getPublicUrl(filename);

        results.beforeUrl = urlData.publicUrl;
        console.log('Before image URL:', results.beforeUrl);
      } catch (uploadError) {
        console.error('Error processing before image:', uploadError);
        return NextResponse.json(
          { error: `Failed to process before image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    // Process after image
    if (afterImage && afterImage.size > 0) {
      console.log('Processing after image:', afterImage.name);
      
      try {
        const validation = validateImageFile(afterImage, 10);
        if (!validation.isValid) {
          return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        
        const arrayBuffer = await afterImage.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let buffer = Buffer.from(bytes);
        let contentType: string;
        let baseName: string;
        
        if (isHeicFile(afterImage)) {
          console.log('Converting HEIC to JPEG (server):', afterImage.name);
          try {
            buffer = await convertHeicBufferToJpeg(bytes);
          } catch (heicError) {
            const msg = heicError instanceof Error ? heicError.message : String(heicError);
            console.warn('Server HEIC conversion failed:', msg);
            return NextResponse.json(
              { error: 'HEIC conversion failed. Please use a JPEG/PNG image, or try again in Chrome/Firefox (they convert HEIC in the browser).' },
              { status: 400 }
            );
          }
          contentType = 'image/jpeg';
          baseName = afterImage.name.replace(/\.[^.]+$/i, '').replace(/[^a-zA-Z0-9.-]/g, '_') + '.jpg';
        } else {
          const processedImage = await processImageFile(afterImage, 10);
          buffer = Buffer.from(await processedImage.file.arrayBuffer());
          contentType = processedImage.finalType;
          baseName = processedImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        }
        
        const timestamp = Date.now();
        const filename = `after_${timestamp}_${baseName}`;
        
        console.log('Uploading after image as:', filename);
        
        const { data, error } = await supabase.storage
          .from('egp')
          .upload(filename, buffer, {
            contentType,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error for after image:', error);
          return NextResponse.json(
            { error: `Failed to upload after image: ${error.message}` },
            { status: 500 }
          );
        }

        console.log('After image uploaded successfully:', data);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('egp')
          .getPublicUrl(filename);

        results.afterUrl = urlData.publicUrl;
        console.log('After image URL:', results.afterUrl);
      } catch (uploadError) {
        console.error('Error processing after image:', uploadError);
        return NextResponse.json(
          { error: `Failed to process after image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 500 }
        );
      }
    }

    console.log('Upload completed successfully:', results);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 