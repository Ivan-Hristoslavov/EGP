# Payment Link Features

This document describes the enhanced payment link functionality with copy/email actions and pending payment tracking.

## New Features

### 1. Payment Link Actions

For existing payment links, you now have additional action buttons:

#### Copy Payment Link
- **Icon**: Purple link icon
- **Functionality**: Copies the payment link URL to clipboard
- **Visibility**: Only shown for payments that are payment links and have a URL

#### Send Payment Link Email
- **Icon**: Orange email icon
- **Functionality**: Sends the payment link via email to the customer
- **Visibility**: Only shown for payment links with customer email available

### 2. Email Link Creation

New "Email Link" button that creates a payment link and sends it via email in one action:

#### Features:
- **Creates pending payment record** in database
- **Generates Stripe Payment Link** with customer pre-filled
- **Sends professional email** to customer with payment link
- **Tracks email sending** in payment notes

## How It Works

### Payment Link Actions

1. **Copy Link**:
   ```javascript
   // Extracts URL from payment notes
   const getPaymentLinkUrl = (payment) => {
     const urlMatch = payment.notes.match(/URL: (https:\/\/[^\s]+)/);
     return urlMatch ? urlMatch[1] : null;
   };
   ```

2. **Send Email**:
   ```javascript
   // Calls API to send email with payment link
   POST /api/payments/send-link-email
   {
     payment_id: "uuid",
     customer_email: "customer@example.com",
     customer_name: "John Doe",
     payment_link_url: "https://buy.stripe.com/...",
     amount: 25.00
   }
   ```

### Email Link Creation

1. **Creates Payment Record**:
   ```javascript
   // Creates pending payment in database
   const payment = {
     customer_id: "uuid",
     amount: 25.00,
     payment_status: "pending",
     payment_method: "card",
     notes: "Stripe Payment Link to be created and emailed"
   };
   ```

2. **Generates Stripe Payment Link**:
   ```javascript
   // Creates Stripe Payment Link with metadata
   const paymentLink = await createPaymentLink({
     amount: 25.00,
     currency: "gbp",
     description: "Payment for services",
     customerEmail: "customer@example.com",
     metadata: {
       payment_id: "uuid",
       customer_id: "uuid",
       created_via: "email_link"
     }
   });
   ```

3. **Sends Email**:
   ```html
   <!-- Professional email template -->
   <div style="font-family: Arial, sans-serif; max-width: 600px;">
     <h2>Payment Request</h2>
     <p>Dear Customer,</p>
     <p>We have prepared a secure payment link for your convenience.</p>
     <div style="text-align: center;">
       <a href="[PAYMENT_LINK]" style="background-color: #007bff; color: white; padding: 12px 30px;">
         Pay Now - £25.00
       </a>
     </div>
   </div>
   ```

## API Endpoints

### Send Payment Link Email
```
POST /api/payments/send-link-email
```

**Request Body:**
```json
{
  "payment_id": "uuid",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe",
  "payment_link_url": "https://buy.stripe.com/...",
  "amount": 25.00
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment link email sent successfully"
}
```

### Create and Send Email Link
```
POST /api/payments/create-and-send-link
```

**Request Body:**
```json
{
  "customer_id": "uuid",
  "booking_id": "uuid",
  "amount": 25.00,
  "description": "Payment for plumbing service",
  "currency": "gbp"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "uuid",
    "reference": "plink_xxx",
    "payment_status": "pending"
  },
  "payment_link_url": "https://buy.stripe.com/...",
  "payment_link_id": "plink_xxx",
  "email_sent": true,
  "customer_email": "customer@example.com",
  "message": "Payment link created and email sent successfully"
}
```

## UI Components

### Action Buttons

The payment actions are now organized with proper spacing and colors:

- **View** (Blue): Eye icon
- **Copy Link** (Purple): Link icon - only for payment links
- **Send Email** (Orange): Email icon - only for payment links with customer email
- **Edit** (Green): Edit icon - only for pending/failed payments
- **Delete** (Red): Trash icon

### Email Link Modal

New modal with:
- Customer selection (shows email in dropdown)
- Booking selection (filtered by customer)
- Amount input
- Description input
- Create & Send button

## Webhook Integration

When a customer pays via email link:

1. **Stripe sends webhook** with `payment_intent.succeeded`
2. **Webhook handler finds payment** by `payment_id` in metadata
3. **Updates payment status** from "pending" to "paid"
4. **Updates reference** with Payment Intent ID
5. **Adds payment details** to notes

## Benefits

### For Admins:
- **Streamlined workflow**: Create and send payment links in one action
- **Better tracking**: All payments visible in admin panel from creation
- **Easy resending**: Copy or email existing payment links
- **Professional communication**: Branded email templates

### For Customers:
- **Convenient payment**: Receive payment link directly in email
- **Secure processing**: Stripe-hosted payment pages
- **Multiple payment methods**: Card, Apple Pay, Google Pay, etc.
- **Professional experience**: Branded emails and payment pages

## Monitoring

Track these metrics in the admin panel:

1. **Pending Payments**: Created via email links awaiting payment
2. **Email Sent Tracking**: Notes show when emails were sent
3. **Payment Conversion**: Pending → Paid conversion rate
4. **Customer Engagement**: Which customers receive and pay via email links

## Future Enhancements

Potential improvements:

1. **Email Templates**: Customizable email templates
2. **Email Service Integration**: SendGrid/Mailgun integration
3. **Payment Reminders**: Automated reminder emails
4. **Link Expiration**: Set expiration dates for payment links
5. **SMS Integration**: Send payment links via SMS
6. **Analytics Dashboard**: Payment link performance metrics 