import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SectionWhyChooseUs from "./SectionWhyChooseUs";
import { siteConfig } from "@/config/site";

describe("SectionWhyChooseUs", () => {
  it("renders section title and representative reasons", () => {
    render(<SectionWhyChooseUs />);
    expect(
      screen.getByRole("heading", { name: /why choose egp aesthetics/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /expert practitioners/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/combining medical expertise/i)).toBeInTheDocument();
  });

  it("renders trust certification badges from site config", () => {
    render(<SectionWhyChooseUs />);
    for (const cert of siteConfig.trust.certifications) {
      const nodes = screen.getAllByText(cert);
      expect(nodes.length).toBeGreaterThan(0);
    }
  });
});
