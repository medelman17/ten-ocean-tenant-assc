# TypeScript Best Practices

This document outlines key TypeScript practices we've established in this project based on lessons learned during development.

## Database Type Safety

- **Use Generated Types**: Always use Supabase-generated types (from `types/supabase.ts`) as the basis for your database interactions.
- **Centralized Type Definitions**: Import and extend types from a centralized location (`lib/types/db.ts`) instead of defining them inline.
- **Handle Join Results Properly**: Create explicit interface types for joined data:
  ```typescript
  // For joined data with units
  export type UserProfileWithUnit = UserProfile & {
    units?: Unit | null;
    email?: string; // Add fields from Auth that aren't in the database
  }
  ```
- **Null Safety**: Always use optional chaining and provide default values for potentially undefined fields:
  ```typescript
  user.units?.unit_number || "Unknown Unit"
  ```

## Inngest Integration

- **Event Sending Syntax**: Use the object-based syntax for sending events:
  ```typescript
  // Correct
  await inngest.send({
    name: "user/verified",
    data: {
      userId: user.id,
      timestamp: new Date().toISOString()
    }
  })
  
  // Avoid this syntax
  await inngest.send("user/verified", {
    data: { /* ... */ }
  })
  ```

- **Type Handling In Workflows**: When handling complex joined data in workflows, create explicit type interfaces:
  ```typescript
  type AdminType = { 
    user_id: string;
    user_profiles: { 
      email: string; 
      first_name: string; 
      last_name: string;
    };
  };
  
  const typedAdmins = admins as unknown as AdminType[];
  ```

- **Event Type Definition**: Define all events in a central `events.ts` file with proper interfaces.

## Form Validation

- **Boolean Field Validation**: Use `z.boolean().refine()` for checkbox validation instead of `z.literal(true)`:
  ```typescript
  acceptTerms: z.boolean()
    .refine(val => val === true, { 
      message: "You must accept the terms and conditions"
    })
  ```

- **Form Default Values**: Ensure form default values match the TypeScript types derived from your Zod schema:
  ```typescript
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      // ...other fields
      acceptTerms: false,
    }
  })
  ```

## Pre-commit Hook Practices

- **Never Bypass Hooks**: Never use `--no-verify` to bypass pre-commit hooks. Fix the issues instead.

- **Run Checks Early**: Run TypeScript validation frequently during development, not just at commit time:
  ```bash
  pnpm exec tsc --noEmit
  ```

- **Document Hooks**: Maintain documentation about hook usage in `.github/hooks/README.md`.

## General TypeScript Tips

- **Type Casting**: When necessary, use explicit type casting with descriptive comments:
  ```typescript
  // Cast to proper type for type safety
  const typedUserRoles = userRoles as UserRoleWithName[] | null;
  ```

- **Avoid Any**: Minimize use of `any` type, prefer `unknown` when the exact type is uncertain, and then narrow with proper type guards.

- **Add JSDoc Comments**: Use JSDoc comments for complex functions to document parameter and return types:
  ```typescript
  /**
   * Approves a user registration
   * @param userId - The ID of the user to approve
   * @param notes - Optional notes about the approval
   * @returns Promise resolving to success/error message
   */
  ```

By following these practices, we'll maintain type safety and avoid common issues throughout the codebase.