import { Resend } from "resend";

// --------------------------------------------------------------------------
// Service d'envoi d'emails (Resend) — Lazy init
// --------------------------------------------------------------------------
// Le client Resend est cree au premier appel, pas au demarrage.
// (Meme raison que Prisma : la cle API n'est pas dispo au build.)
// --------------------------------------------------------------------------

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResend();

  if (!resend) {
    console.log(`[DEV] Email vers ${to} : ${subject}`);
    return { success: true };
  }

  const { error } = await resend.emails.send({
    from: "ONG CHADIA <noreply@ong-chadia.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Erreur envoi email :", error);
    return { success: false, error };
  }

  return { success: true };
}
