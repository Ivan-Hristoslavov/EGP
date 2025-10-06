import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStorageClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabaseStorage = createStorageClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to compress images
async function compressImage(buffer: Buffer, originalSize: number): Promise<{ compressedBuffer: Buffer; compressedSize: number; compressionRatio: number }> {
  try {
    // Compress image with Sharp
    const compressedBuffer = await sharp(buffer)
      .resize(1920, 1920, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ 
        quality: 80, // Good quality with compression
        progressive: true 
      })
      .toBuffer();
    
    const compressedSize = compressedBuffer.length;
    const compressionRatio = compressedSize / originalSize;
    
    return {
      compressedBuffer,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error("Error compressing image:", error);
    // Return original if compression fails
    return {
      compressedBuffer: buffer,
      compressedSize: originalSize,
      compressionRatio: 1
    };
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single invoice
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(
        `
        *,
        customer:customers(name, email, address, phone),
        booking:bookings(service, date, time, description)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update invoice
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    
    const formData = await request.formData();
    
    // Extract form fields
    const customer_id = formData.get('customer_id') as string;
    const booking_id = formData.get('booking_id') as string || null;
    const invoice_date = formData.get('invoice_date') as string;
    const due_date = formData.get('due_date') as string;
    const subtotal = parseFloat(formData.get('subtotal') as string);
    const vat_rate = parseFloat(formData.get('vat_rate') as string);
    const vat_amount = parseFloat(formData.get('vat_amount') as string);
    const total_amount = parseFloat(formData.get('total_amount') as string);
    const company_name = formData.get('company_name') as string;
    const company_address = formData.get('company_address') as string;
    const company_phone = formData.get('company_phone') as string;
    const company_email = formData.get('company_email') as string;
    const company_vat_number = formData.get('company_vat_number') as string;
    const notes = formData.get('notes') as string || null;
    const manual_service = formData.get('manual_service') as string || null;
    const manual_description = formData.get('manual_description') as string || null;

    // Handle image attachments
    const images = formData.getAll('images') as File[];
    const existingImagesJson = formData.get('existing_images') as string;
    let imageAttachments: { filename: string; path: string; originalSize?: number; compressedSize?: number; compressionRatio?: number }[] = [];

    // Parse existing images if provided
    if (existingImagesJson) {
      try {
        const existingImages = JSON.parse(existingImagesJson);
        imageAttachments = [...existingImages];
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }

    // Process new images
    if (images.length > 0) {
      // Process each image
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        if (file && file.size > 0) {
          try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const originalSize = file.size;
            
            // Compress the image
            const { compressedBuffer, compressedSize, compressionRatio } = await compressImage(buffer, originalSize);
            
            // Generate unique filename
            const timestamp = Date.now();
            const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filename = `${timestamp}_${i}_${originalName.replace(/\.[^/.]+$/, '')}.jpg`; // Always save as JPEG
            
            // Upload compressed image to Supabase Storage
            const { data, error } = await supabaseStorage.storage
              .from('invoices')
              .upload(filename, compressedBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
              });

            if (error) {
              console.error(`Error uploading image ${i}:`, error);
              continue;
            }

            // Get public URL
            const { data: urlData } = supabaseStorage.storage
              .from('invoices')
              .getPublicUrl(filename);
            
            imageAttachments.push({
              filename: originalName,
              path: urlData.publicUrl,
              originalSize,
              compressedSize,
              compressionRatio
            });
          } catch (error) {
            console.error(`Error processing image ${i}:`, error);
          }
        }
      }
    }

    // Create update object
    const updateData: any = {
      customer_id,
      booking_id,
      invoice_date,
      due_date,
      subtotal,
      vat_rate,
      vat_amount,
      total_amount,
      company_name,
      company_address,
      company_phone,
      company_email,
      company_vat_number,
      notes,
      manual_service,
      manual_description,
      updated_at: new Date().toISOString()
    };

    // Add image attachments (always update, even if empty to allow removal)
    updateData.image_attachments = JSON.stringify(imageAttachments);

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        customer:customers(name, email, address),
        booking:bookings(service, date, time)
      `
      )
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error in invoice PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Delete invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    // First check if invoice exists
    const { data: existingInvoice, error: fetchError } = await supabase
      .from("invoices")
      .select("id, image_attachments")
      .eq("id", id)
      .single();

    if (fetchError || !existingInvoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Delete associated image files if any
    if (existingInvoice.image_attachments) {
      try {
        const attachments = JSON.parse(existingInvoice.image_attachments);
        const fs = require('fs');
        
        attachments.forEach((attachment: { path: string }) => {
          try {
            if (fs.existsSync(attachment.path)) {
              fs.unlinkSync(attachment.path);
            }
          } catch (error) {
            console.error(`Error deleting file ${attachment.path}:`, error);
          }
        });
      } catch (error) {
        console.error("Error parsing/deleting image attachments:", error);
      }
    }

    // Delete the invoice
    const { error: deleteError } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting invoice:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error in invoice DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 