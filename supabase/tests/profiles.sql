BEGIN;

select plan(5);
-- 001. Check for existence of table
select has_table('auth', 'users', 'Table "auth.users" should exist');
select has_view('public', 'profiles', 'Table "public.profiles" should exist');
select has_table('v1', 'profiles', 'Table "v1.profiles" should exist');

-- 002. Add a User into the auth table
	insert into auth.users (id, email)
	values ('8e0772a9-1424-4e53-8ba3-ff2e1bd53f6a', 'foo@bar.com');

	prepare check_profile as
	select count(*) = 1 from v1.profiles where profile_id = '8e0772a9-1424-4e53-8ba3-ff2e1bd53f6a';

	select results_eq('check_profile', ARRAY[true], 'User with profile_id "1234567" should exist in "v1.profiles"');


-- 003. Verify v1.profile created
-- 004. Verify public.profiles view
prepare check_profile_view as
select count(*) = 1 from public.profiles where email = 'foo@bar.com';

select results_eq('check_profile_view', ARRAY[true], 'User with email "foo@bar.com" should exist in the public.profiles view');

-- Finish the tests
select * from finish();

ROLLBACK;
