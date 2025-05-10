"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/ui/icons"
import { useFloors } from "@/hooks/use-floors"

export function DirectoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { floors, isLoading } = useFloors()
  
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')
  
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())
      
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })
      
      return newSearchParams.toString()
    },
    [searchParams]
  )
  
  const handleSearch = useCallback((value: string) => {
    startTransition(() => {
      const query = value.trim() !== '' ? value : null
      router.push(`${pathname}?${createQueryString({ q: query })}`)
    })
  }, [router, pathname, createQueryString])
  
  const handleFloorChange = useCallback((value: string) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString({ floor: value === 'all' ? null : value })}`)
    })
  }, [router, pathname, createQueryString])
  
  const handleResetFilters = useCallback(() => {
    setSearchInput('')
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])
  
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or unit..."
          className="pl-8"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
        />
        {searchInput && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-9 w-9" 
            onClick={() => {
              setSearchInput('')
              handleSearch('')
            }}
          >
            <Icons.x className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
      
      <div className="flex flex-row gap-2">
        <Select
          value={searchParams.get('floor') || 'all'}
          onValueChange={handleFloorChange}
          disabled={isLoading || isPending}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors?.map((floor) => (
              <SelectItem key={floor} value={floor.toString()}>
                Floor {floor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchParams.has('q') || searchParams.has('floor')) && (
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={isPending}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}