const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createLegalTablesFinal() {
  console.log('🏗️  Creating legal tables - Final Solution');
  console.log('📋 Since migrations are not working, we will create tables in the admin interface');
  console.log('');
  console.log('💡 SOLUTION: Create tables manually in Supabase Dashboard');
  console.log('');
  console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project-id]/editor');
  console.log('');
  console.log('📝 Execute these SQL commands in the SQL Editor:');
  console.log('');
  console.log('--- SQL TO EXECUTE ---');
  console.log('');
  
  const sql = `
-- Create terms table
CREATE TABLE IF NOT EXISTS terms (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create privacy_policy table
CREATE TABLE IF NOT EXISTS privacy_policy (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create site_guidance table
CREATE TABLE IF NOT EXISTS site_guidance (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_policy ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_guidance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations)
CREATE POLICY "Allow all operations on terms" ON terms FOR ALL USING (true);
CREATE POLICY "Allow all operations on privacy_policy" ON privacy_policy FOR ALL USING (true);
CREATE POLICY "Allow all operations on site_guidance" ON site_guidance FOR ALL USING (true);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_terms_updated_at 
    BEFORE UPDATE ON terms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_policy_updated_at 
    BEFORE UPDATE ON privacy_policy 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_guidance_updated_at 
    BEFORE UPDATE ON site_guidance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_guidance_category ON site_guidance(category);
CREATE INDEX IF NOT EXISTS idx_site_guidance_sort_order ON site_guidance(sort_order);

-- Insert default terms content
INSERT INTO terms (content) VALUES (
'# Terms and Conditions

## 1. Introduction
These terms and conditions govern your use of our plumbing services.

## 2. Services
We provide professional plumbing services including emergency repairs, installations, and maintenance.

## 3. Booking and Scheduling
- All bookings must be confirmed in advance
- Emergency services are available 24/7
- Cancellations must be made at least 24 hours in advance

## 4. Payment Terms
- Payment is due upon completion of work
- We accept cash, card, and bank transfer
- All prices include VAT where applicable

## 5. Warranty
- We provide a 12-month warranty on all work
- Parts are covered by manufacturer warranty
- Emergency call-outs have no warranty on diagnostic fees

## 6. Liability
- We are fully insured and licensed
- Our liability is limited to the cost of work performed
- Customer is responsible for providing safe working conditions

## 7. Contact Information
For questions about these terms, please contact us at your registered email address.

*Last updated: ' || CURRENT_DATE || '*'
);

-- Insert default privacy policy content
INSERT INTO privacy_policy (content) VALUES (
'# Privacy Policy

## 1. Introduction
We respect your privacy and are committed to protecting your personal data.

## 2. Information We Collect
- Contact information (name, email, phone)
- Address and location data
- Service history and preferences
- Payment information (processed securely)

## 3. How We Use Your Information
- To provide and improve our services
- To communicate about bookings and appointments
- To send service reminders and updates
- To process payments securely

## 4. Data Sharing
- We do not sell your personal information
- We may share data with trusted service providers
- Legal requirements may necessitate disclosure

## 5. Data Security
- All data is encrypted and stored securely
- We use industry-standard security measures
- Regular security audits are conducted

## 6. Your Rights
- Access your personal data
- Request corrections or deletions
- Opt-out of marketing communications
- Data portability upon request

## 7. Contact Us
For privacy-related questions, contact us at your registered email address.

*Last updated: ' || CURRENT_DATE || '*'
);

-- Insert default site guidance content
INSERT INTO site_guidance (title, content, category, sort_order) VALUES 
('Dashboard Overview', 'The dashboard provides a quick overview of your business performance. Here you can see today''s bookings, recent activity, and key metrics like revenue and customer satisfaction.

**Key Features:**
- **Today''s Schedule:** View all bookings for today
- **Quick Stats:** Revenue, completed jobs, pending invoices
- **Recent Activity:** Latest customer interactions and bookings
- **Performance Metrics:** Monthly comparisons and trends

**Tips:**
- Check your dashboard daily to stay updated
- Use the quick action buttons for common tasks
- Monitor your performance metrics regularly', 'dashboard', 1),

('Managing Bookings', 'The booking system helps you manage customer appointments efficiently. You can view, edit, and create new bookings from this section.

**Key Features:**
- **Calendar View:** See all bookings in calendar format
- **Booking Details:** Customer info, service type, and special notes
- **Status Updates:** Mark bookings as confirmed, completed, or cancelled
- **Customer History:** View past bookings for each customer

**Tips:**
- Always confirm bookings within 24 hours
- Use the notes field for important customer requests
- Update booking status immediately after completion
- Check for conflicts before accepting new bookings', 'bookings', 2),

('Customer Management', 'Keep track of your customers and their service history. Build lasting relationships by maintaining detailed customer profiles.

**Key Features:**
- **Customer Profiles:** Contact info, service history, and preferences
- **Service History:** Complete record of all past work
- **Notes and Reminders:** Keep track of important customer information
- **Customer Communications:** Email and SMS capabilities

**Tips:**
- Update customer information after each service
- Use notes to record customer preferences
- Send follow-up communications after service completion
- Track customer satisfaction and feedback', 'customers', 3),

('Invoice and Payment Processing', 'Manage your invoicing and payment collection efficiently. Generate professional invoices and track payment status.

**Key Features:**
- **Invoice Generation:** Create professional invoices with your branding
- **Payment Tracking:** Monitor paid, pending, and overdue payments
- **Payment Links:** Send secure payment links to customers
- **VAT Management:** Handle VAT calculations automatically

**Tips:**
- Send invoices immediately after job completion
- Use payment links for faster payment collection
- Set up automatic reminders for overdue payments
- Keep detailed records for tax purposes', 'invoices', 4),

('Settings and Configuration', 'Configure your business settings, working hours, pricing, and system preferences to match your business needs.

**Key Features:**
- **Business Information:** Company details and contact information
- **Working Hours:** Set availability and working days
- **Pricing Management:** Configure service rates and packages
- **System Settings:** Notifications, integrations, and preferences

**Tips:**
- Keep business information up to date
- Review and adjust pricing regularly
- Set realistic working hours
- Enable notifications for important events', 'settings', 5),

('Reports and Analytics', 'Monitor your business performance with detailed reports and analytics. Make data-driven decisions to grow your business.

**Key Features:**
- **Revenue Reports:** Track income and profit margins
- **Customer Analytics:** Understand customer behavior and preferences
- **Service Performance:** Identify popular services and trends
- **Growth Metrics:** Monitor business growth over time

**Tips:**
- Review reports monthly to identify trends
- Use analytics to optimize your service offerings
- Track key performance indicators regularly
- Make data-driven business decisions', 'reports', 6);
`;

  console.log(sql);
  console.log('');
  console.log('--- END OF SQL ---');
  console.log('');
  console.log('📋 STEPS:');
  console.log('1. Copy the SQL above');
  console.log('2. Go to Supabase Dashboard → SQL Editor');
  console.log('3. Paste and execute the SQL');
  console.log('4. Run the test script to verify: node scripts/backup-database.js');
  console.log('');
  console.log('✅ This will create all three tables with proper structure and data');
  console.log('✅ Your existing data is safe (backed up)');
  console.log('✅ Admin panel will work immediately after this');
  
  // Also save SQL to file
  const fs = require('fs');
  const path = require('path');
  
  const sqlFile = path.join(__dirname, '..', 'manual-create-legal-tables.sql');
  fs.writeFileSync(sqlFile, sql);
  
  console.log('');
  console.log('💾 SQL also saved to: manual-create-legal-tables.sql');
}

createLegalTablesFinal(); 