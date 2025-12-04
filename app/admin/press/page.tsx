"use client";

import { AdminPressManager } from "@/components/AdminPressManager";

export default function AdminPressPage() {
  return (
    <div className="p-6">
      <div className="mt-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Press Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage awards and press features displayed on your press page. Upload certificates and images to showcase your achievements.
        </p>
      </div>
      
      <AdminPressManager />
    </div>
  );
}


