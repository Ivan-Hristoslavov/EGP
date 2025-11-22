"use client";

import { AdminGalleryManager } from "@/components/AdminGalleryManager";

export default function AdminGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-pink-50/50 to-purple-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800">
      <div className="w-full max-w-[95%] 2xl:max-w-[1600px] mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent font-playfair mb-2">
            Gallery Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your gallery items and before/after images
          </p>
        </div>

        {/* Gallery Manager */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-100/50 dark:border-gray-700/50 overflow-hidden">
          <AdminGalleryManager />
        </div>
      </div>
    </div>
  );
}

