import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CheckoutButton } from "@/features/checkout/components/CheckoutButton";
import { checkoutAction } from "@/features/checkout/actions";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/features/checkout/actions", () => ({
  checkoutAction: vi.fn(),
}));

describe("CheckoutButton", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, assign: vi.fn() },
    });
  });

  it("renders disabled button with 'Bag is Empty' when hasLines is false", () => {
    render(<CheckoutButton hasLines={false} />);

    const button = screen.getByRole("button", { name: /bag is empty/i });
    expect(button).toBeDisabled();
  });

  it("renders enabled button with 'Proceed to Checkout' when hasLines is true", () => {
    render(<CheckoutButton hasLines={true} />);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute("aria-busy", "true");
  });

  it("handles successful checkout redirect on click", async () => {
    vi.mocked(checkoutAction).mockResolvedValue({
      ok: true,
      data: "https://gensis.myshopify.com/checkout/123",
    });

    render(<CheckoutButton hasLines={true} />);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(checkoutAction).toHaveBeenCalledTimes(1);
      expect(window.location.assign).toHaveBeenCalledWith(
        "https://gensis.myshopify.com/checkout/123"
      );
    });
  });

  it("displays error in aria-live region when checkoutAction fails", async () => {
    vi.mocked(checkoutAction).mockResolvedValue({
      ok: false,
      error: {
        code: "PROVIDER_ERROR",
        message: "Checkout is temporarily unavailable.",
      },
    });

    render(<CheckoutButton hasLines={true} />);

    const button = screen.getByRole("button", { name: /proceed to checkout/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to proceed to checkout. Please try again.")
      ).toBeInTheDocument();
    });

    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
