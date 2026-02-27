"use client";

import Link from "next/link";
import { Home, Mail } from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";
import { FirstVisitDiscountFormWrapper } from "@/components/FirstVisitDiscountFormWrapper";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-egp-beige-lighter dark:bg-egp-green-darker flex items-center justify-center px-4 transition-colors duration-300">
      <Card className="max-w-md w-full" shadow="lg">
        <CardBody className="text-center py-8">
          <div className="mb-8">
            <div className="w-24 h-24 bg-egp-beige-dark dark:bg-egp-green-dark rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-12 h-12 text-egp-green dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"
                />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
              Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              as={Link}
              href="/"
              size="lg"
              className="bg-gradient-to-r from-egp-green via-egp-green-light to-egp-green text-white"
              startContent={<Home className="w-5 h-5" />}
            >
              Go Home
            </Button>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Need help? Contact us at{" "}
                <a
                  href={`mailto:${process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk"}`}
                  className="text-egp-green dark:text-white hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="w-4 h-4" />
                  {process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@egpaesthetics.co.uk"}
                </a>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
      <FirstVisitDiscountFormWrapper />
    </div>
  );
} 