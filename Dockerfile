# Dockerfile para Frontend Next.js
FROM node:20-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Instalar dependencias
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f package-lock.json ]; then \
    npm ci; \
  else \
    npm install; \
  fi

# Rebuild del código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build (Next.js necesita estas en build time)
# Valores por defecto del env-template
ARG NEXT_PUBLIC_SUPABASE_URL="https://ucntmhnssxrrmspecams.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbnRtaG5zc3hycm1zcGVjYW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2NDI0NzIsImV4cCI6MjA3NjIxODQ3Mn0.MDiR11ReMFAQVK5Ch1yuN9RuIp-yaebtOQ4sSJ0t2oo"
ARG NEXT_PUBLIC_SUPABASE_BUCKET_NAME="tango-images"
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyBy0nl7YeDWexazsCwd-YGN9xjTFOyQaEI"
ARG NEXT_PUBLIC_MAP_ID="87a2f01c6cc58e67af3b462d"
ARG NEXT_PUBLIC_API_BASE_URL="http://localhost:8080"

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_SUPABASE_BUCKET_NAME=${NEXT_PUBLIC_SUPABASE_BUCKET_NAME}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
ENV NEXT_PUBLIC_MAP_ID=${NEXT_PUBLIC_MAP_ID}
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Configurar Next.js para standalone output
ENV NEXT_OUTPUT=standalone

# Build de la aplicación
RUN \
  if [ -f pnpm-lock.yaml ]; then \
    corepack enable pnpm && pnpm build; \
  else \
    npm run build; \
  fi

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public

# Copiar standalone build si existe
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Ejecutar servidor standalone
CMD ["node", "server.js"]

