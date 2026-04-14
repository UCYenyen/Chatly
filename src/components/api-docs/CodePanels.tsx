import { Copy } from "lucide-react"
import Image from "next/image"

export function CodePanels() {
  return (
    <>
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-md overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant/10">
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-error"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-secondary-fixed"></div>
          </div>
          <span className="text-[10px] font-mono text-outline uppercase tracking-widest">widget-embed.html</span>
          <Copy className="w-3.5 h-3.5 text-outline cursor-pointer hover:text-on-surface transition-colors" />
        </div>
        <div className="p-6 font-mono text-[13px] leading-[1.8] overflow-x-auto text-outline">
          <pre>
<span className="text-outline-variant">{"<!-- Tempel ini sebelum </body> -->"}</span>{"\n"}
<span className="text-inverse-primary">{"<script"}</span>{"\n"}
  <span className="text-secondary-fixed">{"src="}</span><span className="text-primary-fixed">{"\"https://chatly.ai/widget.js\""}</span>{"\n"}
  <span className="text-secondary-fixed">{"data-id="}</span><span className="text-primary-fixed">{"\"YOUR_CHATLY_ID\""}</span>{"\n"}
  <span className="text-secondary-fixed">{"async"}</span>{"\n"}
<span className="text-inverse-primary">{"></script>"}</span>
          </pre>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-6">
        <span className="text-[11px] font-mono text-outline uppercase tracking-widest pl-4">Pratinjau Respons</span>
        <div className="bg-surface-container-low border-y border-r border-l-4 border-l-secondary-fixed border-y-outline-variant/10 border-r-outline-variant/10 p-6 rounded-r-md">
          <pre className="font-mono text-[13px] leading-[2]">
<span className="text-secondary-fixed">{"{"}</span>{"\n"}
  <span className="text-primary-fixed">{"\"status\""}</span><span className="text-on-surface">{": "}</span><span className="text-primary-fixed">{"\"active\""}</span><span className="text-on-surface">{","}</span>{"\n"}
  <span className="text-primary-fixed">{"\"latency\""}</span><span className="text-on-surface">{": "}</span><span className="text-secondary-fixed">{"14ms"}</span><span className="text-on-surface">{","}</span>{"\n"}
  <span className="text-primary-fixed">{"\"stream_url\""}</span><span className="text-on-surface">{": "}</span><span className="text-primary-fixed">{"\"wss://node.chatly.ai/stream\""}</span><span className="text-on-surface">{","}</span>{"\n"}
  <span className="text-primary-fixed">{"\"credits_remaining\""}</span><span className="text-on-surface">{": "}</span><span className="text-on-surface">{"14820"}</span>{"\n"}
<span className="text-secondary-fixed">{"}"}</span>
          </pre>
        </div>
      </div>

      <div className="relative rounded overflow-hidden h-40 bg-surface-container-low group mt-6 border border-outline-variant/5">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-surface-container-low/60 to-transparent z-10"></div>
        <div className="absolute bottom-4 left-6 z-20">
          <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Inti Neural Aktif</span>
        </div>
        <Image 
          src="/neural_core.png" 
          alt="Neural Core" 
          fill 
          className="object-cover opacity-60 mix-blend-screen scale-[1.03] group-hover:scale-110 transition-transform duration-1000" 
        />
      </div>
    </>
  )
}
