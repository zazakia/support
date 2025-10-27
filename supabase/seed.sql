-- Seed data for Greenware Job Order Management System
-- This file contains initial data to populate the database

-- Insert users (these will be created via Supabase Auth)
-- The IDs here are for reference - actual auth users will have different UUIDs
-- You need to create these users manually in Supabase Auth dashboard with these credentials:
-- john.customer@email.com / password123
-- mike.tech@repairshop.com / password123
-- sarah.admin@repairshop.com / password123
-- owner@repairshop.com / password123
-- emily.davis@email.com / password123
-- robert.wilson@email.com / password123
-- alex.tech@repairshop.com / password123
-- jessica.tech@repairshop.com / password123
-- carlos.tech@repairshop.com / password123

-- Note: After creating users in Supabase Auth, update the IDs below with the actual UUIDs from auth.users
-- For now, we'll use placeholder IDs that match the pattern
INSERT INTO greenware717_users (id, email, name, role, phone, address, is_active, last_login, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'john.customer@email.com', 'John Smith', 'customer', '(555) 123-4567', '123 Main St, City, State 12345', true, '2024-01-16T10:30:00Z', '2023-12-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440001', 'mike.tech@repairshop.com', 'Mike Johnson', 'technician', '(555) 987-6543', NULL, true, '2024-01-16T08:15:00Z', '2023-02-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440002', 'sarah.admin@repairshop.com', 'Sarah Wilson', 'admin', '(555) 456-7890', NULL, true, '2024-01-16T09:00:00Z', '2023-01-15T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440003', 'owner@repairshop.com', 'David Brown', 'owner', '(555) 111-2222', NULL, true, '2024-01-16T07:45:00Z', '2023-01-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440004', 'emily.davis@email.com', 'Emily Davis', 'customer', '(555) 789-0123', '789 Oak Ave, City, State 12345', true, '2024-01-15T16:20:00Z', '2023-11-10T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440005', 'robert.wilson@email.com', 'Robert Wilson', 'customer', '(555) 234-5678', '456 Pine St, City, State 12345', true, '2024-01-14T14:10:00Z', '2023-10-05T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440006', 'alex.tech@repairshop.com', 'Alex Rodriguez', 'technician', '(555) 234-5678', NULL, true, '2024-01-16T07:30:00Z', '2023-04-15T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440007', 'jessica.tech@repairshop.com', 'Jessica Chen', 'technician', '(555) 345-6789', NULL, true, '2024-01-16T09:45:00Z', '2023-07-01T00:00:00Z'),
('550e8400-e29b-41d4-a716-446655440008', 'carlos.tech@repairshop.com', 'Carlos Martinez', 'technician', '(555) 456-7890', NULL, true, '2024-01-15T18:20:00Z', '2023-09-15T00:00:00Z');

-- Insert branches
INSERT INTO greenware717_branches (id, name, address, phone, email, manager_id, is_active, created_at) VALUES
('660e8400-e29b-41d4-a716-446655440000', 'Downtown Branch', '123 Main St, Downtown, City 12345', '(555) 100-0001', 'downtown@repairshop.com', '550e8400-e29b-41d4-a716-446655440002', true, '2023-01-15T00:00:00Z'),
('660e8400-e29b-41d4-a716-446655440001', 'Mall Branch', '456 Shopping Mall, City 12345', '(555) 100-0002', 'mall@repairshop.com', '550e8400-e29b-41d4-a716-446655440002', true, '2023-06-01T00:00:00Z'),
('660e8400-e29b-41d4-a716-446655440002', 'North Branch', '789 North Ave, City 12345', '(555) 100-0003', 'north@repairshop.com', NULL, false, '2023-03-10T00:00:00Z');

-- Insert technicians
INSERT INTO greenware717_technicians (id, user_id, branch_id, specializations, is_available, hire_date, completed_jobs, average_rating, work_schedule) VALUES
('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440000', ARRAY['iPhone Repair', 'Android Repair', 'Screen Replacement'], true, '2023-02-01', 156, 4.8, '{"monday": [{"start": "09:00", "end": "17:00"}], "tuesday": [{"start": "09:00", "end": "17:00"}], "wednesday": [{"start": "09:00", "end": "17:00"}], "thursday": [{"start": "09:00", "end": "17:00"}], "friday": [{"start": "09:00", "end": "17:00"}], "saturday": [{"start": "10:00", "end": "14:00"}], "sunday": []}'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440000', ARRAY['MacBook Repair', 'Data Recovery', 'Hardware Diagnostics'], true, '2023-04-15', 89, 4.6, '{"monday": [{"start": "08:00", "end": "16:00"}], "tuesday": [{"start": "08:00", "end": "16:00"}], "wednesday": [{"start": "08:00", "end": "16:00"}], "thursday": [{"start": "08:00", "end": "16:00"}], "friday": [{"start": "08:00", "end": "16:00"}], "saturday": [], "sunday": []}'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', ARRAY['Tablet Repair', 'Water Damage', 'Battery Replacement'], false, '2023-07-01', 67, 4.9, '{"monday": [{"start": "10:00", "end": "18:00"}], "tuesday": [{"start": "10:00", "end": "18:00"}], "wednesday": [{"start": "10:00", "end": "18:00"}], "thursday": [{"start": "10:00", "end": "18:00"}], "friday": [{"start": "10:00", "end": "18:00"}], "saturday": [{"start": "09:00", "end": "15:00"}], "sunday": [{"start": "12:00", "end": "16:00"}]}'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440000', ARRAY['Gaming Console Repair', 'PlayStation', 'Xbox', 'Nintendo Switch'], true, '2023-09-15', 34, 4.7, '{"monday": [{"start": "12:00", "end": "20:00"}], "tuesday": [{"start": "12:00", "end": "20:00"}], "wednesday": [{"start": "12:00", "end": "20:00"}], "thursday": [{"start": "12:00", "end": "20:00"}], "friday": [{"start": "12:00", "end": "20:00"}], "saturday": [{"start": "10:00", "end": "18:00"}], "sunday": []}');

-- Insert jobs
INSERT INTO greenware717_jobs (id, customer_id, customer_name, customer_phone, customer_email, device_type, device_model, device_serial, issue_description, status, priority, technician_id, technician_name, created_at, updated_at, estimated_completion, estimated_cost, actual_cost, images) VALUES
('J001', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', '(555) 123-4567', 'john.customer@email.com', 'iPhone', 'iPhone 14 Pro', 'A1B2C3D4E5', 'Cracked screen, touch not responsive', 'in-progress', 'high', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-15T00:00:00Z', '2024-01-16T00:00:00Z', '2024-01-18T00:00:00Z', 14999.50, 14999.50, ARRAY['https://via.placeholder.com/400x300/2563EB/FFFFFF?text=iPhone+Screen+Damage', 'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Cracked+Screen+Closeup']),
('J002', '550e8400-e29b-41d4-a716-446655440000', 'John Smith', '(555) 123-4567', 'john.customer@email.com', 'MacBook', 'MacBook Pro 13"', NULL, 'Battery drains quickly, won''t hold charge', 'waiting-parts', 'medium', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-10T00:00:00Z', '2024-01-12T00:00:00Z', '2024-01-20T00:00:00Z', 9999.50, NULL, '{}'),
('J003', '550e8400-e29b-41d4-a716-446655440004', 'Emily Davis', '(555) 789-0123', 'emily.davis@email.com', 'Samsung Galaxy', 'Galaxy S23', NULL, 'Water damage, won''t turn on', 'completed', 'urgent', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-05T00:00:00Z', '2024-01-08T00:00:00Z', '2024-01-08T00:00:00Z', 19999.50, 17499.50, ARRAY['https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Water+Damage+Phone', 'https://via.placeholder.com/400x300/059669/FFFFFF?text=Repaired+Device']);

-- Insert parts
INSERT INTO greenware717_parts (id, job_id, name, part_number, cost, quantity, ordered, received, supplier) VALUES
('880e8400-e29b-41d4-a716-446655440000', 'J001', 'iPhone 14 Pro Screen Assembly', 'IP14P-SCR-001', 12499.50, 1, true, true, 'Apple Parts Direct'),
('880e8400-e29b-41d4-a716-446655440001', 'J002', 'MacBook Pro 13" Battery', 'MBP13-BAT-001', 7499.50, 1, true, false, 'Tech Parts Co');

-- Insert notes
INSERT INTO greenware717_notes (id, job_id, text, author_id, author_name, timestamp, type) VALUES
('990e8400-e29b-41d4-a716-446655440000', 'J001', 'Customer dropped phone. Screen completely shattered.', '550e8400-e29b-41d4-a716-446655440002', 'Sarah Wilson', '2024-01-15T10:30:00Z', 'internal'),
('990e8400-e29b-41d4-a716-446655440001', 'J001', 'Started screen replacement. Will be ready by Thursday.', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-16T14:15:00Z', 'customer'),
('990e8400-e29b-41d4-a716-446655440002', 'J002', 'Battery test shows 15% capacity. Needs replacement.', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-10T09:00:00Z', 'internal'),
('990e8400-e29b-41d4-a716-446655440003', 'J003', 'Device was submerged in water. Attempting data recovery.', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-05T11:00:00Z', 'internal'),
('990e8400-e29b-41d4-a716-446655440004', 'J003', 'Successfully recovered all data. Device fully functional.', '550e8400-e29b-41d4-a716-446655440001', 'Mike Johnson', '2024-01-08T16:30:00Z', 'customer');

-- Insert notifications
INSERT INTO greenware717_notifications (id, user_id, title, message, type, job_id, read, created_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Job Status Update', 'Your iPhone 14 Pro repair is now in progress', 'status-update', 'J001', false, '2024-01-16T14:15:00Z'),
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Parts Ordered', 'Parts for your MacBook Pro have been ordered', 'status-update', 'J002', false, '2024-01-12T10:30:00Z'),
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'New Job Assignment', 'You have been assigned to job J001', 'assignment', 'J001', false, '2024-01-15T09:00:00Z');