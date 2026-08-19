import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: "You are capable of amazing things today.",
});

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class MockGoogleGenAI {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

describe("AI message generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a message with correct structure", async () => {
    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({
      topic: "Personal Growth",
      recentMessages: [],
    });

    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("topic", "Personal Growth");
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("includes recent messages in context to avoid repetition", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: "Fresh message here.",
    });

    const { generateMessage } = await import("@/lib/ai");

    await generateMessage({
      topic: "Confidence",
      recentMessages: ["Previous message one", "Previous message two"],
    });

    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const userText = callArgs.contents[0].parts[0].text;
    expect(userText).toContain("Previous message one");
    expect(userText).toContain("Previous message two");
  });
});
