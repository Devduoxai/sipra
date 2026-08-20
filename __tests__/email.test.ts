import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockSendMail = vi.fn().mockResolvedValue({ messageId: "test-email-id" });

vi.mock("nodemailer", () => {
  return {
    default: {
      createTransport: () => ({
        sendMail: mockSendMail,
      }),
    },
  };
});

describe("email service", () => {
  beforeEach(() => {
    process.env.GMAIL_SENDER_EMAIL = "test@gmail.com";
    process.env.GMAIL_APP_PASSWORD = "test-password";
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
    mockSendMail.mockRejectedValueOnce(new Error("SMTP error"));

    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("SMTP error");
  });

  it("builds message email with correct structure", async () => {
    const { buildMessageEmail } = await import("@/lib/email");

    const email = buildMessageEmail("Stay positive!", "Personal Growth");

    expect(email.subject).toContain("Personal Growth");
    expect(email.html).toContain("Stay positive!");
    expect(email.html).toContain("Sipra");
  });
});
