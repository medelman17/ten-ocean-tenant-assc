import { inngest } from "../client";
import nodemailer from "nodemailer";
import { compile } from "handlebars";

// Define email templates
interface EmailTemplate {
  subject: string;
  body: string;
}

// Email templates for user verification
const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  "user-verification": {
    subject: "New User Verification Required",
    body: `
      <h1>New User Verification Required</h1>
      <p>Hello {{approverName}},</p>
      <p>A new user has registered for the 10 Ocean Tenant Association and requires verification:</p>
      <ul>
        <li><strong>Name:</strong> {{userName}}</li>
        <li><strong>Email:</strong> {{userEmail}}</li>
      </ul>
      <p>Please review this user's information and verify their account.</p>
      <p><a href="{{verificationLink}}" target="_blank">Click here to review this user</a></p>
      <p>Thank you for your help maintaining our community!</p>
      <p>- 10 Ocean Tenant Association</p>
    `
  },
  "user-verification-approved": {
    subject: "Your Account Has Been Verified",
    body: `
      <h1>Account Verification Approved</h1>
      <p>Hello {{userName}},</p>
      <p>Great news! Your 10 Ocean Tenant Association account has been verified and approved.</p>
      <p>You now have full access to all resident features, including:</p>
      <ul>
        <li>Community events and RSVPs</li>
        <li>Maintenance requests</li>
        <li>Resident directory</li>
        <li>Building announcements</li>
        <li>Community forum</li>
      </ul>
      <p><a href="{{loginLink}}" target="_blank">Click here to log in to your account</a></p>
      <p>Welcome to our community!</p>
      <p>- 10 Ocean Tenant Association</p>
    `
  },
  "user-verification-rejected": {
    subject: "Account Verification Status",
    body: `
      <h1>Account Verification Update</h1>
      <p>Hello {{userName}},</p>
      <p>We've reviewed your application for the 10 Ocean Tenant Association, and unfortunately, we were unable to verify your account at this time.</p>
      <p><strong>Reason:</strong> {{reason}}</p>
      <p>If you believe this is an error or would like more information, please contact our management team at {{contactEmail}}.</p>
      <p>- 10 Ocean Tenant Association</p>
    `
  }
};

/**
 * Email Notification Service
 * 
 * This function handles the email.send events and sends actual emails
 * using the specified template and data.
 */
export const emailNotificationService = inngest.createFunction(
  { id: "email-notification-service" },
  { event: "notification/email.send" },
  async ({ event, step }) => {
    const { to, template, templateData, timestamp } = event.data;
    
    // Validate required fields
    if (!to || !template) {
      throw new Error("Missing required fields for email notification");
    }
    
    // Get the template
    const emailTemplate = EMAIL_TEMPLATES[template];
    if (!emailTemplate) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    // Compile the template with Handlebars
    const compiledSubject = compile(emailTemplate.subject)(templateData);
    const compiledBody = compile(emailTemplate.body)(templateData);
    
    // Send the email using environment variables
    const emailResult = await step.run("send-email", async () => {
      // Create a test/development email transporter when not in production
      let transporter;
      
      if (process.env.NODE_ENV === "production") {
        // Use real email service in production
        transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT) || 587,
          secure: process.env.EMAIL_SECURE === "true",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
          },
        });
      } else {
        // Use ethereal.email for testing in development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      }
      
      // Send the email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"10 Ocean Tenant Association" <no-reply@example.com>',
        to: to,
        subject: compiledSubject,
        html: compiledBody,
      });
      
      return {
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
        success: true,
      };
    });
    
    // Return the result
    return {
      success: true,
      timestamp,
      emailResult,
      template,
      recipient: to,
    };
  }
);

const emailFunctions = { emailNotificationService };
export default emailFunctions;