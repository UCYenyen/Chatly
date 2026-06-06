import Link from "next/link"

export function BillingFooter() {
  return (
    <footer className="flex items-center justify-between py-6 border-t border-outline-variant/10 w-full shrink-0">
      <span className="text-[11px] text-outline font-mono uppercase tracking-widest font-medium">
        © {new Date().getFullYear()} Chatly Systems. All Rights Reserved.
      </span>
      <div className="flex items-center gap-8">
        <Link href="/syarat-dan-ketentuan" className="text-[11px] text-outline hover:text-on-surface font-mono uppercase tracking-widest transition-colors">
          Syarat dan Ketentuan
        </Link>
      </div>
    </footer>
  )
}
