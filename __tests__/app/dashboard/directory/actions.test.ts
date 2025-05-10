import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { fetchVerifiedResidents, fetchAvailableFloors } from '@/app/dashboard/directory/actions'
import { withRoleAuth } from '@/lib/supabase/auth-middleware'
import * as serverModule from '@/lib/supabase/server'
import { ResidentProfile } from '@/lib/types/directory'

// Mock dependencies
jest.mock('@/lib/supabase/auth-middleware', () => ({
  withRoleAuth: jest.fn()
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Directory Actions', () => {
  const mockUser = { id: 'test-user-id' }
  const mockProfile = { verification_status: 'approved' }
  const mockVerifiedResidents = [
    {
      id: 'user1',
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'JD',
      bio: 'Test bio',
      phone: '123-456-7890',
      profile_picture_url: null,
      occupation: 'Developer',
      move_in_date: '2023-01-01',
      residency_status: 'current',
      languages_spoken: ['English', 'Spanish'],
      social_media_links: {},
      unit_id: 'unit1',
      units: {
        id: 'unit1',
        unit_number: '101',
        floor: 1
      },
      user_skills: [
        {
          skills: ['Coding', 'Design'],
          interests: ['Music', 'Reading'],
          community_involvement: ['Community Garden']
        }
      ]
    }
  ]
  
  const mockFormattedResidents: ResidentProfile[] = [
    {
      id: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      displayName: 'JD',
      bio: 'Test bio',
      phone: '123-456-7890',
      profilePictureUrl: null,
      occupation: 'Developer',
      moveInDate: '2023-01-01',
      residencyStatus: 'current',
      languagesSpoken: ['English', 'Spanish'],
      socialMediaLinks: {},
      unit: {
        id: 'unit1',
        unitNumber: '101',
        floor: 1
      },
      skills: ['Coding', 'Design'],
      interests: ['Music', 'Reading'],
      communityInvolvement: ['Community Garden']
    }
  ]
  
  const mockFloors = [
    { floor: 1 },
    { floor: 2 },
    { floor: 3 }
  ]
  
  // Mock Supabase client
  const mockSupabaseSelect = jest.fn()
  const mockSupabaseEq = jest.fn()
  const mockSupabaseFilter = jest.fn()
  const mockSupabaseNot = jest.fn()
  const mockSupabaseOrder = jest.fn()
  const mockSupabaseFrom = jest.fn().mockReturnValue({
    select: mockSupabaseSelect.mockReturnThis(),
    eq: mockSupabaseEq.mockReturnThis(),
    filter: mockSupabaseFilter.mockReturnThis(),
    not: mockSupabaseNot.mockReturnThis(),
    order: mockSupabaseOrder.mockReturnThis()
  })
  
  const mockSupabaseClient = {
    from: mockSupabaseFrom
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock withRoleAuth to return a verified user
    const mockWithRoleAuth = withRoleAuth as jest.Mock
    mockWithRoleAuth.mockResolvedValue({ user: mockUser, profile: mockProfile })
    
    // Mock createClient to return our mock Supabase client
    const mockCreateClient = serverModule.createClient as jest.Mock
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
  })
  
  describe('fetchVerifiedResidents', () => {
    it('should fetch and format resident profiles', async () => {
      // Setup mock response for fetchVerifiedResidents
      mockSupabaseSelect.mockImplementation(() => ({
        eq: mockSupabaseEq.mockImplementation(() => ({
          eq: mockSupabaseEq.mockImplementation(() => ({
            not: mockSupabaseNot.mockReturnValue({
              data: mockVerifiedResidents,
              error: null
            })
          }))
        }))
      }))
      
      const result = await fetchVerifiedResidents()
      
      // Verify the auth check was performed
      expect(withRoleAuth).toHaveBeenCalled()
      
      // Verify correct API calls were made
      expect(serverModule.createClient).toHaveBeenCalled()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('user_profiles')
      expect(mockSupabaseEq).toHaveBeenCalledWith('verification_status', 'approved')
      expect(mockSupabaseEq).toHaveBeenCalledWith('residency_status', 'current')
      expect(mockSupabaseNot).toHaveBeenCalledWith('profile_visibility', 'eq', 'private')
      
      // Verify the result is correctly formatted
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        // ... other properties in camelCase
      })
      expect(result[0].unit).toMatchObject({
        id: 'unit1',
        unitNumber: '101',
        floor: 1
      })
    })
    
    it('should throw error if user is not verified', async () => {
      // Mock unverified user
      const mockWithRoleAuth = withRoleAuth as jest.Mock
      mockWithRoleAuth.mockResolvedValue({ 
        user: mockUser, 
        profile: { verification_status: 'pending' } 
      })
      
      await expect(fetchVerifiedResidents()).rejects.toThrow('Only verified residents can access the directory')
    })
    
    it('should throw error if database query fails', async () => {
      // Setup mock error response
      mockSupabaseSelect.mockImplementation(() => ({
        eq: mockSupabaseEq.mockImplementation(() => ({
          eq: mockSupabaseEq.mockImplementation(() => ({
            not: mockSupabaseNot.mockReturnValue({
              data: null,
              error: new Error('Database error')
            })
          }))
        }))
      }))
      
      await expect(fetchVerifiedResidents()).rejects.toThrow('Failed to fetch residents')
    })
  })
  
  describe('fetchAvailableFloors', () => {
    it('should fetch and return unique floor numbers', async () => {
      // Setup mock response for fetchAvailableFloors
      mockSupabaseSelect.mockImplementation(() => ({
        filter: mockSupabaseFilter.mockImplementation(() => ({
          order: mockSupabaseOrder.mockReturnValue({
            data: mockFloors,
            error: null
          })
        }))
      }))
      
      const result = await fetchAvailableFloors()
      
      // Verify the auth check was performed
      expect(withRoleAuth).toHaveBeenCalled()
      
      // Verify correct API calls were made
      expect(serverModule.createClient).toHaveBeenCalled()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('units')
      expect(mockSupabaseFilter).toHaveBeenCalled()
      expect(mockSupabaseOrder).toHaveBeenCalledWith('floor', { ascending: true })
      
      // Verify the result is correctly formatted
      expect(result).toEqual([1, 2, 3])
    })
    
    it('should throw error if user is not verified', async () => {
      // Mock unverified user
      const mockWithRoleAuth = withRoleAuth as jest.Mock
      mockWithRoleAuth.mockResolvedValue({ 
        user: mockUser, 
        profile: { verification_status: 'pending' } 
      })
      
      await expect(fetchAvailableFloors()).rejects.toThrow('Only verified residents can access the directory')
    })
    
    it('should throw error if database query fails', async () => {
      // Setup mock error response
      mockSupabaseSelect.mockImplementation(() => ({
        filter: mockSupabaseFilter.mockImplementation(() => ({
          order: mockSupabaseOrder.mockReturnValue({
            data: null,
            error: new Error('Database error')
          })
        }))
      }))
      
      await expect(fetchAvailableFloors()).rejects.toThrow('Failed to fetch floors')
    })
  })
})