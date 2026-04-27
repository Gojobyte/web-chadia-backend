import { NextResponse } from "next/server";

// --------------------------------------------------------------------------
// Configuration CORS
// --------------------------------------------------------------------------
// CORS = Cross-Origin Resource Sharing
//
// Par defaut, un navigateur BLOQUE les appels API entre deux domaines
// differents (ex: ong-chadia.com ne peut pas appeler admin.ong-chadia.com).
// CORS autorise certains domaines a faire ces appels.
//
// On autorise uniquement les origines definies dans ALLOWED_ORIGINS.
// --------------------------------------------------------------------------

export function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "").split(",");

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // Cache pendant 24h
  };

  // Si l'origine de la requete est dans la liste autorisee, on l'accepte
  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

// Reponse pour les requetes OPTIONS (preflight CORS)
export function handleCorsOptions(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
