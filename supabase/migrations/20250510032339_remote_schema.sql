create policy "Users can create their own profiles"
on "public"."user_profiles"
as permissive
for insert
to authenticated
with check ((auth.uid() = id));


create policy "Users can update their own profiles"
on "public"."user_profiles"
as permissive
for update
to authenticated
using ((auth.uid() = id));



