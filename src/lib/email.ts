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
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 40px;">&#9728;&#65039;</span>
          <h1 style="color: #92400e; font-size: 28px; margin: 8px 0 4px;">Sipra</h1>
          <p style="color: #b45309; font-size: 14px; margin: 0;">A little something good, every day.</p>
        </div>
        <div style="background: #fffbeb; border-radius: 12px; padding: 24px; border: 1px solid #fde68a;">
          <p style="color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">${topic}</p>
          <p style="color: #1c1917; font-size: 18px; line-height: 1.7; margin: 0;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #fde68a; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent("{{EMAIL}}")}" style="color: #b45309;">Unsubscribe</a>
        </p>
      </div>
    `,
  };
}
