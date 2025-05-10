import { describe, expect, it, jest, beforeEach } from '@jest/globals'
import { getUserRoles, checkUserAccess } from '@/lib/utils/roles'
import { Roles } from '@/lib/types/roles'

// We need to mock the modules before importing the middleware
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockReturnValue({ type: 'next' }),
    redirect: jest.fn().mockImplementation(url => ({ type: 'redirect', url }))
  }
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn()
}))

jest.mock('@/lib/utils/roles', () => ({
  getUserRoles: jest.fn(),
  checkUserAccess: jest.fn()
}))

// Now import the middleware after mocking dependencies
import { withRoleAuth, adminOnly, floorCaptainOnly, residentsOnly } from '@/lib/supabase/auth-middleware'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

describe('Auth Middleware', () => {
  // Mock data and objects
  const mockUserId = 'user-123'
  const mockUser = { id: mockUserId }

  // Create a mock NextRequest object without using the actual type
  const createMockRequest = () => ({
    nextUrl: {
      pathname: '/dashboard/admin',
      searchParams: {
        set: jest.fn()
      },
      clone: function() {
        return {
          pathname: this.pathname,
          searchParams: {
            set: jest.fn()
          }
        }
      }
    },
    cookies: {
      getAll: jest.fn().mockReturnValue([]),
      set: jest.fn()
    }
  })

  // Mock Supabase client
  const mockSupabase = {
    auth: {
      getUser: jest.fn()
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mocks
    (createServerClient as jest.Mock).mockReturnValue(mockSupabase)
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } })
    
    // Mock getUserRoles and checkUserAccess
    (getUserRoles as jest.Mock).mockResolvedValue({
      id: mockUserId,
      roles: [{ name: 'Admin', permissions: {} }],
      hasRole: (role: string) => role === 'Admin',
      hasPermission: () => true
    })
    
    (checkUserAccess as jest.Mock).mockReturnValue({
      hasRole: true,
      hasPermission: true,
      missingRoles: [],
      missingPermissions: []
    })
  })

  describe('withRoleAuth function', () => {
    it('should redirect to login if no user is found', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      // Mock user not logged in
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      await withRoleAuth(mockRequest as any)
      
      // Since NextResponse is mocked as an object with mock functions
      expect(NextResponse.redirect).toHaveBeenCalled()
      // Get the first argument of the first call
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectUrl.pathname).toBe('/login')
    })

    it('should allow access if user is logged in and no roles are required', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      await withRoleAuth(mockRequest as any, {})
      
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should check user roles when roles are required', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      await withRoleAuth(mockRequest as any, {
        requiredRoles: ['Admin']
      })
      
      expect(getUserRoles).toHaveBeenCalledWith(mockSupabase, mockUserId)
      expect(checkUserAccess).toHaveBeenCalled()
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should redirect to error page if user lacks required roles', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      // Mock role check failure
      (checkUserAccess as jest.Mock).mockReturnValue({
        hasRole: false,
        hasPermission: true,
        missingRoles: ['Admin'],
        missingPermissions: []
      })
      
      await withRoleAuth(mockRequest as any, {
        requiredRoles: ['Admin']
      })
      
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectUrl.pathname).toBe('/error')
    })

    it('should redirect to error page if user lacks required permissions', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      // Mock permission check failure
      (checkUserAccess as jest.Mock).mockReturnValue({
        hasRole: true,
        hasPermission: false,
        missingRoles: [],
        missingPermissions: ['can_manage_users']
      })
      
      await withRoleAuth(mockRequest as any, {
        requiredPermissions: ['can_manage_users']
      })
      
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectUrl.pathname).toBe('/error')
    })

    it('should use custom redirect path if provided', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      // Mock user not logged in
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } })
      
      await withRoleAuth(mockRequest as any, {
        redirectTo: '/custom-login'
      })
      
      expect(NextResponse.redirect).toHaveBeenCalled()
      const redirectUrl = (NextResponse.redirect as jest.Mock).mock.calls[0][0]
      expect(redirectUrl.pathname).toBe('/custom-login')
    })
  })

  describe('Helper functions', () => {
    it('adminOnly should require Admin role', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()

      await adminOnly(mockRequest as any)
      
      // Extract the options passed to withRoleAuth
      const options = (getUserRoles as jest.Mock).mock.calls[0][1]
      
      // Verify the correct roles were checked
      expect(checkUserAccess).toHaveBeenCalledWith(
        expect.anything(),
        ['Admin'],
        expect.anything()
      )
    })

    it('floorCaptainOnly should allow Admin or FloorCaptain roles', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      await floorCaptainOnly(mockRequest as any)
      
      // Verify the correct roles were checked
      expect(checkUserAccess).toHaveBeenCalledWith(
        expect.anything(),
        ['Admin', 'FloorCaptain'],
        expect.anything()
      )
    })

    it('residentsOnly should allow Admin, FloorCaptain, or Resident roles', async () => {
      // Create a fresh request for this test
      const mockRequest = createMockRequest()
      
      await residentsOnly(mockRequest as any)
      
      // Verify the correct roles were checked
      expect(checkUserAccess).toHaveBeenCalledWith(
        expect.anything(),
        ['Admin', 'FloorCaptain', 'Resident'],
        expect.anything()
      )
    })
  })
})