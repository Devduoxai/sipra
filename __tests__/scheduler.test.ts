import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    userPreference: {
      findMany: mockFindMany,
    },
    message: {
      create: mockCreate,
      update: mockUpdate,
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

const mockGenerateMessage = vi.fn().mockResolvedValue({
  content: "You are capable of amazing things.",
  topic: "Confidence",
});

vi.mock("@/lib/ai", () => ({
  generateMessage: mockGenerateMessage,
}));

const mockSendEmail = vi.fn().mockResolvedValue({ success: true, id: "email-1" });

vi.mock("@/lib/email", () => ({
  sendEmail: mockSendEmail,
  buildMessageEmail: (message: string, topic: string) => ({
    subject: `Your daily Sipra: ${topic}`,
    html: `<p>${message}</p>`,
  }),
}));

describe("scheduler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findUsersDueForMessage", () => {
    it("returns users whose delivery time matches current hour", async () => {
      mockFindMany.mockResolvedValue([
        {
          userId: "user-1",
          email: "alice@example.com",
          name: "Alice",
          topics: '["Confidence"]',
          deliveryTime: "08:00",
          user: { email: "alice@example.com", name: "Alice", active: true },
        },
      ]);

      const { findUsersDueForMessage } = await import("@/lib/scheduler");
      const users = await findUsersDueForMessage();

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe("alice@example.com");
      expect(users[0].topics).toEqual(["Confidence"]);
    });

    it("returns empty array when no users are due", async () => {
      mockFindMany.mockResolvedValue([]);

      const { findUsersDueForMessage } = await import("@/lib/scheduler");
      const users = await findUsersDueForMessage();

      expect(users).toHaveLength(0);
    });
  });

  describe("processUserMessage", () => {
    it("generates message, sends email, and records delivery", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCreate.mockResolvedValue({ id: "msg-1" });
      mockUpdate.mockResolvedValue({});

      const { processUserMessage } = await import("@/lib/scheduler");

      await processUserMessage({
        userId: "user-1",
        email: "alice@example.com",
        name: "Alice",
        topics: ["Confidence"],
        deliveryTime: "08:00",
      });

      expect(mockGenerateMessage).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();
    });

    it("marks message as failed when email fails", async () => {
      mockFindMany.mockResolvedValue([]);
      mockCreate.mockResolvedValue({ id: "msg-1" });
      mockUpdate.mockResolvedValue({});
      mockSendEmail.mockResolvedValueOnce({ success: false, error: "Email error" });

      const { processUserMessage } = await import("@/lib/scheduler");

      await processUserMessage({
        userId: "user-1",
        email: "alice@example.com",
        name: "Alice",
        topics: ["Confidence"],
        deliveryTime: "08:00",
      });

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.where.id).toBe("msg-1");
    });
  });
});
