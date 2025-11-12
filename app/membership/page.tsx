import type { Metadata } from 'next';
import Link from "next/link";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Skin Membership | ${siteConfig.name}`,
    description: "Join our exclusive skin membership program for priority access, special rates, and personalized skincare plans.",
    alternates: {
      canonical: `${siteConfig.url}/membership`,
    },
  };
}

export default function MembershipPage() {
  const membershipTiers = [
    {
      name: "Essential",
      price: "£49/month",
      features: [
        "15% discount on all treatments",
        "Priority booking",
        "Skincare consultation",
        "Monthly skincare tips",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: "£99/month",
      features: [
        "25% discount on all treatments",
        "VIP priority booking",
        "Quarterly skin analysis",
        "Free monthly facial",
        "Exclusive treatment previews",
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "£199/month",
      features: [
        "30% discount on all treatments",
        "Ultimate VIP booking",
        "Monthly skin analysis",
        "Free monthly treatment of choice",
        "Personal aesthetic advisor",
        "Exclusive member events",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-beige-lighter dark:bg-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
              Skin Membership Program
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Join our exclusive membership program and enjoy priority access, special rates, and personalized skincare plans designed just for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {membershipTiers.map((tier, index) => (
              <div
                key={index}
                className={`relative rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all bg-white/80 dark:bg-gray-800/90 border border-transparent ${
                  tier.popular ? 'ring-2 ring-warm-beige scale-105' : 'hover:border-warm-beige'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold text-warm-beige-dark dark:text-warm-beige mb-6">
                  {tier.price}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-warm-beige-dark mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  href="/membership/signup"
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all text-center block border border-warm-beige-dark ${
                    tier.popular
                      ? 'bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] text-gray-900 hover:from-[#8f8575] hover:via-[#a99f8e] hover:to-[#c4bcab]'
                      : 'bg-white/70 text-gray-900 hover:bg-warm-beige-light dark:bg-gray-800/80 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  Join {tier.name}
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Contact us today to learn more about our membership program and find the perfect plan for your needs.
            </p>
            <button className="bg-gradient-to-r from-[#9d9585] via-[#b5ad9d] to-[#c9c1b0] hover:from-[#8f8575] hover:via-[#a99f8e] hover:to-[#c4bcab] text-gray-900 px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Book Treatment Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

