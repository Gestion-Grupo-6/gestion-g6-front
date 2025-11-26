import { sanitizedBaseUrl } from "./config"

export type Visit = {
  userId: string
  postId: string
  timeStamp: string
}

export type VisitsResponse = {
  numberOfVisits: number
  visits: Visit[]
}

export async function fetchVisits(params: { userId?: string; postId?: string }): Promise<VisitsResponse> {
  if (!params.userId && !params.postId) {
    throw new Error("Debes indicar al menos userId o postId")
  }

  const url = new URL(`${sanitizedBaseUrl}/metrics/visits`)
  if (params.userId) url.searchParams.set("userId", params.userId)
  if (params.postId) url.searchParams.set("postId", params.postId)

  const res = await fetch(url.toString(), { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Error al consultar métricas: ${res.status} ${res.statusText} ${text}`)
  }

  return (await res.json()) as VisitsResponse
}

export type RecordVisitParams = { postId: string; userId?: string }
const _recordedVisits = new Set<string>()

export async function recordVisit(params: RecordVisitParams): Promise<void> {
  if (!params.postId) {
    throw new Error("postId is required to record a visit")
  }
  const url = `${sanitizedBaseUrl}/metrics/visit`

  const key = `${params.postId}:${params.userId ?? "anon"}`
  if (_recordedVisits.has(key)) return

  const body: any = { postId: String(params.postId) }
  if (params.userId) body.userId = params.userId

  try {
    _recordedVisits.add(key)
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      _recordedVisits.delete(key)
      throw new Error(`Error recording visit: ${res.status} ${res.statusText} ${text}`)
    }
  } catch (err) {
    _recordedVisits.delete(key)
    throw err
  }
}

