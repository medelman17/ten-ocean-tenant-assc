import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DirectoryFilters } from '@/app/dashboard/directory/components/directory-filters'
import { useFloors } from '@/hooks/use-floors'

// Mock dependencies
jest.mock('@/hooks/use-floors')

// Mock the router and URL params
const mockRouter = {
  push: jest.fn()
}

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useSearchParams: jest.fn().mockImplementation(() => new URLSearchParams()),
  usePathname: () => '/dashboard/directory'
}))

describe('DirectoryFilters Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock floors data
    (useFloors as jest.Mock).mockReturnValue({
      floors: [1, 2, 3],
      isLoading: false,
      error: null
    })
  })
  
  it('should render search input and floor selector correctly', () => {
    render(<DirectoryFilters />)
    
    // Check if search input is rendered
    expect(screen.getByPlaceholderText('Search by name or unit...')).toBeInTheDocument()
    
    // Check if floor selector is rendered
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('All Floors')).toBeInTheDocument()
  })
  
  it('should handle search input changes', async () => {
    render(<DirectoryFilters />)
    
    const searchInput = screen.getByPlaceholderText('Search by name or unit...')
    const user = userEvent.setup()
    
    // Type in search input
    await user.type(searchInput, 'John')
    expect(searchInput).toHaveValue('John')
    
    // Press Enter to search
    await user.keyboard('{Enter}')
    
    // Check if router.push was called with correct search param
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/directory?q=John')
    })
  })
  
  it('should handle floor filter selection', async () => {
    render(<DirectoryFilters />)
    
    const user = userEvent.setup()
    const floorSelector = screen.getByRole('combobox')
    
    // Open dropdown
    await user.click(floorSelector)
    
    // Wait for dropdown options to appear
    await waitFor(() => {
      expect(screen.getByText('Floor 1')).toBeInTheDocument()
      expect(screen.getByText('Floor 2')).toBeInTheDocument()
      expect(screen.getByText('Floor 3')).toBeInTheDocument()
    })
    
    // Select Floor 2
    await user.click(screen.getByText('Floor 2'))
    
    // Check if router.push was called with correct floor param
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/directory?floor=2')
    })
  })
  
  it('should reset filters when Reset button is clicked', async () => {
    // Mock search params
    const mockSearchParams = new URLSearchParams('q=John&floor=2')
    jest.spyOn(require('next/navigation'), 'useSearchParams')
      .mockImplementation(() => mockSearchParams)
    
    render(<DirectoryFilters />)
    
    // Reset button should be visible
    const resetButton = screen.getByText('Reset')
    expect(resetButton).toBeInTheDocument()
    
    const user = userEvent.setup()
    await user.click(resetButton)
    
    // Check if router.push was called with empty params
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/directory')
    })
  })
  
  it('should show loading state when floors are loading', () => {
    // Mock loading state
    (useFloors as jest.Mock).mockReturnValue({
      floors: null,
      isLoading: true,
      error: null
    })
    
    render(<DirectoryFilters />)
    
    // Floor selector should be disabled during loading
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
  
  it('should handle error state correctly', () => {
    // Mock error state
    (useFloors as jest.Mock).mockReturnValue({
      floors: null,
      isLoading: false,
      error: new Error('Failed to load floors')
    })
    
    render(<DirectoryFilters />)
    
    // Floor selector should still be enabled but only with "All Floors" option
    expect(screen.getByRole('combobox')).not.toBeDisabled()
    expect(screen.getByText('All Floors')).toBeInTheDocument()
  })
})