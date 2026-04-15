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

    it("uses the same token keys for light and dark palettes", () => {
      const lightKeys = Object.keys(EMAIL.light).sort();
      const darkKeys = Object.keys(EMAIL.dark).sort();
      expect(lightKeys).toEqual(darkKeys);
    });

    it("exposes semantic tokens used by templates", () => {
      expect(EMAIL.light.link).toBeDefined();
      expect(EMAIL.light.deposit).toBeDefined();
      expect(EMAIL.light.danger).toBeDefined();
      expect(EMAIL.dark.link).toBeDefined();
      expect(EMAIL.dark.deposit).toBeDefined();
      expect(EMAIL.dark.danger).toBeDefined();
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

    it("declares light/dark color scheme support", () => {
      const head = getEmailHead();
      expect(head).toContain('name="color-scheme" content="light dark"');
      expect(head).toContain(
        'name="supported-color-schemes" content="light dark"'
      );
    });

    it("inlines body font and dark-mode overrides for shared class names", () => {
      const head = getEmailHead();
      expect(head).toContain(`font-family: ${EMAIL.font}`);
      expect(head).toContain("prefers-color-scheme: dark");
      expect(head).toContain("body.email-body");
      expect(head).toContain(".email-wrap");
      expect(head).toContain(".email-card");
      expect(head).toContain(EMAIL.dark.link);
      expect(head).toContain(EMAIL.dark.noticeBorder);
    });
  });
});
