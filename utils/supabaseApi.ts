import { supabase } from './supabaseClient';
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

// Job CRUD Operations
export const jobApi = {
  async getAll(queryParams?: any): Promise<Job[]> {
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

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  async create(jobData: CreateJobRequest): Promise<Job> {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UpdateJobRequest): Promise<Job> {
    const { data, error } = await supabase
      .from('greenware717_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// User CRUD Operations
export const userApi = {
  async getAll(queryParams?: any): Promise<User[]> {
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

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('greenware717_users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(userData: CreateUserRequest): Promise<User> {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: UpdateUserRequest): Promise<User> {
    const { data, error } = await supabase
      .from('greenware717_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Technician CRUD Operations
export const technicianApi = {
  async getAll(): Promise<Technician[]> {
    const { data, error } = await supabase
      .from('greenware717_technicians')
      .select(`
        *,
        user:greenware717_users(*),
        branch:greenware717_branches(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Technician | null> {
    const { data, error } = await supabase
      .from('greenware717_technicians')
      .select(`
        *,
        user:greenware717_users(*),
        branch:greenware717_branches(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Technician>): Promise<Technician> {
    const { data, error } = await supabase
      .from('greenware717_technicians')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Branch CRUD Operations
export const branchApi = {
  async getAll(): Promise<Branch[]> {
    const { data, error } = await supabase
      .from('greenware717_branches')
      .select(`
        *,
        manager:greenware717_users(*),
        technicians:greenware717_technicians(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Branch | null> {
    const { data, error } = await supabase
      .from('greenware717_branches')
      .select(`
        *,
        manager:greenware717_users(*),
        technicians:greenware717_technicians(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// Parts CRUD Operations
export const partApi = {
  async getByJobId(jobId: string): Promise<Part[]> {
    const { data, error } = await supabase
      .from('greenware717_parts')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(partData: AddPartRequest): Promise<Part> {
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Part>): Promise<Part> {
    const { data, error } = await supabase
      .from('greenware717_parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_parts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Notes CRUD Operations
export const noteApi = {
  async getByJobId(jobId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('greenware717_notes')
      .select('*')
      .eq('job_id', jobId)
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(noteData: AddNoteRequest): Promise<Note> {
    const { data: user } = await supabase.auth.getUser();
    const { data, error } = await supabase
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

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('greenware717_notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// Notifications CRUD Operations
export const notificationApi = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('greenware717_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('greenware717_notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('greenware717_notifications')
      .insert([notification])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const realtimeApi = {
  subscribeToJobs(callback: (payload: any) => void) {
    return supabase
      .channel('jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'greenware717_jobs' }, callback)
      .subscribe();
  },

  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'greenware717_notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};