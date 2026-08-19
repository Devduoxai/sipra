import { describe, it, expect } from "vitest";
import { signupSchema, preferenceUpdateSchema, unsubscribeSchema } from "@/lib/validation";
import { TOPICS } from "@/types";

describe("signupSchema", () => {
  const validSignup = {
    email: "test@example.com",
    name: "Alice",
    topics: ["Work & Career" as const],
    deliveryTime: "08:00",
  };

  it("accepts valid signup input", () => {
    const result = signupSchema.safeParse(validSignup);
    expect(result.success).toBe(true);
  });

  it("accepts signup without name", () => {
    const result = signupSchema.safeParse({ ...validSignup, name: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = signupSchema.safeParse({ ...validSignup, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty topics", () => {
    const result = signupSchema.safeParse({ ...validSignup, topics: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid topic", () => {
    const result = signupSchema.safeParse({ ...validSignup, topics: ["Invalid Topic"] });
    expect(result.success).toBe(false);
  });

  it("accepts multiple topics", () => {
    const result = signupSchema.safeParse({
      ...validSignup,
      topics: ["Work & Career", "Personal Growth", "Peace & Mindfulness"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid topics", () => {
    const result = signupSchema.safeParse({ ...validSignup, topics: [...TOPICS] });
    expect(result.success).toBe(true);
  });

  it("rejects invalid delivery time format", () => {
    const result = signupSchema.safeParse({ ...validSignup, deliveryTime: "8:00" });
    expect(result.success).toBe(false);
  });

  it("rejects delivery time with non-zero minutes", () => {
    const result = signupSchema.safeParse({ ...validSignup, deliveryTime: "08:30" });
    expect(result.success).toBe(false);
  });

  it("accepts valid delivery times", () => {
    for (const time of ["00:00", "08:00", "12:00", "23:00"]) {
      const result = signupSchema.safeParse({ ...validSignup, deliveryTime: time });
      expect(result.success).toBe(true);
    }
  });

  it("rejects delivery time >= 24:00", () => {
    const result = signupSchema.safeParse({ ...validSignup, deliveryTime: "24:00" });
    expect(result.success).toBe(false);
  });
});

describe("preferenceUpdateSchema", () => {
  it("accepts valid topics update", () => {
    const result = preferenceUpdateSchema.safeParse({ topics: ["Confidence"] });
    expect(result.success).toBe(true);
  });

  it("accepts valid delivery time update", () => {
    const result = preferenceUpdateSchema.safeParse({ deliveryTime: "14:00" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object (no changes)", () => {
    const result = preferenceUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects empty topics array", () => {
    const result = preferenceUpdateSchema.safeParse({ topics: [] });
    expect(result.success).toBe(false);
  });
});

describe("unsubscribeSchema", () => {
  it("accepts valid email", () => {
    const result = unsubscribeSchema.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = unsubscribeSchema.safeParse({ email: "not-valid" });
    expect(result.success).toBe(false);
  });

  it("rejects empty email", () => {
    const result = unsubscribeSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});
