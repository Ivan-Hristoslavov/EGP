# SendGrid Email Setup Guide

## Overview

This guide explains how to set up SendGrid email functionality for the FixMyLeak plumbing service website. The system now includes:

- **SendGrid Integration**: Professional email sending via SendGrid API
- **Conditional Email Logic**: Uses admin email from database if available, otherwise falls back to environment variable
- **HTML Email Templates**: Beautiful, responsive email templates for invoices
- **Test Interface**: Admin panel to test email and payment configurations
- **Error Handling**: Comprehensive error handling and logging

## Environment Variables Setup

Add these variables to your `.env.local` file:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here

# Admin Credentials (fallback email)
ADMIN_EMAIL=admin@fixmyleak.com
```

## SendGrid Account Setup

### 1. Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Choose "Full Access" or "Restricted Access" with "Mail Send" permissions
4. Copy the API key and add it to your environment variables

### 3. Verify Sender Email
1. Go to Settings → Sender Authentication
2. Choose "Single Sender Verification"
3. Add your business email (e.g., admin@fixmyleak.com)
4. Click the verification link sent to your email

## Email Logic Implementation

### Conditional Email Address Logic

The system implements the following logic for determining the sender email:

```typescript
async function getSenderEmail(): Promise<string> {
  try {
    // 1. Try to get email from admin profile in database
    const { data: profile, error } = await supabase
      .from('admin_profile')
      .select('email')
      .single();

    if (profile?.email) {
      return profile.email; // Use database email
    }

    // 2. Fall back to environment variable
    return adminEmail || 'noreply@fixmyleak.com';
  } catch (error) {
    // 3. Final fallback
    return adminEmail || 'noreply@fixmyleak.com';
  }
}
```

### Priority Order:
1. **Database Email**: Email from admin profile in Supabase
2. **Environment Variable**: `ADMIN_EMAIL` from `.env.local`
3. **Default Fallback**: `noreply@fixmyleak.com`

## Testing the Setup

### 1. Access Test Page
Navigate to `/admin/test-email` in your admin panel to access the comprehensive testing interface.

### 2. Test SendGrid Configuration
Click "Test SendGrid Configuration" to verify:
- API key is properly set
- SendGrid connection is working
- Sender email logic is functioning

### 3. Test Email Sending
1. Enter an email address in the test field
2. Click "Send Test Email"
3. Check if the email is received
4. Verify the sender address matches your configuration

### 4. Test Stripe Configuration
Click "Test Stripe Configuration" to verify:
- Stripe API keys are set
- Stripe connection is working
- Payment functionality is ready

## Invoice Email Features

### HTML Email Template
The system generates beautiful HTML emails with:
- Professional styling and branding
- Invoice details in a clean format
- Payment link integration (if enabled)
- Responsive design for mobile devices
- Company contact information

### Email Content Includes:
- Invoice number and date
- Service details and amount
- Payment instructions
- Stripe payment link (if enabled)
- Company contact information
- Professional footer

### Attachments Support
- Image attachments from invoice
- Automatic content type detection
- Base64 encoding for SendGrid compatibility

## API Endpoints

### Test Email Configuration
- **GET** `/api/test-email` - Test SendGrid configuration
- **POST** `/api/test-email` - Send test email

### Invoice Email Sending
- **POST** `/api/invoices/[id]/send-email` - Send invoice email

### Stripe Verification
- **GET** `/api/payments/verify?test=true` - Test Stripe configuration

## Troubleshooting

### Common Issues

#### 1. "SendGrid API key not configured"
**Solution**: Add `SENDGRID_API_KEY` to your environment variables

#### 2. "Email not being sent"
**Possible Causes**:
- Sender email not verified in SendGrid
- API key doesn't have "Mail Send" permissions
- Rate limiting (free tier: 100 emails/day)

#### 3. "Stripe configuration failed"
**Solution**: Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set

#### 4. "Admin email not found"
**Solution**: 
- Check if admin profile exists in database
- Verify `ADMIN_EMAIL` environment variable is set
- Update admin profile email in admin panel

### Debug Steps

1. **Check Environment Variables**:
   ```bash
   echo $SENDGRID_API_KEY
   echo $ADMIN_EMAIL
   ```

2. **Check SendGrid Dashboard**:
   - Verify sender authentication
   - Check API key permissions
   - Review activity logs

3. **Check Application Logs**:
   - Monitor console output for error messages
   - Check network requests in browser dev tools

4. **Test API Endpoints**:
   ```bash
   curl http://localhost:3000/api/test-email
   ```

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly
- Use restricted API keys when possible

### Email Security
- Verify sender domains in SendGrid
- Implement SPF, DKIM, and DMARC records
- Monitor email delivery rates
- Set up bounce and spam complaint handling

## Production Deployment

### Environment Variables for Production
```bash
# Production SendGrid (consider paid plan for higher limits)
SENDGRID_API_KEY=your_production_sendgrid_api_key

# Production admin email
ADMIN_EMAIL=admin@yourdomain.com
```

### SendGrid Production Setup
1. Upgrade to a paid plan if needed (higher email limits)
2. Set up domain authentication (SPF, DKIM, DMARC)
3. Configure webhook endpoints for delivery tracking
4. Set up bounce and spam complaint handling

### Monitoring
- Monitor email delivery rates
- Set up alerts for failed sends
- Track email engagement metrics
- Monitor API usage and limits

## Files Modified/Created

### New Files
- `lib/sendgrid.ts` - SendGrid utility functions
- `app/api/test-email/route.ts` - Test email API endpoints
- `app/admin/test-email/page.tsx` - Test interface
- `SENDGRID_SETUP.md` - This guide

### Modified Files
- `app/api/invoices/[id]/send-email/route.ts` - Updated to use SendGrid
- `app/admin/layout.tsx` - Added test email navigation
- `env-template.txt` - Added SendGrid configuration
- `app/api/payments/verify/route.ts` - Added Stripe testing

## Next Steps

1. **Set up SendGrid account** and get API key
2. **Add environment variables** to your `.env.local`
3. **Verify sender email** in SendGrid dashboard
4. **Test the configuration** using the admin test page
5. **Send a test invoice email** to verify functionality
6. **Monitor email delivery** and adjust as needed

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review SendGrid documentation
3. Check application logs for detailed error messages
4. Test individual components using the admin test interface 