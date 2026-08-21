import { db } from "./db";
import { generateMessage } from "./ai";
import { sendEmail, buildMessageEmail } from "./email";
import type { Topic } from "@/types";

interface UserDueForMessage {
  userId: string;
  email: string;
  name: string | null;
  topics: Topic[];
  deliveryTime: string;
}

function parseTopics(topicsJson: string): Topic[] {
  try {
    return JSON.parse(topicsJson) as Topic[];
  } catch {
    return [];
  }
}

export async function findUsersDueForMessage(): Promise<UserDueForMessage[]> {
  const preferences = await db.userPreference.findMany({
    where: {
      user: { active: true },
    },
    include: { user: true },
  });

  return preferences
    .filter((p) => p.user !== null)
    .map((p) => ({
      userId: p.userId,
      email: p.user.email,
      name: p.user.name,
      topics: parseTopics(p.topics),
      deliveryTime: p.deliveryTime,
    }));
}

export async function getRecentMessages(userId: string, limit = 7): Promise<string[]> {
  const messages = await db.message.findMany({
    where: { userId },
    orderBy: { generatedAt: "desc" },
    take: limit,
    select: { content: true },
  });

  return messages.map((m) => m.content);
}

export async function processUserMessage(user: UserDueForMessage): Promise<void> {
  const randomTopic = user.topics[Math.floor(Math.random() * user.topics.length)];
  const recentMessages = await getRecentMessages(user.userId);

  const generated = await generateMessage({
    topic: randomTopic,
    recentMessages,
  });

  const message = await db.message.create({
    data: {
      userId: user.userId,
      content: generated.content,
      topic: generated.topic,
      deliveryStatus: "pending",
    },
  });

  const emailContent = buildMessageEmail(generated.content, generated.topic);
  const result = await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html.replace("{{EMAIL}}", user.email),
  });

  if (!result.success) {
    console.error(`Email failed for ${user.email}:`, result.error);
  }

  await db.message.update({
    where: { id: message.id },
    data: {
      deliveryStatus: result.success ? "sent" : "failed",
      sentAt: result.success ? new Date() : null,
    },
  });
}

export async function runDailyDelivery(): Promise<{ sent: number; failed: number }> {
  const users = await findUsersDueForMessage();
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < users.length; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    try {
      await processUserMessage(users[i]);
      sent++;
    } catch (e) {
      console.error(`Failed to send to user:`, e);
      failed++;
    }
  }

  return { sent, failed };
}
