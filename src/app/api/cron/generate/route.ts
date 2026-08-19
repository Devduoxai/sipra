import { NextResponse } from "next/server";
import { runDailyDelivery } from "@/lib/scheduler";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runDailyDelivery();
    return NextResponse.json({ message: "Daily delivery complete", ...result });
  } catch {
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
  }
}
