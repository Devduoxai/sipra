import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("unsubscribe flow", () => {
  it("validates email format before processing", async () => {
    const { unsubscribeSchema } = await import("@/lib/validation");

    const valid = unsubscribeSchema.safeParse({ email: "test@example.com" });
    expect(valid.success).toBe(true);

    const invalid = unsubscribeSchema.safeParse({ email: "bad-email" });
    expect(invalid.success).toBe(false);
  });

  it("returns error for empty email", async () => {
    const { unsubscribeSchema } = await import("@/lib/validation");

    const result = unsubscribeSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});
