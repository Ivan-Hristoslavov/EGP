import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error - missing environment variables" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log('Processing press image:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type
    });

    try {
      // Note: processImageFile requires browser environment, so we'll use the file as-is
      // The client-side canvas already handles compression and scaling
      // Just validate the file
      const maxSizeMB = 10;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { error: `File is too large. Maximum size: ${maxSizeMB}MB` },
          { status: 400 }
        );
      }
      
      console.log('Processing press image:', {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type
      });
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `press/${timestamp}_${originalName}`;
      
      console.log('Uploading press image as:', filename);
      
      // Test bucket access first
      const { data: bucketTest, error: bucketError } = await supabase.storage
        .from('egp')
        .list('press', { limit: 1 });
      
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

      console.log('Press image uploaded successfully:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('egp')
        .getPublicUrl(filename);

      return NextResponse.json({
        url: urlData.publicUrl,
        path: filename
      });
    } catch (uploadError) {
      console.error('Error processing press image:', uploadError);
      return NextResponse.json(
        { error: `Failed to process image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading press image:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}



