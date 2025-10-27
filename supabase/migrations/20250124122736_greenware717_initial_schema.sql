-- Create tables with greenware717_ prefix for the job order management system

-- Users table
CREATE TABLE IF NOT EXISTS greenware717_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'technician', 'admin', 'owner')),
    phone TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches table
CREATE TABLE IF NOT EXISTS greenware717_branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    manager_id UUID REFERENCES greenware717_users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Technicians table
CREATE TABLE IF NOT EXISTS greenware717_technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES greenware717_users(id) UNIQUE,
    branch_id UUID REFERENCES greenware717_branches(id),
    specializations TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    hire_date DATE DEFAULT CURRENT_DATE,
    completed_jobs INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    work_schedule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS greenware717_jobs (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES greenware717_users(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    device_type TEXT NOT NULL,
    device_model TEXT NOT NULL,
    device_serial TEXT,
    issue_description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in-progress', 'waiting-parts', 'completed', 'cancelled', 'delivered')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    technician_id UUID REFERENCES greenware717_users(id),
    technician_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    estimated_completion TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    images TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Parts table
CREATE TABLE IF NOT EXISTS greenware717_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id TEXT REFERENCES greenware717_jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    part_number TEXT NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    ordered BOOLEAN DEFAULT false,
    received BOOLEAN DEFAULT false,
    supplier TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE IF NOT EXISTS greenware717_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id TEXT REFERENCES greenware717_jobs(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    author_id UUID REFERENCES greenware717_users(id),
    author_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    type TEXT NOT NULL CHECK (type IN ('internal', 'customer'))
);

-- Notifications table
CREATE TABLE IF NOT EXISTS greenware717_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES greenware717_users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('status-update', 'payment', 'assignment', 'reminder')),
    job_id TEXT REFERENCES greenware717_jobs(id),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_greenware717_jobs_customer_id ON greenware717_jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_greenware717_jobs_technician_id ON greenware717_jobs(technician_id);
CREATE INDEX IF NOT EXISTS idx_greenware717_jobs_status ON greenware717_jobs(status);
CREATE INDEX IF NOT EXISTS idx_greenware717_jobs_priority ON greenware717_jobs(priority);
CREATE INDEX IF NOT EXISTS idx_greenware717_jobs_created_at ON greenware717_jobs(created_at);

CREATE INDEX IF NOT EXISTS idx_greenware717_notifications_user_id ON greenware717_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_greenware717_notifications_read ON greenware717_notifications(read);

-- Enable Row Level Security (RLS)
ALTER TABLE greenware717_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE greenware717_notifications ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (these can be customized based on your auth requirements)
-- For now, allowing all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON greenware717_users
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_branches
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_technicians
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_jobs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_parts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_notes
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON greenware717_notifications
    FOR ALL USING (auth.role() = 'authenticated');