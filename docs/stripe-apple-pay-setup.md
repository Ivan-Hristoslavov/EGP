# Apple Pay (and Google Pay) setup for Stripe

The booking payment form uses Stripe’s **Payment Element**, which can show **Apple Pay** and **Google Pay** when they’re enabled and the domain is verified. No code changes are required; setup is done in the Stripe Dashboard.

## 1. Enable Apple Pay in Stripe

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com).
2. Go to **Settings** → **Payment methods** (or **Business settings** → **Payment methods**).
3. Find **Apple Pay** and click **Configure** / **Turn on**.
4. Follow the steps for **Web** (not iOS app). You’ll need to register your domain(s) in the next step.

## 2. Register your domain for Apple Pay

Apple Pay on the web only works on **verified domains** and over **HTTPS**.

1. In Stripe Dashboard go to **Settings** → **Payment method domains**  
   (or **Payment methods** → **Apple Pay** → **Add domain**).
2. Add each domain where the booking site runs, for example:
   - Production: `yourdomain.com` (and `www.yourdomain.com` if you use it).
   - Staging: e.g. `staging.yourdomain.com`.
3. For each domain, Stripe will give you an **Apple Pay domain verification file**.
4. Host that file at:  
   `https://<your-domain>/.well-known/apple-developer-merchantid-domain-association`  
   (no file extension). Your hosting or Next.js `public` folder must serve this URL exactly.
5. In the Dashboard, complete verification for each domain (Stripe will check the file).

References:

- [Stripe: Apple Pay (web)](https://docs.stripe.com/apple-pay?platform=web)
- [Stripe: Enable Apple Pay](https://support.stripe.com/questions/enable-apple-pay-on-your-stripe-account)

## 3. Testing on your MacBook

- **Safari** on macOS is the main browser where Apple Pay appears. Make sure:
  - You have at least one card set up in **Wallet** (System Settings → Wallet & Apple Pay).
  - The site is loaded over **HTTPS** (or a secure tunnel).
- **http://localhost** is not supported by Apple Pay. To test locally:
  - Use an **HTTPS tunnel** (e.g. [ngrok](https://ngrok.com)) and add that HTTPS URL as a payment method domain in Stripe, or
  - Test on your **deployed HTTPS site** after adding and verifying the domain.
- In **Safari**, ensure Apple Pay is allowed for the site (e.g. no “Block” in Safari settings for the domain).

## 4. Payment Element behaviour

- The app already uses **Payment Element** with **automatic_payment_methods** enabled in the Payment Intent, so Stripe will show every enabled method (card, Apple Pay, Google Pay, etc.) that is eligible.
- Which methods appear depends on:
  - What’s enabled in **Settings** → **Payment methods**.
  - Domain verification for **Apple Pay** (and similar for **Google Pay** if you use it).
  - Browser and device (e.g. Apple Pay in Safari on macOS/iOS).
  - Customer having a valid card in their wallet.

## 5. Quick checklist

- [ ] Apple Pay turned on in Stripe **Settings** → **Payment methods**.
- [ ] Domain(s) added under **Payment method domains** (or Apple Pay domain section).
- [ ] Verification file hosted at `https://<domain>/.well-known/apple-developer-merchantid-domain-association` and verification completed in the Dashboard.
- [ ] Testing over **HTTPS** (not localhost), e.g. production or ngrok.
- [ ] Safari on Mac, with a card in Wallet; Apple Pay not blocked for the site.

After this, **Proceed to payment** should show Apple Pay as an option when the conditions above are met.
