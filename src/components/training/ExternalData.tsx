import { FilePlus, UploadCloud, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ExternalData() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col shadow-xl mt-8">
      <div className="flex items-center gap-3 mb-8">
        <FilePlus className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">External Data Sources</h2>
      </div>
      
      <div className="border border-dashed border-outline-variant/20 rounded-lg p-12 flex flex-col items-center justify-center text-center gap-4 bg-surface-container/20 mb-8 hover:bg-surface-container/40 transition-colors cursor-pointer group">
        <div className="bg-surface-container p-4 rounded-xl mb-2 group-hover:scale-105 transition-transform shadow-md border border-outline-variant/5">
          <UploadCloud className="w-6 h-6 text-on-surface" />
        </div>
        <h3 className="font-bold text-on-surface text-[15px]">Drag & Drop Training Files</h3>
        <p className="text-[13px] text-outline max-w-[260px] leading-relaxed mb-3">
          Upload PDFs, CSVs, or Image manuals. Our AI will OCR and index them automatically.
        </p>
        <Button className="bg-surface-container-high text-outline hover:text-on-surface hover:bg-surface-variant font-medium text-[12px] h-9 px-6 rounded-sm border border-outline-variant/20 shadow-sm transition-colors">
          Select Files
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-[#08111d] flex items-center justify-between p-4 px-5 rounded-md border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4">
            <FileText className="w-4 h-4 text-primary-fixed" />
            <span className="text-[13px] font-bold text-outline hover:text-on-surface cursor-pointer transition-colors">product_specs_v3.pdf</span>
          </div>
          <span className="text-[9px] font-mono text-[#a4d730] font-bold uppercase tracking-widest bg-secondary-fixed/5 px-2 py-1 rounded">Processed</span>
        </div>
        <div className="bg-[#08111d] flex items-center justify-between p-4 px-5 rounded-md border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-4">
            <FileText className="w-4 h-4 text-primary-fixed" />
            <span className="text-[13px] font-bold text-outline hover:text-on-surface cursor-pointer transition-colors">faq_sheet_internal.pdf</span>
          </div>
          <span className="text-[9px] font-mono text-[#a4d730] font-bold uppercase tracking-widest bg-secondary-fixed/5 px-2 py-1 rounded">Processed</span>
        </div>
      </div>
    </div>
  )
}
