import Link from "next/link";
import { Home } from "lucide-react";
import { BrainCircuit } from "lucide-react";

export function TrainingHeader() {
  return (
    <div className="flex flex-col gap-6 w-full border-b border-outline-variant/10 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4 sm:gap-0">
        <div className="flex items-center gap-2 text-[12px] font-mono text-outline uppercase tracking-widest font-bold">
          <Link href="/dashboard" className="hover:text-secondary-fixed transition-colors flex items-center gap-1.5">
            <Home className="w-3 h-3" /> Utama
          </Link>
          <span>/</span>
          <span className="text-on-surface flex items-center gap-1.5">
            <BrainCircuit className="w-3 h-3" /> Pelatihan
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold tracking-tight text-on-surface">
          Latih Kecerdasan Anda
        </h1>
        <p className="text-sm text-outline leading-relaxed max-w-2xl">
          Sempurnakan cara AI Anda berinteraksi dengan pelanggan di Acme Corp.
          Unggah dokumen, atur batasan perilaku, dan tentukan dokumen pelatihan
          inti.
        </p>
      </div>
    </div>
  );
}
