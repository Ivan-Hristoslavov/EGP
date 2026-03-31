"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AdminProfileProvider } from "@/components/AdminProfileContext";
import { SiteDataProvider } from "@/contexts/SiteDataContext";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  initialAdminProfile?: any;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps, initialAdminProfile = null }: ProvidersProps) {
  const router = useRouter();

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      themes={["light", "dark"]}
      {...themeProps}
    >
      <HeroUIProvider navigate={router.push}>
        <AdminProfileProvider initialProfile={initialAdminProfile}>
          <SiteDataProvider>
          {children}
          </SiteDataProvider>
        </AdminProfileProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
