// src/lib/server/activity-logger.ts
import { getDatabase } from '@/lib/mongodb';
import { pusherServer } from '@/lib/pusher-server';
import { ActivityLog } from '@/types/activity';

export interface ActivityLogData {
  userId?: string;
  userName?: string;
  username?: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class ActivityLogger {
  private static async logToDatabase(data: ActivityLogData, request?: Request): Promise<ActivityLog> {
    const db = await getDatabase();
    const activityLogs = db.collection('activity_logs');
    
    const logEntry = {
      userId: data.userId,
      userName: data.userName,
      username: data.username,
      action: data.action,
      description: data.description,
      timestamp: new Date(),
      ipAddress: data.ipAddress || request?.headers.get('x-forwarded-for') || 
                request?.headers.get('x-real-ip') || 'unknown',
      userAgent: data.userAgent || request?.headers.get('user-agent'),
      metadata: data.metadata || {}
    };

    const result = await activityLogs.insertOne(logEntry);
    
    // Convert to frontend type format
    const formattedLog: ActivityLog = {
      _id: result.insertedId.toString(),
      userId: logEntry.userId || '',
      userName: logEntry.userName || '',
      username: logEntry.username,
      action: logEntry.action,
      description: logEntry.description,
      timestamp: logEntry.timestamp.toISOString(),
      ipAddress: logEntry.ipAddress,
      metadata: logEntry.metadata
    };

    return formattedLog;
  }

  private static async triggerRealTimeUpdate(log: ActivityLog) {
    try {
      await pusherServer.trigger('activity-logs', 'new-activity', {
        log,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Pusher activity log error:', error);
    }
  }

  // Main logging method - returns the created log for real-time
  static async log(data: ActivityLogData, request?: Request): Promise<ActivityLog> {
    try {
      const log = await this.logToDatabase(data, request);
      
      // Trigger real-time update (fire and forget)
      this.triggerRealTimeUpdate(log);
      
      return log;
    } catch (error) {
      console.error('Activity logging failed:', error);
      // Return a fallback log object
      return {
        _id: 'error',
        userId: data.userId || '',
        userName: data.userName || '',
        username: data.username,
        action: data.action,
        description: data.description,
        timestamp: new Date().toISOString(),
        ipAddress: data.ipAddress,
        metadata: data.metadata
      };
    }
  }

  // Convenience methods that return the created log
  static async logLogin(user: any, rememberMe: boolean, isSessionTakeover: boolean, request?: Request) {
    return this.log({
      userId: user._id.toString(),
      userName: user.name,
      username: user.username,
      action: 'LOGIN',
      description: `@${user.username} logged in ${rememberMe ? 'with "Remember Me"' : ''}${isSessionTakeover ? ' (session takeover)' : ''}`,
      metadata: { sessionType: rememberMe ? 'extended' : 'standard', isSessionTakeover }
    }, request);
  }

  static async logLogout(user: any, request?: Request) {
    return this.log({
      userId: user._id.toString(),
      userName: user.name,
      username: user.username,
      action: 'LOGOUT',
      description: `@${user.username} logged out`
    }, request);
  }

  static async logSessionTakeover(user: any, previousSession: any, request?: Request) {
    return this.log({
      userId: user._id.toString(),
      userName: user.name,
      username: user.username,
      action: 'SESSION_TAKEOVER',
      description: `@${user.username} session takeover`,
      metadata: { previousSession }
    }, request);
  }

  static async logPasswordChange(user: any, request?: Request) {
    return this.log({
      userId: user._id.toString(),
      userName: user.name,
      username: user.username,
      action: 'PASSWORD_CHANGE',
      description: `@${user.username} changed password`
    }, request);
  }

  static async logUserCreation(createdBy: any, newUser: any, request?: Request) {
    return this.log({
      userId: createdBy._id.toString(),
      userName: createdBy.name,
      username: createdBy.username,
      action: 'CREATE_USER',
      description: `Created user @${newUser.username}`,
      metadata: { createdUser: newUser }
    }, request);
  }

  static async logUserDeletion(deletedBy: any, deletedUser: any, request?: Request) {
    return this.log({
      userId: deletedBy._id.toString(),
      userName: deletedBy.name,
      username: deletedBy.username,
      action: 'DELETE_USER',
      description: `Deleted user @${deletedUser.username}`,
      metadata: { deletedUser }
    }, request);
  }

  static async logError(action: string, error: Error, request?: Request) {
    return this.log({
      action: `${action}_ERROR`,
      description: `Error in ${action}`,
      metadata: { error: error.message }
    }, request);
  }
}