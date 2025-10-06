import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "../../../lib/supabase";
import { processImageFile } from "@/lib/image-utils";

const supabaseStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");
    const offset = (page - 1) * limit;

    // Get total count for pagination
    let countQuery = supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    if (status) {
      countQuery = countQuery.eq("status", status);
    }

    if (customerId) {
      countQuery = countQuery.eq("customer_id", customerId);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
    }

    // Get paginated invoices
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (customerId) {
      query = query.eq("customer_id", customerId);
    }

    const { data: invoices, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalPages = Math.ceil((totalCount || 0) / limit);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Invoice creation API called');
    
    const formData = await request.formData();
    
    // Use hardcoded VAT settings (like gallery upload approach)
    const vatRate = 20.00;
    const vatEnabled = false; // Disabled by default
    
    // Extract form fields
    const subtotal = parseFloat(formData.get('subtotal') as string);
    const vatAmount = vatEnabled ? (subtotal * vatRate / 100) : 0;
    const totalAmount = subtotal + vatAmount;
    
    const invoiceData = {
      customer_id: formData.get('customer_id') as string,
      booking_id: formData.get('booking_id') as string || null,
      invoice_date: formData.get('invoice_date') as string,
      due_date: formData.get('due_date') as string,
      subtotal: subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      status: formData.get('status') as string,
      company_name: formData.get('company_name') as string,
      company_address: formData.get('company_address') as string,
      company_phone: formData.get('company_phone') as string,
      company_email: formData.get('company_email') as string,
      company_vat_number: formData.get('company_vat_number') as string || null,
      notes: formData.get('notes') as string || null,
      // Add manual entry fields
      manual_service: formData.get('manual_service') as string || null,
      manual_description: formData.get('manual_description') as string || null,
    };

    console.log('📊 Invoice data prepared:', invoiceData);

    // Handle image files (using gallery upload approach)
    const images = formData.getAll('images') as File[];
    const imageAttachments: { filename: string; path: string; originalSize: number; compressedSize: number; compressionRatio: number }[] = [];

    if (images.length > 0) {
      console.log(`📤 Processing ${images.length} images...`);
      
      // Process each image using gallery upload approach
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        console.log(`Processing image ${i + 1}/${images.length}:`, {
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
          type: file.type
        });
        
        try {
          // Use new image validation and processing
          const processedImage = await processImageFile(file, 10);
          
          console.log('Image processing result:', {
            originalType: processedImage.originalType,
            finalType: processedImage.finalType,
            wasConverted: processedImage.wasConverted,
            fileName: processedImage.file.name
          });
          
          const bytes = await processedImage.file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Generate unique filename
          const timestamp = Date.now();
          const originalName = processedImage.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filename = `${timestamp}_${i}_${originalName}`;
          
          console.log(`📁 Uploading image as:`, filename);
          
          // Test bucket access first
          const { data: bucketTest, error: bucketError } = await supabaseStorage.storage
            .from('invoices')
            .list('', { limit: 1 });
          
          if (bucketError) {
            console.error('Bucket access test failed:', bucketError);
            continue;
          }
          
          console.log('Bucket access test successful');
          
          // Upload to Supabase Storage
          const { data, error } = await supabaseStorage.storage
            .from('invoices')
            .upload(filename, buffer, {
              contentType: processedImage.finalType,
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error(`Error uploading image ${i}:`, error);
            continue;
          }

          console.log(`Image ${i + 1} uploaded successfully:`, data);

          // Get public URL
          const { data: urlData } = supabaseStorage.storage
            .from('invoices')
            .getPublicUrl(filename);
          
          imageAttachments.push({
            filename: originalName,
            path: urlData.publicUrl,
            originalSize: file.size,
            compressedSize: processedImage.file.size, // Use processed file size
            compressionRatio: processedImage.wasConverted ? 
              ((file.size - processedImage.file.size) / file.size * 100) : 0
          });
          
          console.log(`✅ Image ${i + 1} processed successfully`);
        } catch (error) {
          console.error(`Error processing image ${i}:`, error);
        }
      }
      
      console.log(`✅ Successfully processed ${imageAttachments.length}/${images.length} images`);
    }

    // Generate invoice number
    console.log('🔢 Generating invoice number...');
    const { data: invoiceNumber, error: numberError } = await supabase.rpc(
      "generate_invoice_number",
    );

    if (numberError) {
      console.error('Error generating invoice number:', numberError);
      return NextResponse.json(
        { error: numberError.message },
        { status: 400 },
      );
    }

    console.log('✅ Invoice number generated:', invoiceNumber);

    // Create final invoice object
    const finalInvoiceData = {
      ...invoiceData,
      invoice_number: invoiceNumber,
      ...(imageAttachments.length > 0 && { 
        image_attachments: JSON.stringify(imageAttachments) 
      })
    };

    console.log('💾 Saving invoice to database...');
    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert([finalInvoiceData])
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `,
      )
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log('✅ Invoice created successfully!');
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
