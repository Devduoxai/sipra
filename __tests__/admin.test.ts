import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCount = vi.fn();
const mockFindMany = vi.fn();
const mockGroupBy = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      count: mockCount,
      findMany: mockFindMany,
    },
    message: {
      count: mockCount,
      groupBy: mockGroupBy,
    },
  },
}));

describe("GET /api/admin/stats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ADMIN_KEY = "test-admin-key";
  });

  async function callGet(key: string | null) {
    const { GET } = await import("@/app/api/admin/stats/route");
    const url = key
      ? `http://localhost/api/admin/stats?key=${encodeURIComponent(key)}`
      : "http://localhost/api/admin/stats";
    return GET(new Request(url));
  }

  it("returns 401 when key is invalid", async () => {
    const res = await callGet("wrong-key");
    expect(res.status).toBe(401);
  });

  it("returns 401 when key is missing", async () => {
    const res = await callGet(null);
    expect(res.status).toBe(401);
  });

  it("returns stats for valid key", async () => {
    mockCount.mockResolvedValueOnce(10);
    mockCount.mockResolvedValueOnce(8);
    mockCount.mockResolvedValueOnce(25);
    mockCount.mockResolvedValueOnce(20);
    mockCount.mockResolvedValueOnce(5);
    mockFindMany.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([]);

    const res = await callGet("test-admin-key");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.users.total).toBe(10);
    expect(data.users.active).toBe(8);
    expect(data.messages.total).toBe(25);
    expect(data.messages.sent).toBe(20);
    expect(data.messages.failed).toBe(5);
  });

  it("returns recent users", async () => {
    mockCount.mockResolvedValueOnce(1);
    mockCount.mockResolvedValueOnce(1);
    mockCount.mockResolvedValueOnce(1);
    mockCount.mockResolvedValueOnce(1);
    mockCount.mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValue([
      { id: "u1", email: "a@test.com", name: "Alice", createdAt: new Date(), active: true },
    ]);
    mockGroupBy.mockResolvedValue([]);

    const res = await callGet("test-admin-key");
    const data = await res.json();

    expect(data.recentUsers).toHaveLength(1);
    expect(data.recentUsers[0].email).toBe("a@test.com");
  });

  it("returns messages by topic", async () => {
    mockCount.mockResolvedValueOnce(0);
    mockCount.mockResolvedValueOnce(0);
    mockCount.mockResolvedValueOnce(5);
    mockCount.mockResolvedValueOnce(4);
    mockCount.mockResolvedValueOnce(1);
    mockFindMany.mockResolvedValue([]);
    mockGroupBy.mockResolvedValue([
      { topic: "Confidence", _count: { topic: 3 } },
      { topic: "Gratitude", _count: { topic: 2 } },
    ]);

    const res = await callGet("test-admin-key");
    const data = await res.json();

    expect(data.messagesByTopic).toHaveLength(2);
    expect(data.messagesByTopic[0].topic).toBe("Confidence");
    expect(data.messagesByTopic[0].count).toBe(3);
  });

  it("returns 500 on database error", async () => {
    mockCount.mockRejectedValue(new Error("DB error"));

    const res = await callGet("test-admin-key");
    expect(res.status).toBe(500);
  });
});
