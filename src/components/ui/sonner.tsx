"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--surface-container)",
          "--normal-text": "var(--on-surface)",
          "--normal-border": "var(--outline-variant)",
          "--border-radius": "var(--radius)",
          
          /* Theme-aligned rich colors */
          "--success-bg": "var(--secondary)",
          "--success-text": "var(--on-secondary)",
          "--success-border": "var(--secondary)",
          
          "--error-bg": "var(--error)",
          "--error-text": "var(--on-error)",
          "--error-border": "var(--error)",
          
          "--info-bg": "var(--primary)",
          "--info-text": "var(--on-primary)",
          "--info-border": "var(--primary)",
          
          "--warning-bg": "var(--secondary-container)",
          "--warning-text": "var(--on-secondary-container)",
          "--warning-border": "var(--secondary-container)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-surface-container group-[.toaster]:text-on-surface group-[.toaster]:border-outline-variant group-[.toaster]:shadow-2xl font-headline",
          description: "group-[.toast]:text-on-surface-variant font-body",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-on-primary",
          cancelButton: "group-[.toast]:bg-surface-variant group-[.toast]:text-on-surface-variant",
          success: "group-[.toaster]:bg-secondary group-[.toaster]:text-on-secondary group-[.toaster]:border-secondary",
          error: "group-[.toaster]:bg-error group-[.toaster]:text-on-error group-[.toaster]:border-error",
          info: "group-[.toaster]:bg-primary group-[.toaster]:text-on-primary group-[.toaster]:border-primary",
          warning: "group-[.toaster]:bg-secondary-container group-[.toaster]:text-on-secondary-container group-[.toaster]:border-secondary-container",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
