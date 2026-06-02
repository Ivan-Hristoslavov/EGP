import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import SectionWhyChooseUs from "./SectionWhyChooseUs";

describe("SectionWhyChooseUs", () => {
  it("renders section title and representative reasons", () => {
    render(<SectionWhyChooseUs />);
    expect(
      screen.getByRole("heading", { name: /why choose egp aesthetics/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /expert practitioners/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/combining medical expertise/i),
    ).toBeInTheDocument();
  });
});
