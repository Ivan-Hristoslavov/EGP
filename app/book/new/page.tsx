"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@heroui/react";

export default function BookNewPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /book (which is the main booking page)
    router.replace('/book');
  }, [router]);

  return (
    <div className="min-h-screen bg-default-50 flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" color="primary" className="mb-4" />
        <p className="text-default-600">Redirecting...</p>
      </div>
    </div>
  );
}
