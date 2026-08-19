import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: mockFindUnique,
    },
    userPreference: {
      update: mockUpdate,
    },
  },
}));

describe("GET /api/preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callGet(email: string | null) {
    const { GET } = await import("@/app/api/preferences/route");
    const url = email
      ? `http://localhost/api/preferences?email=${encodeURIComponent(email)}`
      : "http://localhost/api/preferences";
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

  it("returns preferences for existing user", async () => {
    mockFindUnique.mockResolvedValue({
      email: "alice@example.com",
      name: "Alice",
      preferences: {
        topics: '["Work & Career","Confidence"]',
        deliveryTime: "09:00",
      },
    });

    const res = await callGet("alice@example.com");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.topics).toEqual(["Work & Career", "Confidence"]);
    expect(data.deliveryTime).toBe("09:00");
    expect(data.name).toBe("Alice");
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await callGet("alice@example.com");
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callPut(body: unknown) {
    const { PUT } = await import("@/app/api/preferences/route");
    const req = new Request("http://localhost/api/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return PUT(req);
  }

  const mockUser = {
    id: "user-1",
    email: "alice@example.com",
    preferences: { userId: "user-1" },
  };

  it("returns 400 when email is missing", async () => {
    const res = await callPut({ topics: ["Confidence"] });
    expect(res.status).toBe(400);
  });

  it("returns 404 when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await callPut({ email: "unknown@example.com", topics: ["Confidence"] });
    expect(res.status).toBe(404);
  });

  it("returns 400 on invalid topics", async () => {
    const res = await callPut({ email: "alice@example.com", topics: [] });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid delivery time", async () => {
    const res = await callPut({ email: "alice@example.com", deliveryTime: "8:30" });
    expect(res.status).toBe(400);
  });

  it("updates topics successfully", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({
      topics: '["Confidence","Goals & Success"]',
      deliveryTime: "09:00",
    });

    const res = await callPut({
      email: "alice@example.com",
      topics: ["Confidence", "Goals & Success"],
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Preferences updated");
    expect(data.topics).toEqual(["Confidence", "Goals & Success"]);
  });

  it("updates delivery time successfully", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({
      topics: '["Confidence"]',
      deliveryTime: "14:00",
    });

    const res = await callPut({
      email: "alice@example.com",
      deliveryTime: "14:00",
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.deliveryTime).toBe("14:00");
  });

  it("saves topics as JSON string", async () => {
    mockFindUnique.mockResolvedValue(mockUser);
    mockUpdate.mockResolvedValue({
      topics: '["Peace & Mindfulness"]',
      deliveryTime: "09:00",
    });

    await callPut({
      email: "alice@example.com",
      topics: ["Peace & Mindfulness"],
    });

    const updateCall = mockUpdate.mock.calls[0][0];
    expect(updateCall.data.topics).toBe('["Peace & Mindfulness"]');
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB error"));

    const res = await callPut({
      email: "alice@example.com",
      topics: ["Confidence"],
    });
    expect(res.status).toBe(500);
  });
});
