/**
 * convertHeicToJpeg bails out when `window` is undefined (server / Node).
 */
// @vitest-environment node

import { describe, it, expect, vi } from "vitest";

import { convertHeicToJpeg } from "./image-utils";

describe("convertHeicToJpeg (Node)", () => {
  it("returns null without a browser environment", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const file = new File([new Uint8Array([1, 2])], "photo.heic", {
      type: "application/octet-stream",
    });

    await expect(convertHeicToJpeg(file)).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "HEIC conversion requires browser environment",
    );
    warn.mockRestore();
  });
});
