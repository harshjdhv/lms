"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const TOASTER_STYLE = {
  "--normal-bg": "var(--popover)",
  "--normal-text": "var(--popover-foreground)",
  "--normal-border": "var(--border)",
  "--border-radius": "var(--radius)",
} as React.CSSProperties

const Toaster = React.memo(function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme()
  const theme = (resolvedTheme ?? "system") as ToasterProps["theme"]

  const icons = React.useMemo(
    () => ({
      success: <CircleCheckIcon className="size-4" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }),
    [],
  )

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={icons}
      style={TOASTER_STYLE}
      {...props}
    />
  )
})

export { Toaster }
