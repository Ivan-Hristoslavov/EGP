import type { Metadata } from 'next';
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all ${
                  tier.popular ? 'ring-2 ring-rose-500 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-6">
                  {tier.price}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  tier.popular
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}>
                  Join {tier.name}
                </button>
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
            <button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
              Book Treatment Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

