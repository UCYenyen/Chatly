import { Skeleton } from "@/components/ui/skeleton";

export function CustomerTransactionTableSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden w-full">
      <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant/10 gap-6 bg-linear-to-r from-surface-container/50 to-transparent">
        <div className="flex flex-col gap-3 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-60 rounded-sm" />
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
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
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-outline-variant/5">
                <td className="px-8 py-6">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-4 py-7">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-6">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </td>
                <td className="px-4 py-6">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-6">
                  <Skeleton className="h-7 w-20 rounded-full" />
                </td>
                <td className="px-8 py-6 text-right">
                  <Skeleton className="h-8 w-24 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
