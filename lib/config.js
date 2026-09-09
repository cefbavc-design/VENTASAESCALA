// Dominio público usado para construir las URLs /q/:codigo.
// Se lee de la variable de entorno DOMAIN. Cambiala en .env cuando tengas
// tu dominio final; no hace falta tocar código en ningún otro lado.
export function getDomain() {
  return (process.env.DOMAIN || 'https://midominio.com').replace(/\/$/, '');
}

export function buildUrl(codigo) {
  return `${getDomain()}/q/${codigo}`;
}

// Sólo permitimos destinos http/https. Bloquea javascript:, data:, file:, etc.
export function isDestinoValido(destino) {
  if (!destino || typeof destino !== 'string') return false;
  try {
    const url = new URL(destino);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
