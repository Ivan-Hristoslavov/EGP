import { describe, it, expect } from "vitest";
import { EMAIL, getEmailHead } from "./email-theme";

describe("lib/email-theme", () => {
  describe("EMAIL", () => {
    it("has light and dark theme colors", () => {
      expect(EMAIL.light).toBeDefined();
      expect(EMAIL.dark).toBeDefined();
      expect(EMAIL.light.bg).toBe("#f5f1e9");
      expect(EMAIL.dark.bg).toBe("#2d322c");
    });

    it("has font family", () => {
      expect(EMAIL.font).toContain("Montserrat");
    });
  });

  describe("getEmailHead", () => {
    it("returns HTML string with meta and style", () => {
      const head = getEmailHead();
      expect(head).toContain("<meta charset");
      expect(head).toContain("viewport");
      expect(head).toContain("Montserrat");
      expect(head).toContain(EMAIL.dark.bg);
      expect(head).toContain("<style>");
    });
  });
});
