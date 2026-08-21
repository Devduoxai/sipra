import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGenerateContent = vi.fn().mockResolvedValue({
  text: "Every step forward is a victory worth celebrating.",
});

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

describe("POST /api/messages/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callGenerate(body: unknown) {
    const { POST } = await import("@/app/api/messages/generate/route");
    const req = new Request("http://localhost/api/messages/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(req);
  }

  it("generates a message for valid topic", async () => {
    const res = await callGenerate({ topic: "Confidence" });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.content).toBe("Every step forward is a victory worth celebrating.");
    expect(data.topic).toBe("Confidence");
  });

  it("returns 400 on missing topic", async () => {
    const res = await callGenerate({});
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid topic", async () => {
    const res = await callGenerate({ topic: "Invalid Topic" });
    expect(res.status).toBe(400);
  });

  it("accepts recentMessages array", async () => {
    const res = await callGenerate({
      topic: "Peace & Mindfulness",
      recentMessages: ["Calm message"],
    });
    expect(res.status).toBe(200);
  });

  it("returns fallback message when AI fails", async () => {
    mockGenerateContent.mockRejectedValue(new Error("API down"));

    const res = await callGenerate({ topic: "Confidence" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toContain("tired");
  });
});
