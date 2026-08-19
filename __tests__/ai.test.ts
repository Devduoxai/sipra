import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn().mockResolvedValue({
  choices: [{ message: { content: "You are capable of amazing things today." } }],
});

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
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
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Fresh message here." } }],
    });

    const { generateMessage } = await import("@/lib/ai");

    await generateMessage({
      topic: "Confidence",
      recentMessages: ["Previous message one", "Previous message two"],
    });

    expect(mockCreate).toHaveBeenCalled();
    const callArgs = mockCreate.mock.calls[0][0];
    const userMessage = callArgs.messages.find((m: { role: string }) => m.role === "user");
    expect(userMessage?.content).toContain("Previous message one");
    expect(userMessage?.content).toContain("Previous message two");
  });
});
