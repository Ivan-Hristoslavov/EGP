# Supabase Storage Setup for Production Image Uploads

## Problem
Your image uploads work locally but fail in production because:
- Production environments are read-only (no file system writes)
- Local filesystem uploads don't persist in production
- Most hosting platforms don't allow file writes

## Solution: Supabase Storage

I've updated your upload routes to use Supabase Storage instead of local filesystem.

## Setup Steps

### 1. Create Storage Buckets in Supabase

Go to your Supabase dashboard → Storage and create these buckets:

#### Gallery Bucket
- **Name**: `gallery`
- **Public**: ✅ Yes (for public image access)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Invoices Bucket
- **Name**: `invoices`
- **Public**: ✅ Yes (for public image access)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

### 2. Set Storage Policies

For each bucket, add these policies:

#### Gallery Bucket Policies
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload gallery images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own gallery images" ON storage.objects FOR UPDATE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own gallery images" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
```

#### Invoices Bucket Policies
```sql
-- Allow public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'invoices');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload invoice images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow users to update their own uploads
CREATE POLICY "Users can update own invoice images" ON storage.objects FOR UPDATE USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own invoice images" ON storage.objects FOR DELETE USING (bucket_id = 'invoices' AND auth.role() = 'authenticated');
```

### 3. Environment Variables

Make sure you have these environment variables set in production:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Updated Routes

The following routes have been updated to use Supabase Storage:

- `app/api/gallery/upload-images/route.ts` ✅
- `app/api/invoices/route.ts` ✅
- `app/api/invoices/[id]/route.ts` ✅

## Benefits

✅ **Works in production** - No filesystem dependencies
✅ **Persistent storage** - Images survive deployments
✅ **CDN delivery** - Fast global image delivery
✅ **Automatic backups** - Supabase handles backups
✅ **Scalable** - No storage limits (within your plan)

## Testing

After setup, test image uploads in:
1. Gallery management
2. Invoice creation with attachments
3. Invoice editing with new attachments

## Troubleshooting

If uploads still fail:

1. **Check bucket permissions** - Ensure buckets are public
2. **Verify policies** - Make sure RLS policies allow uploads
3. **Check environment variables** - Ensure service role key is set
4. **Check file size** - Ensure files are under 10MB
5. **Check file type** - Ensure only images are uploaded

## Migration from Local Files

If you have existing local images, you can migrate them to Supabase Storage using the Supabase dashboard or API. 