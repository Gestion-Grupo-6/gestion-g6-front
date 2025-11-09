"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  defaultValue?: string
  placeholder?: string
}

export function SearchBar({ defaultValue, placeholder }: SearchBarProps) {
  return (
    <form action="" method="get" className="mb-6 flex items-center justify-center gap-3">
      <Input
        name="q"
        placeholder={placeholder ?? "Buscar por nombre..."}
        defaultValue={defaultValue || ""}
        className="w-full max-w-2xl"
      />
      <Button type="submit" className="shrink-0">Buscar</Button>
    </form>
  )
}
