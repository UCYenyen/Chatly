-- AlterTable
ALTER TABLE "subscription" ADD COLUMN "tutorializedFeatures" TEXT[] NOT NULL DEFAULT '{}';

-- Backfill existing subscriptions with the features their current plan already grants,
-- so existing customers are not shown unlock tutorials for features they already have.
UPDATE "subscription" SET "tutorializedFeatures" = CASE "plan"
  WHEN 'STARTER' THEN ARRAY['customPersonality']
  WHEN 'GROWTH' THEN ARRAY['customPersonality','dataExport']
  WHEN 'PRO' THEN ARRAY['customPersonality','dataExport','advancedAnalytics','adminNotification','slaSupport']
  WHEN 'ENTERPRISE' THEN ARRAY['customPersonality','dataExport','advancedAnalytics','adminNotification','slaSupport']
  ELSE ARRAY[]::TEXT[]
END;
