import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ButtonPrimary from "./ButtonPrimary";

describe("ButtonPrimary", () => {
  it("renders children", () => {
    render(<ButtonPrimary>Click me</ButtonPrimary>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    render(<ButtonPrimary variant="secondary">Secondary</ButtonPrimary>);
    expect(screen.getByRole("button", { name: /secondary/i })).toBeInTheDocument();
  });
});
