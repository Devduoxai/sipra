import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRunDailyDelivery = vi.fn();

vi.mock("@/lib/scheduler", () => ({
  runDailyDelivery: mockRunDailyDelivery,
}));

describe("GET /api/cron/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function callCron(authHeader: string | null = null) {
    const { GET } = await import("@/app/api/cron/generate/route");
    const req = new Request("http://localhost/api/cron/generate");
    if (authHeader !== null) {
      req.headers.set("authorization", authHeader);
    }
    return GET(req);
  }

  it("returns 401 with wrong auth when CRON_SECRET is set", async () => {
    process.env.CRON_SECRET = "test-secret";
    const res = await callCron("Bearer wrong-secret");
    expect(res.status).toBe(401);
    delete process.env.CRON_SECRET;
  });

  it("returns 200 with correct auth", async () => {
    process.env.CRON_SECRET = "test-secret";
    mockRunDailyDelivery.mockResolvedValue({ sent: 5, failed: 0 });

    const res = await callCron("Bearer test-secret");
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.sent).toBe(5);
    expect(data.failed).toBe(0);
    delete process.env.CRON_SECRET;
  });

  it("returns 200 when no CRON_SECRET is set (dev mode)", async () => {
    delete process.env.CRON_SECRET;
    mockRunDailyDelivery.mockResolvedValue({ sent: 2, failed: 1 });

    const res = await callCron(null);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.sent).toBe(2);
  });

  it("returns 500 on delivery error", async () => {
    mockRunDailyDelivery.mockRejectedValue(new Error("DB down"));

    const res = await callCron(null);
    expect(res.status).toBe(500);
  });
});
