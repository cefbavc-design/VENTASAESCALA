# QR Dinámico — Panel de administración

Sistema de QR dinámicos/configurables: cada QR físico apunta siempre a
`https://tudominio.com/q/CODIGO`, y desde el panel podés asignar y cambiar
el destino real cuantas veces quieras sin reimprimir nada.

## 1. Instalación local

```bash
npm install
cp .env.example .env
```

Editá `.env`:

```
DOMAIN=https://midominio.com        # tu dominio real (sin barra final)
ADMIN_USER=admin
ADMIN_PASSWORD=elegí-una-clave-fuerte
SESSION_SECRET=un-string-random-largo-y-secreto
DB_PATH=./data/qr.db
```

Corré en desarrollo:

```bash
npm run dev
```

Entrá a `http://localhost:3000/admin` con el usuario/clave que configuraste.
La base de datos SQLite se crea sola en `./data/qr.db` la primera vez que
arranca la app (no hace falta ningún paso de migración manual).

## 2. Uso

1. **Generar un lote**: `/admin/lotes/nuevo` → cantidad, prefijo, número inicial.
2. Se crean los códigos (ej. `QR-0001`…`QR-0250`), todos en estado
   "Disponible" y sin destino.
3. Descargás el **ZIP de PNG** o el **PDF de impresión en grilla** y mandás a
   imprimir.
4. Cuando vendés un QR, entrás a su ficha (`/admin/qr/QR-0047`), cargás el
   destino (Instagram, WhatsApp, lo que sea) y guardás. El estado pasa
   automáticamente a "Activo".
5. Podés **pausar** un QR (deja de redireccionar y muestra una página de
   "QR desactivado") o **cambiar el destino** en cualquier momento — el QR
   impreso nunca cambia.

## 3. Cambiar de dominio

Sólo hay que cambiar la variable `DOMAIN` en `.env` (o en las variables de
entorno del hosting) y reiniciar la app. Todas las URLs (panel, CSV, PNG,
PDF) se generan a partir de esa variable.

## 4. Deploy recomendado (barato y simple)

**Importante:** este proyecto usa SQLite (`better-sqlite3`), que necesita un
**disco persistente**. No sirve en plataformas 100% serverless como Vercel
(el sistema de archivos se resetea en cada request).

Opciones económicas recomendadas:

- **Railway** o **Render** (~5 USD/mes): permiten un volumen persistente
  donde apuntás `DB_PATH` (ej. `/data/qr.db`), y despliegan directo desde
  este repo con `npm run build` / `npm start`.
- **VPS chico** (DigitalOcean, Hetzner, etc.): corré `npm run build && npm start`
  detrás de un proxy (Caddy/Nginx) con tu dominio y HTTPS gratis (Let's Encrypt).

Si en el futuro preferís serverless puro (Vercel/Netlify), migrá `lib/db.js`
de `better-sqlite3` a una base compatible con HTTP como **Turso** (SQLite
distribuido) — el esquema y las queries son prácticamente iguales.

## 5. Seguridad ya implementada

- El panel (`/admin/*` y las APIs de escritura) está protegido por login
  con cookie firmada (HMAC + expiración).
- `/q/:codigo` es pública (así tiene que ser: es lo que escanea la gente).
- Los destinos se validan: sólo se aceptan URLs `http://` o `https://`
  (se bloquean `javascript:`, `data:`, etc.).
- Un QR pausado nunca redirecciona: muestra una página informativa.
- Un QR sin destino configurado muestra "aún no configurado" en vez de dar error.

## 6. Analítica (preparada, no activa)

Ya existe la tabla `scans` (código, destino, fecha, user-agent, IP) y cada
redirección exitosa inserta una fila ahí. La v1 no expone esto en el panel
a propósito, tal como se pidió — queda lista para construir un dashboard de
estadísticas más adelante sin tocar el modelo de datos.

## 7. Estructura del proyecto

```
app/
  q/[codigo]/route.js        → redirección dinámica (el corazón del sistema)
  pausado/, no-configurado/  → páginas públicas de estado
  admin/login/                → login del panel
  admin/(app)/                → panel protegido (dashboard, lotes, detalle de QR)
  api/lotes/                  → generación de lotes
  api/qr/                     → listado, detalle, edición, imagen de cada QR
  api/export/{csv,zip,pdf}    → exportaciones
lib/
  db.js       → conexión SQLite + esquema
  auth.js     → sesión del panel (cookie firmada)
  config.js   → dominio configurable + validación de URLs de destino
  qrgen.js    → generación de imágenes QR (PNG/SVG)
```
