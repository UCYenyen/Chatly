import Link from "next/link"

export function TrainingFooter() {
  const links = ["Privacy", "Terms", "Security", "Status"]
  
  return (
    <footer className="flex items-center justify-between py-6 border-t border-outline-variant/10 w-full shrink-0">
      <span className="text-[11px] text-outline font-mono uppercase tracking-widest font-medium">
        © 2024 Chatly AI. Kinetic Archive Edition.
      </span>
      <div className="flex items-center gap-8">
        {links.map(link => (
          <Link key={link} href={`/${link.toLowerCase()}`} className="text-[11px] text-outline hover:text-on-surface font-mono uppercase tracking-widest transition-colors">
            {link}
          </Link>
        ))}
      </div>
    </footer>
  )
}
