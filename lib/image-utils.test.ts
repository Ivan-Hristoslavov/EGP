import { describe, it, expect } from "vitest";
import {
  isImageFile,
  getImageType,
  validateImageFile,
  getSupportedImageFormats,
  getSupportedFormatsText,
} from "./image-utils";

function createMockFile(
  name: string,
  type: string,
  size: number = 1024
): File {
  const content = size <= 10240 ? "x".repeat(size) : new Uint8Array(size);
  return new File([content], name, { type });
}

describe("lib/image-utils", () => {
  describe("isImageFile", () => {
    it("returns true for standard image types", () => {
      expect(isImageFile(createMockFile("a.jpg", "image/jpeg"))).toBe(true);
      expect(isImageFile(createMockFile("a.png", "image/png"))).toBe(true);
      expect(isImageFile(createMockFile("a.webp", "image/webp"))).toBe(true);
      expect(isImageFile(createMockFile("a.gif", "image/gif"))).toBe(true);
    });

    it("returns true for HEIC by extension", () => {
      expect(isImageFile(createMockFile("photo.heic", "application/octet-stream"))).toBe(true);
      expect(isImageFile(createMockFile("photo.HEIF", "application/octet-stream"))).toBe(true);
    });

    it("returns false for non-image files", () => {
      expect(isImageFile(createMockFile("doc.pdf", "application/pdf"))).toBe(false);
      expect(isImageFile(createMockFile("data.txt", "text/plain"))).toBe(false);
    });
  });

  describe("getImageType", () => {
    it("returns mime type for known images", () => {
      expect(getImageType(createMockFile("a.jpg", "image/jpeg"))).toBe("image/jpeg");
    });

    it("returns image/heic for .heic extension", () => {
      expect(getImageType(createMockFile("a.heic", "application/octet-stream"))).toBe("image/heic");
    });
  });

  describe("validateImageFile", () => {
    it("validates correct image", () => {
      const result = validateImageFile(createMockFile("test.jpg", "image/jpeg", 100));
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects non-image file", () => {
      const result = validateImageFile(createMockFile("doc.pdf", "application/pdf"));
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not a supported image format");
    });

    it("rejects file exceeding max size", () => {
      const largeFile = createMockFile("big.jpg", "image/jpeg", 11 * 1024 * 1024);
      const result = validateImageFile(largeFile, 10);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("too large");
    });

    it("rejects empty file", () => {
      const emptyFile = createMockFile("empty.jpg", "image/jpeg", 0);
      const result = validateImageFile(emptyFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("empty");
    });
  });

  describe("getSupportedImageFormats", () => {
    it("returns non-empty string", () => {
      expect(getSupportedImageFormats()).toBeTruthy();
    });
  });

  describe("getSupportedFormatsText", () => {
    it("returns human-readable format list", () => {
      const text = getSupportedFormatsText();
      expect(text).toContain("JPEG");
      expect(text).toContain("PNG");
    });
  });
});
