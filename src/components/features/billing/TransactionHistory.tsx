"use client";

import { Download, ExternalLink, ListFilter, X } from "lucide-react";
import { toast } from "sonner";
import { useWalletContext } from "./WalletProvider";
import { PLANS } from "@/lib/utils/payment-gateway/plans";
import { formatIDR, formatShortDateID } from "./billing-format";
import { useCancelPayment } from "@/hooks/use-cancel-payment";
import type { PaymentDTO, WalletStateResponse } from "@/types/wallet.md";
import type { PaymentStatus } from "@prisma/client";

function isCancelable(status: PaymentStatus): boolean {
  return status !== "PAID" && status !== "FAILED";
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: "Menunggu",
  PAID: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kadaluarsa",
};

function statusClass(status: PaymentStatus): string {
  switch (status) {
    case "PAID":
      return "bg-[#143600]/80 border-[#304400] text-secondary-fixed";
    case "PENDING":
      return "bg-surface-container-high border-outline-variant/20 text-outline";
    case "FAILED":
    case "EXPIRED":
      return "bg-red-950/60 border-red-900/60 text-red-300";
  }
}

export function TransactionHistory() {
  const { data, isLoading, refresh } = useWalletContext();
  const { cancelPayment, pendingId } = useCancelPayment();
  const payments: PaymentDTO[] = data?.payments ?? [];

  const handleCancel = async (payment: PaymentDTO): Promise<void> => {
    const confirmed = window.confirm(
      `Batalkan transaksi ${payment.xenditExternalId}? Tindakan ini tidak dapat diurungkan.`,
    );
    if (!confirmed) return;
    const ok = await cancelPayment(payment.id);
    if (ok) {
      toast.success("Transaksi dibatalkan.");
      await refresh();
    } else {
      toast.error("Gagal membatalkan transaksi.");
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full">
      <div className="p-8 pb-8 flex items-center justify-between border-b border-outline-variant/10">
        <h2 className="text-[16px] font-headline font-bold text-on-surface">Riwayat Transaksi</h2>
        <button
          type="button"
          className="bg-surface-container border border-outline-variant/15 hover:bg-surface-container-high transition-colors p-2 rounded shadow-sm text-outline hover:text-on-surface active:scale-95"
        >
          <ListFilter className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/10 text-[10px] font-mono text-outline uppercase tracking-widest bg-surface-container/30">
              <th className="px-8 py-5 font-bold whitespace-nowrap">Tanggal</th>
              <th className="px-4 py-5 font-bold">Deskripsi</th>
              <th className="px-4 py-5 font-bold">Jumlah</th>
              <th className="px-4 py-5 font-bold">Status</th>
              <th className="px-8 py-5 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-[13px]">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-outline">
                  Memuat...
                </td>
              </tr>
            )}
            {!isLoading && payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-outline">
                  Belum ada transaksi.
                </td>
              </tr>
            )}
            {payments.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-outline-variant/5 hover:bg-surface-container/30 transition-colors"
              >
                <td className="px-8 py-7 text-outline font-medium whitespace-nowrap">
                  {formatShortDateID(tx.createdAt)}
                </td>
                <td className="px-4 py-7">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-on-surface font-bold">
                      {tx.type === 'TOPUP' ? 'Top Up Saldo Akun' : `Langganan Paket ${PLANS[tx.plan].name}`}
                    </span>
                    {tx.businessName && (
                        <span className="text-[11px] text-secondary-fixed">Bisnis: {tx.businessName}</span>
                    )}
                    <span className="text-[11px] font-mono text-outline">{tx.xenditExternalId}</span>
                  </div>
                </td>
                <td className="px-4 py-7 text-on-surface font-mono font-bold tracking-wide">
                  {formatIDR(tx.amount)}
                </td>
                <td className="px-4 py-7">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded shadow-sm border ${statusClass(tx.status)}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                      {STATUS_LABEL[tx.status]}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-7 text-right">
                  <div className="flex justify-end gap-1">
                    {tx.status === "PENDING" && tx.invoiceUrl && (
                      <a
                        href={tx.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-outline hover:text-on-surface transition-colors active:scale-95 p-2 rounded-full hover:bg-surface-container"
                        aria-label="Lanjutkan pembayaran"
                      >
                        <ExternalLink className="w-[18px] h-[18px]" />
                      </a>
                    )}
                    {isCancelable(tx.status) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(tx)}
                        disabled={pendingId === tx.id}
                        aria-label="Batalkan transaksi"
                        className="text-outline hover:text-destructive transition-colors active:scale-95 p-2 rounded-full hover:bg-surface-container disabled:opacity-50"
                      >
                        <X className="w-[18px] h-[18px]" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-outline hover:text-on-surface transition-colors active:scale-95 p-2 rounded-full hover:bg-surface-container"
                      aria-label="Unduh invoice"
                    >
                      <Download className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5 border-t border-outline-variant/10 bg-surface-container-high hover:bg-surface-variant transition-colors cursor-pointer flex justify-center shadow-inner">
        <button type="button" className="text-[11px] font-mono text-outline uppercase tracking-widest font-bold">
          Lihat Semua Transaksi
        </button>
      </div>
    </div>
  );
}
