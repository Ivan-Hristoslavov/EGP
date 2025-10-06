# Next.js Skeleton Template

A comprehensive Next.js 15 template with full-stack features for building modern web applications.

## 🚀 Features Included

### **Frontend Framework**
- Next.js 15 with App Router
- TypeScript support
- Tailwind CSS + DaisyUI
- Framer Motion animations
- Next Themes (dark/light mode)

### **Backend & Database**
- Supabase integration
- PostgreSQL database
- Real-time subscriptions
- Row Level Security (RLS)
- Database migrations

### **Authentication & Security**
- Supabase Auth
- Google OAuth integration
- Protected routes
- Role-based access control

### **Payment Processing**
- Stripe integration
- Payment links
- Webhook handling
- Invoice generation

### **Email & Communication**
- SendGrid integration
- Email templates
- PDF generation (jsPDF)
- Invoice emailing

### **File Management**
- Supabase Storage
- Image upload/compression
- File validation
- Image optimization with Sharp

### **Admin Dashboard**
- Complete admin panel
- Customer management
- Booking system
- Invoice management
- Settings configuration

### **SEO & Performance**
- Meta tags optimization
- Sitemap generation
- Robots.txt
- Favicon management
- Image optimization

### **Development Tools**
- ESLint configuration
- Prettier formatting
- TypeScript strict mode
- Hot reloading

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── areas/             # Service areas pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript types
├── config/               # Configuration files
├── supabase/             # Database migrations
└── public/               # Static assets
```

## 🛠️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ivan-Hristoslavov/Nextjs-skeleton.git
   cd Nextjs-skeleton
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env-template.txt .env.local
   # Fill in your environment variables
   ```

4. **Database setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start development**
   ```bash
   npm run dev
   ```

## 🔧 Key Configurations

### **Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SENDGRID_API_KEY`

### **Database Schema**
- Users and authentication
- Customers and bookings
- Invoices and payments
- Admin settings
- Gallery and reviews

### **Features Ready to Use**
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Payment processing
- ✅ Email notifications
- ✅ File uploads
- ✅ Image compression
- ✅ SEO optimization
- ✅ Responsive design

## 🎯 Use Cases

This skeleton is perfect for:
- E-commerce platforms
- Service booking websites
- Admin dashboards
- Business management systems
- Content management systems

## 📝 Customization

1. **Branding**: Update colors, fonts, and logos
2. **Features**: Add/remove components as needed
3. **Database**: Modify schema for your requirements
4. **Styling**: Customize Tailwind/DaisyUI themes

## 🚀 Deployment

Ready for deployment on:
- Vercel (recommended)
- Netlify
- Railway
- Any Node.js hosting

## 📄 License

This template is provided as-is for educational and commercial use.

---

**Note**: This is a production-ready skeleton with all major features implemented. Remove unused features and customize according to your project needs. 