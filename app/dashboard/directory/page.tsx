import { Suspense } from "react"
import { redirect } from "next/navigation"

import { checkServerAuth } from "@/lib/supabase/server-auth"
import { ROLES } from "@/lib/types/roles"
import { DirectoryFilters } from "./components/directory-filters"
import { DirectoryList } from "./components/directory-list"
import { cn } from "@/lib/utils"
import { fetchAvailableFloors, fetchVerifiedResidents } from "./actions"

export const metadata = {
  title: "Building Directory - 10 Ocean Tenant Association",
  description: "Find and connect with residents at 10 Ocean",
}

export default async function DirectoryPage() {
  // Verify user is authenticated and has appropriate role
  try {
    const { profile } = await checkServerAuth([ROLES.RESIDENT, ROLES.ADMIN, ROLES.FLOOR_CAPTAIN])

    // Check if user is verified, if not redirect to dashboard
    if (profile?.verification_status !== "approved") {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Auth error:", error)
    redirect("/login?returnUrl=/dashboard/directory")
  }

  // Pre-fetch data for the directory (data will be cached by Next.js)
  try {
    await fetchVerifiedResidents()
    await fetchAvailableFloors()
  } catch (error) {
    console.error("Error pre-fetching directory data:", error)
    // Error will be handled in the client components
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Building Directory</h1>
          <p className="text-muted-foreground mt-1">Find and connect with your verified neighbors at 10 Ocean</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          <Suspense fallback={<DirectoryFiltersSkeleton />}>
            <DirectoryFilters />
          </Suspense>

          <Suspense fallback={<DirectoryListSkeleton />}>
            <DirectoryList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function DirectoryFiltersSkeleton() {
  return <div className="w-full h-12 rounded-md bg-muted animate-pulse" />
}

function DirectoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className={cn("h-52 rounded-md bg-muted animate-pulse", i === 3 && "hidden md:block", i > 3 && "hidden lg:block")} />
        ))}
    </div>
  )
}
