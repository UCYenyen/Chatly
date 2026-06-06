import cron from "node-cron";
import { reassignStaleHandovers } from "./assignment";

export function startHandoverReassignScheduler(): void {
  cron.schedule("*/30 * * * * *", () => {
    void reassignStaleHandovers();
  });
  console.log("[handover-reassign] scheduler started");
}
