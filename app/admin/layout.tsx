"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Package,
  Users,
  Calendar,
  CalendarDays,
  CalendarOff,
  CreditCard,
  Image as ImageIcon,
  FileEdit,
  Mail,
  Star,
  Newspaper,
  Info,
  UsersRound,
  User,
  Share2,
  Images,
  FileText,
  Percent,
  BookOpen,
} from "lucide-react";

import ThemeToggleButton from "../../components/ThemeToggleButton";
import { layout, textColors, typography } from "@/config/typography";

// Navigation definition
const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    name: "Bookings",
    href: "/admin/bookings",
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    name: "Calendar",
    href: "/admin/calendar",
    icon: <Calendar className="w-5 h-5" />,
  },
  {
    name: "Day off",
    href: "/admin/day-off",
    icon: <CalendarOff className="w-5 h-5" />,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: "Services",
    href: "/admin/services",
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: "Team",
    href: "/admin/team",
    icon: <UsersRound className="w-5 h-5" />,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    name: "VAT",
    href: "/admin/settings/vat",
    icon: <Percent className="w-5 h-5" />,
  },
  {
    name: "Gallery",
    href: "/admin/gallery",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  {
    name: "Reviews",
    href: "/admin/reviews",
    icon: <Star className="w-5 h-5" />,
  },
  {
    name: "Blog",
    href: "/admin/blog",
    icon: <FileEdit className="w-5 h-5" />,
  },
  {
    name: "Press",
    href: "/admin/press",
    icon: <Newspaper className="w-5 h-5" />,
  },
  {
    name: "About",
    href: "/admin/about",
    icon: <Info className="w-5 h-5" />,
  },
  {
    name: "Site guidance",
    href: "/admin/site-guidance",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: "Social Media",
    href: "/admin/social",
    icon: <Share2 className="w-5 h-5" />,
  },
  {
    name: "Profile",
    href: "/admin/profile",
    icon: <User className="w-5 h-5" />,
  },
  {
    name: "Hero Section",
    href: "/admin/hero-section",
    icon: <Images className="w-5 h-5" />,
  },
  {
    name: "Test Email",
    href: "/admin/test-email",
    icon: <Mail className="w-5 h-5" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Used to delay rendering until after hydration, for hydration-safe DOM-dependent code
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthenticated(false);
      setIsLoading(false);

      return;
    }

    let cancelled = false;

    async function verifySession() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/admin/auth", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.ok) {
          setIsAuthenticated(true);
          setIsLoading(false);
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
          router.replace("/admin/login");
        }
      } catch {
        if (cancelled) return;
        setIsAuthenticated(false);
        setIsLoading(false);
        router.replace("/admin/login");
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!hasMounted) {
    // Ensure nothing is rendered until after mount, for hydration safety
    return null;
  }

  // If we're on the login page, just render the children
  if (pathname === "/admin/login") {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-500"
      >
        {children}
      </div>
    );
  }

  // Show loading state: skeleton that mirrors admin layout for a smooth transition
  if (isLoading) {
    return (
      <div
        suppressHydrationWarning
        className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-500 flex"
      >
        {/* Skeleton sidebar */}
        <div className="hidden lg:flex w-64 flex-col flex-shrink-0 bg-white dark:bg-gray-800 shadow-xl animate-pulse">
          <div className="flex min-h-[4.5rem] items-center gap-3 border-b border-white/10 bg-gradient-to-r from-rose-600/80 to-purple-600/80 px-4 py-3 sm:px-5">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-white/20 sm:h-10 sm:w-10 sm:rounded-xl" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 max-w-full rounded bg-white/30" />
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div
                key={i}
                className="h-10 rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </nav>
        </div>
        {/* Skeleton main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white/80 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 sm:px-6 animate-pulse">
            <div className="lg:hidden w-10 h-10 rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="ml-4 h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </header>
          <main className="flex-1 p-4 lg:p-6">
            <div className="flex flex-col items-center justify-center min-h-[360px] gap-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-rose-200 dark:border-rose-800" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 dark:border-t-rose-400 animate-spin" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Loading Admin Panel
              </p>
              <div className="flex gap-1.5">
                <span
                  className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-pink-500 animate-bounce"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: "240ms" }}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Render main layout only after hydration
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-colors duration-500"
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" />
        </div>
      )}

      {/* Fixed Sidebar */}
      <div
        suppressHydrationWarning
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 px-4 py-3 sm:px-5">
          <Link
            className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3"
            href="/admin/dashboard"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm sm:h-10 sm:w-10 sm:rounded-xl">
              <Shield className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-montserrat text-base font-bold leading-snug text-white sm:text-lg sm:leading-tight">
                Admin Panel
              </h1>
            </div>
          </Link>
          <button
            aria-label="Close menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center text-white transition-colors hover:text-white/90 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 dark:hover:from-rose-900/20 dark:hover:to-pink-900/20 hover:text-rose-700 dark:hover:text-rose-300"
                  }`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span
                    className={`mr-3 transition-colors ${
                      isActive
                        ? "text-rose-700 dark:text-rose-300"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-rose-600 dark:group-hover:text-rose-300"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <button
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            onClick={async () => {
              try {
                await fetch("/api/admin/auth", { method: "DELETE" });
                router.push("/admin/login");
              } catch (error) {
                console.error("Logout failed:", error);
                router.push("/admin/login");
              }
            }}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content area with margin for fixed sidebar */}
      <div suppressHydrationWarning className="lg:ml-64 min-w-0">
        {/* Top bar */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm border-b border-rose-200/50 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <button
                aria-label="Open menu"
                className="lg:hidden min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1
                  className={`${typography.headingSmall} ${textColors.heading}`}
                >
                  {navigation.find((item) => item.href === pathname)?.name ||
                    "Admin Panel"}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggleButton />
            </div>
          </div>
        </header>
        {/* Page content */}
        <main
          suppressHydrationWarning
          className="min-h-screen bg-gradient-to-br from-rose-50/30 via-pink-50/30 to-purple-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-800 transition-colors duration-300"
        >
          <div
            className={`${layout.containerWide} py-3 sm:py-4 lg:py-6 xl:py-8 min-w-0 overflow-x-hidden`}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
