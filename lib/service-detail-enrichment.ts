/**
 * Marketing / SEO enrichment for public service detail pages when DB fields are thin.
 * Resolution: slug-specific → category-aware fillers → generic medical aesthetics.
 */

export type ServiceFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  title: string;
  body: string;
};

export type ServiceDetailEnrichment = {
  /** Optional override for meta description (SEO) */
  metaDescription?: string;
  tagline: string;
  /** One short paragraph; natural keyword placement for London / treatment type */
  seoIntro: string;
  trustBadgeLabels: string[];
  painLevelLabel: string;
  suitableCandidatesSummary: string;
  whoFor: string[];
  whoNotFor: string[];
  processSteps: ServiceProcessStep[];
  longevityParagraphs: string[];
  safetyBullets: string[];
  pricingNotes: string[];
  faqItems: ServiceFaqItem[];
  finalCtaHeadline: string;
};

const GENERIC: ServiceDetailEnrichment = {
  tagline:
    "Medical-led aesthetic care in London, tailored to your features and goals.",
  seoIntro:
    "At EGP Aesthetics London, every treatment plan is built around a thorough consultation, evidence-based technique, and natural-looking outcomes. We focus on proportion, balance, and safety at every step.",
  trustBadgeLabels: [
    "Medical-led clinic",
    "Advanced injectors",
    "Natural-looking results",
    "Consultation-first care",
  ],
  painLevelLabel: "Mild — discussed at consultation",
  suitableCandidatesSummary:
    "Adults seeking subtle refinement with realistic expectations and good general health.",
  whoFor: [
    "You want a refreshed, balanced appearance",
    "You prefer gradual, natural-looking change",
    "You are happy to follow pre- and post-care advice",
  ],
  whoNotFor: [
    "Pregnancy or breastfeeding",
    "Active skin infection at the treatment site",
    "Certain medical conditions or medications — assessed individually",
  ],
  processSteps: [
    {
      title: "Consultation & assessment",
      body: "We review your goals, medical history, and facial anatomy, then agree a personalised plan.",
    },
    {
      title: "Treatment",
      body: "Your practitioner performs the procedure using premium products and meticulous technique.",
    },
    {
      title: "Aftercare & follow-up",
      body: "Clear guidance on what to expect, how to care for the area, and when to review results.",
    },
  ],
  longevityParagraphs: [
    "Initial results and any swelling settle over the first days to weeks. Your practitioner will explain what is normal for your treatment and how to support healing.",
    "Longevity varies by product, area treated, and individual metabolism. Maintenance visits may be recommended to preserve your preferred look.",
  ],
  safetyBullets: [
    "FDA-cleared / CE-marked products where applicable, sourced through reputable UK supply chains",
    "Complication-aware protocols and clear aftercare instructions",
    "Consultation-led philosophy — we only proceed when treatment is appropriate",
  ],
  pricingNotes: [
    "Final investment depends on product choice, complexity, and volume required to achieve your goals.",
    "A personalised quote is provided after consultation.",
  ],
  faqItems: [
    {
      id: "faq-1",
      question: "Does treatment hurt?",
      answer:
        "Most patients describe only mild discomfort. Topical anaesthetic or nerve blocks may be used where appropriate — your practitioner will explain options at consultation.",
    },
    {
      id: "faq-2",
      question: "How long does swelling last?",
      answer:
        "Mild swelling or bruising can occur and usually settles within several days. Individual healing varies; you will receive written aftercare guidance.",
    },
    {
      id: "faq-3",
      question: "How long do results last?",
      answer:
        "Duration depends on the product, area, and your metabolism. Your clinician will give a realistic range for your plan at consultation.",
    },
    {
      id: "faq-4",
      question: "Will results look natural?",
      answer:
        "Our approach prioritises facial harmony and proportion. We aim for outcomes that look like you — refreshed and balanced — not overfilled.",
    },
    {
      id: "faq-5",
      question: "What products do you use?",
      answer:
        "We use premium, well-established brands appropriate to the treatment. Specific product choice is matched to your anatomy and goals after assessment.",
    },
    {
      id: "faq-6",
      question: "Is there downtime?",
      answer:
        "Downtime varies by treatment. You will be advised on social downtime, exercise, and skincare restrictions before you book.",
    },
    {
      id: "faq-7",
      question: "Can filler be dissolved?",
      answer:
        "Hyaluronic acid–based fillers may be adjusted or dissolved by a medically qualified practitioner when clinically appropriate.",
    },
  ],
  finalCtaHeadline:
    "Take the next step with a consultation tailored to your features and goals.",
};

const FILLER_CATEGORY: Partial<ServiceDetailEnrichment> = {
  tagline:
    "Restore structure and contour with premium hyaluronic acid fillers — subtle, balanced, and bespoke.",
  seoIntro:
    "Cheek and mid-face filler in London is one of the most effective ways to restore lost volume, refine contour, and refresh the mid-face without surgery. At EGP Aesthetics we specialise in non-surgical facial contouring and natural cheek filler results, using precise placement to improve facial harmony while keeping your look authentically you.",
  trustBadgeLabels: [
    "Medical-led clinic",
    "Advanced injectors",
    "Natural cheek filler results",
    "Consultation recommended",
  ],
  painLevelLabel: "Mild — topical options available",
  suitableCandidatesSummary:
    "Adults with mid-face volume loss or contour goals seeking natural cheek enhancement in London.",
  whoFor: [
    "Volume loss or flattening in the cheeks or mid-face",
    "Desire for improved cheekbone definition or contour",
    "Early signs of ageing affecting mid-face balance",
    "Facial asymmetry suitable for soft-tissue balancing",
    "Preference for non-surgical facial contouring",
  ],
  whoNotFor: [
    "Pregnancy or breastfeeding",
    "Allergy history or contraindications to hyaluronic acid fillers (assessed at consultation)",
    "Unrealistic expectations or pressure for overfilling — we prioritise safety and proportion",
    "Active infection or inflammation in the treatment area",
  ],
  processSteps: [
    {
      title: "Consultation & facial assessment",
      body: "We map mid-face volume, skin quality, and proportions. For mid-face filler we discuss cannula or needle technique where appropriate and agree a bespoke plan.",
    },
    {
      title: "Precise filler placement",
      body: "Premium hyaluronic acid filler is placed to support structure and contour. Technique is chosen to optimise comfort, safety, and natural integration.",
    },
    {
      title: "Recovery & review",
      body: "You receive aftercare for swelling and activity restrictions. A review may be arranged to refine balance once initial swelling has settled.",
    },
  ],
  longevityParagraphs: [
    "Many patients notice an immediate softening of hollows or improved contour; mild swelling can temporarily exaggerate volume for a few days.",
    "Settling typically occurs within 1–2 weeks. Longevity depends on product, metabolism, and lifestyle; maintenance may be discussed to preserve mid-face balance.",
  ],
  safetyBullets: [
    "CE-marked hyaluronic acid fillers from reputable UK suppliers",
    "Vascular complication awareness and structured aftercare",
    "Dissolution options discussed when clinically relevant",
    "Consultation-led — we decline treatment when not in your best interest",
  ],
  pricingNotes: [
    "Starting price reflects a typical entry-level volume; mid-face and cheek filler London pricing varies with product choice and complexity.",
    "Full quote after face-to-face or video consultation.",
  ],
  faqItems: [
    {
      id: "cf-1",
      question: "Does cheek filler hurt?",
      answer:
        "Most patients report mild pressure only. We can use topical anaesthetic or other comfort measures as appropriate.",
    },
    {
      id: "cf-2",
      question: "How long does swelling last after cheek filler?",
      answer:
        "Mild swelling or bruising is common and usually improves over several days. Sleeping slightly elevated and following aftercare helps.",
    },
    {
      id: "cf-3",
      question: "How long do cheek filler results last?",
      answer:
        "Many hyaluronic acid cheek treatments last many months; range varies by product, volume, and individual factors. Your clinician will give a personalised estimate.",
    },
    {
      id: "cf-4",
      question: "Will cheek filler look natural?",
      answer:
        "Yes — when mid-face filler is used for structure and balance rather than volume alone. Our focus is natural cheek enhancement and facial harmony.",
    },
    {
      id: "cf-5",
      question: "What filler products are used?",
      answer:
        "We select premium hyaluronic acid fillers suited to mid-face support and contour after your assessment.",
    },
    {
      id: "cf-6",
      question: "Is there downtime after mid-face filler?",
      answer:
        "Social downtime is often minimal but bruising can occur. Strenuous exercise and certain activities may be limited briefly — full guidance is provided.",
    },
    {
      id: "cf-7",
      question: "Can filler be dissolved?",
      answer:
        "Hyaluronic acid fillers may be dissolved by an appropriately trained medical practitioner when clinically indicated.",
    },
  ],
  finalCtaHeadline:
    "Enhance mid-face definition with subtle, natural-looking cheek filler tailored to your features.",
};

const CHEEK_MID_FACE: Partial<ServiceDetailEnrichment> = {
  metaDescription:
    "Cheek & mid-face filler in London at EGP Aesthetics — natural cheek enhancement, non-surgical facial contouring, and consultation-led care. Book a consultation.",
  tagline:
    "Restore youthful facial structure and enhance contour with natural-looking mid-face results.",
  seoIntro:
    "Cheek filler London patients often seek a refreshed mid-face without surgery. This treatment uses premium hyaluronic acid to support the cheek and mid-face, improving contour and balance for natural cheek filler results. It is a cornerstone of non-surgical facial contouring when planned with precision and restraint.",
  trustBadgeLabels: [
    "Medical-led clinic",
    "Advanced injectors",
    "Natural cheek filler results",
    "Consultation recommended",
  ],
};

/** Discovery / consultation-only service — same shell as all treatment pages */
const FREE_DISCOVERY_CONSULTATION: Partial<ServiceDetailEnrichment> = {
  metaDescription:
    "Complimentary discovery consultation at EGP Aesthetics London — personalised aesthetic advice, no obligation, medical-led team. Book your visit.",
  tagline:
    "Start your aesthetic journey with a personalised, no-obligation discovery consultation at our London clinic.",
  seoIntro:
    "This appointment is dedicated to understanding your goals, answering questions, and outlining sensible next steps. There is no pressure to book treatment on the day — we focus on education, suitability, and a plan that fits you.",
  trustBadgeLabels: [
    "Complimentary discovery",
    "No obligation",
    "Medical-led clinic",
    "Transparent next steps",
  ],
  painLevelLabel: "None — conversational visit",
  suitableCandidatesSummary:
    "Anyone exploring aesthetic options who wants professional guidance before committing to a treatment plan.",
  whoFor: [
    "You are new to aesthetics or returning after a break",
    "You want clarity on options, timelines, and investment",
    "You prefer a pressure-free, consultation-first approach",
    "You may combine multiple concerns in one discussion",
  ],
  whoNotFor: [
    "Medical emergencies — please use appropriate NHS services",
    "Anyone unable to provide accurate health and medication history",
    "Under-18s without appropriate guardian involvement where required",
  ],
  processSteps: [
    {
      title: "Welcome & goals",
      body: "Meet your practitioner, confirm your priorities, and outline what you hope to achieve.",
    },
    {
      title: "Assessment & education",
      body: "We review relevant anatomy or skin concerns at a high level and explain suitable treatment families in plain language.",
    },
    {
      title: "Plan & next steps",
      body: "You receive a clear summary of options, indicative timelines, and how to book treatment if and when you are ready.",
    },
  ],
  longevityParagraphs: [
    "This visit is consultative only — there is no treatment downtime. If you proceed to a procedure later, pre- and aftercare will be explained in full at that stage.",
    "You may receive a written summary or quote to take away, depending on what was discussed.",
  ],
  safetyBullets: [
    "Consultations are conducted by qualified practitioners under a medical-led model",
    "We only recommend treatments when clinically appropriate",
    "Your questions on safety, products, and recovery are welcomed",
  ],
  pricingNotes: [
    "The discovery consultation itself is complimentary where offered.",
    "If you choose to proceed, treatment pricing is quoted separately and agreed before booking.",
  ],
  faqItems: [
    {
      id: "fdc-1",
      question: "Is the discovery consultation really free?",
      answer:
        "Where listed as complimentary, there is no charge for the discovery appointment itself. Any treatment you book later is priced separately and agreed in advance.",
    },
    {
      id: "fdc-2",
      question: "Will I be pressured to book?",
      answer:
        "No. The session is for information and planning. You decide if and when to move forward.",
    },
    {
      id: "fdc-3",
      question: "How long does it last?",
      answer:
        "Typically around 30 minutes, depending on your questions and the topics covered.",
    },
    {
      id: "fdc-4",
      question: "What should I bring?",
      answer:
        "A list of medications and supplements, any previous treatment history if relevant, and an open mind. Photos are optional unless we request them.",
    },
    {
      id: "fdc-5",
      question: "Can I book treatment on the same day?",
      answer:
        "Sometimes, if capacity and suitability allow — but it is never required. Many patients prefer to reflect first.",
    },
    {
      id: "fdc-6",
      question: "Is this the same as a medical consultation?",
      answer:
        "It is an aesthetic discovery and planning discussion. Formal medical decisions for treatment are confirmed at the appropriate appointment before any procedure.",
    },
    {
      id: "fdc-7",
      question: "How do I reschedule?",
      answer:
        "Contact the clinic by phone or WhatsApp with as much notice as possible and we will offer the next suitable slot.",
    },
  ],
  finalCtaHeadline:
    "Book your complimentary discovery consultation and map your aesthetic goals with confidence.",
};

function isFillerContext(categorySlug: string, categoryName: string): boolean {
  const s = `${categorySlug} ${categoryName}`.toLowerCase();

  return (
    s.includes("filler") ||
    s.includes("dermal") ||
    s.includes("inject") ||
    s.includes("lip") ||
    s.includes("cheek") ||
    s.includes("facial contour")
  );
}

function mergeEnrichment(
  base: ServiceDetailEnrichment,
  partial: Partial<ServiceDetailEnrichment>,
): ServiceDetailEnrichment {
  return {
    ...base,
    ...partial,
    trustBadgeLabels: partial.trustBadgeLabels ?? base.trustBadgeLabels,
    whoFor: partial.whoFor ?? base.whoFor,
    whoNotFor: partial.whoNotFor ?? base.whoNotFor,
    processSteps: partial.processSteps ?? base.processSteps,
    longevityParagraphs:
      partial.longevityParagraphs ?? base.longevityParagraphs,
    safetyBullets: partial.safetyBullets ?? base.safetyBullets,
    pricingNotes: partial.pricingNotes ?? base.pricingNotes,
    faqItems: partial.faqItems ?? base.faqItems,
  };
}

export function getServiceDetailEnrichment(
  slug: string,
  categorySlug: string,
  categoryName: string,
): ServiceDetailEnrichment {
  let out = { ...GENERIC };

  if (isFillerContext(categorySlug, categoryName)) {
    out = mergeEnrichment(out, FILLER_CATEGORY);
  }

  if (slug === "cheek-mid-face-filler") {
    out = mergeEnrichment(out, CHEEK_MID_FACE);
  }

  if (slug === "free-discovery-consultation") {
    out = mergeEnrichment(out, FREE_DISCOVERY_CONSULTATION);
  }

  return out;
}

export function buildFaqPageJsonLd(
  faqItems: ServiceFaqItem[],
  pageUrl: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.replace(/\n+/g, " ").trim(),
      },
    })),
    url: pageUrl,
  };
}
