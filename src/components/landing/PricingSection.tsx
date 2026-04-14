import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingSection() {
  const plans = [
    {
      name: "STARTER",
      price: "Rp 149k",
      description: "Individuals & Small Projects",
      features: ["300 sessions", "3,000 messages", "Basic Analytics"],
      buttonText: "Get Started",
      isPopular: false
    },
    {
      name: "GROWTH",
      price: "Rp 349k",
      description: "Scaling Teams",
      features: ["1,000 sessions", "10,000 messages", "Custom Knowledge Base"],
      buttonText: "Scale Now",
      isPopular: true
    },
    {
      name: "PRO",
      price: "Rp 749k",
      description: "High-Volume Enterprises",
      features: ["3,000 sessions", "30,000 messages", "API Access"],
      buttonText: "Go Pro",
      isPopular: false
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      description: "Global Scale",
      features: ["Unlimited sessions", "Custom LLM Training", "Dedicated Support"],
      buttonText: "Contact Sales",
      isPopular: false
    }
  ]

  return (
    <section className="container mx-auto px-10 xl:px-16 mt-32 lg:mt-40 flex flex-col items-center">
      <div className="text-center mb-16 flex flex-col items-center">
        <h2 className="text-3xl font-headline font-bold text-on-surface mb-4">Select Your Plan</h2>
        <p className="text-[14px] text-outline max-w-lg leading-relaxed">
          Scalable solutions for businesses of all sizes. No hidden fees, just pure kinetic performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {plans.map((plan) => (
          <div 
            key={plan.name} 
            className={`bg-surface-container-low border flex flex-col p-8 rounded-sm shadow-xl relative ${
              plan.isPopular ? 'border-outline-variant/30 scale-[1.02] bg-surface-container-low/90 z-10' : 'border-outline-variant/15'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#bff44c] text-[#141f00] text-[9px] font-bold font-mono tracking-widest uppercase px-3 py-1 rounded shadow-md border border-[#a4d730]">
                Most Popular
              </div>
            )}
            
            <div className="mb-8">
              <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold block mb-4">
                {plan.name}
              </span>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-headline font-bold text-on-surface leading-none">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-[12px] text-outline">/mo</span>}
              </div>
              <span className="text-[11px] font-bold font-mono text-[#a4d730] block">
                {plan.description}
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-10 flex-1">
              {plan.features.map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed fill-[#3545d6]" />
                  <span className="text-[13px] text-outline">{feat}</span>
                </div>
              ))}
            </div>

            <Button 
              className={`w-full font-bold text-[12px] h-11 transition-transform active:scale-95 border rounded-sm mt-auto shadow-sm ${
                plan.isPopular 
                  ? 'bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] border-[#a4d730]' 
                  : 'bg-transparent text-outline hover:text-on-surface hover:bg-surface-container border-outline-variant/20 tracking-wide'
              }`}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </section>
  )
}
