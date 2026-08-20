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
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
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
      { message: "Signup successful", userId: user.id },
      { status: 201 },
    );
  } catch (e) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
