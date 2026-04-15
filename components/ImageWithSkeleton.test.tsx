import type { SyntheticEvent } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ImageWithSkeleton from "./ImageWithSkeleton";

vi.mock("next/image", () => ({
  default: function MockNextImage({
    onLoad,
    onError,
    alt,
    ...rest
  }: {
    onLoad?: (e: SyntheticEvent<HTMLImageElement>) => void;
    onError?: (e: SyntheticEvent<HTMLImageElement>) => void;
    alt?: string;
    [key: string]: unknown;
  }) {
    return (
      <img
        {...rest}
        alt={alt ?? ""}
        data-testid="next-image"
        onLoad={onLoad}
        onError={onError}
      />
    );
  },
}));

describe("ImageWithSkeleton", () => {
  it("shows fallback when image errors", () => {
    render(
      <ImageWithSkeleton
        src="https://example.com/missing.jpg"
        alt="Hero"
        width={400}
        height={300}
      />
    );
    const img = screen.getByTestId("next-image");
    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("hides skeleton after load", () => {
    const { container } = render(
      <ImageWithSkeleton
        src="https://example.com/ok.jpg"
        alt="Hero"
        width={400}
        height={300}
      />
    );
    const img = screen.getByTestId("next-image");
    fireEvent.load(img);
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toHaveClass("opacity-0");
  });
});
