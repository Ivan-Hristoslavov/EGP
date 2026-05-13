"use client";

import { AdminBlogManager } from "@/components/AdminBlogManager";
import { layout } from "@/config/typography";

export default function AdminBlogPage() {
  return (
    <div className={`w-full ${layout.containerWide}`}>
      <AdminBlogManager />
    </div>
  );
}
