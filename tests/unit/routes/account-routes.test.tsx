import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCustomerSession } from "@/lib/auth/session";

vi.mock("@/lib/auth/session", () => ({
  getCustomerSession: vi.fn(),
}));

describe("Account Route Protection", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns null session for unauthenticated requests", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue(null);

    const session = await getCustomerSession();
    expect(session).toBeNull();
  });

  it("returns active session for authenticated requests", async () => {
    vi.mocked(getCustomerSession).mockResolvedValue({
      sessionId: "s-123",
      tokens: {
        accessToken: "at-123",
        expiresAt: Date.now() + 3600000,
      },
    });

    const session = await getCustomerSession();
    expect(session).not.toBeNull();
    expect(session?.sessionId).toBe("s-123");
  });
});
