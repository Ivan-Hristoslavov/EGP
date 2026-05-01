import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import AboutPage, { generateMetadata } from "./page";

import { siteConfig } from "@/config/site";

const orderMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: orderMock,
        })),
      })),
    })),
  })),
}));

vi.mock("next/image", () => ({
  default: function MockImage({ src, alt }: { src: string; alt: string }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={src} />;
  },
}));

describe("AboutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [], error: null });
  });

  it("shows fallback copy when there is no CMS content", async () => {
    const ui = await AboutPage();

    render(ui);
    expect(
      screen.getByText(/about page content is being updated/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders hero layout when first hero/story section has an image", async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: "hero-1",
          section_type: "hero",
          heading: "Our London clinic",
          content: "First block.\n\nSecond block.",
          image_url: "https://example.com/hero.jpg",
        },
      ],
      error: null,
    });
    const ui = await AboutPage();

    render(ui);
    expect(
      screen.getByRole("heading", { name: /our london clinic/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("First block.")).toBeInTheDocument();
    expect(screen.getByText("Second block.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /our services/i })).toHaveAttribute(
      "href",
      "/#services",
    );
    const img = screen.getByRole("img", { name: /our london clinic/i });

    expect(img).toHaveAttribute("src", "https://example.com/hero.jpg");
  });

  it("renders stacked sections with bullets for non-hero content", async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: "hero-1",
          section_type: "hero",
          heading: "Hero",
          content: "Hero text",
          image_url: "https://example.com/h.jpg",
        },
        {
          id: "why-1",
          section_type: "why_choose_us",
          heading: "Why us",
          content: "Because we care.",
          bullet_points: ["Point one", "Point two"],
        },
      ],
      error: null,
    });
    const ui = await AboutPage();

    render(ui);
    expect(
      screen.getByRole("heading", { name: /why us/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Point one")).toBeInTheDocument();
    expect(screen.getByText("Point two")).toBeInTheDocument();
  });
});

describe("generateMetadata (about)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [], error: null });
  });

  it("uses default description when there is no content", async () => {
    const meta = await generateMetadata();

    expect(meta.title).toContain("About Us");
    expect(meta.title).toContain(siteConfig.name);
    expect(meta.description).toContain("EGP Aesthetics London");
    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/about`);
  });

  it("truncates long first-section content for description", async () => {
    const long = `${"a".repeat(170)}`;

    orderMock.mockResolvedValue({
      data: [
        {
          id: "1",
          section_type: "story",
          content: long,
        },
      ],
      error: null,
    });
    const meta = await generateMetadata();

    expect(meta.description?.length).toBeLessThanOrEqual(162);
    expect(meta.description?.endsWith("…")).toBe(true);
  });
});
