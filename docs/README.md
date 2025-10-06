# 📁 Project Structure Documentation

## 🗂️ **Organized File Structure**

### **Root Directory**
```
Plumbe-2/
├── app/                    # Next.js App Router
├── components/             # React Components
├── database/              # Database Files
├── docs/                  # Documentation
├── hooks/                 # Custom React Hooks
├── lib/                   # Utility Libraries
├── scripts/               # Build & Deployment Scripts
├── supabase/              # Supabase Configuration
├── types/                 # TypeScript Types
└── public/                # Static Assets
```

## 📊 **Database Structure**

### **`database/` Directory**
```
database/
├── migrations/            # Database Migration Files
│   ├── 20250617*.sql     # Initial schema migrations
│   ├── 20250618*.sql     # Day-off settings
│   ├── 20250626*.sql     # Admin profile & areas
│   └── 20250705*.sql     # Admin profile fields
├── fixes/                 # Database Fix Scripts
│   ├── complete-schema.sql
│   ├── complete-database-fix.sql
│   └── reset-database.sql
└── backups/               # Database Backups
    └── database_backup_*.sql
```

### **Active Database Tables**
- ✅ `admin_profile` - Admin user information
- ✅ `admin_settings` - System configuration
- ✅ `customers` - Customer data
- ✅ `bookings` - Booking records
- ✅ `payments` - Payment transactions
- ✅ `invoices` - Invoice management
- ✅ `gallery` - Image gallery
- ✅ `gallery_sections` - Gallery categories
- ✅ `reviews` - Customer reviews
- ✅ `faq` - FAQ management
- ✅ `services` - Service offerings
- ✅ `admin_areas_cover` - Service areas
- ✅ `day_off_periods` - Business hours
- ✅ `pricing_cards` - Pricing information
- ✅ `activity_log` - System activity

## 📚 **Documentation Structure**

### **`docs/` Directory**
```
docs/
├── database/              # Database Documentation
│   ├── DATABASE_SYNC_FIXES_SUMMARY.md
│   ├── database-consistency-analysis.md
│   ├── SCHEMA_SYNC_ANALYSIS.md
│   └── FIXED_ISSUES_SUMMARY.md
├── deployment/            # Deployment Guides
│   └── DEPLOYMENT.md
├── features/              # Feature Documentation
│   ├── PAYMENT_LINK_*.md
│   ├── EMAIL_NOTIFICATIONS_SUMMARY.md
│   ├── STRIPE_*.md
│   ├── SUPABASE_*.md
│   ├── GOOGLE_CALENDAR_SETUP.md
│   ├── LEGAL_CONTENT_SUMMARY.md
│   ├── REGISTRATION_NUMBER_USAGE.md
│   └── SYSTEM_IMPROVEMENTS_SUMMARY.md
└── setup/                 # Setup Guides
    └── SETUP.md
```

## 🔧 **Key Features**

### **✅ Working Features**
- **Customer Management** - Full CRUD operations
- **Booking System** - Appointment scheduling
- **Payment Processing** - Stripe integration
- **Invoice Generation** - PDF creation & emailing
- **Gallery Management** - Image upload & organization
- **Review System** - Customer feedback
- **Admin Dashboard** - Complete admin panel
- **Email Notifications** - SendGrid integration
- **Day-off Management** - Business hours control
- **Service Areas** - Geographic coverage
- **Legal Content** - Terms & Privacy pages

### **🔧 Technical Stack**
- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Email**: SendGrid
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## 🚀 **Quick Start**

### **1. Environment Setup**
```bash
cp env-template.txt .env.local
# Fill in your environment variables
```

### **2. Database Setup**
```bash
# Apply migrations
npx supabase db push
```

### **3. Development**
```bash
npm install
npm run dev
```

### **4. Production**
```bash
npm run build
npm start
```

## 📋 **Database Migrations**

### **Current Active Migrations**
1. `20250617120102_initial_schema.sql` - Base schema
2. `20250617140000_create_complete_admin_system.sql` - Admin system
3. `20250626190000_create_admin_areas_cover.sql` - Service areas
4. `20250705203010_add_admin_profile_fields.sql` - Profile fields

### **Important Fix Scripts**
- `complete-schema.sql` - Full database schema
- `complete-database-fix.sql` - Database consistency fixes
- `reset-database.sql` - Reset database (use carefully)

## 🎯 **Admin Access**

### **Default Admin Credentials**
- **Email**: `admin@fixmyleak.com`
- **Password**: Set in environment variables
- **URL**: `/admin/login`

### **Key Admin Features**
- Customer management
- Booking oversight
- Payment tracking
- Invoice generation
- Gallery management
- Review moderation
- System settings

## 🔒 **Security Features**

### **Database Security**
- Row Level Security (RLS) enabled
- Proper authentication policies
- Secure API endpoints
- Environment variable protection

### **Payment Security**
- Stripe secure processing
- No card data storage
- Webhook verification
- SSL encryption

## 📞 **Support**

For technical issues:
1. Check database migrations
2. Verify environment variables
3. Review error logs
4. Test in development first

---

**Last Updated**: August 2024
**Version**: 2.0.0
**Status**: Production Ready ✅ 