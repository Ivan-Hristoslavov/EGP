# EGP Aesthetics London - Transformation Plan

## Проектен преглед
Трансформация от водопроводен бизнес към естетична клиника **EGP Aesthetics London**

**Референтен сайт:** nofilterclinic.com

---

## 📋 ФАЗА 1: Анализ и планиране

### Задачи:
1. ✅ Проучване на nofilterclinic.com структура
2. ✅ Дефиниране на нова информационна архитектура
3. ✅ Създаване на детайлен TODO списък

### Времетраене: 1-2 часа

---

## 🗄️ ФАЗА 2: Database Schema Redesign

### Нови таблици за създаване:

#### 2.1. Таблица `service_categories`
```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES service_categories(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  icon_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Категории:**
- Face
- Anti-wrinkle injections
- Fillers
- Body

#### 2.2. Таблица `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES service_categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10,2),
  price_label VARCHAR(100), -- за "from £390", "starting at £199"
  duration INTEGER, -- минути
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  seo_title VARCHAR(255),
  seo_description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.3. Таблица `conditions`
```sql
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'face' или 'body'
  description TEXT,
  detailed_content TEXT,
  image_url TEXT,
  related_services JSONB, -- array от service IDs
  seo_title VARCHAR(255),
  seo_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.4. Таблица `blog_posts`
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_name VARCHAR(255),
  author_image TEXT,
  category VARCHAR(100),
  tags JSONB,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  seo_title VARCHAR(255),
  seo_description TEXT,
  views_count INTEGER DEFAULT 0,
  reading_time INTEGER, -- минути
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.5. Таблица `awards_press`
```sql
CREATE TABLE awards_press (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- 'award' или 'press'
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  description TEXT,
  date DATE,
  image_url TEXT,
  external_link TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.6. Таблица `memberships`
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  benefits JSONB, -- array от benefits
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.7. Таблица `member_subscriptions`
```sql
CREATE TABLE member_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  membership_id UUID REFERENCES memberships(id),
  status VARCHAR(50) DEFAULT 'active', -- active, cancelled, expired
  billing_cycle VARCHAR(20), -- monthly, yearly
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.8. Таблица `newsletter_subscribers`
```sql
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  is_subscribed BOOLEAN DEFAULT TRUE,
  discount_code VARCHAR(50), -- за 10% отстъпка
  discount_used BOOLEAN DEFAULT FALSE,
  source VARCHAR(100), -- откъде се е записал
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.9. Таблица `social_media_links`
```sql
CREATE TABLE social_media_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform VARCHAR(50) NOT NULL, -- instagram, facebook, youtube, tiktok
  url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.10. Таблица `youtube_videos`
```sql
CREATE TABLE youtube_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  youtube_id VARCHAR(50) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category VARCHAR(100),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Миграция файл:
`database/migrations/20250108000000_create_aesthetics_clinic_schema.sql`

### Времетраене: 3-4 часа

---

## 🎨 ФАЗА 3: Брандинг и конфигурация

### 3.1. Актуализиране на `config/site.ts`

```typescript
export const siteConfig = {
  name: "EGP Aesthetics London",
  shortName: "EGP Aesthetics",
  description: "Premier aesthetic clinic in London offering advanced facial treatments, anti-wrinkle injections, dermal fillers, and body contouring",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://egpaesthetics.co.uk",
  
  contact: {
    phone: "+44 XXXX XXXXXX",
    email: "info@egpaesthetics.co.uk",
    whatsapp: "+44XXXXXXXXXX",
    address: "London, UK"
  },
  
  social: {
    instagram: "https://instagram.com/egpaesthetics",
    facebook: "https://facebook.com/egpaesthetics",
    youtube: "https://youtube.com/@egpaesthetics",
    tiktok: "https://tiktok.com/@egpaesthetics"
  },
  
  booking: {
    freeConsultationEnabled: true,
    googleCalendarId: "YOUR_GOOGLE_CALENDAR_ID"
  },
  
  newsletter: {
    welcomeDiscountPercent: 10,
    discountCodePrefix: "WELCOME10"
  }
};
```

### 3.2. Създаване на environment variables

Актуализиране на `.env.local`:
```
# Google Calendar Integration
GOOGLE_CALENDAR_API_KEY=
GOOGLE_CALENDAR_ID=

# WhatsApp Business
NEXT_PUBLIC_WHATSAPP_NUMBER=+44XXXXXXXXXX

# Newsletter
NEWSLETTER_DISCOUNT_PERCENT=10

# Social Media
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_YOUTUBE_URL=
NEXT_PUBLIC_TIKTOK_URL=
```

### Времетраене: 1-2 часа

---

## 🧭 ФАЗА 4: Navigation & Header

### 4.1. Нов Header компонент - `components/HeaderAesthetics.tsx`

**Структура:**
```
┌─────────────────────────────────────────────────────┐
│  Find Us | info@egp.com | +44 XXX XXXX              │  <- Top Bar
├─────────────────────────────────────────────────────┤
│              [LOGO] EGP Aesthetics London            │  <- Logo Center
├─────────────────────────────────────────────────────┤
│ About | Book Now | By Condition | Blog | etc.       │  <- Main Nav
└─────────────────────────────────────────────────────┘
```

**Features:**
- Fixed top bar с контакти
- Централизирано лого
- Dropdown mega menus
- Responsive mobile menu
- WhatsApp floating button

### 4.2. Navigation Structure

```typescript
const navigation = [
  {
    name: "About",
    href: "/about"
  },
  {
    name: "Book Now",
    megaMenu: {
      sections: [
        {
          title: "Face",
          items: [
            { name: "Free Discovery Consultation", price: "Free", href: "/services/free-consultation" },
            { name: "Digital Skin Analysis", price: "£50", href: "/services/skin-analysis" },
            { name: "PRP", price: "£480", href: "/services/prp" },
            // ... всички останали
          ]
        },
        {
          title: "Anti-wrinkle Injections",
          items: [...]
        },
        {
          title: "Fillers",
          items: [...]
        },
        {
          title: "Body",
          items: [...]
        }
      ]
    }
  },
  {
    name: "By Condition",
    megaMenu: {
      sections: [
        {
          title: "Face Conditions",
          items: [
            { name: "Acne & acne scarring", href: "/conditions/acne" },
            // ... всички face conditions
          ]
        },
        {
          title: "Body Conditions",
          items: [
            { name: "Cellulite", href: "/conditions/cellulite" },
            // ... всички body conditions
          ]
        }
      ]
    }
  },
  {
    name: "Blog",
    href: "/blog"
  },
  {
    name: "Awards/Press",
    href: "/awards-press"
  },
  {
    name: "Skin Membership",
    href: "/membership"
  }
];
```

### Времетраене: 4-5 часа

---

## 📞 ФАЗА 5: Contact & Action Buttons

### 5.1. Компоненти за създаване:

#### `components/ButtonFreeConsultation.tsx`
- Prominent CTA button
- Modal форма за booking
- Integration с Google Calendar

#### `components/ButtonCallNow.tsx` (вече съществува)
- Актуализиране с нов телефон

#### `components/ButtonWhatsApp.tsx`
- Floating WhatsApp button
- Pre-filled message template

#### `components/FloatingActionButtons.tsx`
- Группа от floating buttons (Call, WhatsApp, Book)
- Fixed position на екрана
- Smooth animations

### 5.2. WhatsApp Integration

```typescript
const whatsappMessage = encodeURIComponent(
  "Hi EGP Aesthetics, I would like to book a free consultation."
);
const whatsappLink = `https://wa.me/${siteConfig.contact.whatsapp}?text=${whatsappMessage}`;
```

### Времетраене: 2-3 часа

---

## 📅 ФАЗА 6: Google Calendar Integration

### 6.1. Setup Google Calendar API

**Стъпки:**
1. Създаване на Google Cloud Project
2. Enable Google Calendar API
3. Създаване на OAuth credentials
4. Setup redirect URLs

### 6.2. Booking System

**API Route:** `app/api/calendar/book/route.ts`

```typescript
// Integration с Google Calendar
// Проверка за свободни часове
// Създаване на events
// Изпращане на confirmation email
```

### 6.3. Available Slots Component

`components/CalendarAvailableSlots.tsx`
- Показване на свободни часове
- Date picker
- Time slot selection

### Времетраене: 6-8 часа

---

## 📧 ФАЗА 7: Newsletter System

### 7.1. Newsletter Signup Component

`components/NewsletterSignup.tsx`

**Features:**
- Email input form
- First name (optional)
- Checkbox за terms acceptance
- Success message с discount code
- Integration със SendGrid списъци

### 7.2. Discount Code Generation

**API Route:** `app/api/newsletter/subscribe/route.ts`

```typescript
// Генериране на уникален код: WELCOME10-XXXXX
// Запазване в newsletter_subscribers
// Изпращане на welcome email с код
// Добавяне в SendGrid marketing list
```

### 7.3. Discount Code Validation

**API Route:** `app/api/newsletter/validate-discount/route.ts`

```typescript
// Проверка на кода
// Маркиране като използван при booking
```

### Времетраене: 3-4 часа

---

## 🍔 ФАЗА 8: Mega Menu Implementation

### 8.1. Mega Menu Component

`components/MegaMenu.tsx`

**Features:**
- Multi-column layout
- Categorized services
- Price display
- Images при hover
- Smooth animations
- Mobile-friendly

### 8.2. Desktop Layout
```
┌─────────────────────────────────────────────────────┐
│  Face              Anti-wrinkle      Fillers    Body│
│  ─────             ─────────────     ───────    ────│
│  • Service 1       • Service 1       • Cheek   • Tx│
│    £XXX              £XXX              £XXX      £XX│
│  • Service 2       • Service 2       • Chin        │
│  • Service 3       • Service 3       • Lips        │
└─────────────────────────────────────────────────────┘
```

### 8.3. Mobile Layout
- Accordion style
- Collapsible sections
- Touch-friendly

### Времетраене: 5-6 часа

---

## 💉 ФАЗА 9: Services Pages

### 9.1. Service Template Page

`app/services/[slug]/page.tsx`

**Sections:**
- Hero with service name & price
- Description
- Benefits
- Before/After gallery
- Treatment process
- FAQ specific за услугата
- Related services
- Book Now CTA
- Reviews/Testimonials

### 9.2. Services Listing Pages

`app/services/face/page.tsx`
`app/services/anti-wrinkle/page.tsx`
`app/services/fillers/page.tsx`
`app/services/body/page.tsx`

**Layout:**
- Grid от service cards
- Filtering options
- Sort by price/popularity
- Quick book buttons

### 9.3. Populate Services Data

Script за попълване на всички 50+ услуги:
`scripts/populate-services.js`

### Времетраене: 8-10 часа

---

## 🔍 ФАЗА 10: By Condition Pages

### 10.1. Condition Template Page

`app/conditions/[slug]/page.tsx`

**Sections:**
- Hero с име на condition
- What is it?
- Causes
- Recommended treatments (от services)
- Before/After
- Prevention tips
- Book consultation CTA

### 10.2. Conditions данни

**Face Conditions (13):**
- Acne & acne scarring
- Rosacea
- Hyperpigmentation & melasma
- Barcode lines around lips
- Bruxism
- Dark under-eye circles
- Double chin
- Nasolabial folds
- Shadows around nasolabial folds
- Under-eye hollows
- Eye bags
- Flat cheeks
- Flat/pebble chin

**Body Conditions (10):**
- Cellulite
- Stubborn belly fat
- Love handles
- Sagging skin
- Stretch marks
- Arm fat & bingo wings
- Thigh fat
- Double chin/jawline fat
- Post-pregnancy tummy
- Water retention/bloating

### 10.3. Script за попълване
`scripts/populate-conditions.js`

### Времетраене: 6-8 часа

---

## 📝 ФАЗА 11: Blog System

### 11.1. Blog Listing Page

`app/blog/page.tsx`

**Features:**
- Grid layout на статии
- Featured post
- Categories filter
- Search functionality
- Pagination
- Related articles sidebar

### 11.2. Blog Post Page

`app/blog/[slug]/page.tsx`

**Sections:**
- Featured image
- Title & meta (author, date, reading time)
- Content (markdown/rich text)
- Table of contents
- Social share buttons
- Comments (optional)
- Related articles

### 11.3. Blog Admin Panel

`app/admin/blog/page.tsx`

**Features:**
- WYSIWYG editor (React Quill or similar)
- Image upload
- SEO fields
- Publish/Draft status
- Preview functionality

### 11.4. Blog API Routes

```
/api/blog/route.ts - GET (list), POST (create)
/api/blog/[id]/route.ts - GET, PUT, DELETE
```

### Времетраене: 6-8 часа

---

## 🏆 ФАЗА 12: Awards & Press

### 12.1. Awards/Press Page

`app/awards-press/page.tsx`

**Layout:**
- Tabs за Awards / Press
- Timeline layout
- Logo/Image showcase
- External links
- Filtriране по година

### 12.2. Admin Management

`app/admin/awards-press/page.tsx`

- Add/Edit/Delete awards
- Upload logos/images
- Set featured items
- Reorder items

### Времетраене: 3-4 часа

---

## 💎 ФАЗА 13: Skin Membership System

### 13.1. Membership Page

`app/membership/page.tsx`

**Features:**
- Pricing plans display
- Monthly vs Yearly toggle
- Benefits comparison table
- Testimonials
- FAQ
- Sign up CTA

### 13.2. Membership Signup Flow

`app/membership/signup/page.tsx`

**Steps:**
1. Choose plan
2. Create account / Login
3. Payment (Stripe)
4. Confirmation
5. Member portal access

### 13.3. Member Portal

`app/member-portal/page.tsx`

**Features:**
- Subscription status
- Booking history
- Special member pricing
- Cancel/Upgrade options

### 13.4. Stripe Subscription Integration

`lib/stripe-subscriptions.ts`

- Create subscription
- Update subscription
- Cancel subscription
- Handle webhooks

### Времетраене: 8-10 часа

---

## 🎬 ФАЗА 14: Media Integration

### 14.1. Social Media Links Component

`components/SocialMediaLinks.tsx`

- Instagram feed widget
- Facebook page plugin
- YouTube channel link
- TikTok profile link

### 14.2. YouTube Videos Section

`components/YouTubeVideosSection.tsx`

**Features:**
- Featured videos grid
- Modal video player
- Categories filter
- Playlist integration

### 14.3. Instagram Feed

Integration с Instagram Graph API:
- Display recent posts
- Clickable to open on Instagram
- Hashtag display

### 14.4. Admin для Media

`app/admin/media/page.tsx`

- Add YouTube video IDs
- Update social media links
- Feature videos

### Времетраене: 4-5 часа

---

## 🎨 ФАЗА 15: Landing Page Redesign

### 15.1. New Homepage Structure

`app/page.tsx`

**Sections:**

1. **Hero Section**
   - Full-screen background image/video
   - Main headline: "Transform Your Natural Beauty"
   - Subheadline
   - Free Consultation CTA
   - Quick contact buttons (Call, WhatsApp)

2. **Featured Services Carousel**
   - Sliding cards с top услуги
   - Images + prices
   - Quick book buttons

3. **Why Choose Us Section**
   - Trust indicators
   - Years of experience
   - Number of treatments
   - Client satisfaction
   - Certifications

4. **By Condition Section**
   - "Not sure what treatment you need?"
   - Grid от popular conditions
   - Click to learn more

5. **Before/After Gallery**
   - Slider с реални резултати
   - Filter by treatment type

6. **Awards & Press Badges**
   - Logo showcase на awards
   - Press mentions

7. **Testimonials/Reviews**
   - Carousel със отзиви
   - Star ratings
   - Photos (optional)

8. **Blog Preview**
   - Latest 3 articles
   - Link to blog

9. **Membership CTA**
   - "Join our Skin Membership"
   - Benefits highlights
   - Special offer

10. **Newsletter Signup**
    - "Get 10% off your first visit"
    - Email form
    - Large, prominent section

11. **Location & Contact**
    - Google Map embed
    - Address
    - Opening hours
    - Contact info

12. **Social Media Feed**
    - Instagram gallery
    - YouTube videos
    - Social links

### 15.2. Hero Variations

- Video background option
- Image carousel
- Split screen (image + form)

### 15.3. Animations

- Smooth scroll animations
- Fade-in effects
- Parallax backgrounds
- Hover effects

### Времетраене: 8-10 часа

---

## 🔐 ФАЗА 16: Admin Panel Updates

### 16.1. New Admin Sections

Актуализиране на `app/admin/layout.tsx` navigation:

```typescript
const adminNavigation = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Bookings", href: "/admin/bookings" },
  { name: "Customers", href: "/admin/customers" },
  // NEW:
  { name: "Services", href: "/admin/services" },
  { name: "Conditions", href: "/admin/conditions" },
  { name: "Blog", href: "/admin/blog" },
  { name: "Awards/Press", href: "/admin/awards-press" },
  { name: "Memberships", href: "/admin/memberships" },
  { name: "Newsletter", href: "/admin/newsletter" },
  { name: "Media", href: "/admin/media" },
  // EXISTING:
  { name: "Invoices", href: "/admin/invoices" },
  { name: "Profile", href: "/admin/profile" },
  { name: "Settings", href: "/admin/settings" }
];
```

### 16.2. Admin Pages за създаване:

1. **Services Manager** - `app/admin/services/page.tsx`
   - List, Add, Edit, Delete services
   - Manage categories
   - Set prices
   - Upload images

2. **Conditions Manager** - `app/admin/conditions/page.tsx`
   - List, Add, Edit, Delete conditions
   - Link to services
   - Manage content

3. **Blog Manager** - `app/admin/blog/page.tsx`
   - Create/Edit posts
   - WYSIWYG editor
   - Publish/Draft status

4. **Awards/Press Manager** - `app/admin/awards-press/page.tsx`
   - Add awards
   - Upload images
   - Set display order

5. **Membership Manager** - `app/admin/memberships/page.tsx`
   - Create plans
   - Set pricing
   - Manage subscribers

6. **Newsletter Manager** - `app/admin/newsletter/page.tsx`
   - View subscribers
   - Export list
   - Send campaigns (optional)
   - Track discount code usage

7. **Media Manager** - `app/admin/media/page.tsx`
   - Add YouTube videos
   - Update social links
   - Upload images for gallery

### Времетраене: 12-15 часа

---

## 📱 ФАЗА 17: Responsive Design

### 17.1. Mobile Optimization

**Priority breakpoints:**
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

### 17.2. Mobile-specific components:

- Hamburger menu
- Mobile mega menu (accordion)
- Touch-friendly buttons (min 44x44px)
- Simplified forms
- Bottom navigation bar (optional)

### 17.3. Testing

- iPhone SE
- iPhone 12/13/14
- Samsung Galaxy
- iPad
- Desktop различни резолюции

### Времетраене: 6-8 часа

---

## 🚀 ФАЗА 18: SEO Optimization

### 18.1. On-Page SEO

**Всяка страница трябва:**
- Уникален title tag
- Meta description
- H1 tag
- Structured data (JSON-LD)
- Alt text за images
- Canonical URLs
- Open Graph tags
- Twitter Cards

### 18.2. Keywords Research

**Target keywords:**
- aesthetic clinic london
- botox london
- dermal fillers london
- anti-wrinkle injections
- skin treatments london
- [specific treatments] + london
- [conditions] + treatment london

### 18.3. Technical SEO

- sitemap.xml актуализиране
- robots.txt
- Page speed optimization
- Image optimization (WebP)
- Lazy loading
- Core Web Vitals

### 18.4. Local SEO

- Google Business Profile setup
- Local schema markup
- NAP consistency
- Local citations

### Времетраене: 4-6 часа

---

## ✅ ФАЗА 19: Testing

### 19.1. Functional Testing

**Checklists:**

- [ ] Всички връзки работят
- [ ] Форми submit correctly
- [ ] Booking system works
- [ ] Google Calendar integration
- [ ] WhatsApp link opens correctly
- [ ] Newsletter signup works
- [ ] Discount codes generate & validate
- [ ] Payment processing (Stripe)
- [ ] Email notifications send
- [ ] Admin panel CRUD operations
- [ ] Image uploads work
- [ ] Search functionality
- [ ] Filters work correctly

### 19.2. Cross-Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

### 19.3. Performance Testing

- [ ] Lighthouse score > 90
- [ ] Page load time < 3s
- [ ] No console errors
- [ ] Proper caching
- [ ] Optimized images

### 19.4. Security Testing

- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Rate limiting
- [ ] Secure cookies
- [ ] HTTPS everywhere

### 19.5. User Acceptance Testing

- [ ] Stakeholder review
- [ ] Real user testing
- [ ] Feedback collection
- [ ] Bug fixes

### Времетраене: 6-8 часа

---

## 📚 ФАЗА 20: Documentation

### 20.1. Technical Documentation

**Documents за създаване:**

1. **ARCHITECTURE.md**
   - System overview
   - Database schema
   - API routes
   - Component structure

2. **API_DOCUMENTATION.md**
   - All endpoints
   - Request/Response examples
   - Authentication
   - Error codes

3. **ADMIN_GUIDE.md**
   - How to manage services
   - How to create blog posts
   - How to manage bookings
   - How to view analytics

4. **DEPLOYMENT.md**
   - Environment variables
   - Database setup
   - Deployment steps
   - CI/CD pipeline

5. **MAINTENANCE.md**
   - Backup procedures
   - Update procedures
   - Monitoring
   - Troubleshooting

### 20.2. User Documentation

1. **Booking Guide** - For clients
2. **Membership Guide** - For members
3. **FAQ** - Common questions

### Времетраене: 4-5 часа

---

## 📊 TOTAL ESTIMATED TIME

| Phase | Hours |
|-------|-------|
| 1. Analysis | 1-2 |
| 2. Database | 3-4 |
| 3. Branding | 1-2 |
| 4. Navigation | 4-5 |
| 5. Contact Buttons | 2-3 |
| 6. Google Calendar | 6-8 |
| 7. Newsletter | 3-4 |
| 8. Mega Menu | 5-6 |
| 9. Services Pages | 8-10 |
| 10. Conditions | 6-8 |
| 11. Blog | 6-8 |
| 12. Awards | 3-4 |
| 13. Membership | 8-10 |
| 14. Media | 4-5 |
| 15. Landing Page | 8-10 |
| 16. Admin Panel | 12-15 |
| 17. Responsive | 6-8 |
| 18. SEO | 4-6 |
| 19. Testing | 6-8 |
| 20. Documentation | 4-5 |
| **TOTAL** | **100-130 hours** |

---

## 🎯 ПРИОРИТЕТИ

### High Priority (Week 1-2):
1. Database schema
2. Navigation & Header
3. Landing page redesign
4. Services pages
5. Booking system basics

### Medium Priority (Week 3-4):
6. By Condition pages
7. Newsletter system
8. Blog system
9. Admin panel updates
10. Responsive design

### Lower Priority (Week 5+):
11. Membership system
12. Awards/Press
13. Advanced features
14. Full testing
15. Documentation

---

## 📝 NOTES

### Next Steps:
1. ✅ Чакаме снимки от WeTransfer
2. Получаваме Google Calendar credentials
3. Финализираме exact contact info (phone, email, WhatsApp)
4. Получаваме реални данни за услуги (ако има промени в цените)
5. Лого файл (SVG, PNG)
6. Brand colors & fonts
7. Съществуващи social media profiles URLs

### Questions to Ask:
- Да използваме ли existing Stripe account?
- Booking approval процес - automatic или manual?
- Working hours за календара?
- Cancellation policy?
- Deposit required при booking?
- Email templates дизайн?

---

## 🔧 ТЕХНИЧЕСКИ STACK (Existing)

- **Framework:** Next.js 14
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + DaisyUI
- **Payments:** Stripe
- **Email:** SendGrid
- **Authentication:** Supabase Auth
- **Image Storage:** Supabase Storage
- **Deployment:** Vercel

### New Integrations Needed:
- Google Calendar API
- WhatsApp Business API (optional)
- Instagram Graph API
- YouTube Data API
- Rich Text Editor (React Quill / Tiptap)

---

## ✨ END OF PLAN

**Ready to start implementation! 🚀**

Първата стъпка е получаване на снимките и брандинг материали, след което можем да започнем с ФАЗА 2 (Database).

