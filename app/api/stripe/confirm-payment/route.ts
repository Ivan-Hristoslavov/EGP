import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve payment intent to check status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Payment successful - create booking record
      // TODO: Save booking to database
      console.log('Payment succeeded:', paymentIntent.id);
      
      return NextResponse.json({
        success: true,
        paymentIntent,
        bookingId: `booking_${Date.now()}`, // Temporary booking ID
      });
    } else {
      return NextResponse.json({
        success: false,
        status: paymentIntent.status,
        error: 'Payment not completed',
      });
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
