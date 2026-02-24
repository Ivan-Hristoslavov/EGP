"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";

export type SocialLinks = {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  twitter: string;
};

const defaults: SocialLinks = {
  instagram: siteConfig.social.instagram ?? "",
  facebook: siteConfig.social.facebook ?? "",
  youtube: siteConfig.social.youtube ?? "",
  tiktok: siteConfig.social.tiktok ?? "",
  linkedin: siteConfig.social.linkedin ?? "",
  twitter: siteConfig.social.twitter ?? "",
};

export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLinks>(defaults);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/social-links")
      .then((res) => (res.ok ? res.json() : defaults))
      .then((data) => {
        if (!cancelled)
          setLinks({
            instagram: data.instagram ?? defaults.instagram,
            facebook: data.facebook ?? defaults.facebook,
            youtube: data.youtube ?? defaults.youtube,
            tiktok: data.tiktok ?? defaults.tiktok,
            linkedin: data.linkedin ?? defaults.linkedin,
            twitter: data.twitter ?? defaults.twitter,
          });
      })
      .catch(() => {
        if (!cancelled) setLinks(defaults);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { socialLinks: links, loading };
}
