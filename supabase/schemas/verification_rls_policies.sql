-- RLS Policies for User Verification
-- These policies ensure that only verified users can access certain features
-- and that users can only see profiles based on verification status and their own role

-- Allow users to view their own profile regardless of verification status
create policy "Users can view their own profile"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (auth.uid() = id);

-- Allow users to view other user profiles if they are verified residents
create policy "Verified users can view other residents' profiles"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (
  -- Current user must be verified
  exists (
    select 1 from public.user_profiles 
    where id = auth.uid() and verification_status = 'approved'
  )
  -- And the profile they're viewing must be verified too
  and verification_status = 'approved'
);

-- Allow admins to view all user profiles
create policy "Admins can view all profiles"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (
  exists (
    select 1 from public.user_roles
    join public.roles on public.user_roles.role_id = public.roles.id
    where public.user_roles.user_id = auth.uid() 
    and public.roles.name = 'Admin'
  )
);

-- Allow floor captains to view profiles for users on their assigned floors
create policy "Floor captains can view profiles on their floors"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (
  -- Check if current user is a floor captain
  exists (
    select 1 from public.user_roles
    join public.roles on public.user_roles.role_id = public.roles.id
    where public.user_roles.user_id = auth.uid() 
    and public.roles.name = 'FloorCaptain'
  )
  -- And the profile they're viewing belongs to a user on their floor
  and exists (
    select 1 from public.floor_captain_assignments fca
    join public.units u on fca.floor_number = u.floor
    where fca.user_id = auth.uid()
    and public.user_profiles.unit_id = u.id
  )
);

-- Verification-based access to privileged content (RLS for other tables)
-- This policy template can be applied to other tables that require verification

/* 
Example for applying to other tables:

create policy "Only verified users can access content"
on "public"."your_protected_table_name"
as permissive
for select/insert/update/delete
to authenticated
using (
  exists (
    select 1 from public.user_profiles 
    where id = auth.uid() and verification_status = 'approved'
  )
);
*/