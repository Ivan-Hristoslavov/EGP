import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { ServiceDetailAboutEditorial } from "@/components/services/service-detail/service-detail-about-editorial";
import { ServiceDetailExtraInfo } from "@/components/services/service-detail/service-detail-extra-info";
import { ServiceDetailFaq } from "@/components/services/service-detail/service-detail-faq";
import { ServiceDetailFinalCta } from "@/components/services/service-detail/service-detail-final-cta";
import { ServiceDetailHeroPremium } from "@/components/services/service-detail/service-detail-hero-premium";
import { ServiceDetailPricingPanel } from "@/components/services/service-detail/service-detail-pricing-panel";
import { ServiceDetailProcessTimeline } from "@/components/services/service-detail/service-detail-process-timeline";
import { ServiceDetailQuickInfoBar } from "@/components/services/service-detail/service-detail-quick-info-bar";
import { ServiceDetailResultsGallery } from "@/components/services/service-detail/service-detail-results-gallery";
import { ServiceDetailResultsLongevity } from "@/components/services/service-detail/service-detail-results-longevity";
import { ServiceDetailSafetyExpertise } from "@/components/services/service-detail/service-detail-safety-expertise";
import { ServiceDetailStickyCta } from "@/components/services/service-detail/service-detail-sticky-cta";
import { ServiceDetailWhoFor } from "@/components/services/service-detail/service-detail-who-for";
import { siteConfig } from "@/config/site";
import {
  buildFaqPageJsonLd,
  getServiceDetailEnrichment,
} from "@/lib/service-detail-enrichment";
import {
  buildWhatsAppLink,
  fetchGalleryForService,
  fetchReviewsSummary,
  fetchTeamSpotlight,
} from "@/lib/service-detail-page-data";
import { canonicalUrl, defaultOgImages, toMetaDescription } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Fetch service from database
async function getService(slug: string) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();

    const { data: service, error } = await supabase
      .from("services")
      .select(
        `
        *,
        category:service_categories!inner(
          *,
          main_tab:main_tabs!inner(*)
        )
      `,
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !service) {
      return null;
    }

    // Transform the data to flatten the structure
    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      details: service.details,
      benefits: service.benefits,
      preparation: service.preparation,
      aftercare: service.aftercare,
      duration: service.duration,
      price: parseFloat(service.price.toString()),
      is_featured: service.is_featured,
      image_url: service.image_url,
      requires_consultation: service.requires_consultation,
      downtime_days: service.downtime_days,
      results_duration_weeks: service.results_duration_weeks,
      display_order: service.display_order,
      category: {
        id: service.category.id,
        name: service.category.name,
        slug: service.category.slug,
      },
    };
  } catch (error) {
    console.error("Error fetching service:", error);

    return null;
  }
}

// Fallback service data for backwards compatibility
const servicesData = {
  "book-treatment-now": {
    title: "Book Treatment Now",
    category: "Face",
    price: "From £50",
    duration: "30 minutes",
    description:
      "Start your aesthetic journey with a personalised consultation",
    benefits: [
      "Expert skin analysis and assessment",
      "Personalised treatment recommendations",
      "Transparent pricing information",
      "Professional advice from qualified practitioners",
      "Customised treatment plan creation",
    ],
    popular: true,
  },
  // FACE Services
  "digital-skin-analysis": {
    title: "Digital Skin Analysis",
    category: "Face",
    price: "£50",
    duration: "45 minutes",
    description:
      "Advanced digital analysis of your skin condition and concerns",
    benefits: [
      "Comprehensive skin assessment",
      "Detailed analysis report",
      "Personalised recommendations",
      "Before/after tracking",
      "Professional skin mapping",
    ],
    popular: false,
  },
  prp: {
    title: "PRP",
    category: "Face",
    price: "£480",
    duration: "60 minutes",
    description: "Platelet-rich plasma treatment for skin rejuvenation",
    benefits: [
      "Natural skin regeneration",
      "Reduced fine lines and wrinkles",
      "Improved skin texture",
      "Stimulates collagen production",
      "Minimal downtime",
    ],
    popular: true,
  },
  exosomes: {
    title: "Exosomes",
    category: "Face",
    price: "£550",
    duration: "60 minutes",
    description: "Advanced exosome therapy for cellular regeneration",
    benefits: [
      "Advanced cellular regeneration",
      "Anti-ageing benefits",
      "Improved skin quality",
      "Reduced inflammation",
      "Enhanced healing",
    ],
    popular: false,
  },
  polynucleotides: {
    title: "Polynucleotides",
    category: "Face",
    price: "£390",
    duration: "45 minutes",
    description: "DNA-based treatment for skin regeneration and hydration",
    benefits: [
      "Deep skin hydration",
      "Improved skin elasticity",
      "Reduced fine lines",
      "Enhanced skin quality",
      "Natural regeneration",
    ],
    popular: false,
  },
  "5-point-facelift": {
    title: "5-Point Facelift",
    category: "Face",
    price: "£950",
    duration: "90 minutes",
    description: "Comprehensive facial lifting using multiple injection points",
    benefits: [
      "Comprehensive facial lifting",
      "Natural-looking results",
      "Long-lasting effects",
      "Minimal downtime",
      "Professional technique",
    ],
    popular: true,
  },
  profhilo: {
    title: "Profhilo",
    category: "Face",
    price: "£390",
    duration: "45 minutes",
    description:
      "Revolutionary skin remodelling treatment for hydration and firmness",
    benefits: [
      "Deep skin hydration",
      "Improved skin firmness",
      "Natural-looking results",
      "Long-lasting effects",
      "Minimal downtime",
    ],
    popular: true,
  },
  sculptra: {
    title: "Sculptra",
    category: "Face",
    price: "£790",
    duration: "60 minutes",
    description: "Collagen-stimulating treatment for volume restoration",
    benefits: [
      "Stimulates natural collagen",
      "Gradual, natural results",
      "Long-lasting effects",
      "Volume restoration",
      "Professional technique",
    ],
    popular: false,
  },
  "skin-boosters": {
    title: "Skin Boosters",
    category: "Face",
    price: "£230",
    duration: "45 minutes",
    description: "Hydrating skin boosters for improved skin quality",
    benefits: [
      "Deep skin hydration",
      "Improved skin texture",
      "Natural-looking results",
      "Quick procedure",
      "Minimal downtime",
    ],
    popular: true,
  },
  "deep-cleansing-facial": {
    title: "Deep Cleansing Facial",
    category: "Face",
    price: "£170",
    duration: "60 minutes",
    description: "Professional deep cleansing facial treatment",
    benefits: [
      "Deep pore cleansing",
      "Improved skin texture",
      "Relaxing experience",
      "Professional products",
      "Immediate results",
    ],
    popular: false,
  },
  "medical-skin-peels": {
    title: "Medical Skin Peels",
    category: "Face",
    price: "£200",
    duration: "45 minutes",
    description: "Professional medical-grade skin peels for skin renewal",
    benefits: [
      "Skin renewal and regeneration",
      "Improved skin texture",
      "Reduced pigmentation",
      "Professional strength",
      "Visible results",
    ],
    popular: true,
  },
  "deep-hydra-detox-facial": {
    title: "Deep Hydra Detox Facial",
    category: "Face",
    price: "£200",
    duration: "60 minutes",
    description: "Hydrating and detoxifying facial treatment",
    benefits: [
      "Deep hydration",
      "Skin detoxification",
      "Improved skin quality",
      "Relaxing treatment",
      "Immediate glow",
    ],
    popular: false,
  },
  "nctf-under-eye-skin-booster": {
    title: "NCTF Under-Eye Skin Booster",
    category: "Face",
    price: "£159",
    duration: "30 minutes",
    description:
      "Specialised under-eye skin booster for dark circles and fine lines",
    benefits: [
      "Targeted under-eye treatment",
      "Reduces dark circles",
      "Minimizes fine lines",
      "Quick procedure",
      "Natural results",
    ],
    popular: true,
  },
  "3-step-under-eye-treatment": {
    title: "3-Step Under-Eye Treatment",
    category: "Face",
    price: "£390",
    duration: "60 minutes",
    description: "Comprehensive 3-step treatment for under-eye concerns",
    benefits: [
      "Comprehensive under-eye care",
      "Multiple treatment benefits",
      "Professional technique",
      "Visible improvements",
      "Long-lasting results",
    ],
    popular: true,
  },
  "injectable-mesotherapy": {
    title: "Injectable Mesotherapy",
    category: "Face",
    price: "£170",
    duration: "45 minutes",
    description: "Injectable mesotherapy for skin rejuvenation and hydration",
    benefits: [
      "Deep skin hydration",
      "Improved skin texture",
      "Reduced fine lines",
      "Natural ingredients",
      "Minimal downtime",
    ],
    popular: false,
  },
  "microneedling-facial": {
    title: "Microneedling Facial",
    category: "Face",
    price: "£170",
    duration: "60 minutes",
    description:
      "Professional microneedling for skin renewal and collagen stimulation",
    benefits: [
      "Stimulates collagen production",
      "Improves skin texture",
      "Reduces fine lines",
      "Minimizes pores",
      "Natural renewal process",
    ],
    popular: true,
  },
  "full-face-balancing": {
    title: "Full Face Balancing",
    category: "Face",
    price: "£790",
    duration: "90 minutes",
    description:
      "Comprehensive full-face balancing treatment for harmonious features",
    benefits: [
      "Comprehensive facial balancing",
      "Harmonious results",
      "Professional technique",
      "Natural-looking outcome",
      "Long-lasting effects",
    ],
    popular: false,
  },

  // ANTI-WRINKLE INJECTIONS
  "baby-botox": {
    title: "Baby Botox",
    category: "Anti-Wrinkle Injections",
    price: "£199",
    duration: "30 minutes",
    description:
      "Subtle, natural-looking anti-wrinkle injections for a refreshed appearance",
    benefits: [
      "Subtle, natural-looking results",
      "Preventive anti-ageing approach",
      "Minimal downtime",
      "Quick procedure",
      "Results last 3-4 months",
      "Suitable for first-time patients",
    ],
    popular: true,
  },
  "lip-enhancement": {
    title: "Lip Enhancement",
    category: "Dermal Fillers",
    price: "£290",
    duration: "30 minutes",
    description:
      "Natural-looking lip enhancement for fuller, more defined lips",
    benefits: [
      "Natural-looking results",
      "Immediate improvement",
      "Minimal downtime",
      "Results last 6-12 months",
      "Customised to your facial features",
      "Expert injection technique",
    ],
    popular: true,
  },
  "fat-freezing-treatment": {
    title: "Fat Freezing Treatment",
    category: "Body Treatments",
    price: "£200",
    duration: "60 minutes",
    description: "Non-invasive fat reduction using advanced cooling technology",
    benefits: [
      "Non-invasive treatment",
      "No downtime required",
      "Permanent fat reduction",
      "Safe and effective",
      "Results visible after 2-3 months",
      "Targets stubborn fat areas",
    ],
    popular: false,
  },
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatServiceDuration(value: unknown): string {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return `${value} minutes`;
  }

  if (typeof value === "string" && value.trim()) return value;

  return "30 minutes";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const dbService = await getService(slug);
  const staticService = servicesData[slug as keyof typeof servicesData];

  const serviceTitle = dbService?.name || staticService?.title || "Service";
  const categorySlug =
    typeof dbService?.category === "object" && dbService.category
      ? dbService.category.slug
      : "";
  const categoryName =
    typeof dbService?.category === "object" && dbService.category
      ? dbService.category.name
      : staticService?.category || "";

  const enrichment = getServiceDetailEnrichment(
    slug,
    categorySlug,
    categoryName,
  );

  const serviceDescription = toMetaDescription(
    enrichment.metaDescription ||
      dbService?.description ||
      staticService?.description ||
      `Book ${serviceTitle} at our London aesthetic clinic.`,
  );

  return {
    title: `${serviceTitle} | ${siteConfig.name}`,
    description: serviceDescription,
    alternates: {
      canonical: canonicalUrl(`/services/${slug}`),
    },
    openGraph: {
      title: `${serviceTitle} | ${siteConfig.name}`,
      description: serviceDescription,
      url: canonicalUrl(`/services/${slug}`),
      type: "website",
      locale: "en_GB",
      siteName: siteConfig.name,
      images: defaultOgImages(serviceTitle),
    },
    twitter: {
      card: "summary_large_image",
      title: `${serviceTitle} | ${siteConfig.shortName}`,
      description: serviceDescription,
      images: [canonicalUrl("/opengraph-image")],
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;

  // Try to fetch from database first
  let service = await getService(slug);

  // Fallback to static data if not found in database
  let normalizedService: any = service;

  if (!normalizedService) {
    const staticService = servicesData[slug as keyof typeof servicesData];

    if (staticService) {
      normalizedService = {
        name: staticService.title,
        category: {
          name: staticService.category,
          id: "",
          slug: "",
        },
        price:
          typeof staticService.price === "string"
            ? parseFloat(staticService.price.replace(/[^0-9.]/g, ""))
            : staticService.price,
        duration: staticService.duration,
        description: staticService.description,
        benefits: staticService.benefits || [],
        is_featured: staticService.popular || false,
        results_duration_weeks: null,
        details: null,
        preparation: null,
        aftercare: null,
        downtime_days: null,
        image_url: null,
        requires_consultation: false,
      };
    } else {
      notFound();
    }
  }

  // Normalize service data structure
  const serviceTitle = normalizedService.name || "";
  const serviceCategory =
    typeof normalizedService.category === "object"
      ? normalizedService.category?.name
      : normalizedService.category || "";
  const rawPrice = normalizedService.price;
  const staticSource =
    !service && slug in servicesData
      ? servicesData[slug as keyof typeof servicesData]
      : null;
  const servicePriceDisplay =
    staticSource && typeof staticSource.price === "string"
      ? staticSource.price
      : typeof rawPrice === "number" &&
          !Number.isNaN(rawPrice) &&
          rawPrice === 0
        ? "Complimentary"
        : typeof rawPrice === "number" && !Number.isNaN(rawPrice)
          ? `£${rawPrice}`
          : "Price on request";
  const serviceDurationDisplay = formatServiceDuration(
    normalizedService.duration,
  );
  const serviceDescription = normalizedService.description || "";
  const serviceBenefits = Array.isArray(normalizedService.benefits)
    ? normalizedService.benefits
    : [];
  const isPopular = normalizedService.is_featured || false;

  const bookHref =
    typeof normalizedService.id === "string" && normalizedService.id.length > 0
      ? `/book?service=${encodeURIComponent(slug)}`
      : "/book/new";

  const callHref = `tel:${siteConfig.contact.phone}`;
  const whatsappHref = buildWhatsAppLink(siteConfig.contact.whatsapp);

  const serviceId =
    typeof normalizedService.id === "string" && normalizedService.id.length > 0
      ? normalizedService.id
      : null;

  const categorySlug =
    typeof normalizedService.category === "object" &&
    normalizedService.category &&
    typeof normalizedService.category.slug === "string"
      ? normalizedService.category.slug
      : "";

  const enrichment = getServiceDetailEnrichment(
    slug,
    categorySlug,
    serviceCategory,
  );

  const [galleryRows, teamMember, reviewsSummary] = await Promise.all([
    fetchGalleryForService(serviceId),
    fetchTeamSpotlight(),
    fetchReviewsSummary(),
  ]);

  const heroImageUrl =
    (typeof normalizedService.image_url === "string" &&
    normalizedService.image_url.trim()
      ? normalizedService.image_url.trim()
      : null) ||
    (galleryRows[0]?.after_image_url ?? null);

  const detailsText =
    typeof normalizedService.details === "string"
      ? normalizedService.details
      : "";
  const detailsMentionsTechnique =
    /\b(cannula|needle)\b/i.test(detailsText) ||
    /\b(cannula|needle)\b/i.test(serviceDescription);

  const pageUrl = canonicalUrl(`/services/${slug}`);
  const faqJsonLd = buildFaqPageJsonLd(enrichment.faqItems, pageUrl);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="relative flex min-h-screen flex-col bg-white pb-[calc(5.5rem+env(safe-area-inset-bottom))] dark:bg-egp-green-darker md:pb-0">
        <ServiceDetailHeroPremium
          bookHref={bookHref}
          callHref={callHref}
          enrichment={enrichment}
          imageUrl={heroImageUrl}
          isPopular={isPopular}
          requiresConsultation={Boolean(
            normalizedService.requires_consultation,
          )}
          serviceCategory={serviceCategory}
          servicePriceDisplay={servicePriceDisplay}
          serviceTitle={serviceTitle}
          whatsappHref={whatsappHref}
        />

        <ServiceDetailQuickInfoBar
          downtimeDays={
            typeof normalizedService.downtime_days === "number"
              ? normalizedService.downtime_days
              : null
          }
          enrichment={enrichment}
          resultsDurationWeeks={
            typeof normalizedService.results_duration_weeks === "number"
              ? normalizedService.results_duration_weeks
              : null
          }
          serviceDurationDisplay={serviceDurationDisplay}
          servicePriceDisplay={servicePriceDisplay}
        />

        <ServiceDetailResultsGallery
          items={galleryRows}
          serviceCategoryName={serviceCategory}
        />

        <ServiceDetailAboutEditorial
          benefits={serviceBenefits}
          description={serviceDescription}
          details={normalizedService.details ?? null}
          enrichment={enrichment}
          serviceTitle={serviceTitle}
        />

        <ServiceDetailWhoFor
          enrichment={enrichment}
          requiresConsultation={Boolean(
            normalizedService.requires_consultation,
          )}
        />

        <ServiceDetailProcessTimeline
          detailsMentionsTechnique={detailsMentionsTechnique}
          enrichment={enrichment}
        />

        <ServiceDetailResultsLongevity
          aftercare={normalizedService.aftercare ?? null}
          downtimeDays={
            typeof normalizedService.downtime_days === "number"
              ? normalizedService.downtime_days
              : null
          }
          enrichment={enrichment}
          resultsDurationWeeks={
            typeof normalizedService.results_duration_weeks === "number"
              ? normalizedService.results_duration_weeks
              : null
          }
        />

        <ServiceDetailSafetyExpertise
          enrichment={enrichment}
          teamMember={teamMember}
        />

        <ServiceDetailPricingPanel
          enrichment={enrichment}
          servicePriceDisplay={servicePriceDisplay}
        />

        <ServiceDetailExtraInfo
          aftercare={normalizedService.aftercare ?? null}
          details={normalizedService.details ?? null}
          preparation={normalizedService.preparation ?? null}
        />

        <ServiceDetailFaq items={enrichment.faqItems} />

        <ServiceDetailFinalCta
          bookHref={bookHref}
          callHref={callHref}
          enrichment={enrichment}
          reviews={reviewsSummary}
          servicePriceDisplay={servicePriceDisplay}
          whatsappHref={whatsappHref}
        />

        <ServiceDetailStickyCta
          bookHref={bookHref}
          servicePriceDisplay={servicePriceDisplay}
        />
      </div>
    </>
  );
}
