const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "https://gestion-g6-back-971976303053.us-east4.run.app"

const sanitizedBaseUrl = API_BASE_URL.replace(/\/$/, "")

export { sanitizedBaseUrl }
