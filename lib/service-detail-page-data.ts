import { supabaseAdmin } from "@/lib/supabase";

export type GalleryRowForService = {
  id: string;
  title: string;
  description: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  order: number;
  is_featured: boolean | null;
  completion_date: string | null;
};

export type TeamSpotlightMember = {
  id: string;
  name: string;
  role: string;
  image_url: string | null;
  specializations: string | null;
  experience_years: string | null;
  certifications: string | null;
};

export type ReviewSnippet = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
};

export type ReviewsSummary = {
  averageRating: number;
  reviewCount: number;
  snippets: ReviewSnippet[];
};

export async function fetchGalleryForService(
  serviceId: string | null,
): Promise<GalleryRowForService[]> {
  if (!serviceId) return [];

  const { data, error } = await supabaseAdmin
    .from("gallery")
    .select(
      'id, title, description, before_image_url, after_image_url, "order", is_featured, completion_date',
    )
    .eq("service_id", serviceId)
    .eq("is_active", true)
    .not("before_image_url", "is", null)
    .not("after_image_url", "is", null)
    .order("order", { ascending: true });

  if (error) {
    console.error("fetchGalleryForService:", error);

    return [];
  }

  return (data || []) as GalleryRowForService[];
}

export async function fetchTeamSpotlight(): Promise<TeamSpotlightMember | null> {
  const { data, error } = await supabaseAdmin
    .from("team")
    .select(
      "id, name, role, image_url, specializations, experience_years, certifications",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("fetchTeamSpotlight:", error);

    return null;
  }

  return data as TeamSpotlightMember;
}

export async function fetchReviewsSummary(): Promise<ReviewsSummary> {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("id, customer_name, rating, comment")
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) {
    if (error) console.error("fetchReviewsSummary:", error);

    return { averageRating: 0, reviewCount: 0, snippets: [] };
  }

  const ratings = data
    .map((r) => r.rating)
    .filter((n) => typeof n === "number");
  const sum = ratings.reduce((a, b) => a + b, 0);
  const averageRating =
    ratings.length > 0 ? Math.round((sum / ratings.length) * 10) / 10 : 0;

  const snippets = data.slice(0, 3).map((r) => ({
    id: r.id,
    customer_name: r.customer_name,
    rating: r.rating,
    comment: r.comment,
  }));

  return {
    averageRating,
    reviewCount: data.length,
    snippets,
  };
}

/** UK-friendly: strips spaces, leading 0 → 44 for wa.me */
export function buildWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (!digits) return "https://wa.me/";

  if (digits.startsWith("44")) return `https://wa.me/${digits}`;
  if (digits.startsWith("0")) return `https://wa.me/44${digits.slice(1)}`;

  return `https://wa.me/${digits}`;
}
