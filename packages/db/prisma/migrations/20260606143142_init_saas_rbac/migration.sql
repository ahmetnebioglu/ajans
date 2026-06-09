/*
  Warnings:

  - You are about to drop the column `companyId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyAccess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CompanyToExpert` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `workspaceId` to the `Folder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workspaceId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppModule" AS ENUM ('DRIVE', 'CMS', 'HR', 'CRM');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'PASSIVE', 'BLACKLISTED', 'VIP', 'CHURN_ALARM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'SYSTEM_SUPPORT';

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CompanyAccess" DROP CONSTRAINT "CompanyAccess_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyAccess" DROP CONSTRAINT "CompanyAccess_userId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_companyId_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToExpert" DROP CONSTRAINT "_CompanyToExpert_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompanyToExpert" DROP CONSTRAINT "_CompanyToExpert_B_fkey";

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "companyId",
ADD COLUMN     "workspaceId" TEXT,
ALTER COLUMN "tenantId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "companyId",
ADD COLUMN     "workspaceId" TEXT NOT NULL,
ALTER COLUMN "tenantId" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "companyId",
ADD COLUMN     "workspaceId" TEXT NOT NULL,
ALTER COLUMN "tenantId" DROP DEFAULT;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "CompanyAccess";

-- DropTable
DROP TABLE "_CompanyToExpert";

-- DropEnum
DROP TYPE "CompanyStatus";

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "taxNumber" TEXT,
    "taxOffice" TEXT,
    "phone" TEXT,
    "driveFolderId" TEXT,
    "createdById" TEXT,
    "tenantId" TEXT NOT NULL,
    "activeModules" "AppModule"[] DEFAULT ARRAY['DRIVE', 'CMS', 'HR', 'CRM']::"AppModule"[],
    "status" "WorkspaceStatus" NOT NULL DEFAULT 'PROSPECT',
    "communicationOptIn" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "permissions" TEXT[],
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkspaceRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceUser" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkspaceToExpert" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkspaceToExpert_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_driveFolderId_key" ON "Workspace"("driveFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_tenantId_key" ON "Workspace"("tenantId");

-- CreateIndex
CREATE INDEX "Workspace_tenantId_idx" ON "Workspace"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRole_workspaceId_name_key" ON "WorkspaceRole"("workspaceId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceUser_userId_workspaceId_key" ON "WorkspaceUser"("userId", "workspaceId");

-- CreateIndex
CREATE INDEX "_WorkspaceToExpert_B_index" ON "_WorkspaceToExpert"("B");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceRole" ADD CONSTRAINT "WorkspaceRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceUser" ADD CONSTRAINT "WorkspaceUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "WorkspaceRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkspaceToExpert" ADD CONSTRAINT "_WorkspaceToExpert_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkspaceToExpert" ADD CONSTRAINT "_WorkspaceToExpert_B_fkey" FOREIGN KEY ("B") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
