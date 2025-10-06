# Schema Synchronization Analysis

## Database Schema vs Types vs APIs - Missing Fields Analysis

### 1. ADMIN_PROFILE Table
**Database Fields:**
- id, name, email, phone, password, company_name, company_address, about
- bank_name, account_number, sort_code, gas_safe_number, insurance_provider
- created_at, updated_at

**Missing in Types:** 
- ❌ `password` field missing from AdminProfile type
- ❌ `years_of_experience`, `specializations`, `certifications`, `service_areas`, `response_time` fields exist in type but NOT in database
- ❌ `terms_and_conditions`, `privacy_policy` fields exist in type but NOT in database

### 2. GALLERY Table  
**Database Fields:**
- id, section_id, title, description, image_url, alt_text, order, is_active, created_at, updated_at

**Issues:**
- ❌ Database has `image_url` but types expect `before_image_url` and `after_image_url`
- ❌ Missing: `project_type`, `location`, `completion_date`, `is_featured`, `admin_id`
- ❌ API tries to save `before_image_url`, `after_image_url` but database expects `image_url`

### 3. GALLERY_SECTIONS Table
**Database Fields:**
- id, title, description, order, is_active, created_at, updated_at

**Issues:**
- ❌ Missing: `admin_id`, `color` fields (referenced in types and components)

### 4. REVIEWS Table
**Database Fields:**
- id, customer_name, customer_email, rating, title, comment, is_approved, is_featured, created_at, updated_at

**Issues:**
- ✅ Mostly aligned, but type uses `name` and `email` while database uses `customer_name` and `customer_email`
- ❌ Type uses `message` but database uses `comment`

### 5. FAQ Table
**Database Fields:**
- id, question, answer, category, order, is_active, created_at, updated_at

**Issues:**
- ✅ Properly aligned

### 6. SERVICES Table
**Database Fields:**
- id, name, description, price, duration_minutes, is_active, category, order, created_at, updated_at

**Issues:**
- ✅ Properly aligned

### 7. ADMIN_AREAS_COVER Table
**Database Fields:**
- id, area_name, description, is_active, order, created_at, updated_at

**Issues:**
- ❌ Type expects `name` but database has `area_name`
- ❌ Missing `slug` field in database (used in components)

### 8. PRICING_CARDS Table
**Database Fields:**
- id, admin_id, title, subtitle, table_rows, table_headers, notes, order, created_at, updated_at

**Issues:**
- ✅ Properly aligned

## Critical Fixes Needed:

### A. Database Schema Updates Required:
1. **admin_profile**: Add missing fields for legal content
2. **gallery**: Fix image fields and add missing project fields  
3. **gallery_sections**: Add admin_id and color fields
4. **admin_areas_cover**: Add slug field
5. **reviews**: Align field names

### B. Type Updates Required:
1. **AdminProfile**: Remove non-existent fields, add password
2. **Review**: Align field names with database
3. **GalleryItem**: Already fixed in previous update

### C. API Updates Required:
1. **Gallery API**: Handle correct image field names
2. **Reviews API**: Use correct field names
3. **Areas API**: Handle area_name vs name

## Priority Order:
1. 🔥 HIGH: Gallery table schema (breaks gallery functionality)
2. 🔥 HIGH: Admin profile legal fields (breaks terms/privacy pages)
3. 🟡 MEDIUM: Reviews field alignment
4. 🟡 MEDIUM: Areas slug field
5. 🟢 LOW: Gallery sections color/admin_id fields 