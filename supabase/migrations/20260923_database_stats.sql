-- ==============================================================================
-- RGP Films & Studio - Database Storage Size Monitoring Function
-- Enables real-time PostgreSQL database size calculation for Admin CMS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_database_size()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT pg_database_size(current_database());
$$;

-- Grant execution to all standard client roles
GRANT EXECUTE ON FUNCTION public.get_database_size() TO anon, authenticated, service_role;
