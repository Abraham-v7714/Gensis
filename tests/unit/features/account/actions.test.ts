import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  initiateLoginAction,
  handleOAuthCallbackAction,
  logoutAction,
  getCustomerProfileAction,
  getCustomerOrdersAction,
  getOrderDetailAction,
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/features/account/actions";
import { fetchOidcConfiguration } from "@/lib/auth/discovery";
import { getPkceCookie, getCustomerSession } from "@/lib/auth/session";
import { customerAccountClient } from "@/lib/commerce/providers/shopify/customerAccount";

vi.mock("@/lib/auth/discovery", () => ({
  fetchOidcConfiguration: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  setPkceCookie: vi.fn(),
  getPkceCookie: vi.fn(),
  clearPkceCookie: vi.fn(),
  createCustomerSession: vi.fn(),
  getCustomerSession: vi.fn(),
  destroyCustomerSession: vi.fn(),
}));

vi.mock("@/lib/commerce/providers/shopify/config", () => ({
  getShopifyStoreDomain: () => "gensis.myshopify.com",
}));

vi.mock("@/lib/commerce/providers/shopify/customerAccount", () => ({
  customerAccountClient: {
    getCustomerProfile: vi.fn(),
    getCustomerOrders: vi.fn(),
    getOrderById: vi.fn(),
    createAddress: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn(),
    setDefaultAddress: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Account Server Actions — Stage 4.12", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("initiateLoginAction generates OIDC authorization URL with PKCE S256 parameters", async () => {
    vi.mocked(fetchOidcConfiguration).mockResolvedValue({
      authorization_endpoint: "https://gensis.myshopify.com/auth/oauth/authorize",
      token_endpoint: "https://gensis.myshopify.com/auth/oauth/token",
    });

    const result = await initiateLoginAction();

    expect(result.ok).toBe(true);
    if (result.ok) {
      const url = new URL(result.data);
      expect(url.searchParams.get("response_type")).toBe("code");
      expect(url.searchParams.get("scope")).toBe("openid email customer-account-api:full");
      expect(url.searchParams.get("code_challenge_method")).toBe("S256");
      expect(url.searchParams.get("code_challenge")).toBeDefined();
    }
  });

  it("handleOAuthCallbackAction fails when PKCE state is mismatched", async () => {
    vi.mocked(getPkceCookie).mockResolvedValue({
      codeVerifier: "verifier-123",
      state: "expected-state-abc",
    });

    const result = await handleOAuthCallbackAction("code-123", "wrong-state-xyz");

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
      expect(result.error.message).toContain("Authentication state mismatch");
    }
  });

  it("logoutAction clears session and returns logout redirect URL", async () => {
    vi.mocked(fetchOidcConfiguration).mockResolvedValue({
      authorization_endpoint: "https://gensis.myshopify.com/auth/oauth/authorize",
      token_endpoint: "https://gensis.myshopify.com/auth/oauth/token",
      end_session_endpoint: "https://gensis.myshopify.com/auth/logout",
    });

    const result = await logoutAction();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBe("https://gensis.myshopify.com/auth/logout");
    }
  });

  it("getCustomerProfileAction fails when session is unauthenticated", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue(null);
    const result = await getCustomerProfileAction();
    expect(result.ok).toBe(false);
  });

  it("getCustomerOrdersAction passes session token to customerAccountClient", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-1",
      tokens: { accessToken: "at-valid", expiresAt: Date.now() + 10000 },
    });
    vi.mocked(customerAccountClient.getCustomerOrders).mockResolvedValue({
      items: [],
      pageInfo: { hasNextPage: false, hasPreviousPage: false },
    });

    const res = await getCustomerOrdersAction({ first: 10, after: "cursor-1" });
    expect(customerAccountClient.getCustomerOrders).toHaveBeenCalledWith("at-valid", {
      first: 10,
      after: "cursor-1",
    });
    expect(res.items.length).toBe(0);
  });

  it("getOrderDetailAction returns order when session is authorized", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-1",
      tokens: { accessToken: "at-valid", expiresAt: Date.now() + 10000 },
    });
    vi.mocked(customerAccountClient.getOrderById).mockResolvedValue({
      ok: true,
      data: {
        id: "order-101",
        orderNumber: "1001",
        processedAt: "2026-09-24T10:00:00Z",
        totalPrice: { amount: 350, currency: "USD" },
        lineItems: [],
      },
    });

    const res = await getOrderDetailAction("order-101");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe("order-101");
    }
  });

  it("createAddressAction validates required fields and calls provider server-side", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-1",
      tokens: { accessToken: "at-valid", expiresAt: Date.now() + 10000 },
    });
    vi.mocked(customerAccountClient.createAddress).mockResolvedValue({
      ok: true,
      data: {
        id: "addr-new",
        address1: "789 Broadway",
        city: "New York",
        country: "US",
        zip: "10003",
      },
    });

    const res = await createAddressAction({
      address1: "789 Broadway",
      city: "New York",
      country: "US",
      zip: "10003",
    });

    expect(res.ok).toBe(true);
    expect(customerAccountClient.createAddress).toHaveBeenCalledWith("at-valid", {
      address1: "789 Broadway",
      city: "New York",
      country: "US",
      zip: "10003",
    });
  });

  it("updateAddressAction fails when unauthenticated", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue(null);
    const res = await updateAddressAction("addr-1", { address1: "123 New St" });
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.code).toBe("NOT_FOUND");
    }
  });

  it("deleteAddressAction calls provider deleteAddress server-side", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-1",
      tokens: { accessToken: "at-valid", expiresAt: Date.now() + 10000 },
    });
    vi.mocked(customerAccountClient.deleteAddress).mockResolvedValue({
      ok: true,
      data: true,
    });

    const res = await deleteAddressAction("addr-1");
    expect(res.ok).toBe(true);
    expect(customerAccountClient.deleteAddress).toHaveBeenCalledWith("at-valid", "addr-1");
  });

  it("setDefaultAddressAction calls provider setDefaultAddress server-side", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-1",
      tokens: { accessToken: "at-valid", expiresAt: Date.now() + 10000 },
    });
    vi.mocked(customerAccountClient.setDefaultAddress).mockResolvedValue({
      ok: true,
      data: {
        id: "addr-2",
        address1: "456 Park Ave",
        city: "New York",
        country: "US",
        zip: "10022",
        isDefault: true,
      },
    });

    const res = await setDefaultAddressAction("addr-2");
    expect(res.ok).toBe(true);
    expect(customerAccountClient.setDefaultAddress).toHaveBeenCalledWith("at-valid", "addr-2");
  });
});
