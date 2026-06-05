import type { Business } from "@prisma/client";
import type { BusinessDTO } from "@/types/business.md";
import { isWeeklyHours } from "@/types/business-hours.md";

export function toBusinessDTO(b: Business): BusinessDTO {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    knowledgeBase: b.knowledgeBase,
    aiTone: b.aiTone,
    knowledgeFiles: b.knowledgeFiles,
    handoverHoursEnabled: b.handoverHoursEnabled,
    timezone: b.timezone,
    businessHours: isWeeklyHours(b.businessHours) ? b.businessHours : null,
    notificationPhone: b.notificationPhone,
    monthlyReportEnabled: b.monthlyReportEnabled,
    monthlyReportEmail: b.monthlyReportEmail,
    monthlyReportFormat: b.monthlyReportFormat,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}
