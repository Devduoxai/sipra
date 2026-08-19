import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSend = vi.fn().mockResolvedValue({ data: { id: "test-email-id" }, error: null });

vi.mock("resend", () => {
  return {
    Resend: class MockResend {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("email service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  it("builds message email with correct structure", async () => {
    const { buildMessageEmail } = await import("@/lib/email");

    const email = buildMessageEmail("Stay positive!", "Personal Growth");

    expect(email.subject).toContain("Personal Growth");
    expect(email.html).toContain("Stay positive!");
    expect(email.html).toContain("Sipra");
  });
});
