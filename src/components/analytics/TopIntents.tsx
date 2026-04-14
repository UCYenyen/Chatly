export function TopIntents() {
  const items = [
    { label: "Product Inquiries", pct: "64%", val: 64 },
    { label: "Pricing & Plans", pct: "22%", val: 22 },
    { label: "Technical Support", pct: "14%", val: 14 }
  ]

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col justify-center h-full shadow-2xl min-h-[220px]">
      <h2 className="text-[16px] font-headline font-bold text-on-surface mb-8">Top Intents Today</h2>
      
      <div className="flex flex-col gap-6">
        {items.map(item => (
          <div key={item.label} className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[13px] font-bold">
              <span className="text-on-surface font-inter">{item.label}</span>
              <span className="text-secondary-fixed font-mono">{item.pct}</span>
            </div>
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary-fixed rounded-full shadow-[0_0_10px_rgba(164,215,48,0.5)]" 
                style={{ width: `${item.val}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
