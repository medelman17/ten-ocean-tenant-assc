/**
 * Type definitions for all events used in the Inngest workflows.
 * This ensures consistent event schemas across the application.
 */
export interface Events {
  // User-related events
  "user/registered": {
    data: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      unitId?: string;
      createdAt: string;
    };
  };
  
  "user/verified": {
    data: {
      userId: string;
      verifiedBy: string;
      timestamp: string;
      notes?: string;
    };
  };
  
  "user/rejected": {
    data: {
      userId: string;
      rejectedBy: string;
      timestamp: string;
      reason?: string;
    };
  };
  
  "user/profile.updated": {
    data: {
      userId: string;
      updatedFields: string[];
      timestamp: string;
    };
  };
  
  "user/status.changed": {
    data: {
      userId: string;
      oldStatus: string;
      newStatus: string;
      timestamp: string;
      changedBy: string;
    };
  };

  // Notification events
  "notification/email.send": {
    data: {
      to: string;
      subject: string;
      template: string;
      templateData: Record<string, unknown>;
      timestamp: string;
    };
  };
  
  "notification/push.send": {
    data: {
      userId: string;
      title: string;
      body: string;
      data?: Record<string, unknown>;
      timestamp: string;
    };
  };
  
  "notification/digest.generate": {
    data: {
      userId: string;
      period: "daily" | "weekly" | "monthly";
      timestamp: string;
    };
  };

  // Community events
  "event/created": {
    data: {
      eventId: string;
      title: string;
      createdBy: string;
      startTime: string;
      endTime: string;
      timestamp: string;
    };
  };
  
  "event/updated": {
    data: {
      eventId: string;
      updatedBy: string;
      updatedFields: string[];
      timestamp: string;
    };
  };
  
  "event/reminder": {
    data: {
      eventId: string;
      title: string;
      startTime: string;
      attendeeIds: string[];
      timestamp: string;
    };
  };
  
  "event/rsvp.changed": {
    data: {
      eventId: string;
      userId: string;
      status: "going" | "maybe" | "not_going";
      timestamp: string;
    };
  };

  // Maintenance events
  "maintenance/request.created": {
    data: {
      requestId: string;
      title: string;
      reportedBy: string;
      unitId: string;
      priority: string;
      timestamp: string;
    };
  };
  
  "maintenance/request.assigned": {
    data: {
      requestId: string;
      assignedTo: string;
      assignedBy: string;
      timestamp: string;
    };
  };
  
  "maintenance/request.updated": {
    data: {
      requestId: string;
      updatedBy: string;
      updatedFields: string[];
      timestamp: string;
    };
  };
  
  "maintenance/request.resolved": {
    data: {
      requestId: string;
      resolvedBy: string;
      resolutionNotes: string;
      timestamp: string;
    };
  };

  // Forum events
  "forum/topic.created": {
    data: {
      topicId: string;
      title: string;
      authorId: string;
      categoryId: string;
      timestamp: string;
    };
  };
  
  "forum/post.created": {
    data: {
      postId: string;
      topicId: string;
      authorId: string;
      content: string;
      timestamp: string;
    };
  };
  
  "forum/mention": {
    data: {
      postId: string;
      topicId: string;
      authorId: string;
      mentionedUserId: string;
      timestamp: string;
    };
  };
}