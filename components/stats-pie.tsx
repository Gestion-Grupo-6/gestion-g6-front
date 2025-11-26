"use client"

import React from "react"

type Props = {
  today: number
  total: number
}

export default function StatsPie({ today, total }: Props) {
  const rest = Math.max(0, total - today)
  const percent = total > 0 ? Math.round((today / total) * 100) : 0
  // Donut visualization
  const size = 140
  const stroke = 18
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const todayPortion = total > 0 ? (today / total) * circumference : 0

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="text-sm text-muted-foreground">Cantidad de visitas:  <span className="font-medium text-foreground">{total}</span></div>

      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`${percent}% de las visitas fueron hoy (${today} de ${total})`}
        >
          <g transform={`translate(${size / 2}, ${size / 2})`}>
            <circle
              r={radius}
              fill="transparent"
              stroke="rgba(2,6,23,0.06)"
              strokeWidth={stroke}
              strokeLinecap="round"
            />

            <circle
              r={radius}
              fill="transparent"
              stroke="#7c3aed"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${todayPortion} ${circumference - todayPortion}`}
              strokeDashoffset={-circumference / 4}
              transform={`rotate(-90)`}
            />
          </g>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Hoy</div>
            <div className="text-2xl font-semibold">{percent}%</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "#7c3aed" }} />
          <div className="text-sm">Hoy: <span className="font-medium">{today}</span></div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm" style={{ background: "rgba(2,6,23,0.06)" }} />
          <div className="text-sm">Otros días: <span className="font-medium">{rest}</span></div>
        </div>
      </div>

      <span className="sr-only">{percent}% de las visitas fueron hoy ({today} de {total})</span>
    </div>
  )
}
