-- migrate:up
BEGIN;

grant delete, insert, references, select, trigger, truncate, update on all tables in schema v1 to authenticated;
grant delete, insert, references, select, trigger, truncate, update on all tables in schema v1 to service_role;

COMMIT;

-- migrate:down
BEGIN;

revoke all privileges on all tables in schema v1 to authenticated;
reovke all privileges on all tables in schema v1 to service_role;

COMMIT;

