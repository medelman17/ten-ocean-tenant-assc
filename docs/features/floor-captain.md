# Floor Captain Management

The Floor Captain system allows designated residents to manage their assigned floors and provides administrators with tools to assign and manage floor captains.

## Features

### Floor Captain Dashboard

- View floor information including unit count and resident count
- Access a dedicated list of residents on the assigned floor
- Send messages to residents on the floor
- View floor-specific announcements (placeholder for future development)

### Admin Floor Captain Management

- View all current floor captain assignments
- Assign verified residents as floor captains
- Remove floor captain assignments
- Automatic role assignment when designating a floor captain

## Technical Implementation

The Floor Captain system consists of the following components:

### Floor Captain Dashboard

- `/app/dashboard/floor-captain/page.tsx` - Main floor captain dashboard
- `/app/dashboard/floor-captain/components/floor-info.tsx` - Floor information component
- `/app/dashboard/floor-captain/components/residents-list.tsx` - Residents list for the floor
- `/app/dashboard/floor-captain/components/floor-announcements.tsx` - Placeholder for announcements

### Admin Floor Captain Management

- `/app/dashboard/admin/floor-captains/page.tsx` - Admin page for managing floor captains
- `/app/dashboard/admin/floor-captains/components/floor-captains-table.tsx` - Table of current assignments
- `/app/dashboard/admin/floor-captains/components/assign-floor-captain-form.tsx` - Form for new assignments

### Server Actions

- `/app/dashboard/floor-captain/actions.ts` - Actions for the floor captain dashboard
  - `fetchAssignedFloors()` - Get floors assigned to the current user
  - `fetchFloorInfo()` - Get information about a specific floor
  - `fetchFloorResidents()` - Get residents for a specific floor

- `/app/dashboard/admin/floor-captains/actions.ts` - Actions for admin floor captain management
  - `fetchFloorCaptainAssignments()` - Get all current assignments
  - `fetchAvailableFloors()` - Get all floors in the building
  - `fetchEligibleUsers()` - Get verified users eligible to be floor captains
  - `assignFloorCaptain()` - Assign a user as floor captain
  - `removeFloorCaptainAssignment()` - Remove a floor captain assignment

### Authorization

- Floor Captain Dashboard: Restricted to users with FloorCaptain or Admin roles
- Admin Floor Captain Management: Restricted to users with Admin role

## Database Structure

The Floor Captain system uses the following database tables:

- `floor_captain_assignments` - Contains floor captain assignments (user_id, floor_number)
- `user_roles` - Contains user role assignments
- `roles` - Contains role definitions
- `user_profiles` - Contains user profile information
- `units` - Contains unit/apartment information

## Future Enhancements

- Enhanced floor announcements functionality
- In-app messaging between floor captains and residents
- Floor event management
- Maintenance request management by floor