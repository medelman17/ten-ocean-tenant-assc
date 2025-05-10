# Role-Based Access Control System

This document explains how to use the role-based access control (RBAC) system implemented in the 10 Ocean Tenant Association application.

## Overview

The RBAC system consists of several components:

1. **Database Schema**: Roles, permissions, and user-role assignments stored in the database
2. **Middleware**: Server-side route protection
3. **Client Components**: Client-side protection and role-based UI rendering
4. **Utility Functions**: Helper functions for checking roles and permissions

## Role Structure

Roles are defined in the database with the following structure:

- `id`: Unique identifier
- `name`: Role name (Admin, FloorCaptain, Resident, Alumni)
- `permissions`: JSONB object containing permission flags
- `created_at`: Timestamp
- `updated_at`: Timestamp

The application has four predefined roles:

1. **Admin**: Full system access
2. **FloorCaptain**: Manages residents on a specific floor
3. **Resident**: Current building resident
4. **Alumni**: Former resident

## Permissions

Permissions are defined as boolean flags in the role's `permissions` JSONB field:

- `can_manage_users`: Create, update, delete users
- `can_manage_roles`: Assign/revoke roles
- `can_manage_content`: Create/edit content
- `can_verify_residents`: Verify new residents
- `can_post_announcements`: Post building announcements
- `can_view_content`: View content
- `can_participate`: Participate in forums, events
- `can_view_limited_content`: Limited content access for alumni
- `can_participate_limited`: Limited participation for alumni

## Implementation

### 1. Server-Side Protection

The main middleware provides route-based protection:

```typescript
// in middleware.ts
export async function middleware(request: NextRequest) {
  // Admin-only routes
  if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    return await adminOnly(request)
  }
  
  // Floor captain routes
  if (request.nextUrl.pathname.startsWith("/dashboard/captain")) {
    return await floorCaptainOnly(request)
  }
  
  // Default session check for all other routes
  return await updateSession(request)
}
```

Helper functions for common role checks:

```typescript
// Admin-only routes
export function adminOnly(request: NextRequest) {
  return withRoleAuth(request, {
    requiredRoles: ["Admin"],
    redirectTo: "/dashboard"
  })
}

// Floor captain routes
export function floorCaptainOnly(request: NextRequest) {
  return withRoleAuth(request, {
    requiredRoles: ["Admin", "FloorCaptain"],
    redirectTo: "/dashboard"
  })
}
```

### 2. Client-Side Component Protection

Using the Higher-Order Component:

```tsx
import { withRole } from "@/lib/components/with-role"

function AdminPanel() {
  // Admin-only component
  return <div>Admin Panel</div>
}

export default withRole(AdminPanel, {
  requiredRoles: ["Admin"],
  fallback: <p>Access denied</p>,
  redirectTo: "/dashboard"
})
```

### 3. Using the Role Context

The RoleProvider context gives access to role information in client components:

```tsx
"use client"

import { useRole } from "@/lib/components/role-provider"

export default function MyComponent() {
  const { 
    userRoles, 
    userPermissions, 
    isAdmin, 
    isFloorCaptain,
    hasRole, 
    hasPermission 
  } = useRole()
  
  // Conditional rendering based on roles
  return (
    <div>
      {isAdmin && <AdminControls />}
      {isFloorCaptain && <FloorCaptainControls />}
      
      {hasPermission("can_manage_content") && (
        <button>Edit Content</button>
      )}
    </div>
  )
}
```

## Using the Role-Based Access Control System

### Setting Up

1. The RoleProvider is set up in the dashboard layout, so all dashboard pages have access to role information.

2. To protect a route at the middleware level, update the middleware.ts file:

```typescript
// Add to middleware.ts
if (request.nextUrl.pathname.startsWith("/your/protected/path")) {
  return await withRoleAuth(request, {
    requiredRoles: ["Admin", "FloorCaptain"],
    requiredPermissions: ["can_manage_users"],
    redirectTo: "/error"
  })
}
```

### Protecting a Component

```tsx
import { withRole } from "@/lib/components/with-role"

function ProtectedComponent() {
  // Component implementation
}

export default withRole(ProtectedComponent, {
  requiredRoles: ["Admin"],
  requiredPermissions: ["can_manage_users"],
  fallback: <AccessDeniedMessage />,
  redirectTo: "/login"
})
```

### Conditional Rendering

```tsx
"use client"

import { useRole } from "@/lib/components/role-provider"

export default function DashboardUI() {
  const { 
    isAdmin, 
    isFloorCaptain, 
    hasPermission 
  } = useRole()
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Role-specific sections */}
      {isAdmin && <AdminPanel />}
      {isFloorCaptain && <FloorCaptainTools />}
      
      {/* Permission-based controls */}
      {hasPermission("can_manage_users") && (
        <UserManagementPanel />
      )}
    </div>
  )
}
```

## Best Practices

1. **Defense in Depth**: Implement both server and client protection
2. **Granular Permissions**: Use specific permissions over role checks when possible
3. **Middleware Protection**: Always protect sensitive routes at the middleware level
4. **Error Messages**: Provide clear but non-specific error messages to users
5. **Testing**: Verify role checks work as expected across different user types

## Example: User Verification Workflow

The user verification workflow demonstrates role-based access:

1. New users register and are assigned "pending" verification status
2. Admin/FloorCaptain users are notified of pending verifications
3. Only users with `can_verify_residents` permission can approve users
4. The UI conditionally renders the verification UI based on user roles

## Future Improvements

- Fine-grained permission control in the admin panel
- Role-based component tree that lazily loads based on permissions
- Audit logging for permission/role changes