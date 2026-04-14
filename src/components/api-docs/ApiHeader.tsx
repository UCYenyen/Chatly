import { Button } from "@/components/ui/button"

export function ApiHeader() {
  return (
    <header className="flex items-center justify-between pb-8 border-b border-outline-variant/10 w-full shrink-0">
      <div className="flex items-center gap-2 text-[13px] text-outline font-medium tracking-wider">
        <span className="uppercase">Documentation</span>
        <span>/</span>
        <span className="text-on-surface font-bold">V2.4 Stable</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[13px] text-outline font-mono">v2.4.0-rc1</span>
        <Button className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary hover:text-on-secondary font-bold text-[11px] h-9 px-5 tracking-widest rounded-sm uppercase">
          Get API Key
        </Button>
      </div>
    </header>
  )
}
