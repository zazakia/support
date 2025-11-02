import { supabase, getConnectionErrorMessage } from './supabaseClient';
import {
  Job,
  User,
  Technician,
  Branch,
  Part,
  Note,
  Notification,
  CreateJobRequest,
  UpdateJobRequest,
  AddNoteRequest,
  AddPartRequest,
  CreateUserRequest,
  UpdateUserRequest
} from '../types';

// Retry configuration
interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  retryableErrors: [
    'connection error',
    'network error',
    'timeout',
    'failed to fetch',
    'request aborted',
    'NetworkError',
    'ECONNRESET',
    'ETIMEDOUT'
  ]
};

// Connection error handling with retry logic
export async function withConnectionRetry<T>(
  operation: () => Promise<{ data: T; error: any }>,
  tableName: string,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<{ data: T | null; error: any }> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
    try {
      const result = await operation();

      if (result.error) {
        const errorMessage = result.error.message || String(result.error);
        const isRetryable = retryConfig.retryableErrors.some(errorType =>
          errorMessage.toLowerCase().includes(errorType)
        );

        if (isRetryable && attempt < retryConfig.maxAttempts) {
          console.log(`⚠️  ${tableName} operation failed (attempt ${attempt}/${retryConfig.maxAttempts}): ${errorMessage}`);

          // Calculate delay with exponential backoff
          const delay = Math.min(
            retryConfig.baseDelay * Math.pow(2, attempt - 1),
            retryConfig.maxDelay
          );

          console.log(`⏳ Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          // Not retryable or max attempts reached
          const diagnosis = require('./connectionValidator').diagnoseConnectionIssue(result.error);
          console.log(`🔍 ${tableName} diagnosis:`, diagnosis);

          return {
            data: null,
            error: {
              ...result.error,
              userFriendlyMessage: getConnectionErrorMessage(result.error),
              diagnosis: diagnosis,
              tableName,
              attempt
            }
          };
        }
      }

      // Success
      return { data: result.data, error: null };

    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || String(error);
      const isRetryable = retryConfig.retryableErrors.some(errorType =>
        errorMessage.toLowerCase().includes(errorType)
      );

      if (isRetryable && attempt < retryConfig.maxAttempts) {
        console.log(`⚠️  ${tableName} operation exception (attempt ${attempt}/${retryConfig.maxAttempts}): ${errorMessage}`);

        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt - 1),
          retryConfig.maxDelay
        );

        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        // Not retryable or max attempts reached
        const diagnosis = require('./connectionValidator').diagnoseConnectionIssue(error);
        console.log(`🔍 ${tableName} diagnosis:`, diagnosis);

        return {
          data: null,
          error: {
            ...error,
            userFriendlyMessage: getConnectionErrorMessage(error),
            diagnosis: diagnosis,
            tableName,
            attempt,
            isException: true
          }
        };
      }
    }
  }

  // If we get here, all attempts failed
  return {
    data: null,
    error: lastError
  };
}

// Health check function
export async function healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];

  try {
    // Test basic connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      issues.push(`Database connectivity: ${error.message}`);
    }
  } catch (error: any) {
    issues.push(`Health check failed: ${error.message}`);
  }

  return {
    healthy: issues.length === 0,
    issues
  };
}

// Job CRUD Operations
export const jobApi = {
  async getAll(queryParams?: any): Promise<Job[]> {
    const result = await withConnectionRetry(async () => {
      let query = supabase
        .from('greenware717_jobs')
        .select(`
          *,
          customer:greenware717_users!greenware717_jobs_customer_id_fkey(*),
          technician:greenware717_users!greenware717_jobs_technician_id_fkey(*),
          parts:greenware717_parts(*),
          notes:greenware717_notes(*)
        `);

      if (queryParams?.status) {
        query = query.in('status', queryParams.status);
      }
      if (queryParams?.priority) {
        query = query.in('priority', queryParams.priority);
      }
      if (queryParams?.technicianId) {
        query = query.eq('technician_id', queryParams.technicianId);
      }
      if (queryParams?.search) {
        query = query.or(`customer_name.ilike.%${queryParams.search}%,device_type.ilike.%${queryParams.search}%,device_model.ilike.%${queryParams.search}%`);
      }

      return query.order('created_at', { ascending: false });
    }, 'jobs');

    if (result.error) {
      console.error('Job API getAll error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async getById(id: string): Promise<Job | null> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_jobs')
        .select(`
          *,
          customer:greenware717_users!greenware717_jobs_customer_id_fkey(*),
          technician:greenware717_users!greenware717_jobs_technician_id_fkey(*),
          parts:greenware717_parts(*),
          notes:greenware717_notes(*)
        `)
        .eq('id', id)
        .single();
    }, 'jobs');

    if (result.error) {
      console.error('Job API getById error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async create(jobData: CreateJobRequest): Promise<Job> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_jobs')
        .insert([{
          id: `J${Date.now()}`,
          customer_name: jobData.customerName,
          customer_phone: jobData.customerPhone,
          customer_email: jobData.customerEmail,
          device_type: jobData.deviceType,
          device_model: jobData.deviceModel,
          device_serial: jobData.deviceSerial,
          issue_description: jobData.issueDescription,
          priority: jobData.priority,
          estimated_cost: jobData.estimatedCost,
          technician_id: jobData.technicianId,
          status: 'pending'
        }])
        .select()
        .single();
    }, 'jobs');

    if (result.error) {
      console.error('Job API create error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async update(id: string, updates: UpdateJobRequest): Promise<Job> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }, 'jobs');

    if (result.error) {
      console.error('Job API update error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_jobs')
        .delete()
        .eq('id', id);
    }, 'jobs');

    if (result.error) {
      console.error('Job API delete error:', result.error);
      throw result.error;
    }
  }
};

// User CRUD Operations
export const userApi = {
  async getAll(queryParams?: any): Promise<User[]> {
    const result = await withConnectionRetry(async () => {
      let query = supabase
        .from('greenware717_users')
        .select('*');

      if (queryParams?.role) {
        query = query.in('role', queryParams.role);
      }
      if (queryParams?.isActive !== undefined) {
        query = query.eq('is_active', queryParams.isActive);
      }
      if (queryParams?.search) {
        query = query.or(`name.ilike.%${queryParams.search}%,email.ilike.%${queryParams.search}%`);
      }

      return query.order('created_at', { ascending: false });
    }, 'users');

    if (result.error) {
      console.error('User API getAll error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async getById(id: string): Promise<User | null> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_users')
        .select('*')
        .eq('id', id)
        .single();
    }, 'users');

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        // User not found - return null instead of throwing
        return null;
      }
      console.error('User API getById error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async create(userData: CreateUserRequest): Promise<User> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_users')
        .insert([{
          email: userData.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          address: userData.address
        }])
        .select()
        .single();
    }, 'users');

    if (result.error) {
      console.error('User API create error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async update(id: string, updates: UpdateUserRequest): Promise<User> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }, 'users');

    if (result.error) {
      console.error('User API update error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_users')
        .delete()
        .eq('id', id);
    }, 'users');

    if (result.error) {
      console.error('User API delete error:', result.error);
      throw result.error;
    }
  }
};

// Technician CRUD Operations
export const technicianApi = {
  async getAll(): Promise<Technician[]> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_technicians')
        .select(`
          *,
          user:greenware717_users(*),
          branch:greenware717_branches(*)
        `)
        .order('created_at', { ascending: false });
    }, 'technicians');

    if (result.error) {
      console.error('Technician API getAll error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async getById(id: string): Promise<Technician | null> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_technicians')
        .select(`
          *,
          user:greenware717_users(*),
          branch:greenware717_branches(*)
        `)
        .eq('id', id)
        .single();
    }, 'technicians');

    if (result.error) {
      console.error('Technician API getById error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async update(id: string, updates: Partial<Technician>): Promise<Technician> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_technicians')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }, 'technicians');

    if (result.error) {
      console.error('Technician API update error:', result.error);
      throw result.error;
    }
    return result.data;
  }
};

// Branch CRUD Operations
export const branchApi = {
  async getAll(): Promise<Branch[]> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_branches')
        .select(`
          *,
          manager:greenware717_users(*),
          technicians:greenware717_technicians(*)
        `)
        .order('created_at', { ascending: false });
    }, 'branches');

    if (result.error) {
      console.error('Branch API getAll error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async getById(id: string): Promise<Branch | null> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_branches')
        .select(`
          *,
          manager:greenware717_users(*),
          technicians:greenware717_technicians(*)
        `)
        .eq('id', id)
        .single();
    }, 'branches');

    if (result.error) {
      console.error('Branch API getById error:', result.error);
      throw result.error;
    }
    return result.data;
  }
};

// Parts CRUD Operations
export const partApi = {
  async getByJobId(jobId: string): Promise<Part[]> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_parts')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
    }, 'parts');

    if (result.error) {
      console.error('Part API getByJobId error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async create(partData: AddPartRequest): Promise<Part> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_parts')
        .insert([{
          job_id: partData.jobId,
          name: partData.name,
          part_number: partData.partNumber,
          cost: partData.cost,
          supplier: partData.supplier
        }])
        .select()
        .single();
    }, 'parts');

    if (result.error) {
      console.error('Part API create error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async update(id: string, updates: Partial<Part>): Promise<Part> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_parts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }, 'parts');

    if (result.error) {
      console.error('Part API update error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_parts')
        .delete()
        .eq('id', id);
    }, 'parts');

    if (result.error) {
      console.error('Part API delete error:', result.error);
      throw result.error;
    }
  }
};

// Notes CRUD Operations
export const noteApi = {
  async getByJobId(jobId: string): Promise<Note[]> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notes')
        .select('*')
        .eq('job_id', jobId)
        .order('timestamp', { ascending: false });
    }, 'notes');

    if (result.error) {
      console.error('Note API getByJobId error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async create(noteData: AddNoteRequest): Promise<Note> {
    const { data: user } = await supabase.auth.getUser();
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notes')
        .insert([{
          job_id: noteData.jobId,
          text: noteData.text,
          type: noteData.type,
          author_id: user.user?.id,
          author_name: user.user?.user_metadata?.name || 'Unknown'
        }])
        .select()
        .single();
    }, 'notes');

    if (result.error) {
      console.error('Note API create error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
    }, 'notes');

    if (result.error) {
      console.error('Note API update error:', result.error);
      throw result.error;
    }
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notes')
        .delete()
        .eq('id', id);
    }, 'notes');

    if (result.error) {
      console.error('Note API delete error:', result.error);
      throw result.error;
    }
  }
};

// Notifications CRUD Operations
export const notificationApi = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    }, 'notifications');

    if (result.error) {
      console.error('Notification API getByUserId error:', result.error);
      throw result.error;
    }
    return result.data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notifications')
        .update({ read: true })
        .eq('id', id);
    }, 'notifications');

    if (result.error) {
      console.error('Notification API markAsRead error:', result.error);
      throw result.error;
    }
  },

  async markAllAsRead(userId: string): Promise<void> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
    }, 'notifications');

    if (result.error) {
      console.error('Notification API markAllAsRead error:', result.error);
      throw result.error;
    }
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const result = await withConnectionRetry(async () => {
      return supabase
        .from('greenware717_notifications')
        .insert([notification])
        .select()
        .single();
    }, 'notifications');

    if (result.error) {
      console.error('Notification API create error:', result.error);
      throw result.error;
    }
    return result.data;
  }
};

// Real-time subscriptions with enhanced error handling and reconnection
export const realtimeApi = {
  subscribeToJobs(callback: (payload: any) => void) {
    const channel = supabase
      .channel('jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'greenware717_jobs'
      }, (payload) => {
        try {
          callback(payload);
        } catch (error: any) {
          console.error('Error in job subscription callback:', error);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Job subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Job subscription failed - attempting to reconnect...');
          setTimeout(() => {
            this.subscribeToJobs(callback);
          }, 5000);
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Job subscription timed out - reconnecting...');
          setTimeout(() => {
            this.subscribeToJobs(callback);
          }, 3000);
        }
      });

    return channel;
  },

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'greenware717_notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        try {
          callback(payload);
        } catch (error: any) {
          console.error('Error in notification subscription callback:', error);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`✅ Notification subscription active for user ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Notification subscription failed for user ${userId} - attempting to reconnect...`);
          setTimeout(() => {
            this.subscribeToNotifications(userId, callback);
          }, 5000);
        } else if (status === 'TIMED_OUT') {
          console.error(`⏰ Notification subscription timed out for user ${userId} - reconnecting...`);
          setTimeout(() => {
            this.subscribeToNotifications(userId, callback);
          }, 3000);
        }
      });

    return channel;
  },

  // Unsubscribe function
  unsubscribe(channel: any) {
    if (channel && channel.unsubscribe) {
      channel.unsubscribe();
      console.log('✅ Unsubscribed from channel');
    }
  },

  // Health check for subscriptions
  async checkSubscriptionHealth(): Promise<{ healthy: boolean; channels: any[] }> {
    try {
      // This is a basic check - in production, you might want more sophisticated health checks
      const channels = supabase.getChannels();
      // Use type assertion to handle the channel state check
      const activeChannels = channels.filter((channel: any) =>
        channel.state === 'SUBSCRIBED' || channel.subscription?.state === 'SUBSCRIBED'
      );

      return {
        healthy: activeChannels.length > 0,
        channels: activeChannels
      };
    } catch (error: any) {
      console.error('Subscription health check failed:', error);
      return {
        healthy: false,
        channels: []
      };
    }
  }
};