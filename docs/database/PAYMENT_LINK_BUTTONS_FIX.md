# Payment Link Buttons Fix

## Problem
The payment link action buttons (Copy Link and Send Email) were not showing in the payments table.

## Root Cause
The issue was in the `create-and-send-link` API endpoint where the payment notes were being overwritten incorrectly:

1. **Initial notes**: `"Stripe Payment Link to be created and emailed"`
2. **Updated notes**: `"Stripe Payment Link: plink_xxx | URL: https://..."`
3. **Final notes**: `"| Email sent to customer@email.com at timestamp"` ❌

The problem was that the email tracking update was using the original `payment.notes` instead of the updated notes with the URL.

## Solution

### 1. Fixed the notes update sequence in `create-and-send-link/route.ts`:

```javascript
// Store the updated notes in a variable
const updatedNotes = `Stripe Payment Link: ${paymentLink.id} (${currency.toUpperCase()}) | URL: ${paymentLink.url} | Created via email`;

// First update with payment link details
await supabase
  .from("payments")
  .update({
    reference: paymentLink.id,
    notes: updatedNotes,
  })
  .eq("id", payment.id);

// Then append email tracking to the updated notes
await supabase
  .from("payments")
  .update({
    notes: `${updatedNotes} | Email sent to ${customer.email} at ${new Date().toISOString()}`,
    updated_at: new Date().toISOString(),
  })
  .eq("id", payment.id);
```

### 2. Enhanced the `isPaymentLink` function to be more flexible:

```javascript
const isPaymentLink = (payment: Payment) => {
  // Check if payment is a Stripe Payment Link
  return payment.notes?.includes("Stripe Payment Link") || 
         payment.reference?.startsWith("plink_") ||
         payment.notes?.includes("Payment Link");
};
```

### 3. The `getPaymentLinkUrl` function extracts URL from notes:

```javascript
const getPaymentLinkUrl = (payment: Payment) => {
  if (payment.notes?.includes("URL: ")) {
    const urlMatch = payment.notes.match(/URL: (https:\/\/[^\s]+)/);
    return urlMatch ? urlMatch[1] : null;
  }
  return null;
};
```

## Button Visibility Conditions

### Copy Payment Link Button (Purple)
- Shows when: `isPaymentLink(payment) && getPaymentLinkUrl(payment)`
- Icon: Link icon
- Action: Copies payment link URL to clipboard

### Send Payment Link Email Button (Orange)
- Shows when: `isPaymentLink(payment) && getPaymentLinkUrl(payment) && payment.customers?.email`
- Icon: Email icon
- Action: Sends payment link via email to customer

## Testing

After the fix, payment links created via "Email Link" will have proper notes format:
```
Stripe Payment Link: plink_xxx (GBP) | URL: https://buy.stripe.com/... | Created via email | Email sent to customer@email.com at 2025-07-15T11:18:58.704Z
```

This allows both action buttons to appear and function correctly.

## Action Buttons Layout

The payments table now shows these action buttons in order:
1. **View** (Blue) - Eye icon
2. **Copy Link** (Purple) - Link icon (payment links only)
3. **Send Email** (Orange) - Email icon (payment links with customer email)
4. **Edit** (Green) - Edit icon (pending/failed payments only)
5. **Delete** (Red) - Trash icon

All buttons are properly sized (8x8) with consistent styling and hover effects. 