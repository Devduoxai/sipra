import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const messages = await db.message.findMany({
      where: { userId: user.id },
      orderBy: { generatedAt: "desc" },
      select: {
        id: true,
        content: true,
        topic: true,
        deliveryStatus: true,
        generatedAt: true,
        sentAt: true,
      },
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
