import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  getImageDimensions,
  compressImage,
  convertHeicToJpeg,
  processImageFile,
} from "./image-utils";

vi.mock("heic-to", () => ({
  heicTo: vi.fn(
    async () =>
      new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" }),
  ),
}));

const heic2anyFail = vi.hoisted(() => vi.fn(async () => new Blob(["x"])));

vi.mock("heic2any", () => ({
  default: heic2anyFail,
}));

function installImageMock(width: number, height: number) {
  class MockImage {
    naturalWidth = width;
    naturalHeight = height;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_: string) {
      queueMicrotask(() => this.onload?.());
    }
  }
  vi.stubGlobal("Image", MockImage);
}

describe("lib/image-utils (browser paths)", () => {
  const origCreateElement = document.createElement.bind(document);

  beforeEach(() => {
    installImageMock(400, 300);
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        const canvas = {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (
            cb: (blob: Blob | null) => void,
            _type?: string,
            _quality?: number,
          ) => {
            cb(new Blob(["jpeg-bytes"], { type: "image/jpeg" }));
          },
        };

        return canvas as unknown as HTMLCanvasElement;
      }

      return origCreateElement(tag);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function jpegFile(name = "p.jpg") {
    return new File([new Uint8Array([1, 2, 3])], name, { type: "image/jpeg" });
  }

  it("getImageDimensions resolves natural size after load", async () => {
    const dims = await getImageDimensions(jpegFile());

    expect(dims).toEqual({ width: 400, height: 300 });
  });

  it("compressImage returns a JPEG File", async () => {
    const out = await compressImage(jpegFile("keep.jpg"), 1920, 1080, 0.85);

    expect(out).toBeInstanceOf(File);
    expect(out.type).toBe("image/jpeg");
    expect(out.name).toBe("keep.jpg");
  });

  it("convertHeicToJpeg uses heic-to in browser", async () => {
    const file = new File([new Uint8Array([1])], "shot.heic", {
      type: "application/octet-stream",
    });
    const out = await convertHeicToJpeg(file);

    expect(out).not.toBeNull();
    expect(out?.name).toBe("shot.jpg");
    expect(out?.type).toBe("image/jpeg");
  });

  it("convertHeicToJpeg falls back to heic2any when heic-to fails", async () => {
    const { heicTo } = await import("heic-to");

    vi.mocked(heicTo).mockRejectedValueOnce(new Error("heic-to unavailable"));
    heic2anyFail.mockResolvedValueOnce(
      new Blob(["fallback"], { type: "image/jpeg" }),
    );
    const file = new File([new Uint8Array([1])], "x.heic", { type: "" });
    const out = await convertHeicToJpeg(file);

    expect(out?.name).toBe("x.jpg");
    expect(heic2anyFail).toHaveBeenCalled();
  });

  it("processImageFile compresses a JPEG and reports dimensions", async () => {
    const file = jpegFile("upload.jpg");
    const result = await processImageFile(file, 10, true, 1920, 1080, 0.85);

    expect(result.wasCompressed).toBe(true);
    expect(result.wasConverted).toBe(false);
    expect(result.originalDimensions).toEqual({ width: 400, height: 300 });
    expect(result.finalDimensions).toEqual({ width: 400, height: 300 });
    expect(result.finalType).toBe("image/jpeg");
  });

  it("processImageFile converts HEIC then compresses", async () => {
    const file = new File([new Uint8Array([9, 9])], "raw.heic", {
      type: "application/octet-stream",
    });
    const result = await processImageFile(file, 10, true);

    expect(result.wasConverted).toBe(true);
    expect(result.wasCompressed).toBe(true);
  });

  it("processImageFile continues when compression fails", async () => {
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") {
        const canvas = {
          width: 0,
          height: 0,
          getContext: () => ({ drawImage: vi.fn() }),
          toBlob: (cb: (b: Blob | null) => void) => {
            cb(null);
          },
        };

        return canvas as unknown as HTMLCanvasElement;
      }

      return origCreateElement(tag);
    });
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const file = jpegFile("nocompress.jpg");
    const result = await processImageFile(file, 10, true);

    expect(result.wasCompressed).toBe(false);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
