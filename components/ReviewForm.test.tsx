import type { ReactElement } from "react";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HeroUIProvider } from "@heroui/system";

import { ReviewForm } from "./ReviewForm";

import { ToastMessages } from "@/components/Toast";

const addReview = vi.fn();

vi.mock("@/hooks/useReviews", () => ({
  useReviews: () => ({
    addReview,
    reviews: [],
    isLoading: false,
    error: null,
    approveReview: vi.fn(),
    deleteReview: vi.fn(),
    refetch: vi.fn(),
  }),
}));

const showError = vi.fn();
const showSuccess = vi.fn();

vi.mock("@/components/Toast", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/Toast")>();

  return {
    ...actual,
    useToast: () => ({
      showSuccess,
      showError,
      showWarning: vi.fn(),
      showInfo: vi.fn(),
      showToast: vi.fn(),
    }),
  };
});

function renderWithProviders(ui: ReactElement) {
  return render(<HeroUIProvider navigate={() => {}}>{ui}</HeroUIProvider>);
}

describe("ReviewForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    addReview.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders heading and submit control", () => {
    renderWithProviders(<ReviewForm />);
    expect(
      screen.getByRole("heading", { name: /share your experience/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeInTheDocument();
  });

  it("disables submit when required fields fail validation", () => {
    renderWithProviders(<ReviewForm />);
    const submit = screen.getByRole("button", { name: /submit review/i });

    expect(submit).toBeDisabled();
  });

  it("keeps submit disabled when optional email has invalid format", () => {
    renderWithProviders(<ReviewForm />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(screen.getByPlaceholderText(/john@example/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/share details about your experience/i),
      {
        target: { value: "This review is long enough to pass minimum length." },
      },
    );
    expect(
      screen.getByRole("button", { name: /submit review/i }),
    ).toBeDisabled();
    expect(addReview).not.toHaveBeenCalled();
  });

  it("submits valid payload and shows success", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderWithProviders(<ReviewForm />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/share details about your experience/i),
      {
        target: { value: "This review is long enough to pass minimum length." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(addReview).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_name: "Jane Smith",
          customer_email: "",
          rating: 5,
          comment: "This review is long enough to pass minimum length.",
        }),
      );
    });
    await waitFor(() => {
      expect(showSuccess).toHaveBeenCalledWith(
        ToastMessages.reviews.submitted.title,
        ToastMessages.reviews.submitted.message,
      );
    });
    expect(
      screen.getByRole("heading", { name: /review submitted/i }),
    ).toBeInTheDocument();
  });

  it("calls showError and surfaces error UI when addReview fails", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    addReview.mockRejectedValueOnce(new Error("Network down"));
    renderWithProviders(<ReviewForm />);
    fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
      target: { value: "Jane Smith" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/share details about your experience/i),
      {
        target: { value: "This review is long enough to pass minimum length." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith(
        ToastMessages.reviews.error.title,
        "Network down",
      );
    });
    expect(
      screen.getByRole("heading", { name: /error occurred/i }),
    ).toBeInTheDocument();
  });
});
