// Route de diagnostic temporaire — a supprimer apres debug
export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? "NOT SET";

  // On masque le mot de passe pour la securite
  let safeUrl = "NOT SET";
  if (dbUrl !== "NOT SET") {
    try {
      const url = new URL(dbUrl);
      url.password = "***";
      safeUrl = url.toString();
    } catch {
      safeUrl = `INVALID URL FORMAT: ${dbUrl.slice(0, 50)}...`;
    }
  }

  return Response.json({
    status: "checking",
    DATABASE_URL: safeUrl,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT SET",
  });
}
