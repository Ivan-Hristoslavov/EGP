import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { ArrowRight, CheckCircle, Star } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Conditions We Treat | ${siteConfig.name}`,
    description: "Find the right treatment for your specific condition. Expert aesthetic solutions for face and body concerns.",
    alternates: {
      canonical: `${siteConfig.url}/conditions`,
    },
  };
}

export default function ConditionsPage() {
  const faceConditions = [
    {
      name: "Acne & Acne Scarring",
      description: "Professional treatment for active acne and scar reduction",
      treatments: ["Medical Skin Peels", "Microneedling", "PRP Treatment"],
      href: "/conditions/acne-acne-scarring",
    },
    {
      name: "Rosacea",
      description: "Gentle treatments to reduce redness and inflammation",
      treatments: ["IPL Therapy", "Medical Peels", "Skincare Routine"],
      href: "/conditions/rosacea",
    },
    {
      name: "Hyperpigmentation & Melasma",
      description: "Advanced treatments for dark spots and uneven skin tone",
      treatments: ["Chemical Peels", "Laser Therapy", "Topical Treatments"],
      href: "/conditions/hyperpigmentation-melasma",
    },
    {
      name: "Dark Under-Eye Circles",
      description: "Non-invasive solutions for tired-looking eyes",
      treatments: ["Tear Trough Filler", "Under-Eye Skin Booster", "PRP"],
      href: "/conditions/dark-under-eye-circles",
    },
    {
      name: "Double Chin",
      description: "Effective fat reduction for a more defined jawline",
      treatments: ["Fat Freezing", "Radiofrequency", "Ultrasound Therapy"],
      href: "/conditions/double-chin",
    },
    {
      name: "Nasolabial Folds",
      description: "Smooth out smile lines for a youthful appearance",
      treatments: ["Dermal Fillers", "Anti-wrinkle Injections", "Skin Boosters"],
      href: "/conditions/nasolabial-folds",
    },
    {
      name: "Under-Eye Hollows",
      description: "Restore volume to tired, sunken under-eye areas",
      treatments: ["Tear Trough Filler", "Under-Eye Treatment", "Skin Booster"],
      href: "/conditions/under-eye-hollows",
    },
    {
      name: "Flat Cheeks",
      description: "Add volume and definition to cheekbones",
      treatments: ["Cheek Filler", "Mid-Face Lift", "Sculptra"],
      href: "/conditions/flat-cheeks",
    },
  ];

  const bodyConditions = [
    {
      name: "Cellulite",
      description: "Reduce the appearance of cellulite on thighs, buttocks, and abdomen",
      treatments: ["Radiofrequency", "Ultrasound Therapy", "Mesotherapy"],
      href: "/conditions/cellulite",
    },
    {
      name: "Stubborn Belly Fat",
      description: "Target abdominal fat that won't respond to diet and exercise",
      treatments: ["Fat Freezing", "Radiofrequency", "Combined Treatment"],
      href: "/conditions/stubborn-belly-fat",
    },
    {
      name: "Love Handles / Flanks",
      description: "Smooth and contour the sides of your waist",
      treatments: ["Fat Freezing", "Radiofrequency", "Ultrasound"],
      href: "/conditions/love-handles-flanks",
    },
    {
      name: "Sagging Skin",
      description: "Tighten and lift loose skin for a firmer appearance",
      treatments: ["Ultrasound Lift", "Radiofrequency", "Skin Tightening"],
      href: "/conditions/sagging-skin",
    },
    {
      name: "Stretch Marks",
      description: "Improve the appearance of stretch marks",
      treatments: ["Microneedling", "Chemical Peels", "Laser Therapy"],
      href: "/conditions/stretch-marks",
    },
    {
      name: "Arm Fat & Bingo Wings",
      description: "Reduce excess fat and tighten loose skin on arms",
      treatments: ["Fat Freezing", "Radiofrequency", "Ultrasound"],
      href: "/conditions/arm-fat-bingo-wings",
    },
    {
      name: "Thigh Fat & Inner Thigh Laxity",
      description: "Contour thighs and improve skin firmness",
      treatments: ["Fat Freezing", "Radiofrequency", "Skin Tightening"],
      href: "/conditions/thigh-fat-inner-thigh-laxity",
    },
    {
      name: "Post-Pregnancy Tummy",
      description: "Restore your pre-pregnancy body confidence",
      treatments: ["Fat Freezing", "Radiofrequency", "Skin Tightening"],
      href: "/conditions/post-pregnancy-tummy",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Conditions We Treat
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Expert aesthetic solutions for your specific concerns
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Face Conditions</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Body Conditions</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Personalized Treatment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Face Conditions */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Face Conditions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12">
              Expert treatments for facial concerns and skin issues
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {faceConditions.map((condition, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {condition.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {condition.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                      Recommended Treatments:
                    </h4>
                    <ul className="space-y-1">
                      {condition.treatments.map((treatment, treatmentIndex) => (
                        <li key={treatmentIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    href={condition.href}
                    className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body Conditions */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Body Conditions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12">
              Non-invasive body contouring and skin tightening treatments
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bodyConditions.map((condition, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {condition.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {condition.description}
                  </p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-400 mb-2">
                      Recommended Treatments:
                    </h4>
                    <ul className="space-y-1">
                      {condition.treatments.map((treatment, treatmentIndex) => (
                        <li key={treatmentIndex} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    href={condition.href}
                    className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Not Sure Which Treatment is Right for You?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Book your treatment now and let our experts create a personalized treatment plan for you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                     href="/book"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-lg font-semibold rounded-full hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                <Star className="w-5 h-5" />
                Book Treatment Now
              </Link>
              <Link
                     href="/book"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-rose-500 text-rose-500 dark:text-rose-400 text-lg font-semibold rounded-full hover:bg-rose-500 hover:text-white transition-all"
              >
                <ArrowRight className="w-5 h-5" />
                View All Treatments
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
