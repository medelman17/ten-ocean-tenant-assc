# Security Policies Migration Analysis

**Migration:** Ten Ocean Tenant Association - Supabase to Neon + Prisma  
**Phase:** 2.5 - Implement Security Policies  
**Date:** January 2025  
**Status:** 📋 IN ANALYSIS  

## Overview

This document analyzes the existing Supabase Row Level Security (RLS) policies and outlines the migration strategy to application-level security in our new Prisma + Neon + Next.js environment.

## Current RLS Policies Inventory

### 🔐 User Profile Access Policies (4 policies)

#### 1. "Admins can view all profiles"
```sql
CREATE POLICY "Admins can view all profiles"
ON "public"."user_profiles" FOR SELECT TO authenticated
USING ((EXISTS ( SELECT 1
   FROM (user_roles JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'Admin'::text)))));
```
**Logic:** Users with 'Admin' role can view all user profiles.

#### 2. "Floor captains can view profiles on their floors"
```sql
CREATE POLICY "Floor captains can view profiles on their floors"
ON "public"."user_profiles" FOR SELECT TO authenticated
USING (((EXISTS ( SELECT 1
   FROM (user_roles JOIN roles ON ((user_roles.role_id = roles.id)))
  WHERE ((user_roles.user_id = auth.uid()) AND (roles.name = 'FloorCaptain'::text)))) 
AND (EXISTS ( SELECT 1
   FROM (floor_captain_assignments fca JOIN units u ON ((fca.floor_number = u.floor)))
  WHERE ((fca.user_id = auth.uid()) AND (user_profiles.unit_id = u.id))))));
```
**Logic:** Users with 'FloorCaptain' role can view profiles of users on floors they're assigned to.

#### 3. "Users can view their own profile"
```sql
CREATE POLICY "Users can view their own profile"
ON "public"."user_profiles" FOR SELECT TO authenticated
USING ((auth.uid() = id));
```
**Logic:** Users can always view their own profile.

#### 4. "Verified users can view other residents' profiles"
```sql
CREATE POLICY "Verified users can view other residents' profiles"
ON "public"."user_profiles" FOR SELECT TO authenticated
USING (((EXISTS ( SELECT 1
   FROM user_profiles user_profiles_1
  WHERE ((user_profiles_1.id = auth.uid()) AND (user_profiles_1.verification_status = 'approved'::text)))) 
AND (verification_status = 'approved'::text)));
```
**Logic:** Verified (approved) users can view other verified users' profiles.

### 💬 Chat Message Access Policy (1 policy)

#### 5. "Users can see their own chat messages"
```sql
CREATE POLICY "Users can see their own chat messages"
ON "public"."chat_messages" FOR SELECT TO public
USING ((session_id IN ( SELECT chat_sessions.id
   FROM chat_sessions
  WHERE (chat_sessions.user_id = auth.uid()))));
```
**Logic:** Users can only see chat messages from chat sessions they own.

### 🔧 Maintenance Request Access Policy (1 policy)

#### 6. "Users can see their own maintenance requests"
```sql
CREATE POLICY "Users can see their own maintenance requests"
ON "public"."maintenance_requests" FOR SELECT TO public
USING ((auth.uid() = reported_by));
```
**Logic:** Users can only see maintenance requests they reported.

## Migration Strategy: RLS → Application-Level Security

### 🏗️ Architecture Approach

**1. Prisma Middleware Layer**
- Create centralized security middleware for data access control
- Implement role-based and permission-based filtering
- Maintain consistent security across all database queries

**2. Next.js Server Component Guards**
- Server-side authentication checks before data access
- Role-based route protection
- Data pre-filtering at the component level

**3. Type-Safe Permission System**
- TypeScript enums for roles and permissions
- Compile-time security validation
- Consistent permission checking across the application

### 🔐 Implementation Components

#### Component 1: Auth Context & Session Management
```typescript
// lib/auth/session.ts - Replace auth.uid() functionality
export async function getCurrentUser(): Promise<User | null>
export async function requireAuth(): Promise<User>
export async function getUserRoles(userId: string): Promise<Role[]>
export async function isAdmin(userId: string): Promise<boolean>
export async function isFloorCaptain(userId: string): Promise<boolean>
```

#### Component 2: Permission Checking Utilities
```typescript
// lib/auth/permissions.ts - Business logic for access control
export async function canViewUserProfile(viewerId: string, targetProfileId: string): Promise<boolean>
export async function canViewChatMessage(userId: string, messageId: string): Promise<boolean>
export async function canViewMaintenanceRequest(userId: string, requestId: string): Promise<boolean>
export async function getAccessibleUserProfiles(userId: string): Promise<string[]>
```

#### Component 3: Prisma Security Middleware
```typescript
// lib/prisma/middleware/security.ts - Automatic query filtering
export function createSecurityMiddleware(userId: string): Prisma.Middleware
```

#### Component 4: Next.js Server Action Security
```typescript
// app/actions/secure-actions.ts - Protected server actions
export async function getSecureUserProfiles()
export async function getSecureChatMessages()  
export async function getSecureMaintenanceRequests()
```

### 📋 Policy Translation Matrix

| Supabase RLS Policy | Application Implementation | Priority |
|-------------------|---------------------------|----------|
| Admin view all profiles | `isAdmin()` check → full access | High |
| Floor captain floor access | `isFloorCaptain()` + floor assignment check | High |  
| User view own profile | `userId === profileId` check | High |
| Verified user mutual access | `verificationStatus === 'approved'` for both users | Medium |
| User own chat messages | Chat session ownership validation | High |
| User own maintenance requests | `reportedBy === userId` check | High |

### 🔄 Migration Implementation Plan

#### Phase 1: Foundation Setup
1. **Authentication Service** - Set up Next.js auth with session management
2. **Role System** - Implement role checking utilities  
3. **Permission Framework** - Create permission checking infrastructure

#### Phase 2: Prisma Integration
1. **Security Middleware** - Create automatic query filtering
2. **Query Helpers** - Build secure data access utilities
3. **Testing Framework** - Implement security testing suite

#### Phase 3: Application Integration  
1. **Server Components** - Update data fetching with security
2. **Server Actions** - Implement protected mutations
3. **Route Protection** - Add page-level access control

#### Phase 4: Validation & Testing
1. **Security Audit** - Comprehensive access control testing
2. **Performance Testing** - Ensure security doesn't impact performance
3. **Documentation** - Complete security implementation guide

## Security Model Comparison

### Before (Supabase RLS)
✅ **Advantages:**
- Database-level enforcement
- Automatic application to all queries
- Cannot be bypassed by application bugs

❌ **Limitations:**
- Limited to SQL expressions
- Difficult to test and debug
- Performance overhead on every query
- Vendor lock-in to Supabase

### After (Application-Level)
✅ **Advantages:**
- Full TypeScript type safety
- Testable business logic
- Better debugging capabilities
- Framework agnostic
- Fine-grained control

❌ **Considerations:**
- Must be consistently applied
- Requires careful implementation
- Developer discipline required

## Risk Mitigation Strategies

### 🛡️ Security Safeguards
1. **Defense in Depth** - Multiple layers of security checks
2. **Fail-Safe Defaults** - Deny access by default, explicit allow
3. **Comprehensive Testing** - Unit and integration tests for all access patterns
4. **Audit Logging** - Track all security-related access attempts
5. **Regular Security Reviews** - Periodic code audits for security compliance

### 🔍 Monitoring & Alerting
1. **Access Pattern Monitoring** - Track unusual access patterns
2. **Failed Access Logging** - Log and alert on unauthorized access attempts  
3. **Performance Monitoring** - Ensure security checks don't degrade performance
4. **Compliance Tracking** - Maintain audit trail for security compliance

## Next Steps

1. ✅ **Analysis Complete** - Current RLS policies documented and migration strategy defined
2. 🔄 **Foundation Setup** - Implement authentication and role checking utilities
3. ⏳ **Prisma Integration** - Create security middleware and query helpers
4. ⏳ **Application Integration** - Update all data access with security
5. ⏳ **Testing & Validation** - Comprehensive security testing

---

*This analysis provides the foundation for migrating from Supabase RLS to a robust application-level security system with Prisma and Next.js.* 