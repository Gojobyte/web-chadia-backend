// --------------------------------------------------------------------------
// Helper de pagination
// --------------------------------------------------------------------------
// Quand une table a beaucoup de lignes (ex: 100 projets), on ne veut pas
// tout renvoyer d'un coup. On renvoie 20 par 20 = c'est la pagination.
//
// Exemple d'utilisation dans un endpoint :
//   const { skip, take, page } = getPagination(request);
//   const projets = await prisma.projet.findMany({ skip, take });
//   return success({ projets, page, pageSize: take });
// --------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export function getPagination(request: Request) {
  const url = new URL(request.url);

  // Lire les parametres ?page=1&pageSize=20 depuis l'URL
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(url.searchParams.get("pageSize") ?? `${DEFAULT_PAGE_SIZE}`, 10))
  );

  return {
    page,
    take: pageSize, // Prisma utilise "take" pour le nombre d'elements
    skip: (page - 1) * pageSize, // Prisma utilise "skip" pour sauter les premiers
  };
}
