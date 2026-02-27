"use client";

import { useState, useEffect } from "react";
import { Save, Instagram, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import { Button, Input, Card, CardBody, Spinner } from "@heroui/react";
import { useToast } from "@/components/Toast";
import { siteConfig } from "@/config/site";
import { inputClassNames, formLayout } from "@/config/design-system";

type SocialLinks = {
  instagram: string;
  facebook: string;
  youtube: string;
  tiktok: string;
  linkedin: string;
  twitter: string;
};

const defaultLinks: SocialLinks = {
  instagram: siteConfig.social.instagram ?? "",
  facebook: siteConfig.social.facebook ?? "",
  youtube: siteConfig.social.youtube ?? "",
  tiktok: siteConfig.social.tiktok ?? "",
  linkedin: siteConfig.social.linkedin ?? "",
  twitter: siteConfig.social.twitter ?? "",
};

export default function AdminSocialPage() {
  const { showSuccess, showError } = useToast();
  const [links, setLinks] = useState<SocialLinks>(defaultLinks);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings?key=social_links", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((value) => {
        if (cancelled) return;
        if (value && typeof value === "object") {
          setLinks({
            instagram: value.instagram ?? defaultLinks.instagram,
            facebook: value.facebook ?? defaultLinks.facebook,
            youtube: value.youtube ?? defaultLinks.youtube,
            tiktok: value.tiktok ?? defaultLinks.tiktok,
            linkedin: value.linkedin ?? defaultLinks.linkedin,
            twitter: value.twitter ?? defaultLinks.twitter,
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ social_links: links }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showSuccess("Saved", "Social links saved. They will appear in the footer and floating buttons.");
    } catch (e) {
      showError("Error", "Could not save social links. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const fields: { key: keyof SocialLinks; label: string; icon: React.ReactNode; placeholder: string }[] = [
    { key: "instagram", label: "Instagram", icon: <Instagram className="w-5 h-5" />, placeholder: "https://instagram.com/yourprofile" },
    { key: "facebook", label: "Facebook", icon: <Facebook className="w-5 h-5" />, placeholder: "https://facebook.com/yourpage" },
    { key: "youtube", label: "YouTube", icon: <Youtube className="w-5 h-5" />, placeholder: "https://youtube.com/@yourchannel" },
    { key: "tiktok", label: "TikTok", icon: <span className="text-lg">♪</span>, placeholder: "https://tiktok.com/@yourprofile" },
    { key: "linkedin", label: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, placeholder: "https://linkedin.com/company/yourpage" },
    { key: "twitter", label: "Twitter / X", icon: <Twitter className="w-5 h-5" />, placeholder: "https://twitter.com/yourprofile" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Social Media</h1>
      <p className="text-sm text-default-500 mb-6">
        These links appear in the footer, floating contact buttons, and anywhere social icons are shown.
      </p>
      <Card className="border border-divider">
        <CardBody className="p-4 sm:p-6">
          <div className={formLayout.gridFields}>
            {fields.map(({ key, label, icon, placeholder }) => (
              <Input
                key={key}
                label={label}
                value={links[key]}
                onValueChange={(v) => setLinks((prev) => ({ ...prev, [key]: v }))}
                placeholder={placeholder}
                type="url"
                startContent={icon}
                variant="bordered"
                labelPlacement="outside"
                classNames={inputClassNames}
              />
            ))}
          </div>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            isDisabled={saving}
            startContent={!saving && <Save className="w-4 h-4" />}
            className="mt-4 min-h-[44px] w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save social links"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
