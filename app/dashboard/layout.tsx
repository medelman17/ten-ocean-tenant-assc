import { redirect } from "next/navigation"
import Link from "next/link"

import { createClient } from "@/lib/supabase/server"
import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"
import { UserRoleWithName } from "@/lib/types/db"
import { RoleProvider } from "@/lib/components/role-provider"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/login")
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // Get user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select(`
      role_id,
      roles!inner (name)
    `)
    .eq("user_id", user.id)

  const typedUserRoles = userRoles as UserRoleWithName[] | null
  const isAdmin = typedUserRoles?.some(role => role.roles.name === "Admin")
  const isFloorCaptain = typedUserRoles?.some(role => role.roles.name === "FloorCaptain")
  
  // Navigation items
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Icons.home className="h-4 w-4" />,
      variant: "default" as const
    },
    {
      title: "Events",
      href: "/dashboard/events",
      icon: <Icons.calendar className="h-4 w-4" />,
      variant: "ghost" as const
    },
    {
      title: "Maintenance",
      href: "/dashboard/maintenance",
      icon: <Icons.wrench className="h-4 w-4" />,
      variant: "ghost" as const
    },
    {
      title: "Forum",
      href: "/dashboard/forum",
      icon: <Icons.message className="h-4 w-4" />,
      variant: "ghost" as const
    },
    {
      title: "Directory",
      href: "/dashboard/directory",
      icon: <Icons.users className="h-4 w-4" />,
      variant: "ghost" as const
    },
    {
      title: "Protected Example",
      href: "/dashboard/protected-example",
      icon: <Icons.lock className="h-4 w-4" />,
      variant: "ghost" as const
    },
  ]
  
  // Admin navigation items
  const adminNavItems = isAdmin || isFloorCaptain ? [
    {
      title: "Verify Users",
      href: "/dashboard/admin/verify-users",
      icon: <Icons.userPlus className="h-4 w-4" />,
      variant: "ghost" as const
    },
    ...(isAdmin ? [
      {
        title: "Management",
        href: "/dashboard/admin",
        icon: <Icons.settings className="h-4 w-4" />,
        variant: "ghost" as const
      }
    ] : [])
  ] : []
  
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-2">
            <Icons.building className="h-6 w-6" />
            <span className="font-bold">10 Ocean</span>
          </div>
          <nav className="ml-6 flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  item.href === "/dashboard" 
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <Link
              href="/dashboard/profile"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {profile?.display_name || user.email}
            </Link>
          </div>
        </div>
      </div>
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <aside className="hidden border-r md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid items-start px-2 text-sm font-medium">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                      item.href === "/dashboard" && "text-foreground bg-muted"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
                
                {/* Admin Section Divider */}
                {adminNavItems.length > 0 && (
                  <div className="my-4 border-t px-6 py-3">
                    <h4 className="mb-2 text-xs font-semibold text-muted-foreground tracking-tight">
                      Administration
                    </h4>
                    {adminNavItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                          item.href === "/dashboard/admin" && "text-foreground bg-muted"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </nav>
            </div>
            <div className="mt-auto p-4">
              <form action="/api/auth/signout" method="post">
                <button 
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-foreground"
                >
                  <Icons.logout className="h-4 w-4" />
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </aside>
        <main className="flex-1">
          <RoleProvider>{children}</RoleProvider>
        </main>
      </div>
    </div>
  )
}