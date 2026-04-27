import { prisma } from "@/lib/prisma";
import { success, error } from "@/lib/utils/api-response";
import { createMessageSchema } from "@/lib/schemas/contact";
import { sendEmail } from "@/lib/email";

// --------------------------------------------------------------------------
// POST /api/public/contact/message — Envoi d'un message de contact
// --------------------------------------------------------------------------
// Appele par le formulaire de contact du site public.
// Inclut un honeypot (champ "fax" qui doit etre vide).

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createMessageSchema.safeParse(body);

  if (!parsed.success) {
    // Si le honeypot est rempli, on renvoie un faux succes (le bot croit que ca a marche)
    if (parsed.error.issues.some((i) => i.path.includes("fax"))) {
      return success({ ok: true });
    }
    return error(parsed.error.issues[0].message, 400);
  }

  const { fax: _, ...messageData } = parsed.data;

  // Sauvegarder en BDD
  await prisma.messageContact.create({ data: messageData });

  // Envoyer un email de notification a l'admin
  const emailTo =
    messageData.sujet.toLowerCase().includes("partenariat")
      ? process.env.CONTACT_EMAIL_PARTENARIAT
      : process.env.CONTACT_EMAIL_GENERAL;

  if (emailTo) {
    await sendEmail({
      to: emailTo,
      subject: `[ONG CHADIA] Nouveau message : ${messageData.sujet}`,
      html: `
        <h2>Nouveau message depuis le site</h2>
        <p><strong>De :</strong> ${messageData.nom} (${messageData.email})</p>
        <p><strong>Sujet :</strong> ${messageData.sujet}</p>
        <hr />
        <p>${messageData.message.replace(/\n/g, "<br />")}</p>
      `,
    });
  }

  return success({ ok: true });
}
