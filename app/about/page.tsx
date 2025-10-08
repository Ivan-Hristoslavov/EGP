import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `About Us | ${siteConfig.name}`,
    description: "Learn about EGP Aesthetics London - our story, values, and commitment to providing exceptional aesthetic treatments.",
    alternates: {
      canonical: `${siteConfig.url}/about`,
    },
  };
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 font-playfair">
            About EGP Aesthetics London
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Welcome to EGP Aesthetics London, where we combine medical expertise with artistic vision to help you achieve your aesthetic goals.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
              Our Story
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Founded with a passion for natural beauty enhancement, EGP Aesthetics has been serving clients in London with exceptional aesthetic treatments. Our clinic is built on the foundation of trust, expertise, and personalized care.
            </p>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
              Our Values
            </h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Safety and excellence in every treatment</li>
              <li>Natural-looking results that enhance your beauty</li>
              <li>Personalized care tailored to your unique needs</li>
              <li>Continuous education and training in latest techniques</li>
              <li>Transparent pricing and honest consultations</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-12 mb-6">
              Why Choose Us
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our team of qualified practitioners is dedicated to providing safe, effective, and beautiful results. We stay at the forefront of aesthetic medicine, using only the latest techniques and highest quality products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

