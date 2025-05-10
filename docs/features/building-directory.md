# Building Directory

The Building Directory is a feature that allows verified residents to view and connect with other verified residents in the building.

## Features

- View all verified residents in a searchable and filterable directory
- Search for residents by name or unit number
- Filter residents by floor
- View detailed resident profiles including contact information, skills, and interests
- Protected by verification status - only visible to verified residents

## Technical Implementation

The Building Directory consists of the following components:

### Pages and Components

- `/app/dashboard/directory/page.tsx` - Main directory page
- `/app/dashboard/directory/components/directory-list.tsx` - Component for displaying resident cards
- `/app/dashboard/directory/components/directory-filters.tsx` - Component for search and filtering
- `/app/dashboard/directory/components/resident-modal.tsx` - Modal for viewing resident details

### Server Actions

- `/app/dashboard/directory/actions.ts` - Server actions for fetching directory data
  - `fetchVerifiedResidents()` - Fetches all verified residents
  - `fetchAvailableFloors()` - Fetches available floors with residents

### Hooks

- `/hooks/use-residents.ts` - Client-side hook for fetching residents
- `/hooks/use-floors.ts` - Client-side hook for fetching floor data

### Authorization

- Restricted to verified residents using the RLS policies and auth middleware
- Users with pending or rejected verification status are redirected to the dashboard

## Database Structure

The Building Directory uses the following database tables:

- `user_profiles` - Contains resident profile information
- `units` - Contains unit/apartment information
- `user_skills` - Contains resident skills and interests

## Future Enhancements

- Pagination for large directories
- Additional filtering options (skills, interests, etc.)
- Improved search functionality with fuzzy matching