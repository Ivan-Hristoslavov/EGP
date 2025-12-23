import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Storage client not configured" },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageIndex = formData.get("imageIndex") as string | null; // 1, 2, or 3

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File is too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    console.log('Uploading hero section image:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type,
      imageIndex
    });

    // File is already processed/compressed on client side if needed
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `hero/${imageIndex || '1'}_${timestamp}_${originalName}`;

    console.log('Uploading hero image as:', filename);

    // Test bucket access first
    const { data: bucketTest, error: bucketError } = await supabase.storage
      .from('egp')
      .list('hero', { limit: 1 });

    if (bucketError && bucketError.message !== 'The resource was not found') {
      console.error('Bucket access test failed:', bucketError);
      return NextResponse.json(
        { error: `Storage bucket access error: ${bucketError.message}` },
        { status: 500 }
      );
    }

    console.log('Bucket access test successful');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('egp')
      .upload(filename, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: `Failed to upload image: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Hero image uploaded successfully:', data);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('egp')
      .getPublicUrl(filename);

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filename
    });
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

