export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "EGP",
  description:
    "Professional services platform - A skeleton template for building modern web applications.",
  links: {
    phone: "123456789",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "",
  },
  areas: [],
};
