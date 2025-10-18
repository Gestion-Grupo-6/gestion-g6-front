"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function MilongiaButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-4 py-2 bg-emerald-700 text-white text-sm rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200">
          ¡Hola, soy MilongIA!
          <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-emerald-700" />
        </div>
      )}

      <Link href="/milongia" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        <Button
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl rounded-2xl p-0 w-14 h-14 md:w-16 md:h-16 overflow-hidden transition-all hover:scale-105"
        >
          <Image
            src="/milongia-logo.png"
            alt="MilongIA"
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </Button>
      </Link>
    </div>
  )
}
