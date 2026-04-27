import { NextResponse } from "next/server";

// --------------------------------------------------------------------------
// Helpers pour les reponses API
// --------------------------------------------------------------------------
// Ces fonctions standardisent le format des reponses JSON.
// Au lieu de repeter NextResponse.json(...) partout, on utilise ces helpers.
//
// Exemple :
//   return success({ projets: [...] })        → 200 OK
//   return error("Projet non trouve", 404)    → 404 Not Found
//   return created({ id: "xxx" })             → 201 Created
// --------------------------------------------------------------------------

export function success<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return NextResponse.json(
    { error: "Non autorise. Veuillez vous connecter." },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { error: "Acces refuse. Vous n'avez pas les droits necessaires." },
    { status: 403 }
  );
}

export function notFound(entite = "Ressource") {
  return NextResponse.json(
    { error: `${entite} non trouve(e).` },
    { status: 404 }
  );
}
