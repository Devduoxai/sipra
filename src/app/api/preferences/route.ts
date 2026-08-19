import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { preferenceUpdateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!user || !user.preferences) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      topics: JSON.parse(user.preferences.topics),
      deliveryTime: user.preferences.deliveryTime,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const result = preferenceUpdateSchema.safeParse(updates);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 },
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: { preferences: true },
    });

    if (!user || !user.preferences) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { topics, deliveryTime } = result.data;

    const updated = await db.userPreference.update({
      where: { userId: user.id },
      data: {
        ...(topics !== undefined && { topics: JSON.stringify(topics) }),
        ...(deliveryTime !== undefined && { deliveryTime }),
      },
    });

    return NextResponse.json({
      message: "Preferences updated",
      topics: JSON.parse(updated.topics),
      deliveryTime: updated.deliveryTime,
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
