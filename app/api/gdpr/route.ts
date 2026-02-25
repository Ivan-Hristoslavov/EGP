import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const defaultGdprContent = `# GDPR & Data Protection

**Last updated:** [Date]

## 1. Who we are

EGP Aesthetics London ("we", "our", "us") is the data controller for the personal data we collect when you use our website, book treatments, or contact us.

## 2. What data we collect

- **Contact details:** name, email, phone number
- **Booking and treatment information:** appointment history, service preferences, notes
- **Marketing preferences:** whether you wish to receive offers and news
- **Technical data:** IP address, browser type, when you use our site (where applicable)

## 3. Why we use your data

We use your data to:

- Provide and manage appointments and treatments
- Send booking confirmations and reminders
- Improve our services and website
- Comply with legal obligations
- With your consent, send you offers and news

## 4. Legal basis

We process your data on the basis of:

- **Contract:** to provide the services you book
- **Legitimate interests:** to run and improve our business
- **Consent:** for marketing and non-essential communications
- **Legal obligation:** where required by law

## 5. How long we keep your data

We keep your data only as long as needed for the purposes above, or as required by law (e.g. tax and clinical records).

## 6. Your rights

Under UK GDPR you have the right to:

- **Access** your personal data
- **Rectification** of inaccurate data
- **Erasure** ("right to be forgotten") in certain cases
- **Restrict** or **object** to processing
- **Data portability** where applicable
- **Withdraw consent** at any time
- **Lodge a complaint** with the ICO (ico.org.uk)

To exercise these rights, contact us using the details on our website or in the footer.

## 7. Data sharing and security

We do not sell your data. We may share it with trusted partners (e.g. booking or payment providers) only where necessary to provide our services. We use appropriate technical and organisational measures to keep your data secure.

## 8. Cookies and similar tech

We use cookies and similar technologies as described in our [Privacy Policy](/privacy). You can manage preferences in your browser or via our cookie notice.

## 9. Changes to this notice

We may update this notice from time to time. The latest version will always be on this page.

---

For questions about your data or this notice, please contact us via the details in the footer.
`;

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "gdpr_content")
      .single();

    if (error || !data?.value) {
      return NextResponse.json({ content: defaultGdprContent });
    }

    const content = typeof data.value === "string" ? data.value : (data.value as { content?: string })?.content ?? defaultGdprContent;
    return NextResponse.json({ content });
  } catch (e) {
    console.error("gdpr GET:", e);
    return NextResponse.json({ content: defaultGdprContent });
  }
}
