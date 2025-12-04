import type { Metadata } from 'next';
import { siteConfig } from "@/config/site";
import { PressPageClient } from "./PressPageClient";
import { supabaseAdmin } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Awards & Press | ${siteConfig.name}`,
    description: "Discover our awards, press features, and media recognition at EGP Aesthetics London.",
    alternates: {
      canonical: `${siteConfig.url}/press`,
    },
  };
}

async function getPressItems() {
  try {
    const { data: pressItems, error } = await supabaseAdmin
      .from("press")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching press items:', error);
      return { awards: [], pressFeatures: [] };
    }

    return {
      awards: (pressItems || []).filter((item: any) => item.type === 'award'),
      pressFeatures: (pressItems || []).filter((item: any) => item.type === 'press_feature')
    };
  } catch (error) {
    console.error('Error fetching press items:', error);
    return { awards: [], pressFeatures: [] };
  }
}

export default async function PressPage() {
  const { awards, pressFeatures } = await getPressItems();

  return <PressPageClient awards={awards} pressFeatures={pressFeatures} />;
}

