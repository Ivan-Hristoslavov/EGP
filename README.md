# EGP Aesthetics London 💎

**Premier aesthetic clinic website** - Advanced Next.js application for managing aesthetic treatments, bookings, memberships, and content.

> 🚧 **Project Status:** In active transformation from plumbing services to aesthetics clinic  
> 📅 **Last Updated:** January 8, 2025

---

## 📖 Project Overview

EGP Aesthetics London is a modern, full-featured website for an aesthetic clinic offering:
- 50+ aesthetic treatments (Face, Anti-wrinkle, Fillers, Body)
- 27 condition-specific treatment guides
- Integrated booking system with Google Calendar
- Blog & content management
- Skin membership program
- Awards & press showcase
- Real-time WhatsApp & phone contact

**Design Reference:** Inspired by nofilterclinic.com structure and functionality

---

## 🛠️ Technology Stack

### Core Technologies
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** [Stripe](https://stripe.com/)
- **Email:** [SendGrid](https://sendgrid.com/)
- **Deployment:** [Vercel](https://vercel.com/)

### Integrations
- **Google Calendar API** - Booking management
- **WhatsApp Business** - Quick contact
- **Instagram Graph API** - Social feed
- **YouTube Data API** - Video gallery
- **Rich Text Editor** - Blog CMS

---

## 📂 Project Structure

```
EGP/
├── app/                      # Next.js app directory
│   ├── admin/               # Admin panel routes
│   ├── api/                 # API routes
│   ├── services/            # Treatment pages
│   ├── conditions/          # Condition-based treatment guides
│   ├── blog/                # Blog system
│   ├── membership/          # Membership portal
│   └── page.tsx             # Landing page
│
├── components/              # React components
│   ├── HeaderAesthetics.tsx
│   ├── MegaMenu.tsx
│   ├── ButtonWhatsApp.tsx
│   └── ...
│
├── lib/                     # Utility functions & integrations
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── sendgrid.ts
│   └── google-calendar.ts
│
├── database/               # Database files
│   ├── schema.sql
│   └── migrations/
│
├── docs/                   # Documentation
│   ├── TRANSFORMATION_PLAN.md      # Full implementation plan (100-130h)
│   ├── SERVICES_DATA.md            # All services & conditions data
│   └── QUICK_START_TRANSFORMATION.md
│
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript definitions
└── public/                 # Static assets
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Stripe account
- SendGrid account
- Google Cloud account (for Calendar API)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd EGP
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment variables**

Create `.env.local` file:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email

# Google Calendar
GOOGLE_CALENDAR_API_KEY=your_api_key
GOOGLE_CALENDAR_ID=your_calendar_id

# Site Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=+44XXXXXXXXXX

# Admin
ADMIN_EMAIL=admin@egpaesthetics.co.uk
```

4. **Run database migrations**
```bash
npm run migrate
```

5. **Start development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Key Features

### Public Website
- ✅ Landing page with hero section & CTAs
- ✅ 50+ treatment service pages
- ✅ 27 condition-based guides
- ✅ Booking system with Google Calendar integration
- ✅ Blog with CMS
- ✅ Newsletter signup (10% discount)
- ✅ WhatsApp & phone quick contact
- ✅ Social media integration
- ✅ Awards & press showcase
- ✅ Skin membership program

### Admin Panel
- ✅ Dashboard with analytics
- ✅ Booking management
- ✅ Customer database
- ✅ Services & conditions CRUD
- ✅ Blog post editor
- ✅ Newsletter subscribers
- ✅ Membership management
- ✅ Invoices & payments
- ✅ Settings & profile management

---

## 📚 Documentation

Detailed documentation can be found in the `/docs` folder:

- **[TRANSFORMATION_PLAN.md](./docs/TRANSFORMATION_PLAN.md)** - Complete 20-phase implementation plan
- **[SERVICES_DATA.md](./docs/SERVICES_DATA.md)** - All services, pricing, and conditions
- **[QUICK_START_TRANSFORMATION.md](./docs/QUICK_START_TRANSFORMATION.md)** - Quick reference guide

---

## 🎯 Current Status

### ✅ Completed
- Project cleanup (removed old brand references)
- Database migration fixes
- Detailed planning & documentation
- Services & conditions structure

### 🚧 In Progress
- Awaiting branding materials (logo, images)
- Awaiting contact information finalization
- Database schema redesign

### 📅 Upcoming (Next 6 weeks)
1. **Week 1:** Database & branding foundation
2. **Week 2:** Core pages & navigation
3. **Week 3:** Booking & content systems
4. **Week 4:** Advanced features (membership, blog)
5. **Week 5:** Optimization & testing
6. **Week 6:** Launch preparation & deployment

**Estimated Total:** 100-130 development hours

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run migrate      # Run migrations
npm run db:push      # Push schema changes
npm run db:studio    # Open database GUI

# Testing
npm run test         # Run tests
npm run test:watch   # Watch mode
```

---

## 🌐 Deployment

The application is configured for deployment on Vercel:

1. Push to main branch
2. Vercel auto-deploys
3. Configure environment variables in Vercel dashboard
4. Set up custom domain

**Production URL:** TBD

---

## 🔐 Admin Access

**Default admin credentials:**
- Email: Set during initial setup
- Password: Hashed with bcrypt

**Admin panel URL:** `/admin`

---

## 📞 Support & Contact

For development questions or issues:
- Check `/docs` folder for detailed documentation
- Review TODO list in project management tool

---

## 🎨 Brand Guidelines

**Primary Colors:** TBD (awaiting brand assets)  
**Typography:** TBD  
**Logo:** In progress  

**Design Philosophy:**
- Clean & modern aesthetic
- Medical-grade professionalism
- Easy navigation
- Mobile-first approach
- Fast loading times

---

## 📄 License

Licensed under the [MIT license](./LICENSE).

---

## 🙏 Acknowledgments

- Design inspiration: nofilterclinic.com
- Built with Next.js, Tailwind CSS, and Supabase
- Powered by Vercel

---

**Made with ❤️ for EGP Aesthetics London**
