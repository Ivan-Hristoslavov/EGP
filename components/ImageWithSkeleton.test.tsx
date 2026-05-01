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
        onError={onError}
        onLoad={onLoad}
      />
    );
  },
}));

describe("ImageWithSkeleton", () => {
  it("shows fallback when image errors", () => {
    render(
      <ImageWithSkeleton
        alt="Hero"
        height={300}
        src="https://example.com/missing.jpg"
        width={400}
      />,
    );
    const img = screen.getByTestId("next-image");

    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
  });

  it("hides skeleton after load", () => {
    const { container } = render(
      <ImageWithSkeleton
        alt="Hero"
        height={300}
        src="https://example.com/ok.jpg"
        width={400}
      />,
    );
    const img = screen.getByTestId("next-image");

    fireEvent.load(img);
    const skeleton = container.querySelector(".animate-pulse");

    expect(skeleton).toHaveClass("opacity-0");
  });
});
