export type ReportCategory = 
  | "SPAM"
  | "OFFENSIVE_LANGUAGE"
  | "FALSE_INFORMATION"
  | "INAPPROPRIATE_CONTENT"
  | "HARASSMENT"
  | "OTHER"

export type ReportStatus = "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED"

export type Report = {
  id: string
  reporterId: string
  commentId: string
  category: ReportCategory
  description?: string | null
  timestamp: string
  status: ReportStatus
}

export type CreateReportRequest = {
  reporterId: string
  commentId: string
  category: ReportCategory
  description?: string | null
}

export type ReportResponse = {
  id: string
  reporterId: string
  commentId: string
  category: ReportCategory
  description?: string | null
  timestamp: string
  status: ReportStatus
}

export const REPORT_CATEGORIES: Array<{ value: ReportCategory; label: string }> = [
  { value: "SPAM", label: "Spam" },
  { value: "OFFENSIVE_LANGUAGE", label: "Lenguaje ofensivo" },
  { value: "FALSE_INFORMATION", label: "Información falsa" },
  { value: "INAPPROPRIATE_CONTENT", label: "Contenido inapropiado" },
  { value: "HARASSMENT", label: "Acoso" },
  { value: "OTHER", label: "Otro" },
]

