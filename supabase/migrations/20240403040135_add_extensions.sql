-- migrate:up
BEGIN;

-- Enable pgtap
create extension pgtap with schema extensions;

-- Enable pg_state_monitor
create extension pg_stat_monitor with schema extensions;

COMMIT;

-- migrate:down
-- BEGIN;
--
-- drop extension if exists pgtap;
--
-- drop extension if exists pg_state_monitor;
--
-- COMMIT;
