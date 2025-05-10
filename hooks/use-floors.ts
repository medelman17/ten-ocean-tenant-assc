"use client"

import { useEffect, useState } from "react"
import { fetchAvailableFloors } from "@/app/dashboard/directory/actions"

export function useFloors() {
  const [floors, setFloors] = useState<number[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getFloors = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const floorNumbers = await fetchAvailableFloors()
        setFloors(floorNumbers)
      } catch (err) {
        console.error("Error fetching floors:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    getFloors()
  }, [])

  return { floors, isLoading, error }
}