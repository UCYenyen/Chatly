"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { BookOpen, UploadCloud, FileText, X, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useUpdateBusiness } from "@/hooks/use-update-business";
import { toast } from "sonner";

export function KnowledgeBase() {
    const { activeBusiness, refresh } = useBusinessContext();
    const { updateBusiness, isPending } = useUpdateBusiness(activeBusiness?.id ?? null);

    const [knowledge, setKnowledge] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeBusiness) {
            setKnowledge(activeBusiness.knowledgeBase || "");
        }
    }, [activeBusiness]);

    const charCount = useMemo(() => {
        return knowledge.length;
    }, [knowledge]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const validFiles = selectedFiles.filter(file => 
            file.type === "application/pdf" || file.type.startsWith("image/")
        );

        if (validFiles.length < selectedFiles.length) {
            toast.error("Hanya file PDF dan Gambar yang diizinkan");
        }

        setFiles(prev => [...prev, ...validFiles]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!activeBusiness) return;

        // The user requested the function accepts files as parameters but does not add functionality yet.
        const saveWithFiles = async (text: string, newFiles: File[]) => {
            const existingFileNames = activeBusiness?.knowledgeFiles || [];
            const newFileNames = newFiles.map(f => f.name);
            // Combine existing and new (avoiding duplicates for simplicity)
            const allFiles = [...new Set([...existingFileNames, ...newFileNames])];
            
            return await updateBusiness({ 
                knowledgeBase: text,
                knowledgeFiles: allFiles 
            });
        };

        const updated = await saveWithFiles(knowledge, files);
        if (updated) {
            toast.success("Basis pengetahuan berhasil diperbarui");
            setFiles([]); // Clear local files after "sending" them
            await refresh();
        } else {
            toast.error("Gagal memperbarui basis pengetahuan");
        }
    };

    const removeExistingFile = async (fileName: string) => {
        if (!activeBusiness) return;
        const remainingFiles = (activeBusiness.knowledgeFiles || []).filter(f => f !== fileName);
        const updated = await updateBusiness({ knowledgeFiles: remainingFiles });
        if (updated) {
            toast.success("File berhasil dihapus");
            await refresh();
        }
    };

    return (
        <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl flex flex-col shadow-xl overflow-hidden">
            <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-secondary-fixed" fill="currentColor" fillOpacity={0.2} />
                        <h2 className="text-[17px] font-headline font-bold text-on-surface tracking-wide">Basis Pengetahuan & Data</h2>
                    </div>
                    <Button 
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-secondary-fixed text-on-secondary-fixed hover:bg-secondary-fixed/90 font-bold text-[12px] h-9 px-6 rounded-md shadow-md transition-all active:scale-95"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
                            Konteks Inti & Dokumentasi
                        </span>
                        <span className="text-[10px] font-mono text-outline/60 bg-surface-container-high px-2 py-0.5 rounded">
                            {charCount} Karakter
                        </span>
                    </div>
                    <textarea
                        value={knowledge}
                        onChange={(e) => setKnowledge(e.target.value)}
                        placeholder="Masukkan informasi detail tentang bisnis Anda di sini..."
                        className="w-full bg-[#08111d] border border-outline-variant/10 rounded-md p-6 text-[13px] text-on-surface placeholder:text-outline/40 resize-none h-[200px] focus:outline-none focus:border-secondary-fixed/50 custom-scrollbar leading-[1.8] shadow-inner transition-all"
                    />
                </div>
            </div>

            <div className="px-8 pb-8 flex flex-col gap-6">
                <div className="pt-6 border-t border-outline-variant/10">
                    <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold block mb-4">
                        Dokumen Pendukung (PDF/Gambar)
                    </span>
                    
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-outline-variant/20 rounded-lg p-8 flex flex-col items-center justify-center text-center gap-3 bg-surface-container/20 hover:bg-surface-container/40 transition-all cursor-pointer group"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            multiple 
                            accept="application/pdf,image/*"
                        />
                        <div className="bg-surface-container p-3 rounded-xl group-hover:scale-105 transition-transform shadow-md border border-outline-variant/5">
                            <UploadCloud className="w-5 h-5 text-secondary-fixed" />
                        </div>
                        <div>
                            <h3 className="font-bold text-on-surface text-[14px]">Unggah File Baru</h3>
                            <p className="text-[11px] text-outline mt-1">PDF atau Gambar (Maks. 10MB)</p>
                        </div>
                    </div>

                    {(activeBusiness?.knowledgeFiles || []).length > 0 && (
                        <div className="flex flex-col gap-2 mb-4">
                            <span className="text-[10px] font-mono text-secondary-fixed/70 uppercase tracking-widest font-bold mb-1">
                                File Tersimpan
                            </span>
                            {activeBusiness?.knowledgeFiles.map((fileName, idx) => (
                                <div key={`existing-${idx}`} className="bg-surface-container-high/40 flex items-center justify-between p-3 px-4 rounded-md border border-secondary-fixed/10 shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="w-4 h-4 text-secondary-fixed shrink-0" />
                                        <span className="text-[12px] font-medium text-on-surface truncate">{fileName}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeExistingFile(fileName); }}
                                        className="p-1 hover:bg-surface-container-high rounded-full text-outline hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {files.length > 0 && (
                        <div className="flex flex-col gap-2">
                             <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold mb-1">
                                File Baru (Belum Disimpan)
                            </span>
                            {files.map((file, idx) => (
                                <div key={`new-${idx}`} className="bg-[#08111d] flex items-center justify-between p-3 px-4 rounded-md border border-outline-variant/10 shadow-sm animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="w-4 h-4 text-secondary-fixed shrink-0" />
                                        <span className="text-[12px] font-medium text-outline truncate">{file.name}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="p-1 hover:bg-surface-container-high rounded-full text-outline hover:text-red-400 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
