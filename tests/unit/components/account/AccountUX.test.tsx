import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AccountNav } from "@/features/account/components/AccountNav";
import { ProfileView } from "@/features/account/components/ProfileView";
import { OrderHistoryView } from "@/features/account/components/OrderHistoryView";
import { OrderDetailView } from "@/features/account/components/OrderDetailView";
import { AddressBookView } from "@/features/account/components/AddressBookView";
import { AddressForm } from "@/features/account/components/AddressForm";
import type { CustomerProfile } from "@/types/customer";
import type { Order } from "@/types/order";

vi.mock("next/navigation", () => ({
  usePathname: () => "/account",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/features/account/actions", () => ({
  logoutAction: vi.fn().mockResolvedValue({ ok: true, data: "/account/login" }),
  createAddressAction: vi.fn().mockResolvedValue({
    ok: true,
    data: {
      id: "addr-new",
      address1: "123 Main St",
      city: "New York",
      country: "US",
      zip: "10001",
    },
  }),
  updateAddressAction: vi.fn().mockResolvedValue({ ok: true, data: {} }),
  deleteAddressAction: vi.fn().mockResolvedValue({ ok: true, data: true }),
  setDefaultAddressAction: vi.fn().mockResolvedValue({ ok: true, data: {} }),
}));

const mockProfile: CustomerProfile = {
  id: "cust-1",
  email: "alex@example.com",
  firstName: "Alex",
  lastName: "Morgan",
  phone: "+15550192834",
  addresses: [
    {
      id: "addr-1",
      firstName: "Alex",
      lastName: "Morgan",
      address1: "100 Fifth Ave",
      city: "New York",
      province: "NY",
      country: "US",
      zip: "10011",
      isDefault: true,
    },
  ],
  defaultAddress: {
    id: "addr-1",
    firstName: "Alex",
    lastName: "Morgan",
    address1: "100 Fifth Ave",
    city: "New York",
    province: "NY",
    country: "US",
    zip: "10011",
    isDefault: true,
  },
};

const mockOrders: Order[] = [
  {
    id: "order-1",
    orderNumber: "1001",
    processedAt: "2026-09-22T14:30:00Z",
    financialStatus: "PAID",
    fulfillmentStatus: "FULFILLED",
    totalPrice: { amount: 650, currency: "USD" },
    lineItems: [
      {
        id: "li-1",
        title: "Tailored Trousers",
        quantity: 1,
        variantTitle: "Charcoal / 32",
        price: { amount: 650, currency: "USD" },
      },
    ],
    shippingAddress: mockProfile.addresses[0],
    fulfillments: [
      {
        id: "ful-1",
        status: "SUCCESS",
        trackingInfo: [{ number: "1Z9999999999999999", company: "UPS", url: "https://ups.com/track" }],
      },
    ],
  },
];

describe("Authenticated Account Experience Components — Stage 4.12", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AccountNav", () => {
    it("renders navigation links and accessible sign out button", () => {
      render(<AccountNav />);
      expect(screen.getByRole("navigation", { name: /account navigation/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /orders/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /addresses/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe("ProfileView", () => {
    it("renders customer welcome, profile details, and address preview", () => {
      render(<ProfileView profile={mockProfile} />);
      expect(screen.getByText(/welcome back, alex morgan/i)).toBeInTheDocument();
      expect(screen.getByText("alex@example.com")).toBeInTheDocument();
      expect(screen.getByText(/100 fifth ave/i)).toBeInTheDocument();
    });
  });

  describe("OrderHistoryView", () => {
    it("renders list of orders with financial and fulfillment badges", () => {
      render(<OrderHistoryView orders={mockOrders} />);
      expect(screen.getByText(/order #1001/i)).toBeInTheDocument();
      expect(screen.getByText("Paid")).toBeInTheDocument();
      expect(screen.getByText("Fulfilled")).toBeInTheDocument();
      expect(screen.getByText(/tailored trousers/i)).toBeInTheDocument();
    });

    it("renders empty state when order list is empty", () => {
      render(<OrderHistoryView orders={[]} />);
      expect(screen.getByText(/no orders placed yet/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /explore shop/i })).toBeInTheDocument();
    });

    it("renders error state when provider failure occurs", () => {
      render(<OrderHistoryView orders={[]} error={true} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/unable to load order history/i)).toBeInTheDocument();
    });
  });

  describe("OrderDetailView", () => {
    it("renders order details, line items, pricing breakdown, and real shipment tracking info", () => {
      render(<OrderDetailView order={mockOrders[0]} />);
      expect(screen.getByText(/order #1001/i)).toBeInTheDocument();
      expect(screen.getByText(/tailored trousers/i)).toBeInTheDocument();
      expect(screen.getByText(/shipment & tracking information/i)).toBeInTheDocument();
      expect(screen.getByText(/carrier: ups/i)).toBeInTheDocument();
      expect(screen.getByText(/tracking #: 1z9999999999999999/i)).toBeInTheDocument();
    });
  });

  describe("AddressBookView", () => {
    it("renders saved addresses and opens add address modal on click", () => {
      render(<AddressBookView addresses={mockProfile.addresses} />);
      expect(screen.getByText(/100 fifth ave/i)).toBeInTheDocument();
      expect(screen.getByText(/default delivery location/i)).toBeInTheDocument();

      const addBtn = screen.getByRole("button", { name: /\+ add new address/i });
      fireEvent.click(addBtn);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /add new address/i })).toBeInTheDocument();
    });
  });

  describe("AddressForm", () => {
    it("validates required fields before submitting", async () => {
      const handleSubmit = vi.fn();
      const handleCancel = vi.fn();

      render(<AddressForm onSubmit={handleSubmit} onCancel={handleCancel} />);

      const saveBtn = screen.getByRole("button", { name: /save address/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(screen.getByText(/address line 1 is required/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
      });

      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
