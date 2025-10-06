import { useState, useEffect } from "react";

export type VATSettings = {
  id: string;
  is_enabled: boolean;
  vat_rate: number;
  vat_number: string | null;
};

export function useVATSettings() {
  const [settings, setSettings] = useState<VATSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVATSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/admin/settings/vat");
      
      if (!response.ok) {
        throw new Error("Failed to fetch VAT settings");
      }
      
      const data = await response.json();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateVATSettings = async (updates: Partial<VATSettings>) => {
    if (!settings) return;

    try {
      const updatedSettings = { ...settings, ...updates };
      
      const response = await fetch("/api/admin/settings/vat", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error("Failed to update VAT settings");
      }

      const data = await response.json();
      setSettings(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  useEffect(() => {
    fetchVATSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    fetchVATSettings,
    updateVATSettings,
  };
} 