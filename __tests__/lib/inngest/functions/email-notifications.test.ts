import { emailNotificationService } from '@/lib/inngest/functions/email-notifications';
import nodemailer from 'nodemailer';

// Mock dependencies
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id',
      response: 'mock-response',
    }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://ethereal.email/message/mock-id'),
}));

describe('Email Notification Service', () => {
  // Mock data
  const mockTo = 'user@example.com';
  const mockTemplate = 'user-verification-approved';
  const mockTimestamp = '2025-05-10T12:00:00.000Z';
  const mockTemplateData = {
    userName: 'John Doe',
    loginLink: 'https://example.com/login',
  };

  // Mock environment
  const originalEnv = process.env;
  const mockStep = {
    run: jest.fn().mockImplementation((name, fn) => fn()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup environment variables
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      EMAIL_FROM: 'noreply@example.com',
    };
  });

  afterEach(() => {
    // Restore environment variables
    process.env = originalEnv;
  });

  it('should exist and be defined correctly', () => {
    expect(emailNotificationService).toBeDefined();
    expect(emailNotificationService.config.id).toBe('email-notification-service');
    expect(emailNotificationService.eventTrigger.event).toBe('notification/email.send');
    expect(typeof emailNotificationService.handler).toBe('function');
  });

  it('should handle email sending in development environment', async () => {
    // Setup test account
    const mockTestAccount = {
      user: 'testuser',
      pass: 'testpass',
    };
    
    // Mock nodemailer.createTestAccount
    jest.spyOn(nodemailer, 'createTestAccount').mockResolvedValue(mockTestAccount);
    
    const mockEvent = {
      data: {
        to: mockTo,
        template: mockTemplate,
        templateData: mockTemplateData,
        timestamp: mockTimestamp,
      },
    };

    // Execute the handler function
    const result = await emailNotificationService.handler({ event: mockEvent, step: mockStep } as any);

    // Assertions
    expect(mockStep.run).toHaveBeenCalledWith('send-email', expect.any(Function));
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: mockTestAccount.user,
        pass: mockTestAccount.pass,
      },
    });
    
    // Check transporter.sendMail was called with the right parameters
    const mockTransporter = nodemailer.createTransport();
    expect(mockTransporter.sendMail).toHaveBeenCalledWith({
      from: process.env.EMAIL_FROM,
      to: mockTo,
      subject: expect.any(String),
      html: expect.any(String),
    });
    
    // Check the final result
    expect(result).toEqual({
      success: true,
      timestamp: mockTimestamp,
      emailResult: {
        messageId: 'mock-message-id',
        previewUrl: 'https://ethereal.email/message/mock-id',
        success: true,
      },
      template: mockTemplate,
      recipient: mockTo,
    });
  });

  it('should handle email sending in production environment', async () => {
    // Set NODE_ENV to production
    process.env.NODE_ENV = 'production';
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_SECURE = 'false';
    process.env.EMAIL_USER = 'user';
    process.env.EMAIL_PASSWORD = 'password';
    
    const mockEvent = {
      data: {
        to: mockTo,
        template: mockTemplate,
        templateData: mockTemplateData,
        timestamp: mockTimestamp,
      },
    };

    // Execute the handler function
    const result = await emailNotificationService.handler({ event: mockEvent, step: mockStep } as any);

    // Assertions
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'user',
        pass: 'password',
      },
    });
    
    expect(result.success).toBe(true);
  });

  it('should throw an error for missing required fields', async () => {
    const mockEvent = {
      data: {
        // Missing 'to' field
        template: mockTemplate,
        templateData: mockTemplateData,
        timestamp: mockTimestamp,
      },
    };

    // Expect the function to throw an error
    await expect(
      emailNotificationService.handler({ event: mockEvent, step: mockStep } as any)
    ).rejects.toThrow('Missing required fields for email notification');
  });

  it('should throw an error for invalid template', async () => {
    const mockEvent = {
      data: {
        to: mockTo,
        template: 'non-existent-template',
        templateData: mockTemplateData,
        timestamp: mockTimestamp,
      },
    };

    // Expect the function to throw an error
    await expect(
      emailNotificationService.handler({ event: mockEvent, step: mockStep } as any)
    ).rejects.toThrow('Email template \'non-existent-template\' not found');
  });
});