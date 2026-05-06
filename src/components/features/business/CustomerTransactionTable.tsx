"use client";

import { useEffect, useState, useCallback } from "react";
import { ExternalLink, ListFilter, RefreshCcw, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatIDR, formatDateTimeID } from "@/components/features/billing/billing-format";
import type { PaymentStatus } from "@prisma/client";
import type { CustomerTransaction } from "@prisma/client";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
};

function statusClass(status: PaymentStatus): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    case "PENDING":
      return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 dark:bg-amber-500/20";
    case "FAILED":
    case "EXPIRED":
      return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20";
  }
}

function StatusIcon({ status }: { status: PaymentStatus }) {
  switch (status) {
    case "PAID":
      return <CheckCircle2 className="w-3 h-3" />;
    case "PENDING":
      return <Clock className="w-3 h-3" />;
    case "FAILED":
    case "EXPIRED":
      return <AlertCircle className="w-3 h-3" />;
  }
}

export function CustomerTransactionTable({ businessId }: { businessId: string }) {
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/businesses/${businessId}/transactions`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (error) {
      console.error("Gagal mengambil transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filtered = transactions.filter(tx => 
    tx.name.toLowerCase().includes(search.toLowerCase()) || 
    tx.customerPhone.includes(search) ||
    (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
  );

  if (!isMounted) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full h-[400px] items-center justify-center">
        <RefreshCcw className="w-8 h-8 animate-spin text-secondary-fixed/20" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/10 gap-6 bg-linear-to-r from-surface-container/50 to-transparent">
        <div>
          <h2 className="text-[18px] font-headline font-bold text-on-surface flex items-center gap-2">
            Transaksi Pelanggan
          </h2>
          <p className="text-[13px] text-outline mt-1.5 font-inter">Kelola dan pantau pembayaran dari pelanggan Anda secara real-time.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary-fixed transition-colors" />
            <input 
              type="text" 
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-surface-container border border-outline-variant/15 rounded-sm pl-9 pr-4 py-2 text-[13px] text-on-surface placeholder:text-outline/60 focus:outline-none focus:ring-1 focus:ring-secondary-fixed/30 focus:border-secondary-fixed/40 transition-all min-w-[240px]"
            />
          </div>
          <button
            type="button"
            onClick={fetchTransactions}
            className="bg-surface-container border border-outline-variant/15 hover:bg-surface-container-high transition-colors p-2.5 rounded shadow-sm text-outline hover:text-on-surface active:scale-95 flex items-center gap-2"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            className="bg-surface-container border border-outline-variant/15 hover:bg-surface-container-high transition-colors p-2.5 rounded shadow-sm text-outline hover:text-on-surface active:scale-95"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest bg-surface-container/30">
              <th className="px-8 py-5 font-bold whitespace-nowrap">Tanggal</th>
              <th className="px-4 py-5 font-bold">Pelanggan</th>
              <th className="px-4 py-5 font-bold">Detail Transaksi</th>
              <th className="px-4 py-5 font-bold">Jumlah</th>
              <th className="px-4 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCcw className="w-6 h-6 animate-spin text-secondary-fixed" />
                    <span className="text-outline font-inter text-[13px]">Memuat data transaksi...</span>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-60">
                    <p className="text-outline font-inter">Tidak ada transaksi yang ditemukan.</p>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors"
              >
                <td className="px-8 py-6 text-outline font-medium whitespace-nowrap">
                  {formatDateTimeID(String(tx.createdAt)).replace('pukul', '').trim()}
                </td>
                <td className="px-4 py-7">
                  <span className="text-on-surface font-mono font-medium">{tx.customerPhone}</span>
                </td>
                <td className="px-4 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-on-surface font-bold text-[14px]">
                      {tx.name}
                    </span>
                    {tx.description && (
                        <span className="text-[12px] text-outline/80 leading-snug">"{tx.description}"</span>
                    )}
                    <span className="text-[10px] font-mono text-outline/50 mt-1 uppercase bg-surface-container-high/50 w-fit px-1.5 py-0.5 rounded-sm border border-outline-variant/10">{tx.xenditExternalId}</span>
                  </div>
                </td>
                <td className="px-4 py-6 text-on-surface font-mono font-bold tracking-wide text-[14px]">
                  {formatIDR(tx.amount)}
                </td>
                <td className="px-4 py-6">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${statusClass(tx.status)} transition-all duration-300 hover:shadow-md`}
                  >
                    <StatusIcon status={tx.status} />
                    <span className="text-[11px] font-bold uppercase tracking-widest font-mono">
                      {STATUS_LABEL[tx.status]}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {tx.status === "PENDING" && tx.invoiceUrl && (
                      <a
                        href={tx.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-secondary-fixed hover:text-white bg-secondary-fixed/10 hover:bg-secondary-fixed border border-secondary-fixed/20 hover:border-secondary-fixed transition-all active:scale-95 px-3 py-1.5 rounded-full shadow-sm"
                        title="Buka Link Pembayaran"
                      >
                        <span>Link Tagihan</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
