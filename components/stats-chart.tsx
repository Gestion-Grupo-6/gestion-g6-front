"use client"

import React, { useState, useRef } from "react"
import { parseTimestamp } from "@/lib/parse-timestamp"

type Visit = { userId?: string; postId?: string; timeStamp: any }

type Props = {
  visits: Visit[]
  range: string // "7" | "30" | "90" | "all"
}

function getDaysArray(days: number) {
  const now = new Date()
  const arr: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    arr.push(`${y}-${m}-${day}`)
  }
  return arr
}

function getLastNMonths(n: number) {
  const now = new Date()
  const arr: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    arr.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  return arr
}

function aggregateByDay(visits: Visit[], days: number) {
  const keys = getDaysArray(days)
  const counts = Object.fromEntries(keys.map((k) => [k, 0])) as Record<string, number>
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  visits.forEach((v) => {
    const t = parseTimestamp(v.timeStamp)
    if (isNaN(t) || t < since) return
    const d = new Date(t)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    counts[key] = (counts[key] ?? 0) + 1
  })
  return { keys, counts }
}

function aggregateByMonth(visits: Visit[], months: number) {
  const keys = getLastNMonths(months)
  const counts = Object.fromEntries(keys.map((k) => [k, 0])) as Record<string, number>
  visits.forEach((v) => {
    const t = parseTimestamp(v.timeStamp)
    if (isNaN(t)) return
    const d = new Date(t)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (key in counts) counts[key]++
  })
  return { keys, counts }
}

export default function StatsChart({ visits, range }: Props) {
  const [openModal, setOpenModal] = useState(false)
  const modalContainerRef = useRef<HTMLDivElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  if (!visits) return null

  // 7-day bar chart
  if (range === "7") {
    const { keys, counts } = aggregateByDay(visits, 7)
    const values = keys.map((k) => counts[k])
    const total = values.reduce((s, v) => s + v, 0)
    if (total <= 1) return null
    const max = Math.max(...values, 1)
    return (
      <div className="mt-3">
        <svg width="100%" height={80} viewBox={`0 0 ${keys.length * 40} 80`} preserveAspectRatio="none">
          {values.map((v, i) => {
            const barHeight = (v / max) * 60
            const x = i * 40 + 10
            const y = 70 - barHeight
            return (
              <g key={i}>
                <rect x={x} y={y} width={20} height={barHeight} fill="#60a5fa" rx={3}>
                  <title>{`${keys[i]}: ${v} visitas`}</title>
                </rect>
                <text x={x + 10} y={78} fontSize={10} textAnchor="middle" fill="#374151">{keys[i].slice(5)}</text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // 30-day chart
  if (range === "30") {
    const { keys, counts } = aggregateByDay(visits, 30)
    const values = keys.map((k) => counts[k])
    const total = values.reduce((s, v) => s + v, 0)
    if (total <= 1) return null
    const max = Math.max(...values, 1)

    const sw = Math.max(120, keys.length * 6)
    const sh = 36
    const padding = 4
    const pts = values.map((v, i) => {
      const x = padding + (i / Math.max(1, keys.length - 1)) * (sw - padding * 2)
      const y = padding + (1 - v / max) * (sh - padding * 2)
      return `${x},${y}`
    })
    const points = pts.join(" ")

    return (
      <div className="mt-3">
        <div className="flex items-center gap-3">
          <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} className="block">
            <polyline fill="none" stroke="#4f46e5" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
            {values.map((v, i) => {
              const [x, y] = pts[i].split(",").map(Number)
              return (
                <circle key={i} cx={x} cy={y} r={2} fill="#4f46e5">
                  <title>{`${keys[i]}: ${v} visitas`}</title>
                </circle>
              )
            })}
          </svg>
        </div>

        <div className="mt-2">
          <button type="button" onClick={() => setOpenModal(true)} className="text-sm text-primary underline">Ver gráfico</button>
        </div>

        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpenModal(false)} />
            <div ref={modalContainerRef} className="relative bg-white rounded-md p-3 max-w-4xl w-[95%] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Visitas - Últimos 30 días</h3>
                <button className="text-sm text-muted-foreground" onClick={() => setOpenModal(false)}>Cerrar</button>
              </div>

              <div className="overflow-auto">
                {/* Full bar chart inside modal */}
                {(() => {
                  // Make the enlarged sparkline occupy the full modal width and increase height
                  const sw = Math.max(900, keys.length * 24)
                  const sh = 220
                  const padding = 10
                  const ptsLarge = values.map((v, i) => {
                    const x = padding + (i / Math.max(1, keys.length - 1)) * (sw - padding * 2)
                    const y = padding + (1 - v / max) * (sh - padding * 2)
                    return `${x},${y}`
                  })
                  const pointsLarge = ptsLarge.join(" ")

                  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
                    const container = modalContainerRef.current
                    const svg = svgRef.current
                    if (!container || !svg) return
                    const rect = svg.getBoundingClientRect()
                    const relClientX = e.clientX - rect.left
                    // map client X to viewBox coordinate (sw)
                    const viewBoxWidth = sw
                    const svgX = (relClientX / rect.width) * viewBoxWidth

                    // find nearest point in ptsLarge by x coordinate
                    let nearest = 0
                    let bestDist = Infinity
                    for (let i = 0; i < ptsLarge.length; i++) {
                      const px = Number(ptsLarge[i].split(",")[0])
                      const d = Math.abs(px - svgX)
                      if (d < bestDist) {
                        bestDist = d
                        nearest = i
                      }
                    }

                    const date = keys[nearest]
                    const value = values[nearest]

                  }

                  function handleMouseLeave() {
         
                  }

                  return (
                    <div style={{ position: "relative" }}>
                      <svg
                        ref={svgRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="block w-full"
                        height={sh}
                        viewBox={`0 0 ${sw} ${sh + 28}`}
                        preserveAspectRatio="xMinYMin meet"
                      >
                        <polyline fill="none" stroke="#4f46e5" strokeWidth={3} points={pointsLarge} strokeLinecap="round" strokeLinejoin="round" />
                        {values.map((v, i) => {
                          const [x, y] = ptsLarge[i].split(",").map(Number)
                          return (
                            <circle key={i} cx={x} cy={y} r={3} fill="#4f46e5">
                              <title>{`${keys[i]}: ${v} visitas`}</title>
                            </circle>
                          )
                        })}

                        {/* X-axis labels: show every day label with slightly larger font */}
                        {keys.map((k, i) => {
                          const [x] = ptsLarge[i].split(",").map(Number)
                          return (
                            <text key={i} x={x} y={sh + 14} fontSize={10} textAnchor="middle" fill="#374151">{k.slice(8)}</text>
                          )
                        })}
                      </svg>

                      {/* no tooltip box (removed per user request) */}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 90-day (3 months) monthly bars
  if (range === "90") {
    const { keys, counts } = aggregateByMonth(visits, 3)
    const values = keys.map((k) => counts[k])
    const total = values.reduce((s, v) => s + v, 0)
    if (total <= 1) return null
    const max = Math.max(...values, 1)
    return (
      <div className="mt-3">
        <svg width="100%" height={100} viewBox={`0 0 ${keys.length * 80} 100`} preserveAspectRatio="none">
          {values.map((v, i) => {
            const barH = (v / max) * 60
            const x = i * 80 + 10
            const y = 80 - barH
            return (
              <g key={i}>
                <rect x={x} y={y} width={40} height={barH} fill="#10b981" rx={4}>
                  <title>{`${keys[i]}: ${v} visitas`}</title>
                </rect>
                <text x={x + 20} y={95} fontSize={12} textAnchor="middle" fill="#374151">{keys[i].slice(0, 7)}</text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  // last 3 months (monthly)
  const { keys, counts } = aggregateByMonth(visits, 3)
  const values = keys.map((k) => counts[k])
  const total = values.reduce((s, v) => s + v, 0)
  if (total <= 1) return null
  const max = Math.max(...values, 1)
  return (
    <div className="mt-3">
      <svg width="100%" height={100} viewBox={`0 0 ${keys.length * 80} 100`} preserveAspectRatio="none">
        {values.map((v, i) => {
          const barH = (v / max) * 60
          const x = i * 80 + 10
          const y = 80 - barH
          return <rect key={i} x={x} y={y} width={40} height={barH} fill="#60a5fa" rx={4} />
        })}
      </svg>
    </div>
  )
}

