import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ data: { id: "test-email-id" } });

vi.mock("googleapis", () => {
  return {
    google: {
      auth: {
        OAuth2: class MockOAuth2 {
          setCredentials() {}
          generateAuthUrl() { return "http://mock"; }
        },
      },
      gmail: () => ({
        users: { messages: { send: mockSend } },
      }),
    },
  };
});

describe("email service", () => {
  beforeEach(() => {
    process.env.GMAIL_CLIENT_ID = "test-client-id";
    process.env.GMAIL_CLIENT_SECRET = "test-client-secret";
    process.env.GMAIL_REFRESH_TOKEN = "test-refresh-token";
    process.env.GMAIL_SENDER_EMAIL = "test@gmail.com";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends email and returns success", async () => {
    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("test-email-id");
  });

  it("returns error on failure", async () => {
    mockSend.mockRejectedValueOnce(new Error("Auth failed"));

    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Auth failed");
  });

  it("builds message email with correct structure", async () => {
    const { buildMessageEmail } = await import("@/lib/email");

    const email = buildMessageEmail("Stay positive!", "Personal Growth");

    expect(email.subject).toContain("Personal Growth");
    expect(email.html).toContain("Stay positive!");
    expect(email.html).toContain("Sipra");
  });
});
