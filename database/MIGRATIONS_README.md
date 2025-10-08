# Database Migrations Guide

## 📋 Overview

Този проект използва PostgreSQL migrations за управление на database schema. Миграциите са организирани хронологично и всяка се изпълнява веднъж.

---

## 🎯 Current Status

### ✅ **ACTIVE MIGRATION** (Use This One!)

**File:** `20250108000000_complete_database_schema.sql`

**Description:** Пълна, консолидирана database schema с всички таблици, indexes, triggers и функции.

**Contains:**
- All 19 tables
- All indexes for performance
- All triggers (updated_at, activity_log)
- All functions (invoice numbering, customer deletion)
- All views (dashboard_stats)
- Row Level Security policies
- Proper foreign key constraints

**Status:** ✅ Clean skeleton, ready for production

---

## 📜 Migration History

All previous migrations have been consolidated into a single, clean schema file. The legacy migrations from the plumbing services version have been **removed** and consolidated.

### Migration Consolidation

**Previous migrations (14 files)** → **Current migration (1 file)**

All historical migrations have been merged into:
- ✅ `20250108000000_complete_database_schema.sql`

This includes all features from legacy migrations:
- Initial schema setup
- Admin authentication & password security
- Customers, payments, invoices system
- Day off periods & settings
- Activity logging
- Content management (services, gallery, reviews, FAQ)
- Service areas
- Legal documents (terms, privacy)
- All indexes, triggers, functions, and views

**Result:** Clean, consolidated database schema ready for production

---

## 🚀 How to Use (Fresh Installation)

### Option 1: New Project Setup (Recommended)

```bash
# 1. Create new Supabase project or PostgreSQL database
# 2. Run the complete schema migration
psql -U your_user -d your_database -f database/migrations/20250108000000_complete_database_schema.sql
```

### Option 2: Using Supabase CLI

```bash
# Initialize Supabase (if not done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Apply migration
supabase db push
```

### Option 3: Using Node.js script

```bash
# Run migration script (if you create one)
npm run migrate
```

---

## 📊 Database Schema Overview

### Core Tables (8)
1. **admin_profile** - Admin/practitioner information
2. **admin_settings** - Application settings (JSONB)
3. **customers** - Customer database
4. **bookings** - Appointments/treatments
5. **payments** - Payment records
6. **invoices** - Invoice management
7. **day_off_periods** - Clinic closures
8. **activity_log** - Audit trail

### Content Tables (6)
9. **services** - Treatment services
10. **pricing_cards** - Pricing display
11. **gallery_sections** - Gallery categories
12. **gallery** - Before/after photos
13. **reviews** - Customer testimonials
14. **faq** - FAQs

### Location & Legal (5)
15. **admin_areas_cover** - Service areas
16. **terms** - Terms & Conditions
17. **privacy_policy** - Privacy Policy
18. **site_guidance** - Site content
19. **vat_settings** - VAT configuration

---

## 🔄 Future Migrations (Aesthetics Clinic)

Следващите миграции за трансформацията към aesthetics clinic:

### Planned:
- [ ] `20250108100000_create_aesthetics_tables.sql` - Service categories, conditions, etc.
- [ ] `20250108110000_create_blog_system.sql` - Blog posts and categories
- [ ] `20250108120000_create_membership_system.sql` - Membership plans
- [ ] `20250108130000_create_newsletter_system.sql` - Newsletter subscribers
- [ ] `20250108140000_create_social_media_tables.sql` - YouTube, Instagram integration

---

## ⚙️ Migration Strategy

### For Existing Production Database:

If you have an existing database from the old migrations:

1. **Backup first!**
   ```bash
   pg_dump -U user -d database > backup_$(date +%Y%m%d).sql
   ```

2. **Option A: Fresh Start (Recommended for transformation)**
   - Drop existing database
   - Create new database
   - Run `20250108000000_complete_database_schema.sql`

3. **Option B: Incremental Migration (If you have important data)**
   - Export existing data
   - Apply new schema
   - Import data with transformations

---

## 🛠️ Utility Scripts

### Check Current Schema Version

```sql
-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

### Verify All Triggers

```sql
-- List all triggers
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Check Foreign Key Constraints

```sql
-- List all foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

---

## 🔐 Security & RLS

Row Level Security (RLS) е enabled на всички таблици, но с permissive policies (`USING (true)`).

**TODO:** Update policies based on authentication:
```sql
-- Example: Restrict admin_profile to authenticated admins only
DROP POLICY "Allow all operations on admin_profile" ON admin_profile;

CREATE POLICY "Admin can manage own profile" 
  ON admin_profile 
  FOR ALL 
  USING (auth.uid() = id);
```

---

## 📝 Adding New Migrations

1. **Create new migration file:**
   ```
   database/migrations/YYYYMMDDHHMMSS_description.sql
   ```

2. **Follow naming convention:**
   - Timestamp: `YYYYMMDDHHMMSS`
   - Description: `snake_case`
   - Example: `20250108150000_add_service_categories.sql`

3. **Migration template:**
   ```sql
   -- Migration: Add [feature name]
   -- Created: YYYY-MM-DD
   -- Description: [What this migration does]
   
   -- Add your changes here
   CREATE TABLE IF NOT EXISTS new_table (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     -- ... columns
   );
   
   -- Add indexes
   CREATE INDEX IF NOT EXISTS idx_new_table_field ON new_table(field);
   
   -- Add triggers if needed
   CREATE TRIGGER update_new_table_updated_at 
     BEFORE UPDATE ON new_table 
     FOR EACH ROW 
     EXECUTE FUNCTION update_updated_at_column();
   ```

4. **Test migration:**
   - Test on development database first
   - Verify no breaking changes
   - Check all constraints work

---

## 🐛 Troubleshooting

### Issue: "relation already exists"
```sql
-- Use IF NOT EXISTS or IF EXISTS clauses
CREATE TABLE IF NOT EXISTS my_table ...
DROP TABLE IF EXISTS my_table;
```

### Issue: "cannot drop table because other objects depend on it"
```sql
-- Use CASCADE carefully
DROP TABLE my_table CASCADE;
```

### Issue: Foreign key constraint violation
```sql
-- Check what's referencing the table
SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'your_table';
```

### Issue: Trigger not firing
```sql
-- Check trigger exists and is enabled
SELECT * FROM pg_trigger WHERE tgname = 'your_trigger_name';
```

---

## 📚 References

- [PostgreSQL Migrations Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- [Supabase Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Migration Checklist

Before running migrations in production:

- [ ] Backup database
- [ ] Test on development/staging
- [ ] Review all SQL statements
- [ ] Check for breaking changes
- [ ] Verify foreign key constraints
- [ ] Test rollback procedure (if needed)
- [ ] Update documentation
- [ ] Notify team of downtime (if any)

---

**Last Updated:** January 8, 2025  
**Current Schema Version:** `20250108000000`  
**Next Migration:** Aesthetics clinic tables (planned)

