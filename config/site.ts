export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "FIX MY LEAK",
  description:
    "Professional plumbing services across South West London. Emergency plumber covering Clapham, Balham, Chelsea, Battersea, Wandsworth, and Streatham with 45-minute response times.",
  links: {
    phone: "07476 746635",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "info@fixmyleak.co.uk",
  },
  areas: [
    {
      name: "Clapham",
      slug: "clapham",
      postcode: "SW4"
    },
    {
      name: "Balham", 
      slug: "balham",
      postcode: "SW12"
    },
    {
      name: "Chelsea",
      slug: "chelsea", 
      postcode: "SW3"
    },
    {
      name: "Battersea",
      slug: "battersea",
      postcode: "SW8"
    },
    {
      name: "Wandsworth",
      slug: "wandsworth",
      postcode: "SW18"
    },
    {
      name: "Streatham",
      slug: "streatham",
      postcode: "SW16"
    }
  ],
};
