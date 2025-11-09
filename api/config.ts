const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:8080"

const sanitizedBaseUrl = API_BASE_URL.replace(/\/$/, "")

export { sanitizedBaseUrl }
