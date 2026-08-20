import { google } from "googleapis";

let gmailClient: ReturnType<typeof google.gmail> | null = null;

function getGmail() {
  if (!gmailClient) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
    gmailClient = google.gmail({ version: "v1", auth: oauth2Client });
  }
  return gmailClient;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

function buildRawEmail(to: string, subject: string, html: string): string {
  const from = process.env.GMAIL_SENDER_EMAIL || "devduoxai@gmail.com";
  const messageParts = [
    `From: Sipra <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ];
  return Buffer.from(messageParts.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const gmail = getGmail();
    const raw = buildRawEmail(input.to, input.subject, input.html);

    const result = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return { success: true, id: result.data.id ?? undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    return { success: false, error: message };
  }
}

export function buildMessageEmail(
  message: string,
  topic: string,
): { subject: string; html: string } {
  return {
    subject: `Your daily Sipra: ${topic}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Sipra</h2>
        <p style="color: #666; font-size: 14px;">Topic: ${topic}</p>
        <p style="color: #333; font-size: 18px; line-height: 1.6;">${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent("{{EMAIL}}")}" style="color: #999;">Unsubscribe</a>
        </p>
      </div>
    `,
  };
}
