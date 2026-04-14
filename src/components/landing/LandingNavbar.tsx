import Link from "next/link"
import { Button } from "@/components/ui/button"

export function LandingNavbar() {
  return (
    <nav className="flex items-center justify-between w-full py-8 px-10 xl:px-16 container mx-auto">
      <div className="flex items-center gap-2">
        <span className="text-xl font-headline font-bold text-on-surface tracking-wide">Chatly AI</span>
      </div>
      
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-8 text-[13px] font-medium text-outline">
          <Link href="#product" className="text-primary hover:text-primary-fixed border-b border-primary pb-0.5 transition-colors">Product</Link>
          <Link href="#pricing" className="hover:text-on-surface transition-colors">Pricing</Link>
          <Link href="/login" className="hover:text-on-surface transition-colors">Login</Link>
        </div>
        
        <Button className="bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[12px] h-9 px-6 rounded-sm shadow-md transition-transform active:scale-95 border border-[#a4d730]">
          Get Started
        </Button>
      </div>
    </nav>
  )
}
