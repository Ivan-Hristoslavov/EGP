import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export type SocialLinks = {
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  linkedin?: string;
  twitter?: string;
};

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "social_links")
      .single();

    if (error || !data?.value) {
      return NextResponse.json({
        instagram: siteConfig.social.instagram ?? "",
        facebook: siteConfig.social.facebook ?? "",
        youtube: siteConfig.social.youtube ?? "",
        tiktok: siteConfig.social.tiktok ?? "",
        linkedin: siteConfig.social.linkedin ?? "",
        twitter: siteConfig.social.twitter ?? "",
      } as SocialLinks);
    }

    const value = typeof data.value === "string" ? JSON.parse(data.value) : data.value;
    return NextResponse.json({
      instagram: value.instagram ?? siteConfig.social.instagram ?? "",
      facebook: value.facebook ?? siteConfig.social.facebook ?? "",
      youtube: value.youtube ?? siteConfig.social.youtube ?? "",
      tiktok: value.tiktok ?? siteConfig.social.tiktok ?? "",
      linkedin: value.linkedin ?? siteConfig.social.linkedin ?? "",
      twitter: value.twitter ?? siteConfig.social.twitter ?? "",
    } as SocialLinks);
  } catch (e) {
    console.error("social-links GET:", e);
    return NextResponse.json(
      {
        instagram: siteConfig.social.instagram ?? "",
        facebook: siteConfig.social.facebook ?? "",
        youtube: siteConfig.social.youtube ?? "",
        tiktok: siteConfig.social.tiktok ?? "",
        linkedin: siteConfig.social.linkedin ?? "",
        twitter: siteConfig.social.twitter ?? "",
      } as SocialLinks
    );
  }
}
