import { sanitizedBaseUrl } from "./config"
import type { CreateReportRequest, ReportResponse } from "@/types/report"

/**
 * Crea un nuevo reporte de comentario
 */
export async function createReport(payload: CreateReportRequest): Promise<ReportResponse> {
  const res = await fetch(`${sanitizedBaseUrl}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`No se pudo crear el reporte: ${res.status} ${res.statusText}. ${errorText}`)
  }
  return (await res.json()) as ReportResponse
}

/**
 * Obtiene todos los reportes de un comentario específico
 */
export async function getReportsByComment(commentId: string): Promise<ReportResponse[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/reports/comment/${commentId}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Error al obtener reportes: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as ReportResponse[]
}

/**
 * Obtiene todos los reportes realizados por un usuario
 */
export async function getReportsByReporter(reporterId: string): Promise<ReportResponse[]> {
  const res = await fetch(`${sanitizedBaseUrl}/api/reports/reporter/${reporterId}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`Error al obtener reportes del usuario: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as ReportResponse[]
}

