// --------------------------------------------------------------------------
// Rate Limiter — Protection contre les attaques brute force
// --------------------------------------------------------------------------
// Limite le nombre de tentatives de connexion par adresse IP.
//
// Fonctionnement :
// - Chaque IP a un compteur de tentatives
// - Apres 5 tentatives en 15 minutes → bloque pendant 15 minutes
// - Le compteur se reinitialise apres 15 minutes sans tentative
//
// On utilise un Map en memoire (pas en BDD) car :
// - C'est plus rapide (pas de requete BDD a chaque tentative)
// - C'est suffisant pour un seul serveur
// - Les donnees se perdent au redemarrage, mais c'est acceptable
// --------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  firstAttempt: number; // Timestamp de la premiere tentative
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes en millisecondes

/**
 * Verifie si une IP est autorisee a faire une tentative.
 *
 * @param ip - L'adresse IP du client
 * @returns { allowed: true } si autorise, { allowed: false, retryAfter } si bloque
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number; // Secondes restantes avant deblocage
  remaining?: number;  // Tentatives restantes
} {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Pas d'entree = premiere tentative → autorise
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // La fenetre de 15 minutes est expiree → reinitialiser
  if (now - entry.firstAttempt > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Encore dans la fenetre : verifier le nombre de tentatives
  if (entry.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil(
      (WINDOW_MS - (now - entry.firstAttempt)) / 1000
    );
    return { allowed: false, retryAfter };
  }

  // Incrementer le compteur
  entry.count++;
  rateLimitMap.set(ip, entry);
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count };
}

/**
 * Reinitialise le compteur pour une IP (apres une connexion reussie).
 */
export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

// Nettoyage periodique des entrees expirees (toutes les 30 minutes)
// Ca evite que le Map grossisse indefiniment
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, 30 * 60 * 1000);
