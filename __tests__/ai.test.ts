import { describe, it, expect, vi, beforeEach } from "vitest";

const validPayload = (message: string) => JSON.stringify({ message, valid: true });

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: validPayload("You are capable of amazing things today."),
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
      text: validPayload("Fresh message here."),
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

  it("clamps overly long messages to text-message size", async () => {
    const longText =
      "You are incredible and capable of absolutely anything you set your mind to today my friend. " +
      "We all know deep down that you have so much potential inside you just waiting to come out. " +
      "Every single day is a brand new opportunity to become the strongest version of yourself.";
    mockGenerateContent.mockResolvedValueOnce({ text: validPayload(longText) });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({ topic: "Personal Growth", recentMessages: [] });

    expect(result.content.trim().split(/\s+/).length).toBeLessThanOrEqual(25);
    expect(result.content.trim().endsWith(".")).toBe(true);
  });

  it("normalizes a message without a full stop", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: validPayload("You belong exactly where you are right now"),
    });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({ topic: "Confidence", recentMessages: [] });

    expect(result.content).toBe("You belong exactly where you are right now.");
  });

  it("recognizes fragments as incomplete sentences", async () => {
    const { isCompleteSentence } = await import("@/lib/ai");

    expect(isCompleteSentence("The work you do when.")).toBe(false);
    expect(isCompleteSentence("Because you believe that.")).toBe(false);
    expect(isCompleteSentence("Keep going with.")).toBe(false);
    expect(isCompleteSentence("Your unique perspective.")).toBe(false);
  });

  it("accepts real complete sentences", async () => {
    const { isCompleteSentence } = await import("@/lib/ai");

    expect(isCompleteSentence("The work you do matters deeply.")).toBe(true);
    expect(isCompleteSentence("You belong exactly where you are right now.")).toBe(true);
    expect(isCompleteSentence("Take the first small step today.")).toBe(true);
  });

  it("retries when the model marks the message as invalid", async () => {
    mockGenerateContent
      .mockResolvedValueOnce({
        text: JSON.stringify({ message: "Your unique perspective.", valid: false }),
      })
      .mockResolvedValueOnce({
        text: validPayload("Your hard work today is building a brighter tomorrow."),
      });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({ topic: "Personal Growth", recentMessages: [] });

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe("Your hard work today is building a brighter tomorrow.");
  });

  it("retries when the model returns malformed JSON", async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: "not valid json" }).mockResolvedValueOnce({
      text: validPayload("You deserve to shine today."),
    });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({ topic: "Confidence", recentMessages: [] });

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe("You deserve to shine today.");
  });

  it("retries when the heuristic rejects a structurally bad message even if marked valid", async () => {
    mockGenerateContent
      .mockResolvedValueOnce({
        text: JSON.stringify({ message: "Your unique perspective.", valid: true }),
      })
      .mockResolvedValueOnce({
        text: validPayload("Your unique perspective is a gift the world needs."),
      });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({ topic: "Personal Growth", recentMessages: [] });

    expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    expect(result.content).toBe("Your unique perspective is a gift the world needs.");
  });

  it("treats an exact duplicate as a duplicate", async () => {
    const { isDuplicateMessage } = await import("@/lib/ai");

    expect(
      isDuplicateMessage("You are capable of amazing things today.", [
        "You are capable of amazing things today.",
      ]),
    ).toBe(true);
    expect(
      isDuplicateMessage("You are capable of amazing things today.", ["Unrelated thought."]),
    ).toBe(false);
  });

  it("treats a near-repeat with mostly the same words as a duplicate", async () => {
    const { isDuplicateMessage } = await import("@/lib/ai");

    expect(
      isDuplicateMessage("You are capable of amazing things today.", [
        "You are capable of amazing things right now.",
      ]),
    ).toBe(true);
    expect(
      isDuplicateMessage("The quiet work you do shapes everything.", [
        "The quiet work you do shapes your whole future.",
      ]),
    ).toBe(true);
  });

  it("retries when the model returns a message already sent recently", async () => {
    mockGenerateContent
      .mockResolvedValueOnce({
        text: validPayload("The quiet work you do shapes your future."),
      })
      .mockResolvedValueOnce({
        text: validPayload("Small daily choices build a life you are proud of."),
      })
      .mockResolvedValueOnce({
        text: validPayload("Each small step today builds a stronger tomorrow."),
      });

    const { generateMessage } = await import("@/lib/ai");

    const result = await generateMessage({
      topic: "Goals & Success",
      recentMessages: ["The quiet work you do shapes your future."],
    });

    expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    expect(result.content).toBe("Each small step today builds a stronger tomorrow.");
  });
});
