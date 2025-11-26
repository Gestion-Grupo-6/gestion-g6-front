"use client"

import { Bell } from "lucide-react"
import { useNotifications } from "@/contexts/NotificationContext"
import { Badge } from "@/components/ui/badge"
import { HeaderIcon } from "./header-icon"
import { useState } from "react"
import { NotificationsPanel } from "./notifications-panel"

type NotificationBadgeProps = {
  mobile?: boolean
}

export function NotificationBadge({ mobile = false }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications()
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <>
      <div className="relative">
        <HeaderIcon
          icon={Bell}
          mobile={mobile}
          label="Notificaciones"
          onClick={() => setPanelOpen(true)}
        />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </div>
      <NotificationsPanel open={panelOpen} onOpenChange={setPanelOpen} />
    </>
  )
}

