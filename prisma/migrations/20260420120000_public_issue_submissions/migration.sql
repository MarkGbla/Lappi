-- Public /scan/[id] flow: mark issue origin + keep a per-IP rate-limit log.

-- New enum for Issue.source.
CREATE TYPE "IssueSource" AS ENUM ('STAFF', 'PUBLIC');

-- Source column on Issue. Existing rows default to STAFF — no backfill needed.
ALTER TABLE "Issue"
  ADD COLUMN "source" "IssueSource" NOT NULL DEFAULT 'STAFF';

CREATE INDEX "Issue_source_idx" ON "Issue"("source");

-- Rate-limit bookkeeping for anonymous submissions. No FKs — writes happen
-- before the issue insert and we want to count rejected attempts too.
CREATE TABLE "IssueSubmissionLog" (
  "id"        TEXT          NOT NULL,
  "ip"        TEXT          NOT NULL,
  "assetId"   TEXT          NOT NULL,
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IssueSubmissionLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "IssueSubmissionLog_ip_createdAt_idx"
  ON "IssueSubmissionLog"("ip", "createdAt");

CREATE INDEX "IssueSubmissionLog_assetId_createdAt_idx"
  ON "IssueSubmissionLog"("assetId", "createdAt");
