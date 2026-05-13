"use client";

import { Spinner } from "@heroui/react";

interface AdminPageLoadingProps {
  message?: string;
}

export function AdminPageLoading({
  message = "Loading…",
}: AdminPageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[320px] gap-6 py-12">
      <Spinner color="primary" size="lg" />
      <p className="text-sm font-medium text-default-500 dark:text-default-400">
        {message}
      </p>
      <div className="flex gap-1.5">
        <span
          className="w-2 h-2 rounded-full bg-rose-500 dark:bg-rose-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-pink-500 dark:bg-pink-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
