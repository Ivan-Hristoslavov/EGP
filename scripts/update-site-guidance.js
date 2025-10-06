const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const siteGuidanceContent = [
  {
    title: "Dashboard Overview",
    content: `# Dashboard Overview

Your dashboard provides a comprehensive overview of your plumbing business performance. This is your command center for monitoring key metrics and managing daily operations.

## Key Features

### Today's Schedule
- View all bookings scheduled for today
- Quick access to customer details and service information
- Status indicators for each booking (pending, confirmed, completed)

### Quick Statistics
- Revenue Tracking: Monitor daily, weekly, and monthly income
- Completed Jobs: Track finished work and success rates
- Pending Invoices: Keep track of outstanding payments
- Customer Satisfaction: View recent reviews and ratings

### Recent Activity Feed
- Latest customer interactions and bookings
- Recent invoice and payment activities
- System notifications and alerts

### Performance Metrics
- Monthly comparisons and growth trends
- Service popularity analysis
- Customer retention rates

## Tips for Daily Use
- Check your dashboard first thing each morning
- Use the quick action buttons for common tasks
- Monitor performance metrics weekly
- Set up notifications for important events`,
    category: "dashboard",
    sort_order: 1
  },
  {
    title: "Managing Bookings",
    content: `# Managing Bookings

The booking system is the heart of your business operations. Efficiently manage customer appointments, track service delivery, and maintain customer relationships.

## Key Features

### Calendar View
- Visual Schedule: See all bookings in an intuitive calendar format
- Date Navigation: Easily switch between days, weeks, and months
- Conflict Detection: System alerts for double-bookings
- Quick Actions: Direct access to booking details and modifications

### Booking Details Management
- Customer Information: Complete contact details and service history
- Service Specifications: Detailed service type and requirements
- Special Notes: Important customer requests and preferences
- Address Information: Service location and access instructions

### Status Management
- Pending: New bookings awaiting confirmation
- Confirmed: Approved and scheduled appointments
- In Progress: Currently being serviced
- Completed: Finished work with customer satisfaction
- Cancelled: Cancelled appointments with reasons

### Customer History Integration
- Past Services: Complete record of previous work
- Preferences: Customer-specific requirements and notes
- Communication History: Email and SMS interactions
- Payment History: Previous invoices and payment status

## Best Practices
- Confirm bookings within 24 hours of receipt
- Use detailed notes for customer-specific requirements
- Update status immediately after service completion
- Check for scheduling conflicts before accepting new bookings
- Maintain clear communication with customers throughout the process`,
    category: "bookings",
    sort_order: 2
  },
  {
    title: "Customer Management",
    content: `# Customer Management

Build lasting relationships with your customers through comprehensive profile management and service history tracking.

## Key Features

### Customer Profiles
- Contact Information: Name, email, phone, and address details
- Customer Type: Individual or business customer classification
- Company Details: Business information for corporate clients
- Communication Preferences: Preferred contact methods and times

### Service History Tracking
- Complete Work Record: All past services and dates
- Service Details: Specific work performed and materials used
- Pricing Information: Historical pricing and payment records
- Warranty Information: Service guarantees and warranty periods

### Notes and Reminders
- Customer Preferences: Specific requirements and preferences
- Special Instructions: Access requirements, parking information
- Follow-up Reminders: Scheduled follow-up calls or maintenance
- Important Dates: Customer-specific important dates

### Communication Tools
- Email Integration: Direct email from customer profiles
- SMS Capabilities: Text message notifications and updates
- Communication History: Complete record of all interactions
- Automated Reminders: System-generated follow-up messages

## Customer Relationship Tips
- Update customer information after each service visit
- Use notes to record specific customer preferences
- Send follow-up communications after service completion
- Track customer satisfaction and feedback
- Maintain detailed records for warranty and follow-up services`,
    category: "customers",
    sort_order: 3
  },
  {
    title: "Invoice Management",
    content: `# Invoice Management

Create professional invoices, manage payment tracking, and streamline your billing process with comprehensive invoice management tools.

## Key Features

### Professional Invoice Creation
- Automatic Numbering: System-generated unique invoice numbers
- Company Branding: Your business details and logo integration
- Service Details: Comprehensive breakdown of work performed
- VAT Management: Automatic VAT calculations and compliance
- Photo Attachments: Include work photos with invoices

### Photo Attachments Feature
- Work Documentation: Attach photos of completed work
- Before/After Images: Show problem and solution
- Multiple Images: Support for up to 5 photos per invoice
- Automatic Email: Photos sent automatically with invoice emails
- Professional Presentation: Images enhance invoice credibility

### Payment Tracking
- Status Monitoring: Track paid, pending, and overdue payments
- Payment Methods: Cash, card, bank transfer, and online payments
- Payment Links: Secure Stripe payment links for online payments
- Reminder System: Automatic overdue payment notifications

### Email Integration
- Professional Templates: Branded email templates
- Automatic Sending: One-click invoice email delivery
- Photo Attachments: Images automatically included in emails
- Payment Links: Integrated payment options in emails
- Delivery Tracking: Confirm email delivery and opens

## Invoice Workflow
1. Create Invoice: Generate from booking or manual entry
2. Add Photos: Attach relevant work images (optional)
3. Review Details: Check all information and calculations
4. Send Email: Deliver invoice with photos to customer
5. Track Payment: Monitor payment status and follow up
6. Record Payment: Update system when payment received

## Best Practices
- Send invoices immediately after job completion
- Include relevant photos to support your work
- Use payment links for faster payment collection
- Set up automatic reminders for overdue payments
- Keep detailed records for tax and accounting purposes`,
    category: "invoices",
    sort_order: 4
  },
  {
    title: "Reviews Management",
    content: `# Reviews Management

Manage customer reviews and testimonials to build trust and credibility for your plumbing business.

## Key Features

### Review Approval System
- Moderation Process: All reviews require approval before publication
- Quality Control: Ensure reviews meet your business standards
- Spam Protection: Filter out inappropriate or fake reviews
- Content Guidelines: Maintain professional review standards

### Review Management Tools
- Approval Controls: Approve or reject reviews with one click
- Edit Capabilities: Modify review content if needed
- Delete Function: Remove inappropriate reviews permanently
- Bulk Operations: Manage multiple reviews simultaneously

### Customer Information
- Reviewer Details: Customer name and contact information
- Service History: Link reviews to specific services
- Rating System: 1-5 star rating with detailed feedback
- Date Tracking: When reviews were submitted and approved

### Display Management
- Featured Reviews: Highlight your best testimonials
- Website Integration: Automatic display on your website
- Social Proof: Build customer trust through testimonials
- SEO Benefits: Reviews improve search engine visibility

## Review Management Process
1. Review Submission: Customers submit reviews through your website
2. Notification: You receive notification of new review
3. Moderation: Review content for appropriateness and accuracy
4. Approval Decision: Approve, reject, or request modifications
5. Publication: Approved reviews appear on your website
6. Response: Optionally respond to customer feedback

## Best Practices
- Review and approve submissions within 24 hours
- Respond to both positive and negative reviews professionally
- Use reviews to identify areas for service improvement
- Encourage satisfied customers to leave reviews
- Maintain a balance of recent and diverse testimonials`,
    category: "reviews",
    sort_order: 5
  },
  {
    title: "Settings and Configuration",
    content: `# Settings and Configuration

Configure your business settings, working hours, pricing, and system preferences to match your business needs and operational requirements.

## Key Features

### Business Information Management
- Company Details: Name, address, contact information
- Professional Credentials: Gas Safe registration, insurance details
- Company Status: Legal structure (Ltd, Sole Trader, etc.)
- Response Time: Set customer response time expectations

### Working Hours Configuration
- Daily Schedule: Set start and end times for each day
- Working Days: Select which days you provide services
- Holiday Management: Configure time off and vacation periods
- Emergency Services: 24/7 emergency call-out settings

### Pricing Management
- Service Rates: Configure standard and emergency rates
- VAT Settings: Enable/disable VAT and set rates
- Discount Options: Set up promotional pricing
- Payment Terms: Define payment methods and terms

### System Preferences
- Email Notifications: Configure automatic email alerts
- SMS Notifications: Set up text message notifications
- Booking Confirmation: Automatic booking confirmations
- Reminder Settings: Payment and follow-up reminders

## Configuration Tips
- Keep business information up to date at all times
- Review and adjust pricing regularly based on market conditions
- Set realistic working hours that match your capacity
- Enable notifications for important business events
- Regularly update professional credentials and certifications`,
    category: "settings",
    sort_order: 6
  },
  {
    title: "Gallery Management",
    content: `# Gallery Management

Showcase your best work and build customer confidence through a professional photo gallery of completed projects.

## Key Features

### Photo Organization
- Section Management: Organize photos into logical categories
- Before/After Images: Show problem and solution pairs
- Project Types: Categorize by service type (emergency, installation, etc.)
- Location Tags: Add area or location information

### Image Management
- Upload System: Easy drag-and-drop photo upload
- Image Optimization: Automatic compression and optimization
- Multiple Formats: Support for JPG, PNG, and other formats
- Bulk Operations: Upload and manage multiple images

### Display Control
- Featured Images: Highlight your best work
- Order Management: Control the display order of photos
- Active/Inactive: Show or hide specific images
- Website Integration: Automatic display on your website

### Customer Engagement
- Professional Presentation: Build trust through quality work photos
- Service Examples: Show customers what to expect
- Social Proof: Demonstrate your expertise and experience
- Marketing Tool: Use gallery for marketing and sales

## Gallery Best Practices
- Upload high-quality, well-lit photos of completed work
- Include before and after images when possible
- Organize photos into logical sections (emergency, installation, etc.)
- Keep gallery updated with recent work
- Use descriptive titles and descriptions for SEO benefits`,
    category: "gallery",
    sort_order: 7
  },
  {
    title: "Payment Processing",
    content: `# Payment Processing

Streamline your payment collection with multiple payment methods and automated payment tracking.

## Key Features

### Payment Methods
- Cash Payments: Traditional cash collection
- Card Payments: Credit and debit card processing
- Bank Transfer: Direct bank transfer options
- Online Payments: Stripe payment link integration

### Stripe Payment Links
- Secure Links: Generate secure payment links for customers
- Email Integration: Send payment links via email
- Automatic Tracking: Payment status updates automatically
- Multiple Currencies: Support for GBP and other currencies

### Payment Tracking
- Status Monitoring: Track pending, paid, and failed payments
- Payment History: Complete record of all transactions
- Customer Linking: Connect payments to specific customers
- Invoice Integration: Automatic invoice status updates

### Automated Features
- Payment Reminders: Automatic overdue payment notifications
- Receipt Generation: Automatic payment confirmations
- Refund Processing: Handle refunds and adjustments
- Reporting: Payment analytics and reporting

## Payment Workflow
1. Create Invoice: Generate invoice with payment details
2. Send Payment Link: Email secure payment link to customer
3. Customer Payment: Customer completes payment online
4. Confirmation: Automatic payment confirmation and receipt
5. Status Update: Invoice status updated to paid
6. Follow-up: Send thank you and service follow-up

## Best Practices
- Send payment links immediately after job completion
- Follow up on overdue payments promptly
- Keep detailed payment records for accounting
- Provide multiple payment options for customer convenience
- Use automated reminders to improve payment collection`,
    category: "payments",
    sort_order: 8
  },
  {
    title: "FAQ Management",
    content: `# FAQ Management

Manage frequently asked questions to reduce customer inquiries and provide quick answers to common questions.

## Key Features

### Question Organization
- Category Management: Organize questions by topic
- Order Control: Set the display order of questions
- Active/Inactive: Show or hide specific questions
- Search Functionality: Help customers find answers quickly

### Content Management
- Rich Text Editor: Format answers with text styling
- Image Support: Include relevant images in answers
- Link Integration: Add links to related information
- Version Control: Track changes and updates

### Customer Experience
- Quick Answers: Provide immediate answers to common questions
- Reduced Inquiries: Decrease customer service workload
- Professional Appearance: Show expertise and organization
- SEO Benefits: Improve search engine visibility

### Website Integration
- Automatic Display: FAQs appear on your website
- Mobile Responsive: Optimized for all device types
- Search Function: Help customers find specific information
- Contact Integration: Easy transition to contact form

## FAQ Management Tips
- Keep questions and answers up to date
- Use clear, concise language
- Organize questions logically by category
- Include contact information for complex questions
- Regularly review and update content based on customer feedback`,
    category: "faq",
    sort_order: 9
  },
  {
    title: "Area Coverage Management",
    content: `# Area Coverage Management

Manage your service areas and coverage zones to help customers understand where you provide services.

## Key Features

### Area Configuration
- Geographic Zones: Define specific service areas
- Area Descriptions: Detailed information about each area
- Service Availability: Specify which services in each area
- Response Times: Set expected response times by area

### Customer Communication
- Area Information: Help customers understand coverage
- Service Clarity: Clear expectations about service availability
- Professional Presentation: Show organized service structure
- Marketing Tool: Use areas for targeted marketing

### Operational Management
- Resource Planning: Plan resources by service area
- Scheduling: Optimize scheduling based on area coverage
- Cost Management: Track costs by service area
- Performance Analysis: Monitor performance by area

## Area Management Best Practices
- Keep area information accurate and up to date
- Provide clear descriptions of each service area
- Include response time expectations for each area
- Use areas for strategic business planning
- Regularly review and adjust coverage based on demand`,
    category: "areas",
    sort_order: 10
  }
];

async function updateSiteGuidance() {
  try {
    console.log('🔄 Updating site guidance content...');
    
    // First, delete existing content
    const { error: deleteError } = await supabase
      .from('site_guidance')
      .delete()
      .neq('id', 0);
    
    if (deleteError) {
      console.error('❌ Error deleting existing guidance:', deleteError);
      return;
    }
    
    console.log('✅ Deleted existing guidance content');
    
    // Insert new content
    const { data, error } = await supabase
      .from('site_guidance')
      .insert(siteGuidanceContent);
    
    if (error) {
      console.error('❌ Error inserting new guidance:', error);
      return;
    }
    
    console.log('✅ Successfully updated site guidance with', data?.length || 0, 'guides');
    console.log('📋 Categories included:');
    siteGuidanceContent.forEach(guide => {
      console.log(`   - ${guide.category}: ${guide.title}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

updateSiteGuidance(); 