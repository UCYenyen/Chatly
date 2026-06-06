export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;
  const { startReportScheduler } = await import(
    "@/lib/utils/reports/scheduler"
  );
  startReportScheduler();
  const { startHandoverReassignScheduler } = await import(
    "@/lib/utils/notifications/scheduler"
  );
  startHandoverReassignScheduler();
}
