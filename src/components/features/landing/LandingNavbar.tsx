"use client"

import * as React from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { authClient } from "@/lib/utils/auth/auth-client"
import { useRouter } from "next/navigation"

export function LandingNavbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { data: session } = authClient.useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/sign-in")
          router.refresh()
        }
      }
    })
  }

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Harga", href: "/#pricing" },
    ...(session 
      ? [{ name: "Logout", href: "#", onClick: handleSignOut }] 
      : [{ name: "Masuk", href: "/sign-in" }]
    ),
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/80 backdrop-blur-lg border-b border-border/40 py-4 shadow-sm" 
          : "bg-transparent py-8"
      }`}
    >
      <nav className="container mx-auto px-6 lg:px-10 xl:px-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center">
            <Image src="/logos/chatly-text.svg" draggable={false} alt="Chatly Logo" width={200} className="h-auto w-32" height={100} />
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-8 text-[14px] font-medium">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  } else if (link.href.startsWith("/#")) {
                    const id = link.href.replace("/#", "");
                    const element = document.getElementById(id);
                    if (element) {
                      e.preventDefault();
                      element.scrollIntoView({ behavior: "smooth" });
                      window.history.pushState(null, "", link.href);
                    }
                  }
                }}
                className="text-outline hover:text-on-surface transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary-fixed transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
          
          <Button 
            asChild
            className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold text-[13px] h-10 px-6 rounded-md shadow-md transition-all active:scale-95 border border-secondary-fixed-dim"
          >
            <Link href={session ? "/dashboard" : "/sign-up"}>
              {session ? "Ke Dashboard" : "Mulai Sekarang"}
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-on-surface">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-border/20 bg-background/85 backdrop-blur-xl px-4">
              <SheetHeader className="text-left pb-6 border-b border-border/10">
                <SheetTitle className="text-xl font-headline font-bold">Chatly AI</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    onClick={(e) => {
                      if (link.onClick) {
                        e.preventDefault();
                        link.onClick();
                      } else if (link.href.startsWith("/#")) {
                        const id = link.href.replace("/#", "");
                        const element = document.getElementById(id);
                        if (element) {
                          e.preventDefault();
                          element.scrollIntoView({ behavior: "smooth" });
                          window.history.pushState(null, "", link.href);
                        }
                      }
                    }}
                    className="text-lg font-medium text-outline hover:text-on-surface transition-colors px-2 py-1"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-border/10" />
                  <Button 
                    asChild
                    className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold text-[15px] h-12 rounded-xl shadow-lg border border-secondary-fixed-dim mt-4"
                  >
                    <Link href={session ? "/dashboard" : "/sign-up"}>
                      {session ? "Ke Dashboard" : "Mulai Sekarang"}
                    </Link>
                  </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
