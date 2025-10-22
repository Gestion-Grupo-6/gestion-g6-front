# Local testing guide

Aplicación Next.js que consume el backend de `gestion-g6-back` para listar y administrar hoteles, restaurantes, actividades y destinos.

## Requisitos

- Node.js ≥ 18.18.0 (o 20.x LTS)
- PNPM (`npm i -g pnpm`)
- Backend corriendo (por defecto en `http://localhost:8080`)

## Puesta en marcha local

1. Clona el repositorio y entra a `gestion-g6-front`.
2. Instala dependencias:
   ```bash
   pnpm install
   ```
3. Si el backend no corre en `http://localhost:8080`, crea `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=http://tu-backend:8080
   ```
4. Arranca el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
5. Abre `http://localhost:3000`.

## Flujo principal

- Los listados (`/hoteles`, `/restaurantes`, `/actividades`, `/destinos`) y las páginas dinámicas (`/hotel/[id]`, etc.) consumen los endpoints REST del backend.
- La home (`/`) muestra cuatro destacados tomados del backend.
- La sección `/mis-negocios` permite **crear publicaciones**. Completa el formulario, elige la categoría y se enviará un `POST` al backend. Las tarjetas se refrescan tras guardar.

> Para tener datos base, ejecuta el seed del backend:  
> `mongosh "mongodb://localhost:27017/gestion" scripts/seed-places.js`

## Scripts útiles

- `pnpm dev` – servidor de desarrollo.
- `pnpm build` – build de producción.
- `pnpm start` – sirve la build (`next start`).
- `pnpm lint` – ESLint (requiere configurar `.eslintrc` si aún no existe).

## Notas

- Asegúrate de tener el backend levantado antes de usar `/mis-negocios` o los listados.
- Las imágenes se sirven desde `/public`; si agregas nuevas rutas de imagen, súbelas allí.
