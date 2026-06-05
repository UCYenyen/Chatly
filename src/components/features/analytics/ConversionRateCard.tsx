"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { TrendingUp, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { ConversionRateCardSkeleton } from "./ConversionRateCardSkeleton"

interface ConversionData {
  totalChatCustomers: number
  totalBuyingCustomers: number
  conversionRate: number
  totalTransactions: number
  totalRevenue: number
  details: {
    chatCustomers: string[]
    buyingCustomers: string[]
    transactions: Array<{
      id: string
      customerPhone: string
      name: string
      amount: number
      status: string
      createdAt: string
    }>
  }
}

type DetailView = null | "chat" | "buyers" | "transactions"

export function ConversionRateCard() {
  const params = useParams()
  const businessId = (params?.businessId || params?.id) as string

  const [data, setData] = useState<ConversionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailView, setDetailView] = useState<DetailView>(null)

  useEffect(() => {
    const fetchConversionRate = async () => {
      if (!businessId) return

      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/businesses/${businessId}/analytics/conversion-rate`)
        const responseData = await res.json()

        if (!res.ok) {
          throw new Error(responseData?.message || "Gagal mengambil data conversion rate")
        }

        setData(responseData)
      } catch (err) {
        console.error("[ConversionRateCard] Error:", err)
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversionRate()
  }, [businessId])

  if (isLoading) {
    return <ConversionRateCardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl flex flex-col justify-center h-full shadow-2xl min-h-[220px]">
        <p className="text-[13px] text-outline">{error || "Gagal memuat data"}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Card */}
        <div className="bg-surface-container-low border border-outline-variant/15 border-t-4 border-t-secondary-fixed p-8 rounded-xl flex flex-col justify-center h-full shadow-2xl min-h-[220px] relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">Conversion Rate</span>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-6xl font-bold font-headline text-on-surface tracking-tight">
                {data.conversionRate.toFixed(1)}%
              </h1>
              <TrendingUp className="w-8 h-8 text-secondary-fixed" />
            </div>
            
            <p className="text-[13px] text-outline leading-relaxed max-w-[280px]">
              {data.totalBuyingCustomers} dari {data.totalChatCustomers} customer membeli produk
            </p>
          </div>

          {/* Background Icon */}
          <div className="absolute right-0 bottom-0 opacity-15 text-secondary-fixed translate-x-8 translate-y-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"></path>
              <path d="M12 6v6l4.2 2.5"></path>
            </svg>
          </div>

          {/* Revenue Badge */}
          <div className="absolute right-0 bottom-0 bg-surface-container border-t border-l border-outline-variant/20 rounded-tl-xl p-3.5 px-5 flex items-center gap-3 shadow-[-5px_-5px_20px_rgba(0,0,0,0.2)]">
            <div className="bg-secondary-fixed/20 p-2 rounded-md">
              <span className="text-[11px] font-bold text-secondary-fixed">💰</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest font-bold">Revenue</span>
              <span className="text-[13px] font-bold text-on-surface mt-0.5">
                {(data.totalRevenue / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        </div>

        {/* Detail Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat Button Card */}
          <button
            onClick={() => setDetailView("chat")}
            className="bg-surface-container-low border-2 border-outline-variant/30 hover:border-secondary-fixed p-6 rounded-xl relative overflow-hidden group transition-all hover:shadow-lg text-left"
          >
            <div className="absolute top-4 right-4 text-outline-variant/50 group-hover:text-secondary-fixed transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
            
            <h3 className="text-[18px] font-headline font-bold text-on-surface mb-2 group-hover:text-secondary-fixed transition-colors">
              Chat Customers
            </h3>
            <p className="text-[14px] text-outline mb-4 group-hover:text-outline transition-colors">
              Pelanggan yang berkomunikasi
            </p>
            <p className="text-[32px] font-bold text-secondary-fixed">
              {data.totalChatCustomers}
            </p>
          </button>

          {/* Buyers Button Card */}
          <button
            onClick={() => setDetailView("buyers")}
            className="bg-surface-container-low border-2 border-outline-variant/30 hover:border-secondary-fixed p-6 rounded-xl relative overflow-hidden group transition-all hover:shadow-lg text-left"
          >
            <div className="absolute top-4 right-4 text-outline-variant/50 group-hover:text-secondary-fixed transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
            
            <h3 className="text-[18px] font-headline font-bold text-on-surface mb-2 group-hover:text-secondary-fixed transition-colors">
              Pembeli
            </h3>
            <p className="text-[14px] text-outline mb-4 group-hover:text-outline transition-colors">
              Customer yang membeli
            </p>
            <p className="text-[32px] font-bold text-secondary-fixed">
              {data.totalBuyingCustomers}
            </p>
          </button>

          {/* Transactions Button Card */}
          <button
            onClick={() => setDetailView("transactions")}
            className="bg-surface-container-low border-2 border-outline-variant/30 hover:border-secondary-fixed p-6 rounded-xl relative overflow-hidden group transition-all hover:shadow-lg text-left"
          >
            <div className="absolute top-4 right-4 text-outline-variant/50 group-hover:text-secondary-fixed transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
            
            <h3 className="text-[18px] font-headline font-bold text-on-surface mb-2 group-hover:text-secondary-fixed transition-colors">
              Transaksi
            </h3>
            <p className="text-[14px] text-outline mb-4 group-hover:text-outline transition-colors">
              Total pesanan berhasil
            </p>
            <p className="text-[32px] font-bold text-secondary-fixed">
              {data.totalTransactions}
            </p>
          </button>
        </div>
      </div>

      {/* Chat Customers Dialog */}
      <Dialog open={detailView === "chat"} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Chat Customers ({data.details.chatCustomers.length})</DialogTitle>
            <DialogDescription>
              Daftar semua customer yang telah berkomunikasi dengan chatbot
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {data.details.chatCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data</p>
              ) : (
                data.details.chatCustomers.map((phone) => (
                  <div
                    key={phone}
                    className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/15"
                  >
                    <span className="font-mono text-sm">{phone}</span>
                    {data.details.buyingCustomers.includes(phone) && (
                      <Badge variant="secondary">Pembeli</Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Buyers Dialog */}
      <Dialog open={detailView === "buyers"} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Customer Pembeli ({data.details.buyingCustomers.length})</DialogTitle>
            <DialogDescription>
              Daftar customer yang telah melakukan pembelian
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {data.details.buyingCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data</p>
              ) : (
                data.details.buyingCustomers.map((phone) => (
                  <div
                    key={phone}
                    className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/15"
                  >
                    <span className="font-mono text-sm">{phone}</span>
                    <Badge variant="secondary">Converted</Badge>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Transactions Dialog */}
      <Dialog open={detailView === "transactions"} onOpenChange={(open) => !open && setDetailView(null)}>
        <DialogContent className="max-w-4xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Transaksi Sukses ({data.details.transactions.length})</DialogTitle>
            <DialogDescription>
              Daftar semua transaksi yang berhasil diselesaikan
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {data.details.transactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Tidak ada data</p>
              ) : (
                data.details.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-surface-container rounded-lg border border-outline-variant/15"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-outline mb-1">{tx.customerPhone}</p>
                        <p className="text-sm font-medium text-on-surface truncate">{tx.name}</p>
                        <p className="text-xs text-outline mt-1">
                          {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-on-surface">
                          Rp {tx.amount.toLocaleString("id-ID")}
                        </p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
