import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anti-wrinkle Injections in London | Botox Treatments",
  description: "Expert anti-wrinkle injections in London. Baby Botox, brow lift, forehead lines, eye wrinkles. Safe, effective treatments from £129.",
};

export default function AntiWrinkleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}





