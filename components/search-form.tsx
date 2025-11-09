"use client"

import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchFormProps {
  defaultQuery?: string
  defaultCategory?: string
}

export function SearchForm({ defaultQuery, defaultCategory }: SearchFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action="" method="get" className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Input
        name="q"
        placeholder="Buscar hoteles, restaurantes o actividades..."
        defaultValue={defaultQuery || ""}
        className="w-full max-w-2xl"
      />
      <select
        name="c"
        defaultValue={defaultCategory || ""}
        className="border border-input bg-background px-3 py-2 rounded-md text-sm"
        onChange={() => formRef.current?.submit()}
      >
        <option value="">Todas</option>
        <option value="hoteles">Hoteles</option>
        <option value="restaurantes">Restaurantes</option>
        <option value="actividades">Actividades</option>
      </select>
      <Button type="submit" className="shrink-0">Buscar</Button>
    </form>
  )
}
