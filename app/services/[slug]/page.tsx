import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { Calendar, Clock, CheckCircle, Star, ArrowRight, Phone, Shield } from "lucide-react";
import { notFound } from 'next/navigation';

// Service data - this would typically come from a database
const servicesData = {
  'book-treatment-now': {
    title: 'Book Treatment Now',
    category: 'Face',
    price: 'From £50',
    duration: '30 minutes',
    description: 'Start your aesthetic journey with a personalized consultation',
    benefits: [
      'Expert skin analysis and assessment',
      'Personalized treatment recommendations',
      'Transparent pricing information',
      'Professional advice from qualified practitioners',
      'Customized treatment plan creation'
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
      'Personalized recommendations',
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
    description: 'Specialized under-eye skin booster for dark circles and fine lines',
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
      'Customized to your facial features',
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
  const service = servicesData[slug as keyof typeof servicesData];
  
  if (!service) {
    return {
      title: `Service Not Found | ${siteConfig.name}`,
    };
  }

  return {
    title: `${service.title} | ${siteConfig.name}`,
    description: service.description,
    alternates: {
      canonical: `${siteConfig.url}/services/${slug}`,
    },
  };
}

export default async function ServicePage({ params }: PageProps) {
  const { slug } = await params;
  const service = servicesData[slug as keyof typeof servicesData];

  if (!service) {
    notFound();
  }

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {service.popular && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 dark:bg-rose-900/30 rounded-full text-rose-700 dark:text-rose-400 text-sm font-semibold mb-6">
                <Star className="w-4 h-4" />
                <span>Popular Treatment</span>
              </div>
            )}
            <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 text-sm font-medium mb-6">
              {service.category}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {service.title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {service.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Calendar className="w-5 h-5" />
                Book Consultation - {service.price}
              </Link>
              <Link
                href={`tel:${siteConfig.contact.phone}`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Service Info */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                  About This Treatment
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {service.description}. Our expert practitioners use advanced techniques and premium products to deliver exceptional results tailored to your individual needs.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-rose-500" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Duration</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{service.duration}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-rose-500" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Results</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Long-lasting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Treatment Benefits
                </h3>
                <ul className="space-y-4">
                  {service.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Procedure Steps */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
              Treatment Process
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {procedureSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-lg">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {service.title}
              </h2>
              <div className="text-4xl font-bold text-rose-600 dark:text-rose-400 mb-4">
                {service.price}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Includes consultation, treatment, and aftercare instructions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}