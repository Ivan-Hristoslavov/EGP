import { describe, it, expect } from "vitest";

import { formatCategoryLabel } from "./category-label";

describe("formatCategoryLabel", () => {
  it("shows ALL-CAPS names in sentence case", () => {
    expect(formatCategoryLabel("FACE")).toBe("Face");
    expect(formatCategoryLabel("BODY CONTOURING")).toBe("Body contouring");
  });

  it("leaves mixed-case names as written", () => {
    expect(formatCategoryLabel("Anti-wrinkle")).toBe("Anti-wrinkle");
    expect(formatCategoryLabel("Fillers")).toBe("Fillers");
  });

  it("copes with empty values and short names", () => {
    expect(formatCategoryLabel(undefined)).toBe("");
    expect(formatCategoryLabel("  ")).toBe("");
    expect(formatCategoryLabel("A")).toBe("A");
  });
});
