-- DropIndex
DROP INDEX "NaceCode_code_key";

-- DropIndex
DROP INDEX "Workspace_driveFolderId_key";

-- AlterTable
ALTER TABLE "BlogCategory" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "HomepageSettings" DROP CONSTRAINT "HomepageSettings_pkey",
ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "HomepageSettings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "IsgCategory" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "IsgDocument" DROP COLUMN "driveFileId",
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "IsgLibrary" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "NaceCode" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "Reference" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "ReferenceRequest" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "ReferenceSector" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "driveFileId",
ADD COLUMN     "s3Key" TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "iyzicoApiKey" TEXT,
ADD COLUMN     "iyzicoBaseUrl" TEXT,
ADD COLUMN     "iyzicoSecretKey" TEXT,
ADD COLUMN     "tenantId" TEXT NOT NULL DEFAULT 'mercan',
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "driveFolderId";

-- CreateTable
CREATE TABLE "IyzicoPayment" (
    "id" TEXT NOT NULL,
    "orderReferenceCode" TEXT NOT NULL,
    "customerReferenceCode" TEXT NOT NULL,
    "subscriptionReferenceCode" TEXT,
    "iyziReferenceCode" TEXT NOT NULL,
    "iyziEventType" TEXT NOT NULL,
    "iyziEventTime" BIGINT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "paymentDetails" JSONB,
    "customerDetails" JSONB,
    "orderDetails" JSONB,
    "refund" JSONB,
    "rawWebhookData" JSONB,
    "logs" JSONB NOT NULL DEFAULT '[]',
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorHasError" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "errorAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IyzicoPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsRecord" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "messageId" TEXT,
    "bulkId" TEXT,
    "jobId" TEXT,
    "responseCode" TEXT,
    "responseMessage" TEXT,
    "errorDetail" TEXT,
    "orderId" TEXT,
    "orderEvent" TEXT,
    "orderInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IyzicoPayment_orderReferenceCode_key" ON "IyzicoPayment"("orderReferenceCode");

-- CreateIndex
CREATE INDEX "IyzicoPayment_orderReferenceCode_idx" ON "IyzicoPayment"("orderReferenceCode");

-- CreateIndex
CREATE INDEX "IyzicoPayment_customerReferenceCode_idx" ON "IyzicoPayment"("customerReferenceCode");

-- CreateIndex
CREATE INDEX "IyzicoPayment_iyziReferenceCode_idx" ON "IyzicoPayment"("iyziReferenceCode");

-- CreateIndex
CREATE INDEX "IyzicoPayment_createdAt_idx" ON "IyzicoPayment"("createdAt");

-- CreateIndex
CREATE INDEX "SmsRecord_createdAt_idx" ON "SmsRecord"("createdAt");

-- CreateIndex
CREATE INDEX "SmsRecord_type_idx" ON "SmsRecord"("type");

-- CreateIndex
CREATE INDEX "SmsRecord_status_idx" ON "SmsRecord"("status");

-- CreateIndex
CREATE INDEX "SmsRecord_recipient_idx" ON "SmsRecord"("recipient");

-- CreateIndex
CREATE INDEX "BlogCategory_tenantId_idx" ON "BlogCategory"("tenantId");

-- CreateIndex
CREATE INDEX "BlogPost_tenantId_idx" ON "BlogPost"("tenantId");

-- CreateIndex
CREATE INDEX "ContactMessage_tenantId_idx" ON "ContactMessage"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSettings_tenantId_key" ON "HomepageSettings"("tenantId");

-- CreateIndex
CREATE INDEX "HomepageSettings_tenantId_idx" ON "HomepageSettings"("tenantId");

-- CreateIndex
CREATE INDEX "IsgCategory_tenantId_idx" ON "IsgCategory"("tenantId");

-- CreateIndex
CREATE INDEX "IsgDocument_tenantId_idx" ON "IsgDocument"("tenantId");

-- CreateIndex
CREATE INDEX "IsgLibrary_tenantId_idx" ON "IsgLibrary"("tenantId");

-- CreateIndex
CREATE INDEX "NaceCode_tenantId_idx" ON "NaceCode"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "NaceCode_tenantId_code_key" ON "NaceCode"("tenantId", "code");

-- CreateIndex
CREATE INDEX "Newsletter_tenantId_idx" ON "Newsletter"("tenantId");

-- CreateIndex
CREATE INDEX "Page_tenantId_idx" ON "Page"("tenantId");

-- CreateIndex
CREATE INDEX "PageSection_tenantId_idx" ON "PageSection"("tenantId");

-- CreateIndex
CREATE INDEX "Reference_tenantId_idx" ON "Reference"("tenantId");

-- CreateIndex
CREATE INDEX "ReferenceRequest_tenantId_idx" ON "ReferenceRequest"("tenantId");

-- CreateIndex
CREATE INDEX "ReferenceSector_tenantId_idx" ON "ReferenceSector"("tenantId");

-- CreateIndex
CREATE INDEX "Service_tenantId_idx" ON "Service"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_tenantId_key" ON "SiteSettings"("tenantId");

-- CreateIndex
CREATE INDEX "SiteSettings_tenantId_idx" ON "SiteSettings"("tenantId");
