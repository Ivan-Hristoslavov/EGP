"use client";

import { AdminReviewsManager } from "@/components/AdminReviewsManager";

export default function AdminReviewsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reviews Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage customer reviews and testimonials. Approve reviews before they appear on your website.
        </p>
      </div>
      
      <AdminReviewsManager />
    </div>
  );
} 