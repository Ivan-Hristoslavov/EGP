export type StripePaymentErrorToast = {
  title: string;
  message: string;
};

const DEFAULT_TITLE = "Payment could not be completed";

/**
 * Maps Stripe payment error strings to short toast copy for customers.
 */
export function mapStripePaymentErrorMessage(
  raw: string,
): StripePaymentErrorToast {
  const lower = raw.toLowerCase();

  if (
    lower.includes("live mode") &&
    (lower.includes("test card") || lower.includes("known test"))
  ) {
    return {
      title: "Card not accepted in live checkout",
      message:
        "This checkout is using live Stripe keys. Test card numbers only work with test keys. Use a real card here, or switch your site to Stripe test keys when testing.",
    };
  }

  if (
    lower.includes("card_declined") ||
    lower.includes("your card was declined")
  ) {
    return {
      title: DEFAULT_TITLE,
      message:
        "Your bank declined the payment. Try another card or contact your bank.",
    };
  }

  if (
    lower.includes("insufficient_funds") ||
    lower.includes("insufficient funds")
  ) {
    return {
      title: DEFAULT_TITLE,
      message: "The card has insufficient funds. Try another payment method.",
    };
  }

  if (
    lower.includes("incorrect_cvc") ||
    lower.includes("incorrect number") ||
    lower.includes("invalid cvc")
  ) {
    return {
      title: DEFAULT_TITLE,
      message:
        "The security code (CVC) or card number does not match. Check the details and try again.",
    };
  }

  if (
    lower.includes("expired_card") ||
    (lower.includes("expired") && lower.includes("card"))
  ) {
    return {
      title: DEFAULT_TITLE,
      message: "This card has expired. Use a different card.",
    };
  }

  if (
    lower.includes("processing_error") ||
    lower.includes("try again") ||
    lower.includes("temporary")
  ) {
    return {
      title: DEFAULT_TITLE,
      message:
        "A temporary error occurred while processing the payment. Please try again in a moment.",
    };
  }

  if (
    lower.includes("incomplete") ||
    lower.includes("incomplete_number") ||
    lower.includes("incomplete_expiry") ||
    lower.includes("incomplete_cvc")
  ) {
    return {
      title: "Incomplete card details",
      message: "Please fill in all card fields and try again.",
    };
  }

  return {
    title: DEFAULT_TITLE,
    message:
      raw.trim() || "Something went wrong with the payment. Please try again.",
  };
}
