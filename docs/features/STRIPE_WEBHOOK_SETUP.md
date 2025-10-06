# Stripe Webhook Setup Guide

This guide explains how to properly configure Stripe webhooks to avoid 308 redirect errors.

## Problem: 308 Permanent Redirect

If you're getting HTTP 308 errors from Stripe webhooks, it's usually due to:
1. Incorrect webhook URL configuration
2. Missing or incorrect webhook secret
3. Trailing slash issues

## Solution

### 1. Stripe Dashboard Configuration

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Create new webhook endpoint** or edit existing one
3. **Set the endpoint URL exactly as**:
   ```
   https://plumber-uk.vercel.app/api/webhooks/stripe
   ```
   ⚠️ **Important**: NO trailing slash!

4. **Select events to listen for**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `checkout.session.completed`
   - `checkout.session.expired`

5. **Copy the webhook signing secret** (starts with `whsec_`)

### 2. Vercel Environment Variables

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add the following variables**:

   ```
   STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
   ```

3. **Make sure the variable is set for**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 3. Test the Webhook

1. **Use Stripe CLI to test locally**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Send a test event**:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

3. **Check the logs** in your application for:
   ```
   🔔 Webhook received: {...}
   🔐 Verifying webhook signature...
   ✅ Webhook signature verified successfully
   🔄 Processing event: {...}
   ✅ Webhook processed successfully
   ```

### 4. Common Issues & Solutions

#### Issue: 308 Redirect
**Cause**: Trailing slash in webhook URL
**Solution**: Use `https://plumber-uk.vercel.app/api/webhooks/stripe` (no trailing slash)

#### Issue: 400 Invalid Signature
**Cause**: Wrong webhook secret or missing environment variable
**Solution**: 
1. Check webhook secret in Stripe dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
3. Redeploy after updating environment variables

#### Issue: 500 Webhook Secret Not Configured
**Cause**: `STRIPE_WEBHOOK_SECRET` environment variable not set
**Solution**: Add the environment variable in Vercel dashboard

#### Issue: Webhook Not Receiving Events
**Cause**: Incorrect event selection or URL
**Solution**: 
1. Verify webhook URL is correct
2. Check that required events are selected
3. Test with Stripe CLI

### 5. Debugging

#### Check Webhook Logs in Stripe Dashboard
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your webhook endpoint
3. Check the "Recent deliveries" section
4. Look for failed deliveries and error messages

#### Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on the webhook function
3. Check the logs for errors

#### Enable Debug Logging
The webhook handler includes detailed logging:
- 🔔 Webhook received
- 🔐 Signature verification
- 🔄 Event processing
- ✅ Success confirmation
- ❌ Error details

### 6. Testing Webhook Endpoint

Use this command to test your webhook endpoint:

```bash
curl -X POST https://plumber-uk.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{"error":"Missing stripe-signature header"}
```

This confirms the endpoint is reachable and working.

### 7. Production Checklist

Before going live, verify:

- [ ] Webhook URL is correct (no trailing slash)
- [ ] Webhook secret is properly configured in Vercel
- [ ] All required events are selected in Stripe
- [ ] Webhook endpoint returns 200 for test events
- [ ] Payment records are created and updated correctly
- [ ] Logs show successful webhook processing

### 8. Monitoring

Monitor these metrics:
- Webhook delivery success rate in Stripe dashboard
- Response times for webhook processing
- Error rates in Vercel function logs
- Payment status update accuracy

If you continue to experience 308 redirects, check:
1. Vercel deployment logs
2. Next.js middleware configuration
3. Custom redirect rules in vercel.json
4. DNS configuration for your domain 