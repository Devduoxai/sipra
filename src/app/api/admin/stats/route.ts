import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalUsers,
      activeUsers,
      totalMessages,
      sentMessages,
      failedMessages,
      recentUsers,
      messagesByTopic,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { active: true } }),
      db.message.count(),
      db.message.count({ where: { deliveryStatus: "sent" } }),
      db.message.count({ where: { deliveryStatus: "failed" } }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, email: true, name: true, createdAt: true, active: true },
      }),
      db.message.groupBy({
        by: ["topic"],
        _count: { topic: true },
        orderBy: { _count: { topic: "desc" } },
      }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, active: activeUsers },
      messages: { total: totalMessages, sent: sentMessages, failed: failedMessages },
      recentUsers,
      messagesByTopic: messagesByTopic.map((item: { topic: string; _count: { topic: number } }) => ({
        topic: item.topic,
        count: item._count.topic,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
