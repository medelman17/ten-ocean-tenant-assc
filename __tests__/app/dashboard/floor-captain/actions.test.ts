import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { fetchAssignedFloors, fetchFloorInfo, fetchFloorResidents } from '@/app/dashboard/floor-captain/actions'
import { withRoleAuth } from '@/lib/supabase/auth-middleware'
import * as serverModule from '@/lib/supabase/server'

// Mock dependencies
jest.mock('@/lib/supabase/auth-middleware', () => ({
  withRoleAuth: jest.fn()
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

describe('Floor Captain Actions', () => {
  const mockUser = { 
    id: 'test-user-id',
    roles: ['FloorCaptain']
  }
  
  // Mock floor assignments
  const mockFloorAssignments = [
    {
      id: 'assignment1',
      user_id: 'test-user-id',
      floor_number: 1,
      assigned_at: '2023-05-01T00:00:00Z',
      assigned_by: null
    }
  ]
  
  // Mock units
  const mockUnits = [
    { id: 'unit1', floor: 1 },
    { id: 'unit2', floor: 1 }
  ]
  
  // Mock Supabase client
  const mockSupabaseSelect = jest.fn()
  const mockSupabaseEq = jest.fn()
  const mockSupabaseIn = jest.fn()
  const mockSupabaseOrder = jest.fn()
  const mockSupabaseFrom = jest.fn().mockReturnValue({
    select: mockSupabaseSelect.mockReturnThis(),
    eq: mockSupabaseEq.mockReturnThis(),
    in: mockSupabaseIn.mockReturnThis(),
    order: mockSupabaseOrder.mockReturnThis(),
    count: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          data: null,
          count: 5,
          error: null
        })
      })
    })
  })
  
  const mockSupabaseClient = {
    from: mockSupabaseFrom
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock withRoleAuth to return a floor captain user
    const mockWithRoleAuth = withRoleAuth as jest.Mock
    mockWithRoleAuth.mockResolvedValue({ user: mockUser })
    
    // Mock createClient to return our mock Supabase client
    const mockCreateClient = serverModule.createClient as jest.Mock
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
  })
  
  describe('fetchAssignedFloors', () => {
    it('should fetch and format floor assignments for floor captains', async () => {
      // Setup mock response for fetchAssignedFloors
      mockSupabaseSelect.mockImplementation(() => ({
        eq: mockSupabaseEq.mockImplementation(() => ({
          order: mockSupabaseOrder.mockReturnValue({
            data: mockFloorAssignments,
            error: null
          })
        }))
      }))
      
      const result = await fetchAssignedFloors()
      
      // Verify the auth check was performed
      expect(withRoleAuth).toHaveBeenCalled()
      
      // Verify correct API calls were made
      expect(serverModule.createClient).toHaveBeenCalled()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('floor_captain_assignments')
      expect(mockSupabaseEq).toHaveBeenCalledWith('user_id', 'test-user-id')
      
      // Verify the result is correctly formatted
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'assignment1',
        userId: 'test-user-id',
        floorNumber: 1
      })
    })
  })
  
  describe('fetchFloorInfo', () => {
    it('should fetch and return info about a floor', async () => {
      // Setup mock responses
      mockSupabaseSelect.mockImplementationOnce(() => ({
        eq: mockSupabaseEq.mockReturnValue({
          data: mockUnits,
          error: null
        })
      }))
      
      const result = await fetchFloorInfo(1)
      
      // Basic validation of the returned object
      expect(result).toMatchObject({
        floorNumber: 1,
        unitCount: expect.any(Number)
      })
    })
  })
  
  describe('fetchFloorResidents', () => {
    it('should fetch residents for a specific floor', async () => {
      // Setup mock responses for units query
      mockSupabaseSelect.mockImplementationOnce(() => ({
        eq: mockSupabaseEq.mockReturnValue({
          data: mockUnits,
          error: null
        })
      }))
      
      // Setup mock responses for residents query
      mockSupabaseSelect.mockImplementationOnce(() => ({
        in: mockSupabaseIn.mockReturnValue({
          order: mockSupabaseOrder.mockReturnValue({
            data: [], // No residents (for simplicity)
            error: null
          })
        })
      }))
      
      const result = await fetchFloorResidents(1)
      
      // Verify the results
      expect(Array.isArray(result)).toBe(true)
    })
  })
})