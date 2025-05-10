import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DirectoryList } from '@/app/dashboard/directory/components/directory-list'
import { useResidents } from '@/hooks/use-residents'
import { ResidentProfile } from '@/lib/types/directory'

// Mock hooks
jest.mock('@/hooks/use-residents')
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
  usePathname: () => '/dashboard/directory',
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock the modal to avoid testing implementation details
jest.mock('@/app/dashboard/directory/components/resident-modal', () => ({
  ResidentModal: ({ resident, isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="resident-modal">
        <div data-testid="modal-resident-name">
          {resident.firstName} {resident.lastName}
        </div>
        <button onClick={onClose} data-testid="close-modal-btn">Close</button>
      </div>
    ) : null
  )
}))

describe('DirectoryList Component', () => {
  const mockResidents: ResidentProfile[] = [
    {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'JD',
      bio: 'Frontend Developer',
      phone: '123-456-7890',
      profilePictureUrl: null,
      occupation: 'Software Engineer',
      moveInDate: '2023-01-01',
      residencyStatus: 'current',
      languagesSpoken: ['English', 'Spanish'],
      unit: {
        id: 'unit1',
        unitNumber: '101',
        floor: 1
      },
      socialMediaLinks: null,
      skills: ['JavaScript', 'React'],
      interests: ['Coding', 'Music'],
      communityInvolvement: ['Tech Committee']
    },
    {
      id: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: null,
      bio: 'Architect with 10+ years experience',
      phone: null,
      profilePictureUrl: null,
      occupation: 'Architect',
      moveInDate: '2022-06-15',
      residencyStatus: 'current',
      languagesSpoken: ['English', 'French'],
      unit: {
        id: 'unit2',
        unitNumber: '202',
        floor: 2
      },
      socialMediaLinks: null,
      skills: ['Architecture', 'Design'],
      interests: ['Art', 'Travel'],
      communityInvolvement: ['Building Committee']
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state while fetching residents', () => {
    // Mock the hook to return loading state
    (useResidents as jest.Mock).mockReturnValue({
      residents: null,
      isLoading: true,
      error: null
    })

    render(<DirectoryList />)
    
    // Check if loading message is displayed
    expect(screen.getByText('Loading residents...')).toBeInTheDocument()
  })

  it('should render error state if fetching fails', () => {
    // Mock the hook to return error state
    (useResidents as jest.Mock).mockReturnValue({
      residents: null,
      isLoading: false,
      error: new Error('Failed to fetch residents')
    })

    render(<DirectoryList />)
    
    // Check if error message is displayed
    expect(screen.getByText(/Error loading residents/)).toBeInTheDocument()
  })

  it('should render residents correctly', async () => {
    // Mock the hook to return residents
    (useResidents as jest.Mock).mockReturnValue({
      residents: mockResidents,
      isLoading: false,
      error: null
    })

    render(<DirectoryList />)
    
    // Check if resident cards are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Architect')).toBeInTheDocument()
  })

  it('should display empty state when no residents match filters', () => {
    // Mock the hook to return empty array
    (useResidents as jest.Mock).mockReturnValue({
      residents: [],
      isLoading: false,
      error: null
    })

    render(<DirectoryList />)
    
    // Check if empty state is displayed
    expect(screen.getByText('No residents found')).toBeInTheDocument()
  })

  it('should open resident modal when View Profile is clicked', async () => {
    // Mock the hook to return residents
    (useResidents as jest.Mock).mockReturnValue({
      residents: mockResidents,
      isLoading: false,
      error: null
    })

    render(<DirectoryList />)
    
    // Click the View Profile button for the first resident
    const user = userEvent.setup()
    const viewProfileButtons = screen.getAllByText('View Profile')
    await user.click(viewProfileButtons[0])
    
    // Check if modal is displayed
    await waitFor(() => {
      expect(screen.getByTestId('resident-modal')).toBeInTheDocument()
      expect(screen.getByTestId('modal-resident-name')).toHaveTextContent('John Doe')
    })
    
    // Close modal
    await user.click(screen.getByTestId('close-modal-btn'))
    
    // Check if modal is closed
    await waitFor(() => {
      expect(screen.queryByTestId('resident-modal')).not.toBeInTheDocument()
    })
  })
})