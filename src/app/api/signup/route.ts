import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { signupSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: result.error.issues },
        { status: 400 },
      );
    }

    const { email, name, topics, deliveryTime } = result.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      const user = await db.user.update({
        where: { id: existing.id },
        data: {
          active: true,
          ...(name ? { name } : {}),
        },
      });

      await db.userPreference.update({
        where: { userId: existing.id },
        data: {
          topics: JSON.stringify(topics),
          deliveryTime,
        },
      });

      return NextResponse.json(
        { message: "Signup successful", userId: user.id, updated: true },
        { status: 200 },
      );
    }

    const user = await db.user.create({
      data: {
        email,
        name: name || null,
        preferences: {
          create: {
            topics: JSON.stringify(topics),
            deliveryTime,
          },
        },
      },
      include: { preferences: true },
    });

    return NextResponse.json(
      { message: "Signup successful", userId: user.id, updated: false },
      { status: 201 },
    );
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
