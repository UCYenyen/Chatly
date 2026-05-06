"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Download, CheckCircle2, Trash2, Loader2, AlertTriangle, MessageSquare, Users } from "lucide-react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

interface BusinessIntent {
  id: string
  name: string
}

interface AnalyticsEvent {
  id: string
  phone: string
  createdAt: string
  intentCategory: string
  messageContent?: string | null
}

interface IntentStats {
  totalMessages: number
  totalConversations: number
}

export function IntentDashboard() {
  const params = useParams()
  const businessId = (params?.businessId || params?.id) as string

  const [mounted, setMounted] = useState(false)
  const [trackedIntents, setTrackedIntents] = useState<BusinessIntent[]>([])
  const [activeIntent, setActiveIntent] = useState<BusinessIntent | null>(null)
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [stats, setStats] = useState<IntentStats | null>(null)
  
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isEventsLoading, setIsEventsLoading] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  // Deletion state
  const [intentToDelete, setIntentToDelete] = useState<BusinessIntent | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchIntents = useCallback(async () => {
    if (!businessId) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/intents`)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || `Gagal mengambil data (Status ${res.status})`)
      }
      
      setTrackedIntents(data || [])
      if (data && data.length > 0 && !activeIntent) {
        setActiveIntent(data[0])
      }
    } catch (error) {
      console.error("[IntentDashboard] Fetch error:", error)
      toast.error(error instanceof Error ? error.message : "Gagal memuat daftar niat")
    } finally {
      setIsLoading(false)
    }
  }, [businessId, activeIntent])

  const fetchEvents = useCallback(async (intentId: string) => {
    setIsEventsLoading(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/intents/${intentId}/events`)
      const data = await res.json().catch(() => ({ events: [], stats: null }))
      
      if (!res.ok) {
        console.error("[IntentDashboard] Events fetch failed:", data)
        setEvents([])
        setStats(null)
      } else {
        setEvents(data.events || [])
        setStats(data.stats || null)
      }
    } catch (error) {
      console.error("[IntentDashboard] Events error:", error)
      setEvents([])
      setStats(null)
    } finally {
      setIsEventsLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && businessId) {
      fetchIntents()
    }
  }, [mounted, businessId, fetchIntents])

  useEffect(() => {
    if (activeIntent) {
      fetchEvents(activeIntent.id)
    } else {
      setEvents([])
      setStats(null)
    }
  }, [activeIntent, fetchEvents])

  const handleAddIntent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setIsAdding(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/intents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: inputValue.trim() }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.message || `Gagal menambah niat (Status ${res.status})`)
      }
      
      setTrackedIntents(prev => [...prev, data])
      setActiveIntent(data)
      setInputValue("")
      toast.success("Niat berhasil ditambahkan")
    } catch (error) {
      console.error("[IntentDashboard] Add error:", error)
      toast.error(error instanceof Error ? error.message : "Gagal menambah niat")
    } finally {
      setIsAdding(false)
    }
  }

  const confirmDeleteIntent = async () => {
    if (!intentToDelete) return
    
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/businesses/${businessId}/intents/${intentToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || `Gagal menghapus niat (Status ${res.status})`)
      }
      
      setTrackedIntents(prev => prev.filter(i => i.id !== intentToDelete.id))
      if (activeIntent?.id === intentToDelete.id) {
        const remaining = trackedIntents.filter(i => i.id !== intentToDelete.id)
        setActiveIntent(remaining.length > 0 ? remaining[0] : null)
      }
      toast.success("Niat berhasil dihapus")
      setIntentToDelete(null)
    } catch (error) {
      console.error("[IntentDashboard] Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Gagal menghapus niat")
    } finally {
      setIsDeleting(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col w-full gap-8">
      {/* Top Section: Intent Input and Selection */}
      <div className="bg-surface-container-low border border-outline-variant/15 p-8 xl:p-10 rounded-xl shadow-2xl flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2 tracking-tight">Pelacakan Niat Pelanggan</h2>
          <p className="text-[14px] text-outline max-w-2xl leading-relaxed">
            Tambahkan pertanyaan niat (intent) yang ingin Anda pantau. Chatly AI akan mengevaluasi setiap pesan pelanggan dan mencatat pesan yang mengindikasikan niat tersebut.
          </p>
        </div>

        <form onSubmit={handleAddIntent} className="flex items-center gap-4 relative z-10">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik niat yang ingin dilacak (misal: 'Ingin mengajukan refund')..." 
            className="flex-1 max-w-xl bg-surface-container-high/50 text-[13px] text-on-surface border-outline-variant/10 py-6 px-5 focus:border-secondary transition-all"
          />
          <Button 
            type="submit"
            disabled={!inputValue.trim() || isAdding}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-[13px] h-[48px] px-8 shadow-lg shadow-secondary/10 transition-all active:scale-95"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Lacak Niat
          </Button>
        </form>

        <div className="flex flex-col gap-3 relative z-10">
          <span className="text-[11px] font-mono text-secondary uppercase tracking-widest font-bold ml-1">Niat Terlacak Saya</span>
          <div className="flex items-center gap-3 flex-wrap">
            {isLoading ? (
              <div className="flex items-center gap-2 text-outline text-[13px] ml-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memuat niat...</span>
              </div>
            ) : trackedIntents.length === 0 ? (
              <span className="text-[13px] text-outline italic ml-1 opacity-60">Belum ada niat yang dilacak.</span>
            ) : (
              trackedIntents.map((intent) => (
                <div
                  key={intent.id}
                  onClick={() => setActiveIntent(intent)}
                  className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer border ${
                    activeIntent?.id === intent.id 
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-[0_8px_20px_rgba(191,244,76,0.2)] scale-105" 
                      : "bg-surface-container-high/40 hover:bg-surface-container-high text-outline hover:text-on-surface border-outline-variant/10"
                  }`}
                >
                  {intent.name}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIntentToDelete(intent)
                    }}
                    className={`transition-all ml-1 p-0.5 rounded-md hover:bg-destructive/20 hover:text-destructive ${
                       activeIntent?.id === intent.id ? "text-secondary-foreground/80 hover:text-secondary-foreground" : "text-outline/60 hover:text-on-surface"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Analytics Summary and Log Section */}
      {activeIntent && (
        <div className="flex flex-col gap-6 xl:gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-xl flex items-center gap-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />
               <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner">
                 <MessageSquare className="w-7 h-7" />
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Total Pesan</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-headline font-bold text-on-surface tracking-tight">
                     {isEventsLoading ? "..." : (stats?.totalMessages || 0)}
                   </span>
                   <span className="text-[13px] text-outline">Pesan</span>
                 </div>
               </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-xl flex items-center gap-6 relative overflow-hidden">
               <div className="absolute inset-0 bg-linear-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />
               <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner">
                 <Users className="w-7 h-7" />
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Total Percakapan</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-headline font-bold text-on-surface tracking-tight">
                     {isEventsLoading ? "..." : (stats?.totalConversations || 0)}
                   </span>
                   <span className="text-[13px] text-outline">User Unik</span>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden h-full relative">
            <div className="p-8 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/50 backdrop-blur-sm relative z-10">
              <div>
                <h2 className="text-xl font-headline font-bold text-on-surface mb-2 flex items-center gap-2">
                  Log Percakapan: <span className="text-secondary tracking-tight">"{activeIntent.name}"</span>
                </h2>
                <p className="text-[13px] text-outline">Percakapan pengguna yang sesuai dengan niat ini</p>
              </div>
              <Button variant="ghost" size="icon" className="text-outline hover:text-on-surface rounded-xl hover:bg-surface-container-high transition-all">
                <Download className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-x-auto relative z-10">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-outline-variant/10 hover:bg-transparent bg-surface-container-high/30">
                    <TableHead className="px-8 py-5 text-[10px] font-mono text-outline uppercase tracking-widest font-bold whitespace-nowrap">Stempel Waktu</TableHead>
                    <TableHead className="px-4 py-5 text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Nomor Telepon</TableHead>
                    <TableHead className="px-8 py-5 text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Isi Pesan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[13px]">
                  {isEventsLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-20 text-center text-outline">
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">Menganalisis Log...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : events.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-20 text-center text-outline">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                          <AlertTriangle className="w-8 h-8 mb-2" />
                          <p className="font-medium">Belum ada percakapan</p>
                          <p className="text-[12px]">Chatly AI akan mencatat percakapan di sini segera setelah niat ini muncul.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event.id} className="border-b border-outline-variant/5 hover:bg-surface-container-high/30 transition-colors group">
                        <TableCell className="px-8 py-7 text-outline font-medium whitespace-nowrap group-hover:text-on-surface transition-colors">
                          {format(new Date(event.createdAt), "dd MMM yyyy · HH:mm:ss", { locale: localeId })}
                        </TableCell>
                        <TableCell className="px-4 py-7 text-on-surface font-mono font-bold tracking-tight">{event.phone}</TableCell>
                        <TableCell className="px-8 py-7">
                           <div className="flex flex-col gap-2">
                             <span className="text-on-surface font-medium leading-relaxed max-w-2xl break-words">
                               {event.messageContent || "(Pesan tidak tersedia)"}
                             </span>
                             <div className="inline-flex items-center gap-1.5 self-start bg-secondary/10 border border-secondary/20 text-secondary px-2 py-0.5 rounded-md shadow-sm mt-1">
                               <CheckCircle2 className="w-3 h-3 fill-secondary text-surface-container-low" />
                               <span className="text-[9px] font-bold uppercase tracking-widest font-mono">Cocok</span>
                             </div>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {events.length > 0 && (
              <div className="p-5 border-t border-outline-variant/10 bg-surface-container-low/80 hover:bg-surface-container-high transition-colors cursor-pointer flex justify-center mt-auto">
                <Button variant="ghost" className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold hover:bg-transparent hover:text-on-surface">
                  Muat Lebih Banyak
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!intentToDelete} onOpenChange={(open) => !open && setIntentToDelete(null)}>
        <DialogContent className="sm:max-w-[440px] bg-surface-container-low/95 backdrop-blur-xl border-outline-variant/20 shadow-2xl p-0 overflow-hidden ring-1 ring-white/5">
          <div className="absolute inset-0 bg-linear-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mb-4 ring-1 ring-destructive/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <DialogTitle className="text-2xl font-headline font-bold text-on-surface tracking-tight">
              Hapus Niat Pelacakan?
            </DialogTitle>
            <DialogDescription className="text-outline text-sm leading-relaxed mt-1">
              Anda akan berhenti melacak niat <span className="text-on-surface font-bold">"{intentToDelete?.name}"</span>. Data log yang sudah ada tidak akan hilang, namun analisis baru untuk niat ini akan dihentikan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="p-8 pt-4 gap-3">
            <Button
              variant="ghost"
              onClick={() => setIntentToDelete(null)}
              className="flex-1 cursor-pointer hover:bg-surface-container-high text-outline font-bold h-11"
            >
              Batal
            </Button>
            <Button
              onClick={confirmDeleteIntent}
              disabled={isDeleting}
              className="flex-1 cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold h-11 shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghapus...</span>
                </div>
              ) : (
                "Hapus Niat"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
