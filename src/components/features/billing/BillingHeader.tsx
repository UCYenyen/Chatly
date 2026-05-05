export function BillingHeader() {
  return (
    <header className="flex flex-col gap-2 pb-6 border-b border-outline-variant/10 w-full shrink-0">
      <div className="flex items-center gap-2 text-[12px] text-outline font-medium tracking-wide">
        <span>Utama</span>
        <span>›</span>
        <span className="text-on-surface font-bold">Billing</span>
      </div>
      <h1 className="text-[32px] md:text-[36px] font-headline font-bold text-on-surface tracking-tight">
        Billing & Langganan
      </h1>
    </header>
  )
}
