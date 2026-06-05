import { Skeleton } from "@/components/ui/skeleton"

export function IntentDashboardSkeleton() {
  return (
    <div className="flex flex-col w-full gap-8">
      <div className="bg-surface-container-low border border-outline-variant/15 p-8 xl:p-10 rounded-xl shadow-2xl flex flex-col gap-8 relative overflow-visible">
        <div className="absolute inset-0 bg-linear-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <Skeleton className="flex-1 max-w-xl h-12 rounded-lg" />
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>

        <div className="flex flex-col gap-4 relative z-10">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="w-full max-w-sm h-10 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col gap-6 xl:gap-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-xl shadow-xl flex items-center gap-6 relative overflow-hidden"
            >
              <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl shadow-2xl flex flex-col overflow-hidden h-full relative">
          <div className="p-8 flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-low/50 backdrop-blur-sm relative z-10">
            <div className="space-y-2">
              <Skeleton className="h-6 w-80" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>

          <div className="flex-1 overflow-x-auto relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10 bg-surface-container-high/30">
                  <th className="px-8 py-5">
                    <Skeleton className="h-3 w-24" />
                  </th>
                  <th className="px-4 py-5">
                    <Skeleton className="h-3 w-20" />
                  </th>
                  <th className="px-8 py-5">
                    <Skeleton className="h-3 w-28" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/5">
                    <td className="px-8 py-7">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-4 py-7">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-8 py-7">
                      <Skeleton className="h-4 w-48" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
