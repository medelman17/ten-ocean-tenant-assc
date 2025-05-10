"use client"

import { useEffect, useState } from "react"
import { ResidentProfile } from "@/lib/types/directory"
import { fetchVerifiedResidents } from "@/app/dashboard/directory/actions"

export function useResidents() {
  const [residents, setResidents] = useState<ResidentProfile[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getResidents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchVerifiedResidents()
        setResidents(data)
      } catch (err) {
        console.error("Error fetching residents:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    getResidents()
  }, [])

  return { residents, isLoading, error }
}