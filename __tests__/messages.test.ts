import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mockFindUnique,
    },
    message: {
      findMany: mockFindMany,
    },
  },
}));

describe("GET /api/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callGet(email: string | null) {
    const { GET } = await import("@/app/api/messages/route");
    const url = email
      ? `http://localhost/api/messages?email=${encodeURIComponent(email)}`
      : "http://localhost/api/messages";
    return GET(new Request(url));
  }

  it("returns 400 when email is missing", async () => {
    const res = await callGet(null);
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await callGet("unknown@example.com");
    expect(res.status).toBe(404);
  });

  it("returns messages for existing user", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1" });
    mockFindMany.mockResolvedValue([
      {
        id: "msg-1",
        content: "You are capable of amazing things.",
        topic: "Confidence",
        deliveryStatus: "sent",
        generatedAt: new Date("2026-01-01"),
        sentAt: new Date("2026-01-01"),
      },
    ]);

    const res = await callGet("alice@example.com");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.messages).toHaveLength(1);
    expect(data.messages[0].content).toBe("You are capable of amazing things.");
  });

  it("returns empty array when user has no messages", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1" });
    mockFindMany.mockResolvedValue([]);

    const res = await callGet("alice@example.com");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.messages).toHaveLength(0);
  });

  it("orders messages by generatedAt descending", async () => {
    mockFindUnique.mockResolvedValue({ id: "user-1" });
    mockFindMany.mockResolvedValue([]);

    await callGet("alice@example.com");

    const findManyCall = mockFindMany.mock.calls[0][0];
    expect(findManyCall.orderBy).toEqual({ generatedAt: "desc" });
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await callGet("alice@example.com");
    expect(res.status).toBe(500);
  });
});
