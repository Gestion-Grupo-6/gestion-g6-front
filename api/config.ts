// Backend base URL configuration
// En el servidor (SSR/API routes), usar API_BASE_URL (http://backend:8080 en Docker)
// En el cliente (navegador), usar NEXT_PUBLIC_API_BASE_URL (http://localhost:8080)
const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://backend:8080")
  : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080")

const sanitizedBaseUrl = API_BASE_URL.replace(/\/$/, "")

export { sanitizedBaseUrl }
