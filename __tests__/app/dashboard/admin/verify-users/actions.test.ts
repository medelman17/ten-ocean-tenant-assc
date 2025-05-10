import { approveUser, rejectUser } from '@/app/dashboard/admin/verify-users/actions';
import { createClient } from '@/lib/supabase/server';
import { inngest } from '@/lib/inngest/client';
import { revalidatePath } from 'next/cache';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/inngest/client', () => ({
  inngest: {
    send: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('User Verification Actions', () => {
  let mockFormData: FormData;
  const mockUserId = 'user-123';
  const mockVerifierId = 'admin-456';
  const mockUser = { id: mockVerifierId };
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up form data mock
    mockFormData = new FormData();
    mockFormData.append('userId', mockUserId);
    
    // Set up Supabase client mock
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    
    // Set up Inngest mock
    (inngest.send as jest.Mock).mockResolvedValue(undefined);
  });

  describe('approveUser', () => {
    it('should return error if userId is missing', async () => {
      const emptyFormData = new FormData();
      const result = await approveUser(emptyFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'User ID is required',
      });
      expect(inngest.send).not.toHaveBeenCalled();
    });

    it('should return error if user is not logged in', async () => {
      // Mock user not logged in
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const result = await approveUser(mockFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to approve users',
      });
      expect(inngest.send).not.toHaveBeenCalled();
    });

    it('should send Inngest event with correct data when approving user', async () => {
      // Add notes to form data
      mockFormData.append('notes', 'Verified in person');
      
      // Mock date for consistent testing
      const mockDate = '2025-05-10T12:00:00.000Z';
      jest.spyOn(global.Date.prototype, 'toISOString').mockReturnValue(mockDate);
      
      const result = await approveUser(mockFormData);
      
      expect(result).toEqual({
        success: true,
        message: 'User approved successfully',
      });
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'user/verified',
        data: {
          userId: mockUserId,
          verifiedBy: mockVerifierId,
          timestamp: mockDate,
          notes: 'Verified in person',
        },
      });
      
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/admin/verify-users');
    });

    it('should handle empty notes', async () => {
      const result = await approveUser(mockFormData);
      
      expect(result.success).toBe(true);
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'user/verified',
        data: expect.objectContaining({
          userId: mockUserId,
          verifiedBy: mockVerifierId,
          notes: undefined,
        }),
      });
    });

    it('should handle Inngest error', async () => {
      // Mock Inngest throwing an error
      (inngest.send as jest.Mock).mockRejectedValue(new Error('Inngest error'));
      
      const result = await approveUser(mockFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'Failed to approve user',
      });
    });
  });

  describe('rejectUser', () => {
    it('should return error if userId is missing', async () => {
      const emptyFormData = new FormData();
      const result = await rejectUser(emptyFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'User ID is required',
      });
      expect(inngest.send).not.toHaveBeenCalled();
    });

    it('should return error if user is not logged in', async () => {
      // Mock user not logged in
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
      
      const result = await rejectUser(mockFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'You must be logged in to reject users',
      });
      expect(inngest.send).not.toHaveBeenCalled();
    });

    it('should send Inngest event with correct data when rejecting user', async () => {
      // Add rejection reason to form data
      mockFormData.append('reason', 'Incorrect information provided');
      
      // Mock date for consistent testing
      const mockDate = '2025-05-10T12:00:00.000Z';
      jest.spyOn(global.Date.prototype, 'toISOString').mockReturnValue(mockDate);
      
      const result = await rejectUser(mockFormData);
      
      expect(result).toEqual({
        success: true,
        message: 'User rejected successfully',
      });
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'user/rejected',
        data: {
          userId: mockUserId,
          rejectedBy: mockVerifierId,
          timestamp: mockDate,
          reason: 'Incorrect information provided',
        },
      });
      
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/admin/verify-users');
    });

    it('should handle empty reason', async () => {
      const result = await rejectUser(mockFormData);
      
      expect(result.success).toBe(true);
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'user/rejected',
        data: expect.objectContaining({
          userId: mockUserId,
          rejectedBy: mockVerifierId,
          reason: undefined,
        }),
      });
    });

    it('should handle Inngest error', async () => {
      // Mock Inngest throwing an error
      (inngest.send as jest.Mock).mockRejectedValue(new Error('Inngest error'));
      
      const result = await rejectUser(mockFormData);
      
      expect(result).toEqual({
        success: false,
        error: 'Failed to reject user',
      });
    });
  });
});