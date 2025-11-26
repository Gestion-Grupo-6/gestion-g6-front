"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import type { ReportCategory } from "@/types/report"
import { REPORT_CATEGORIES } from "@/types/report"

type ReportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentId: string
  reporterId: string
  onReportSubmitted: () => void
}

export function ReportDialog({ open, onOpenChange, commentId, reporterId, onReportSubmitted }: ReportDialogProps) {
  const [category, setCategory] = useState<ReportCategory | null>(null)
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!category) {
      return
    }

    try {
      setSubmitting(true)
      const { createReport } = await import("@/api/report")
      await createReport({
        reporterId,
        commentId,
        category,
        description: description.trim() || null,
      })
      
      // Reset form
      setCategory(null)
      setDescription("")
      onOpenChange(false)
      onReportSubmitted()
      toast.success("Reporte enviado correctamente")
    } catch (error: any) {
      console.error("Error al reportar:", error)
      const errorMessage = error?.message || "No se pudo crear el reporte. Intenta nuevamente."
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setCategory(null)
      setDescription("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-[60] w-full max-w-md bg-background rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Flag className="h-5 w-5 text-destructive" />
              Reportar comentario
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="p-1 rounded-md hover:bg-muted"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Motivo del reporte *
              </Label>
              <div className="space-y-2">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    disabled={submitting}
                    className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                      category === cat.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description" className="text-sm font-medium text-foreground">
                Descripción (opcional)
              </Label>
              <Textarea
                id="report-description"
                placeholder="Proporciona más detalles sobre el problema..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={submitting}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!category || submitting}
                className="flex-1"
                variant="destructive"
              >
                {submitting ? "Enviando..." : "Reportar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

