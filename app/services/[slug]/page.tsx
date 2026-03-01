import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import { typography, layout, textColors } from "@/config/typography";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, Star, ArrowRight, Phone, Shield } from "lucide-react";
import { notFound } from 'next/navigation';
import { Button } from "@heroui/button";

// Fetch service from database
async function getService(slug: string) {
  try {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories!inner(
          *,
          main_tab:main_tabs!inner(*)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
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
    console.error('Error fetching service:', error);
    return null;
  }
}

// Fallback service data for backwards compatibility
const servicesData = {
  'book-treatment-now': {
    title: 'Book Treatment Now',
    category: 'Face',
    price: 'From £50',
    duration: '30 minutes',
    description: 'Start your aesthetic journey with a personalised consultation',
    benefits: [
      'Expert skin analysis and assessment',
      'Personalised treatment recommendations',
      'Transparent pricing information',
      'Professional advice from qualified practitioners',
      'Customised treatment plan creation'
    ],
    popular: true
  },
  // FACE Services
  'digital-skin-analysis': {
    title: 'Digital Skin Analysis',
    category: 'Face',
    price: '£50',
    duration: '45 minutes',
    description: 'Advanced digital analysis of your skin condition and concerns',
    benefits: [
      'Comprehensive skin assessment',
      'Detailed analysis report',
      'Personalised recommendations',
      'Before/after tracking',
      'Professional skin mapping'
    ],
    popular: false
  },
  'prp': {
    title: 'PRP',
    category: 'Face',
    price: '£480',
    duration: '60 minutes',
    description: 'Platelet-rich plasma treatment for skin rejuvenation',
    benefits: [
      'Natural skin regeneration',
      'Reduced fine lines and wrinkles',
      'Improved skin texture',
      'Stimulates collagen production',
      'Minimal downtime'
    ],
    popular: true
  },
  'exosomes': {
    title: 'Exosomes',
    category: 'Face',
    price: '£550',
    duration: '60 minutes',
    description: 'Advanced exosome therapy for cellular regeneration',
    benefits: [
      'Advanced cellular regeneration',
      'Anti-ageing benefits',
      'Improved skin quality',
      'Reduced inflammation',
      'Enhanced healing'
    ],
    popular: false
  },
  'polynucleotides': {
    title: 'Polynucleotides',
    category: 'Face',
    price: '£390',
    duration: '45 minutes',
    description: 'DNA-based treatment for skin regeneration and hydration',
    benefits: [
      'Deep skin hydration',
      'Improved skin elasticity',
      'Reduced fine lines',
      'Enhanced skin quality',
      'Natural regeneration'
    ],
    popular: false
  },
  '5-point-facelift': {
    title: '5-Point Facelift',
    category: 'Face',
    price: '£950',
    duration: '90 minutes',
    description: 'Comprehensive facial lifting using multiple injection points',
    benefits: [
      'Comprehensive facial lifting',
      'Natural-looking results',
      'Long-lasting effects',
      'Minimal downtime',
      'Professional technique'
    ],
    popular: true
  },
  'profhilo': {
    title: 'Profhilo',
    category: 'Face',
    price: '£390',
    duration: '45 minutes',
    description: 'Revolutionary skin remodelling treatment for hydration and firmness',
    benefits: [
      'Deep skin hydration',
      'Improved skin firmness',
      'Natural-looking results',
      'Long-lasting effects',
      'Minimal downtime'
    ],
    popular: true
  },
  'sculptra': {
    title: 'Sculptra',
    category: 'Face',
    price: '£790',
    duration: '60 minutes',
    description: 'Collagen-stimulating treatment for volume restoration',
    benefits: [
      'Stimulates natural collagen',
      'Gradual, natural results',
      'Long-lasting effects',
      'Volume restoration',
      'Professional technique'
    ],
    popular: false
  },
  'skin-boosters': {
    title: 'Skin Boosters',
    category: 'Face',
    price: '£230',
    duration: '45 minutes',
    description: 'Hydrating skin boosters for improved skin quality',
    benefits: [
      'Deep skin hydration',
      'Improved skin texture',
      'Natural-looking results',
      'Quick procedure',
      'Minimal downtime'
    ],
    popular: true
  },
  'deep-cleansing-facial': {
    title: 'Deep Cleansing Facial',
    category: 'Face',
    price: '£170',
    duration: '60 minutes',
    description: 'Professional deep cleansing facial treatment',
    benefits: [
      'Deep pore cleansing',
      'Improved skin texture',
      'Relaxing experience',
      'Professional products',
      'Immediate results'
    ],
    popular: false
  },
  'medical-skin-peels': {
    title: 'Medical Skin Peels',
    category: 'Face',
    price: '£200',
    duration: '45 minutes',
    description: 'Professional medical-grade skin peels for skin renewal',
    benefits: [
      'Skin renewal and regeneration',
      'Improved skin texture',
      'Reduced pigmentation',
      'Professional strength',
      'Visible results'
    ],
    popular: true
  },
  'deep-hydra-detox-facial': {
    title: 'Deep Hydra Detox Facial',
    category: 'Face',
    price: '£200',
    duration: '60 minutes',
    description: 'Hydrating and detoxifying facial treatment',
    benefits: [
      'Deep hydration',
      'Skin detoxification',
      'Improved skin quality',
      'Relaxing treatment',
      'Immediate glow'
    ],
    popular: false
  },
  'nctf-under-eye-skin-booster': {
    title: 'NCTF Under-Eye Skin Booster',
    category: 'Face',
    price: '£159',
    duration: '30 minutes',
    description: 'Specialised under-eye skin booster for dark circles and fine lines',
    benefits: [
      'Targeted under-eye treatment',
      'Reduces dark circles',
      'Minimizes fine lines',
      'Quick procedure',
      'Natural results'
    ],
    popular: true
  },
  '3-step-under-eye-treatment': {
    title: '3-Step Under-Eye Treatment',
    category: 'Face',
    price: '£390',
    duration: '60 minutes',
    description: 'Comprehensive 3-step treatment for under-eye concerns',
    benefits: [
      'Comprehensive under-eye care',
      'Multiple treatment benefits',
      'Professional technique',
      'Visible improvements',
      'Long-lasting results'
    ],
    popular: true
  },
  'injectable-mesotherapy': {
    title: 'Injectable Mesotherapy',
    category: 'Face',
    price: '£170',
    duration: '45 minutes',
    description: 'Injectable mesotherapy for skin rejuvenation and hydration',
    benefits: [
      'Deep skin hydration',
      'Improved skin texture',
      'Reduced fine lines',
      'Natural ingredients',
      'Minimal downtime'
    ],
    popular: false
  },
  'microneedling-facial': {
    title: 'Microneedling Facial',
    category: 'Face',
    price: '£170',
    duration: '60 minutes',
    description: 'Professional microneedling for skin renewal and collagen stimulation',
    benefits: [
      'Stimulates collagen production',
      'Improves skin texture',
      'Reduces fine lines',
      'Minimizes pores',
      'Natural renewal process'
    ],
    popular: true
  },
  'full-face-balancing': {
    title: 'Full Face Balancing',
    category: 'Face',
    price: '£790',
    duration: '90 minutes',
    description: 'Comprehensive full-face balancing treatment for harmonious features',
    benefits: [
      'Comprehensive facial balancing',
      'Harmonious results',
      'Professional technique',
      'Natural-looking outcome',
      'Long-lasting effects'
    ],
    popular: false
  },

  // ANTI-WRINKLE INJECTIONS
  'baby-botox': {
    title: 'Baby Botox',
    category: 'Anti-Wrinkle Injections',
    price: '£199',
    duration: '30 minutes',
    description: 'Subtle, natural-looking anti-wrinkle injections for a refreshed appearance',
    benefits: [
      'Subtle, natural-looking results',
      'Preventive anti-ageing approach',
      'Minimal downtime',
      'Quick procedure',
      'Results last 3-4 months',
      'Suitable for first-time patients'
    ],
    popular: true
  },
  'lip-enhancement': {
    title: 'Lip Enhancement',
    category: 'Dermal Fillers',
    price: '£290',
    duration: '30 minutes',
    description: 'Natural-looking lip enhancement for fuller, more defined lips',
    benefits: [
      'Natural-looking results',
      'Immediate improvement',
      'Minimal downtime',
      'Results last 6-12 months',
      'Customised to your facial features',
      'Expert injection technique'
    ],
    popular: true
  },
  'fat-freezing-treatment': {
    title: 'Fat Freezing Treatment',
    category: 'Body Treatments',
    price: '£200',
    duration: '60 minutes',
    description: 'Non-invasive fat reduction using advanced cooling technology',
    benefits: [
      'Non-invasive treatment',
      'No downtime required',
      'Permanent fat reduction',
      'Safe and effective',
      'Results visible after 2-3 months',
      'Targets stubborn fat areas'
    ],
    popular: false
  }
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to fetch service for metadata
  const dbService = await getService(slug);
  const staticService = servicesData[slug as keyof typeof servicesData];
  
  const serviceTitle = dbService?.name || staticService?.title || 'Service';
  const serviceDescription = dbService?.description || staticService?.description || '';
  
  return {
    title: `${serviceTitle} | ${siteConfig.name}`,
    description: serviceDescription,
    alternates: {
      canonical: `${siteConfig.url}/services/${slug}`,
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
          id: '',
          slug: ''
        },
        price: typeof staticService.price === 'string' ? parseFloat(staticService.price.replace('£', '')) : staticService.price,
        duration: staticService.duration,
        description: staticService.description,
        benefits: staticService.benefits || [],
        is_featured: staticService.popular || false,
        results_duration_weeks: null,
        details: null
      };
    } else {
      notFound();
    }
  }
  
  // Normalize service data structure
  const serviceTitle = normalizedService.name || '';
  const serviceCategory = typeof normalizedService.category === 'object' ? normalizedService.category?.name : normalizedService.category || '';
  const servicePrice = normalizedService.price || 0;
  const serviceDuration = normalizedService.duration || '30 minutes';
  const serviceDescription = normalizedService.description || '';
  const serviceBenefits = Array.isArray(normalizedService.benefits) ? normalizedService.benefits : [];
  const isPopular = normalizedService.is_featured || false;

  const procedureSteps = [
    {
      step: "1",
      title: "Consultation",
      description: "Assessment of your needs and discussion of desired results"
    },
    {
      step: "2",
      title: "Treatment Planning",
      description: "Customised plan tailored to your individual requirements"
    },
    {
      step: "3",
      title: "Treatment Process",
      description: "Professional treatment performed by qualified practitioners"
    },
    {
      step: "4",
      title: "Aftercare",
      description: "Post-treatment care instructions and follow-up guidance"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-egp-green-darker flex flex-col">
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-egp-beige-lighter to-egp-beige-light dark:from-egp-green-dark dark:to-egp-green-darker">
        <div className={layout.container}>
          <div className="max-w-4xl mx-auto text-center">
            {isPopular && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-egp-green/20 dark:bg-egp-green-dark rounded-full text-egp-green dark:text-white text-xs font-semibold mb-4">
                <Star className="w-3 h-3" />
                <span>Popular Treatment</span>
              </div>
            )}
            <div className="inline-block px-3 py-1.5 bg-white/80 dark:bg-egp-green-dark rounded-full text-egp-green dark:text-white text-xs font-medium mb-4">
              {serviceCategory}
            </div>
            <h1 className={`${typography.headingPage} ${textColors.heading} mb-4`}>
              {serviceTitle}
            </h1>
            <p className={`${typography.lead} ${textColors.body} mb-6`}>
              {serviceDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                as={Link}
                href="/book/new"
                onClick={() => {
                  // Store service ID in sessionStorage for booking page
                  if (typeof window !== 'undefined' && normalizedService?.id) {
                    sessionStorage.setItem('pendingServiceId', normalizedService.id);
                  }
                }}
                size="lg"
                className="bg-egp-green hover:bg-egp-green-dark text-white"
                startContent={<Calendar className="w-5 h-5" />}
              >
                Book Consultation - {typeof servicePrice === 'number' ? `£${servicePrice}` : servicePrice}
              </Button>
              <Button
                as={Link}
                href={`tel:${siteConfig.contact.phone}`}
                variant="bordered"
                size="lg"
                className="border-egp-green text-egp-green dark:text-white dark:border-egp-green"
                startContent={<Phone className="w-5 h-5" />}
              >
                Call Us
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-12 md:py-16 flex-1">
        <div className={layout.container}>
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Service Info */}
              <div>
                <h2 className={`${typography.headingSection} ${textColors.heading} mb-4`}>
                  About This Treatment
                </h2>
                <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                  {serviceDescription}. Our expert practitioners use advanced techniques and premium products to deliver exceptional results tailored to your individual needs.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-egp-green" />
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">Duration</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{serviceDuration}</div>
                    </div>
                  </div>
                  {normalizedService.results_duration_weeks && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-egp-green" />
                      <div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">Results</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{normalizedService.results_duration_weeks} weeks</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Benefits */}
              {serviceBenefits && serviceBenefits.length > 0 && (
                <div>
                  <h3 className={`${typography.headingCard} ${textColors.heading} mb-4`}>
                    Treatment Benefits
                  </h3>
                  <ul className="space-y-3">
                    {serviceBenefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-egp-green mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Procedure Steps */}
      {normalizedService.details && (
        <section className="py-12 md:py-16 bg-egp-beige-lighter dark:bg-egp-green-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
                Treatment Process
              </h2>
              <div className="bg-white dark:bg-egp-green rounded-xl p-6 shadow-md">
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                  {normalizedService.details}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pricing & CTA - Fixed at bottom */}
      <section className="py-12 md:py-16 bg-egp-beige-lighter dark:bg-egp-green-dark mt-auto">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-egp-green rounded-2xl p-6 md:p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {serviceTitle}
                </h2>
                <div className="text-3xl font-bold text-egp-green dark:text-white mb-3">
                  {typeof servicePrice === 'number' ? `£${servicePrice}` : servicePrice}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Includes consultation, treatment, and aftercare instructions
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  as={Link}
                  href="/book/new"
                  onClick={() => {
                    // Store service ID in sessionStorage for booking page
                    if (typeof window !== 'undefined' && normalizedService?.id) {
                      sessionStorage.setItem('pendingServiceId', normalizedService.id);
                    }
                  }}
                  size="lg"
                  className="bg-egp-green hover:bg-egp-green-dark text-white"
                  startContent={<Calendar className="w-5 h-5" />}
                >
                  Book Now
                </Button>
                <Button
                  as={Link}
                  href="/services"
                  size="lg"
                  className="bg-egp-green hover:bg-egp-green-dark text-white"
                  startContent={<ArrowRight className="w-5 h-5" />}
                >
                  View All Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}