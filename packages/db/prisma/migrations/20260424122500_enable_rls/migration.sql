-- Enable RLS for NewsletterSubscriber (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'NewsletterSubscriber'
    ) THEN
        ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Create Policy for tenant isolation
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'NewsletterSubscriber'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'NewsletterSubscriber' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "NewsletterSubscriber" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;
