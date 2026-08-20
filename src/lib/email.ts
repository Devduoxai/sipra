import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_SENDER_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
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

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  try {
    const from = process.env.GMAIL_SENDER_EMAIL || "devduoxai@gmail.com";
    const result = await getTransporter().sendMail({
      from: `Sipra <${from}>`,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    return { success: true, id: result.messageId };
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
