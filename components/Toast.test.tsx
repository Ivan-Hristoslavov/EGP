import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ToastProvider, useToast } from "./Toast";

function ToastTrigger() {
  const { showSuccess, showError } = useToast();
  return (
    <div>
      <button
        type="button"
        onClick={() => showSuccess("Saved", "Your changes were stored.")}
      >
        success
      </button>
      <button
        type="button"
        onClick={() => showError("Failed", "Something went wrong.")}
      >
        error
      </button>
    </div>
  );
}

describe("ToastProvider", () => {
  it("renders toast content after showSuccess", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /success/i }));
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(
      screen.getByText("Your changes were stored.")
    ).toBeInTheDocument();
  });

  it("renders error styling path after showError", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole("button", { name: /^error$/i }));
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
  });
});

describe("useToast", () => {
  it("throws when used outside ToastProvider", () => {
    function Bad() {
      useToast();
      return null;
    }
    expect(() => renderToString(<Bad />)).toThrow(/ToastProvider/i);
  });
});
