import { Button } from "@/components/ui/button"
import { BotMessageSquare } from "lucide-react"

export function CtaSection() {
  return (
    <section className="container mx-auto px-10 xl:px-16 mt-32 lg:mt-40 mb-24">
      <div className="bg-[#3545d6] rounded-sm w-full p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_0_40px_rgba(53,69,214,0.2)] overflow-hidden relative">
        <div className="flex flex-col w-full md:w-[50%] z-10 relative">
          <h2 className="text-4xl lg:text-5xl font-headline font-bold text-white leading-tight mb-6 tracking-tight">
            Ready to automate <br /> your excellence?
          </h2>
          <p className="text-[15px] text-[#c8ccff] leading-relaxed max-w-sm mb-8">
            Join 2,000+ businesses using Chatly AI to deliver premium customer experiences around the clock.
          </p>
          <Button className="bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold text-[13px] h-12 px-8 w-fit rounded-sm shadow-md transition-transform active:scale-95 border border-[#a4d730]">
            Create Account Free
          </Button>
        </div>

        <div className="w-full md:w-[45%] flex justify-end z-10">
          <div className="bg-surface-container-low border border-outline-variant/15 p-6 rounded-md shadow-2xl flex flex-col gap-5 w-full max-w-[400px] border-l-4 border-l-secondary-fixed rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
            <div className="flex items-start gap-4">
              <div className="w-[36px] h-[36px] rounded bg-secondary-fixed flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(164,215,48,0.3)]">
                <BotMessageSquare className="w-5 h-5 text-[#141f00]" />
              </div>
              <p className="text-[13px] text-outline leading-relaxed bg-[#08111d] p-3.5 rounded-md border border-outline-variant/10">
                Hello! I&apos;ve analyzed your sales funnel. Ready to optimize your response time by 40%?
              </p>
            </div>
            <div className="flex justify-end pt-1">
              <Button className="bg-[#c8ccff] text-[#000865] hover:bg-white font-bold text-[12px] h-9 px-5 rounded-sm shadow-sm transition-transform active:scale-95">
                Launch Optimization
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative background vectors */}
        <div className="absolute right-0 top-0 opacity-10 text-white translate-x-1/4 -translate-y-1/4 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
