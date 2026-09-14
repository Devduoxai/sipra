import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockFindUnique = vi.fn();
const mockUpdateUser = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      create: mockCreate,
      findUnique: mockFindUnique,
      update: mockUpdateUser,
    },
    userPreference: {
      update: mockUpdatePreferences,
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
    expect(data.updated).toBe(false);
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

  it("updates topics and delivery time on duplicate email and returns 200", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" });
    mockUpdateUser.mockResolvedValue({ id: "existing-user", email: "alice@example.com" });
    mockUpdatePreferences.mockResolvedValue({
      userId: "existing-user",
      topics: JSON.stringify(validBody.topics),
      deliveryTime: validBody.deliveryTime,
    });

    const res = await callSignup(validBody);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toBe("Signup successful");
    expect(data.updated).toBe(true);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdateUser).toHaveBeenCalledWith({
      where: { id: "existing-user" },
      data: { active: true, name: "Alice" },
    });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      where: { userId: "existing-user" },
      data: {
        topics: JSON.stringify(validBody.topics),
        deliveryTime: validBody.deliveryTime,
      },
    });
  });

  it("reactivates a previously inactive user on duplicate email", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" });
    mockUpdateUser.mockResolvedValue({ id: "existing-user" });
    mockUpdatePreferences.mockResolvedValue({ userId: "existing-user" });

    const res = await callSignup(validBody);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.updated).toBe(true);
    const updateCall = mockUpdateUser.mock.calls[0][0];
    expect(updateCall.data.active).toBe(true);
  });

  it("keeps the existing name when re-signup provides no name", async () => {
    mockFindUnique.mockResolvedValue({ id: "existing-user" });
    mockUpdateUser.mockResolvedValue({ id: "existing-user" });
    mockUpdatePreferences.mockResolvedValue({ userId: "existing-user" });

    const res = await callSignup({ ...validBody, name: undefined });
    expect(res.status).toBe(200);

    const updateCall = mockUpdateUser.mock.calls[0][0];
    expect(updateCall.data).toEqual({ active: true });
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
