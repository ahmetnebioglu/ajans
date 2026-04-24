-- Enable RLS for NewsletterSubscriber
ALTER TABLE "NewsletterSubscriber" ENABLE ROW LEVEL SECURITY;

-- Create Policy for tenant isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'NewsletterSubscriber' AND policyname = 'tenant_isolation'
    ) THEN
        CREATE POLICY tenant_isolation ON "NewsletterSubscriber" 
        USING ("tenantId" = current_setting('app.current_tenant', TRUE));
    END IF;
END $$;
