import { describe, it, expect } from "vitest";
import { typography, layout, textColors } from "./typography";

describe("config/typography", () => {
  describe("typography", () => {
    it("headingPage has responsive classes", () => {
      expect(typography.headingPage).toContain("text-2xl");
      expect(typography.headingPage).toContain("sm:text-3xl");
      expect(typography.headingPage).toContain("font-bold");
    });

    it("headingHero includes xl breakpoint", () => {
      expect(typography.headingHero).toContain("xl:text-6xl");
    });

    it("headingSection has responsive scale", () => {
      expect(typography.headingSection).toContain("text-xl");
      expect(typography.headingSection).toContain("lg:text-4xl");
    });

    it("layout.container has max-width and padding", () => {
      expect(layout.container).toContain("max-w-6xl");
      expect(layout.container).toContain("mx-auto");
      expect(layout.container).toContain("px-4");
    });

    it("textColors has heading and body", () => {
      expect(textColors.heading).toBeDefined();
      expect(textColors.body).toBeDefined();
      expect(textColors.muted).toBeDefined();
    });
  });
});
