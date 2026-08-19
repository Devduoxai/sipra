import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      create: mockCreate,
      findUnique: mockFindUnique,
    },
  },
}));

describe("POST /api/signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callSignup(body: unknown) {
    const { POST } = await import("@/app/api/signup/route");
    const req = new Request("http://localhost/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return POST(req);
  }

  const validBody = {
    email: "alice@example.com",
    name: "Alice",
    topics: ["Work & Career"],
    deliveryTime: "08:00",
  };

  it("creates user and returns 201 on valid signup", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1", email: "alice@example.com" });

    const res = await callSignup(validBody);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe("Signup successful");
    expect(data.userId).toBe("user-1");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("saves topics as JSON string", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1" });

    await callSignup(validBody);

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.preferences.create.topics).toBe('["Work & Career"]');
  });

  it("returns 400 on missing email", async () => {
    const res = await callSignup({ ...validBody, email: "" });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid email", async () => {
    const res = await callSignup({ ...validBody, email: "not-email" });
    expect(res.status).toBe(400);
  });

  it("returns 400 on empty topics", async () => {
    const res = await callSignup({ ...validBody, topics: [] });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid topic", async () => {
    const res = await callSignup({ ...validBody, topics: ["Invalid"] });
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid delivery time", async () => {
    const res = await callSignup({ ...validBody, deliveryTime: "8:30" });
    expect(res.status).toBe(400);
  });

  it("returns 409 on duplicate email", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" });

    const res = await callSignup(validBody);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toBe("Email already registered");
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("accepts signup without name", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1" });

    const res = await callSignup({ ...validBody, name: undefined });
    expect(res.status).toBe(201);

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.name).toBeNull();
  });

  it("accepts multiple topics", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "user-1" });

    const topics = ["Work & Career", "Personal Growth", "Peace & Mindfulness"];
    const res = await callSignup({ ...validBody, topics });
    expect(res.status).toBe(201);

    const createCall = mockCreate.mock.calls[0][0];
    expect(createCall.data.preferences.create.topics).toBe(JSON.stringify(topics));
  });

  it("returns 500 on database error", async () => {
    mockFindUnique.mockRejectedValue(new Error("DB connection failed"));

    const res = await callSignup(validBody);
    expect(res.status).toBe(500);
  });
});
