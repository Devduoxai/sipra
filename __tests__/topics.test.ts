import { describe, it, expect } from "vitest";
import { TOPICS } from "@/types";

describe("TOPICS constant", () => {
  it("contains exactly 9 topics", () => {
    expect(TOPICS).toHaveLength(9);
  });

  it("contains expected topics", () => {
    expect(TOPICS).toContain("Work & Career");
    expect(TOPICS).toContain("Love & Relationships");
    expect(TOPICS).toContain("Family & Kids");
    expect(TOPICS).toContain("Personal Growth");
    expect(TOPICS).toContain("Confidence");
    expect(TOPICS).toContain("Health & Wellness");
    expect(TOPICS).toContain("Goals & Success");
    expect(TOPICS).toContain("Peace & Mindfulness");
    expect(TOPICS).toContain("Surprise Me");
  });

  it("has no duplicate topics", () => {
    const unique = new Set(TOPICS);
    expect(unique.size).toBe(TOPICS.length);
  });
});
