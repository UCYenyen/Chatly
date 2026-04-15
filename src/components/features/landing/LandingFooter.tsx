"use client"

import Link from "next/link"
import { useRef } from "react"
import { useGsapScrollReveal } from "@/hooks/use-gsap-scroll-reveal"

export function LandingFooter() {
  const links = ["Privasi", "Ketentuan", "Keamanan", "Status"]
  const footerRef = useRef<HTMLElement | null>(null)

  useGsapScrollReveal(footerRef, {
    start: "top 95%",
    y: 24,
    duration: 0.7,
  })
  
  return (
    <footer ref={footerRef} className="container mx-auto px-10 xl:px-16 flex flex-col sm:flex-row gap-4 items-center justify-between py-8 border-t border-outline-variant/10">
      <span className="text-[9px] text-outline font-mono uppercase tracking-widest font-bold">
        © 2024 Chatly AI. Edisi Arsip Kinetik.
      </span>
      <div className="flex items-center gap-8">
        {links.map(link => (
          <Link key={link} href={`/${link.toLowerCase()}`} className="text-[9px] text-outline hover:text-on-surface font-mono uppercase tracking-widest transition-colors font-bold">
            {link}
          </Link>
        ))}
      </div>
    </footer>
  )
}
