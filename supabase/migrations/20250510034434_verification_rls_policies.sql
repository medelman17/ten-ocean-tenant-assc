drop policy "Users can create their own profiles" on "public"."user_profiles";

drop policy "Users can update their own profiles" on "public"."user_profiles";

create policy "Admins can view all profiles"
on "public"."user_profiles"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM (user_roles
     JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'Admin'::text)))));


create policy "Floor captains can view profiles on their floors"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM (user_roles
     JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'FloorCaptain'::text)))) AND (EXISTS ( SELECT 1
   FROM (floor_captain_assignments fca
     JOIN units u ON ((fca.floor_number = u.floor)))
  WHERE ((fca.user_id = auth.uid()) AND (user_profiles.unit_id = u.id))))));


create policy "Users can view their own profile"
on "public"."user_profiles"
as permissive
for select
to authenticated
using ((auth.uid() = id));


create policy "Verified users can view other residents' profiles"
on "public"."user_profiles"
as permissive
for select
to authenticated
using (((EXISTS ( SELECT 1
   FROM user_profiles user_profiles_1
  WHERE ((user_profiles_1.id = auth.uid()) AND (user_profiles_1.verification_status = 'approved'::text)))) AND (verification_status = 'approved'::text)));



