/** URL de base pour les appels REST (vide = chemins relatifs, même origine). */
export function getApiBase(): string {
  const env = import.meta.env.VITE_SOCKET_URL;
  if (typeof window === "undefined") {
    return typeof env === "string" && env.trim() !== "" ? env.trim() : "";
  }
  if (typeof env === "string" && env.trim() !== "") {
    try {
      if (new URL(env.trim()).origin === window.location.origin) return "";
    } catch {
      // URL invalide : on retombe sur la valeur brute ci-dessous.
    }
    return env.trim();
  }
  return "";
}

export function apiUrl(path: string): string {
  const base = getApiBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
