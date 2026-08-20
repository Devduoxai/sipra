import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("email service", () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    process.env.BREVO_API_KEY = "test-key";
    process.env.BREVO_SENDER_EMAIL = "test@gmail.com";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ messageId: "test-email-id" }), { status: 200 }),
    );
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
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns error on API failure", async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }),
    );

    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("builds message email with correct structure", async () => {
    const { buildMessageEmail } = await import("@/lib/email");

    const email = buildMessageEmail("Stay positive!", "Personal Growth");

    expect(email.subject).toContain("Personal Growth");
    expect(email.html).toContain("Stay positive!");
    expect(email.html).toContain("Sipra");
  });
});
