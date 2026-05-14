-- Enable RLS for all tenant-isolated tables
-- This migration protects multi-tenant data isolation

-- Lead table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Lead'
    ) THEN
        ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Lead" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Lead'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Lead' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Lead" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- LeadActivity table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'LeadActivity'
    ) THEN
        ALTER TABLE "LeadActivity" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "LeadActivity" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'LeadActivity'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'LeadActivity' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "LeadActivity" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Company table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Company'
    ) THEN
        ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Company" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Company'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Company' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Company" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Folder table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Folder'
    ) THEN
        ALTER TABLE "Folder" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Folder" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Folder'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Folder' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Folder" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Report table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Report'
    ) THEN
        ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Report" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Report'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Report' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Report" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- AuditLog table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'AuditLog'
    ) THEN
        ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "AuditLog" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'AuditLog'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'AuditLog' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "AuditLog" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Classroom table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Classroom'
    ) THEN
        ALTER TABLE "Classroom" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Classroom" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Classroom'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Classroom' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Classroom" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Student table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Student'
    ) THEN
        ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Student" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Student'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Student' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Student" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- ParentStudent table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ParentStudent'
    ) THEN
        ALTER TABLE "ParentStudent" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "ParentStudent" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ParentStudent'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ParentStudent' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "ParentStudent" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- PermissionRequest table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'PermissionRequest'
    ) THEN
        ALTER TABLE "PermissionRequest" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "PermissionRequest" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'PermissionRequest'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'PermissionRequest' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "PermissionRequest" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- JobPosting table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'JobPosting'
    ) THEN
        ALTER TABLE "JobPosting" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "JobPosting" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'JobPosting'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'JobPosting' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "JobPosting" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- Candidate table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Candidate'
    ) THEN
        ALTER TABLE "Candidate" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "Candidate" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'Candidate'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Candidate' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "Candidate" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- LeaveRequest table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'LeaveRequest'
    ) THEN
        ALTER TABLE "LeaveRequest" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "LeaveRequest" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'LeaveRequest'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'LeaveRequest' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "LeaveRequest" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- ServiceAccount table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ServiceAccount'
    ) THEN
        ALTER TABLE "ServiceAccount" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "ServiceAccount" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ServiceAccount'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'ServiceAccount' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "ServiceAccount" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;

-- NewsletterSubscriber table (already has RLS, but ensure it's enabled)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'NewsletterSubscriber'
    ) THEN
        ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "NewsletterSubscriber" FORCE ROW LEVEL SECURITY;
    END IF;
END $$;
