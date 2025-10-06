# Stripe Integration Setup

## Overview
The payments system is integrated with Stripe for secure online payments. This allows you to:
- Create payment links and send them to customers
- Track payment statuses automatically
- Receive real-time payment updates via webhooks

## Setup Instructions

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the verification process
3. Navigate to the Dashboard

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers** → **API keys**
2. Copy the following keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 3. Configure Environment Variables
Create or update the `.env.local` file in the `ui` directory:

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin Credentials
ADMIN_EMAIL=
ADMIN_PASSWORD=your-secure-password-here
ADMIN_NAME=Your Full Name
```

### 4. Update Stripe Configuration
Edit `ui/lib/stripe.ts` and replace the placeholder keys with your actual Stripe keys:

```typescript
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'your_actual_secret_key',
  {
    apiVersion: '2024-06-20',
  }
);

export const getStripe = () => {
  return loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'your_actual_publishable_key'
  );
};
```

### 5. Setup Webhooks (Recommended)
1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.requires_action`
5. Copy the webhook signing secret and add it to your `.env.local`

## Features

### Send Payment Links
- Navigate to **Admin** → **Payments**
- Click **Send Payment Link**
- Select customer and booking (optional)
- Enter amount and description
- System creates Stripe Checkout Session and returns a shareable payment link
- Link is automatically copied to clipboard and can be sent to customer
- Payment links expire after 24 hours

### Record Manual Payments
- Click **Record Payment** 
- Enter payment details for cash, bank transfer, or cheque payments
- System stores payment record in database

### Payment Status Tracking
- All payments show real-time status
- Stripe payments update automatically via webhooks
- Manual payments can be updated as needed

### Financial Dashboard
- View total revenue, pending payments
- Track payment methods and success rates
- Filter and search payments

## Testing

### Test Cards
Use these test card numbers in Stripe test mode:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

### Test Workflow
1. Create a test customer and booking
2. Send payment link via admin panel
3. Use test card to complete payment
4. Verify payment status updates in admin panel

## Production Setup

### 1. Switch to Live Mode
1. In Stripe Dashboard, toggle to **Live mode**
2. Get live API keys (start with `pk_live_` and `sk_live_`)
3. Update environment variables with live keys

### 2. Webhook Configuration
1. Update webhook endpoint to production URL
2. Update webhook secret in environment variables

### 3. Security Considerations
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Enable webhook signature verification
- Monitor Stripe Dashboard for suspicious activity

## Troubleshooting

### Common Issues
1. **Payment fails silently**: Check Stripe logs in Dashboard
2. **Webhook not working**: Verify endpoint URL and signing secret
3. **Keys not working**: Ensure you're using the correct mode (test/live)

### Support
- Stripe Documentation: [stripe.com/docs](https://stripe.com/docs)
- Stripe Support: Available in Dashboard
- Project Issues: Check application logs for detailed error messages 