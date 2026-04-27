import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// --------------------------------------------------------------------------
// Middleware — Protection des routes admin
// --------------------------------------------------------------------------
// Ce middleware verifie si un cookie de session NextAuth existe.
//
// IMPORTANT : Il ne verifie PAS si la session est valide (ca c'est le
// role de auth() dans les pages et API routes). Il verifie juste si
// l'utilisateur a un cookie de session = s'il s'est deja connecte.
//
// C'est une premiere barriere rapide. La verification complete
// (session valide + role correct) se fait dans chaque page/API.
//
// Pourquoi ne pas utiliser auth() ici ?
// → Le middleware tourne dans un runtime leger qui n'a pas acces
//   a Prisma/PostgreSQL. On garde la verification BDD pour les pages.
// --------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifier si un cookie de session NextAuth existe
  // NextAuth v5 utilise "authjs.session-token" ou "__Secure-authjs.session-token"
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  // --- Routes admin (pages du panel) sauf login ---
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // --- Page de login quand deja connecte ---
  if (pathname === "/admin/login" && hasSession) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // --- Routes API admin ---
  if (pathname.startsWith("/api/admin")) {
    if (!hasSession) {
      return NextResponse.json(
        { error: "Non autorise. Veuillez vous connecter." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
