import { 
  userApprovalWorkflow, 
  userRejectionWorkflow, 
  userVerificationWorkflow 
} from '@/lib/inngest/functions/user-verification';
import { createServiceClient } from '@/lib/supabase/service-client';
import { inngest } from '@/lib/inngest/client';

// Mock dependencies
jest.mock('@/lib/supabase/service-client', () => ({
  createServiceClient: jest.fn(),
}));

jest.mock('@/lib/inngest/client', () => ({
  inngest: {
    send: jest.fn(),
    createFunction: jest.fn().mockImplementation((config, eventTrigger, handler) => {
      return { config, eventTrigger, handler };
    }),
  },
}));

describe('User Verification Inngest Workflows', () => {
  // Mock data
  const mockUserId = 'user-123';
  const mockVerifierId = 'admin-456';
  const mockTimestamp = '2025-05-10T12:00:00.000Z';
  const mockNotes = 'Verification notes';
  const mockReason = 'Rejection reason';
  const mockEmail = 'user@example.com';
  const mockFirstName = 'John';
  const mockLastName = 'Doe';
  const mockUnitId = 'unit-789';
  const mockFloor = 5;

  // Mock Supabase responses
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    auth: {
      admin: {
        getUserById: jest.fn(),
      },
    },
    order: jest.fn().mockReturnThis(),
  };

  // Mock step object
  const mockStep = {
    run: jest.fn().mockImplementation((name, fn) => fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createServiceClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Default mock responses for Supabase
    mockSupabase.select.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.in.mockReturnThis();
    mockSupabase.single.mockReturnValue({ data: { first_name: mockFirstName, last_name: mockLastName } });
    mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { email: mockEmail } } });
    
    // Reset the mocked 'from' function so we can set new returns for each test
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'user_profiles') {
        return mockSupabase;
      }
      if (table === 'floor_captain_assignments') {
        return mockSupabase;
      }
      if (table === 'units') {
        return { 
          ...mockSupabase,
          select: jest.fn().mockReturnValue({ 
            data: { floor: mockFloor }, 
            single: jest.fn().mockReturnValue({ data: { floor: mockFloor } }) 
          })
        };
      }
      if (table === 'user_roles') {
        return mockSupabase;
      }
      return mockSupabase;
    });
    
    // Mock inngest.send to return a resolved Promise
    (inngest.send as jest.Mock).mockResolvedValue(undefined);
  });

  describe('userVerificationWorkflow', () => {
    it('should exist and be defined correctly', () => {
      expect(userVerificationWorkflow).toBeDefined();
      expect(userVerificationWorkflow.config.id).toBe('user-verification-workflow');
      expect(userVerificationWorkflow.eventTrigger.event).toBe('user/registered');
      expect(typeof userVerificationWorkflow.handler).toBe('function');
    });

    it('should handle user registration workflow', async () => {
      const mockEvent = {
        data: {
          userId: mockUserId,
          email: mockEmail,
          firstName: mockFirstName,
          lastName: mockLastName,
          unitId: mockUnitId,
        },
      };

      // Setup mock response for the first step (update profile)
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ data: {}, error: null }),
      }));

      // Setup mock response for the find-approvers step
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ data: { floor: mockFloor } }),
      }));

      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [
          { 
            user_id: 'captain-123', 
            user_profiles: { 
              email: 'captain@example.com', 
              first_name: 'Floor', 
              last_name: 'Captain' 
            } 
          },
        ],
      }));

      // Execute the handler function
      const result = await userVerificationWorkflow.handler({ event: mockEvent, step: mockStep } as any);

      // Assertions
      expect(mockStep.run).toHaveBeenCalledWith('ensure-pending-verification', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('find-approvers', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('send-notifications', expect.any(Function));
      
      expect(result).toEqual({
        userId: mockUserId,
        verification: {
          status: 'pending',
          notifiedApprovers: expect.any(Number),
        },
      });
    });
  });

  describe('userApprovalWorkflow', () => {
    it('should exist and be defined correctly', () => {
      expect(userApprovalWorkflow).toBeDefined();
      expect(userApprovalWorkflow.config.id).toBe('user-approval-workflow');
      expect(userApprovalWorkflow.eventTrigger.event).toBe('user/verified');
      expect(typeof userApprovalWorkflow.handler).toBe('function');
    });

    it('should handle user approval workflow', async () => {
      const mockEvent = {
        data: {
          userId: mockUserId,
          verifiedBy: mockVerifierId,
          timestamp: mockTimestamp,
          notes: mockNotes,
        },
      };

      // Setup mock response for update-verification-status step
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ 
          data: { 
            first_name: mockFirstName, 
            last_name: mockLastName,
            display_name: `${mockFirstName} ${mockLastName}`,
          }, 
          error: null 
        }),
      }));

      // Mock getUserById response
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            email: mockEmail,
          },
        },
      });

      // Execute the handler function
      const result = await userApprovalWorkflow.handler({ event: mockEvent, step: mockStep } as any);

      // Assertions
      expect(mockStep.run).toHaveBeenCalledWith('update-verification-status', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('notify-user', expect.any(Function));
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'notification/email.send',
        data: expect.objectContaining({
          to: mockEmail,
          subject: expect.any(String),
          template: 'user-verification-approved',
        }),
      });
      
      expect(result).toEqual({
        userId: mockUserId,
        verification: {
          status: 'approved',
          verifiedBy: mockVerifierId,
          timestamp: mockTimestamp,
        },
      });
    });

    it('should handle errors during approval', async () => {
      const mockEvent = {
        data: {
          userId: mockUserId,
          verifiedBy: mockVerifierId,
          timestamp: mockTimestamp,
        },
      };

      // Simulate an error in the update step
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ data: null, error: new Error('Database error') }),
      }));

      // Expect the function to throw an error
      await expect(
        userApprovalWorkflow.handler({ event: mockEvent, step: mockStep } as any)
      ).rejects.toThrow('Failed to update user verification status');
    });
  });

  describe('userRejectionWorkflow', () => {
    it('should exist and be defined correctly', () => {
      expect(userRejectionWorkflow).toBeDefined();
      expect(userRejectionWorkflow.config.id).toBe('user-rejection-workflow');
      expect(userRejectionWorkflow.eventTrigger.event).toBe('user/rejected');
      expect(typeof userRejectionWorkflow.handler).toBe('function');
    });

    it('should handle user rejection workflow', async () => {
      const mockEvent = {
        data: {
          userId: mockUserId,
          rejectedBy: mockVerifierId,
          timestamp: mockTimestamp,
          reason: mockReason,
        },
      };

      // Setup mock response for update-verification-status step
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ 
          data: { 
            first_name: mockFirstName, 
            last_name: mockLastName,
            display_name: `${mockFirstName} ${mockLastName}`,
          }, 
          error: null 
        }),
      }));

      // Mock getUserById response
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: {
          user: {
            email: mockEmail,
          },
        },
      });

      // Execute the handler function
      const result = await userRejectionWorkflow.handler({ event: mockEvent, step: mockStep } as any);

      // Assertions
      expect(mockStep.run).toHaveBeenCalledWith('update-verification-status', expect.any(Function));
      expect(mockStep.run).toHaveBeenCalledWith('notify-user', expect.any(Function));
      
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'notification/email.send',
        data: expect.objectContaining({
          to: mockEmail,
          subject: expect.any(String),
          template: 'user-verification-rejected',
          templateData: expect.objectContaining({
            reason: mockReason,
          }),
        }),
      });
      
      expect(result).toEqual({
        userId: mockUserId,
        verification: {
          status: 'rejected',
          rejectedBy: mockVerifierId,
          timestamp: mockTimestamp,
          reason: mockReason,
        },
      });
    });

    it('should handle missing email in user record', async () => {
      const mockEvent = {
        data: {
          userId: mockUserId,
          rejectedBy: mockVerifierId,
          timestamp: mockTimestamp,
        },
      };

      // Setup mock response
      mockSupabase.from.mockImplementationOnce(() => ({
        ...mockSupabase,
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnValue({ data: {}, error: null }),
      }));

      // Mock getUserById with a null response
      mockSupabase.auth.admin.getUserById.mockResolvedValue({
        data: { user: null },
      });

      // Create a spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Execute the handler function
      const result = await userRejectionWorkflow.handler({ event: mockEvent, step: mockStep } as any);

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Could not find user email for notification');
      
      // Verify that notification was skipped but workflow completed
      expect(result).toEqual({
        userId: mockUserId,
        verification: {
          status: 'rejected',
          rejectedBy: mockVerifierId,
          timestamp: mockTimestamp,
          reason: undefined,
        },
      });
      
      // Restore the console.error
      consoleErrorSpy.mockRestore();
    });
  });
});