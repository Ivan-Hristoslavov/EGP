"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAdminProfile as useAdminProfileHook } from "@/hooks/useAdminProfile";

interface AdminProfileContextType {
  adminProfile: any; // Using any to accommodate the combined profile data
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({ 
  children
}: { 
  children: ReactNode;
}) {
  const { profile, loading, error, refresh } = useAdminProfileHook();

  return (
    <AdminProfileContext.Provider value={{ 
      adminProfile: profile, 
      loading, 
      error, 
      refresh 
    }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (context === undefined) {
    throw new Error("useAdminProfile must be used within an AdminProfileProvider");
  }
  return context.adminProfile;
}

export function useAdminProfileContext() {
  const context = useContext(AdminProfileContext);
  if (context === undefined) {
    throw new Error("useAdminProfileContext must be used within an AdminProfileProvider");
  }
  return context;
} 