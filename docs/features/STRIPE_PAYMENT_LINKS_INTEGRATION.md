# Stripe Payment Links Integration

This document describes how the Stripe Payment Links integration works with webhooks to track payment status.

## Overview

The system creates Stripe Payment Links that automatically generate corresponding payment records in the database. These payments are then tracked through Stripe webhooks to update their status in real-time.

## Flow

### 1. Payment Link Creation

When a payment link is created through the admin interface:

1. **Database Record Creation**: A payment record is created with status `pending`
2. **Stripe Payment Link**: A Stripe Payment Link is created with metadata containing:
   - `payment_id`: Database payment record ID
   - `customer_id`: Customer ID
   - `booking_id`: Booking ID (if applicable)
   - `customer_name`: Customer name
   - `currency`: Payment currency

3. **Database Update**: The payment record is updated with:
   - `reference`: Payment Link ID
   - `notes`: Payment Link details and URL

### 2. Customer Payment

When a customer uses the payment link:

1. **Stripe Processing**: Stripe processes the payment and creates a Payment Intent
2. **Webhook Trigger**: Stripe sends a `payment_intent.succeeded` webhook
3. **Payment Tracking**: The webhook handler finds the payment record using:
   - Payment Intent ID (if already linked)
   - Payment ID from metadata (for new payments)

### 3. Webhook Processing

The webhook handler (`/api/webhooks/stripe`) processes the event:

1. **Payment Lookup**: Finds the payment record by:
   - Direct reference (Payment Intent ID)
   - Metadata payment_id
   - Customer email matching (fallback)

2. **Status Update**: Updates the payment record with:
   - `payment_status`: Maps Stripe status to database status
   - `reference`: Payment Intent ID
   - `payment_method`: Actual payment method used
   - `notes`: Comprehensive payment details

3. **Booking Update**: If linked to a booking, updates booking payment status

## API Endpoints

### Create Payment Link
```
POST /api/payments
Content-Type: application/json

{
  "type": "create_payment_link",
  "customer_id": "uuid",
  "booking_id": "uuid", // optional
  "amount": 25.00,
  "description": "Payment for plumbing service",
  "currency": "gbp"
}
```

**Response:**
```json
{
  "payment": {
    "id": "uuid",
    "reference": "plink_xxx",
    "payment_status": "pending",
    ...
  },
  "payment_link_url": "https://buy.stripe.com/xxx",
  "payment_link_id": "plink_xxx",
  "active": true,
  "currency": "GBP"
}
```

### Webhook Endpoint
```
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: whsec_xxx

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_xxx",
      "status": "succeeded",
      "amount": 2500,
      "currency": "gbp",
      "customer": "cus_xxx",
      "metadata": {
        "payment_id": "uuid",
        "customer_id": "uuid",
        ...
      }
    }
  }
}
```

## Status Mapping

Stripe Payment Intent statuses are mapped to database statuses:

| Stripe Status | Database Status |
|---------------|-----------------|
| `succeeded` | `paid` |
| `canceled` | `failed` |
| `requires_payment_method` | `pending` |
| `requires_confirmation` | `pending` |
| `requires_action` | `pending` |
| `processing` | `pending` |
| `requires_capture` | `pending` |

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL(10,2),
  payment_method VARCHAR(20),
  payment_status VARCHAR(20), -- pending, paid, failed, refunded
  payment_date DATE,
  reference VARCHAR(255), -- Stripe Payment Link ID or Payment Intent ID
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Customers Table
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  stripe_customer_id VARCHAR(255), -- Links to Stripe customer
  ...
);
```

## Error Handling

The system handles various error scenarios:

1. **Payment Not Found**: Creates new payment record if customer can be identified
2. **Customer Not Found**: Logs warning and skips processing
3. **Stripe API Errors**: Graceful fallbacks and detailed logging
4. **Webhook Signature Validation**: Verifies webhook authenticity

## Security

- **Webhook Signature Verification**: All webhooks are verified using Stripe signature
- **Development Mode**: Allows testing without signature in development
- **Metadata Validation**: Ensures payment metadata matches database records

## Testing

Use the test script to verify integration:

```bash
node test-payment-link-integration.js
```

This tests the complete flow:
1. Creates payment link
2. Simulates webhook event
3. Verifies payment status update

## Monitoring

Key metrics to monitor:

- **Payment Link Creation Rate**: Number of links created per day
- **Webhook Processing Success**: Percentage of successful webhook processing
- **Payment Status Updates**: Time between payment and status update
- **Failed Payments**: Number of failed payment attempts

## Troubleshooting

### Common Issues

1. **Payment Not Found in Webhook**
   - Check payment metadata in Stripe dashboard
   - Verify customer email matches database
   - Check webhook payload for payment_id

2. **Status Not Updating**
   - Verify webhook endpoint is receiving events
   - Check Stripe webhook logs
   - Validate payment record exists in database

3. **Customer Linking Issues**
   - Ensure customer email is correct
   - Check stripe_customer_id field
   - Verify customer exists in database

### Debug Logging

Enable debug logging to see detailed webhook processing:

```javascript
console.log('Processing payment intent:', paymentIntentId, {
  status,
  amount,
  currency,
  customerId,
  metadata
});
``` 