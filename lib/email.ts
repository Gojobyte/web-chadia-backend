import { Resend } from "resend";

// --------------------------------------------------------------------------
// Service d'envoi d'emails (Resend)
// --------------------------------------------------------------------------
// On utilise Resend pour envoyer des emails :
// - Notification quand un visiteur envoie un message de contact
// - Email avec identifiants quand le Super Admin cree un compte
//
// Resend offre 3000 emails/mois gratuitement — largement suffisant.
// --------------------------------------------------------------------------

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  // En developpement, on affiche dans la console au lieu d'envoyer
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 [DEV] Email vers ${to} : ${subject}`);
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
