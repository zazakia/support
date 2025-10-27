import { User, Job, KPI, Notification, Branch, Technician } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.customer@email.com',
    name: 'John Smith',
    role: 'customer',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    isActive: true,
    lastLogin: new Date('2024-01-16T10:30:00'),
    createdAt: new Date('2023-12-01'),
    permissions: ['view_own_jobs', 'create_job', 'update_profile']
  },
  {
    id: '2',
    email: 'mike.tech@repairshop.com',
    name: 'Mike Johnson',
    role: 'technician',
    phone: '(555) 987-6543',
    isActive: true,
    lastLogin: new Date('2024-01-16T08:15:00'),
    createdAt: new Date('2023-02-01'),
    permissions: ['view_assigned_jobs', 'update_job_status', 'add_notes', 'update_profile']
  },
  {
    id: '3',
    email: 'sarah.admin@repairshop.com',
    name: 'Sarah Wilson',
    role: 'admin',
    phone: '(555) 456-7890',
    isActive: true,
    lastLogin: new Date('2024-01-16T09:00:00'),
    createdAt: new Date('2023-01-15'),
    permissions: ['view_all_jobs', 'manage_users', 'assign_technicians', 'view_reports', 'manage_customers']
  },
  {
    id: '4',
    email: 'owner@repairshop.com',
    name: 'David Brown',
    role: 'owner',
    phone: '(555) 111-2222',
    isActive: true,
    lastLogin: new Date('2024-01-16T07:45:00'),
    createdAt: new Date('2023-01-01'),
    permissions: ['full_access', 'manage_branches', 'view_analytics', 'system_settings']
  },
  {
    id: '5',
    email: 'emily.davis@email.com',
    name: 'Emily Davis',
    role: 'customer',
    phone: '(555) 789-0123',
    address: '789 Oak Ave, City, State 12345',
    isActive: true,
    lastLogin: new Date('2024-01-15T16:20:00'),
    createdAt: new Date('2023-11-10'),
    permissions: ['view_own_jobs', 'create_job', 'update_profile']
  },
  {
    id: '6',
    email: 'robert.wilson@email.com',
    name: 'Robert Wilson',
    role: 'customer',
    phone: '(555) 234-5678',
    address: '456 Pine St, City, State 12345',
    isActive: true,
    lastLogin: new Date('2024-01-14T14:10:00'),
    createdAt: new Date('2023-10-05'),
    permissions: ['view_own_jobs', 'create_job', 'update_profile']
  },
  {
    id: 'T001',
    email: 'alex.tech@repairshop.com',
    name: 'Alex Rodriguez',
    role: 'technician',
    phone: '(555) 234-5678',
    isActive: true,
    lastLogin: new Date('2024-01-16T07:30:00'),
    createdAt: new Date('2023-04-15'),
    permissions: ['view_assigned_jobs', 'update_job_status', 'add_notes', 'update_profile']
  },
  {
    id: 'T002',
    email: 'jessica.tech@repairshop.com',
    name: 'Jessica Chen',
    role: 'technician',
    phone: '(555) 345-6789',
    isActive: true,
    lastLogin: new Date('2024-01-16T09:45:00'),
    createdAt: new Date('2023-07-01'),
    permissions: ['view_assigned_jobs', 'update_job_status', 'add_notes', 'update_profile']
  },
  {
    id: 'T003',
    email: 'carlos.tech@repairshop.com',
    name: 'Carlos Martinez',
    role: 'technician',
    phone: '(555) 456-7890',
    isActive: true,
    lastLogin: new Date('2024-01-15T18:20:00'),
    createdAt: new Date('2023-09-15'),
    permissions: ['view_assigned_jobs', 'update_job_status', 'add_notes', 'update_profile']
  }
];

export const mockBranches: Branch[] = [
  {
    id: 'B001',
    name: 'Downtown Branch',
    address: '123 Main St, Downtown, City 12345',
    phone: '(555) 100-0001',
    email: 'downtown@repairshop.com',
    managerId: '3',
    managerName: 'Sarah Wilson',
    technicians: ['2'],
    isActive: true,
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'B002',
    name: 'Mall Branch',
    address: '456 Shopping Mall, City 12345',
    phone: '(555) 100-0002',
    email: 'mall@repairshop.com',
    managerId: '3',
    managerName: 'Sarah Wilson',
    technicians: [],
    isActive: true,
    createdAt: new Date('2023-06-01'),
  },
  {
    id: 'B003',
    name: 'North Branch',
    address: '789 North Ave, City 12345',
    phone: '(555) 100-0003',
    email: 'north@repairshop.com',
    technicians: [],
    isActive: false,
    createdAt: new Date('2023-03-10'),
  },
];

export const mockTechnicians: Technician[] = [
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike.tech@repairshop.com',
    phone: '(555) 987-6543',
    branchId: 'B001',
    branchName: 'Downtown Branch',
    specializations: ['iPhone Repair', 'Android Repair', 'Screen Replacement'],
    isActive: true,
    isAvailable: true,
    hireDate: new Date('2023-02-01'),
    completedJobs: 156,
    averageRating: 4.8,
    workSchedule: {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
      wednesday: [{ start: '09:00', end: '17:00' }],
      thursday: [{ start: '09:00', end: '17:00' }],
      friday: [{ start: '09:00', end: '17:00' }],
      saturday: [{ start: '10:00', end: '14:00' }],
      sunday: []
    }
  },
  {
    id: 'T001',
    name: 'Alex Rodriguez',
    email: 'alex.tech@repairshop.com',
    phone: '(555) 234-5678',
    branchId: 'B001',
    branchName: 'Downtown Branch',
    specializations: ['MacBook Repair', 'Data Recovery', 'Hardware Diagnostics'],
    isActive: true,
    isAvailable: true,
    hireDate: new Date('2023-04-15'),
    completedJobs: 89,
    averageRating: 4.6,
    workSchedule: {
      monday: [{ start: '08:00', end: '16:00' }],
      tuesday: [{ start: '08:00', end: '16:00' }],
      wednesday: [{ start: '08:00', end: '16:00' }],
      thursday: [{ start: '08:00', end: '16:00' }],
      friday: [{ start: '08:00', end: '16:00' }],
      saturday: [],
      sunday: []
    }
  },
  {
    id: 'T002',
    name: 'Jessica Chen',
    email: 'jessica.tech@repairshop.com',
    phone: '(555) 345-6789',
    branchId: 'B002',
    branchName: 'Mall Branch',
    specializations: ['Tablet Repair', 'Water Damage', 'Battery Replacement'],
    isActive: true,
    isAvailable: false,
    hireDate: new Date('2023-07-01'),
    completedJobs: 67,
    averageRating: 4.9,
    workSchedule: {
      monday: [{ start: '10:00', end: '18:00' }],
      tuesday: [{ start: '10:00', end: '18:00' }],
      wednesday: [{ start: '10:00', end: '18:00' }],
      thursday: [{ start: '10:00', end: '18:00' }],
      friday: [{ start: '10:00', end: '18:00' }],
      saturday: [{ start: '09:00', end: '15:00' }],
      sunday: [{ start: '12:00', end: '16:00' }]
    }
  },
  {
    id: 'T003',
    name: 'Carlos Martinez',
    email: 'carlos.tech@repairshop.com',
    phone: '(555) 456-7890',
    branchId: 'B001',
    branchName: 'Downtown Branch',
    specializations: ['Gaming Console Repair', 'PlayStation', 'Xbox', 'Nintendo Switch'],
    isActive: true,
    isAvailable: true,
    hireDate: new Date('2023-09-15'),
    completedJobs: 34,
    averageRating: 4.7,
    workSchedule: {
      monday: [{ start: '12:00', end: '20:00' }],
      tuesday: [{ start: '12:00', end: '20:00' }],
      wednesday: [{ start: '12:00', end: '20:00' }],
      thursday: [{ start: '12:00', end: '20:00' }],
      friday: [{ start: '12:00', end: '20:00' }],
      saturday: [{ start: '10:00', end: '18:00' }],
      sunday: []
    }
  },
];
export const mockJobs: Job[] = [
  {
    id: 'J001',
    customerId: '1',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    customerEmail: 'john.customer@email.com',
    deviceType: 'iPhone',
    deviceModel: 'iPhone 14 Pro',
    deviceSerial: 'A1B2C3D4E5',
    issueDescription: 'Cracked screen, touch not responsive',
    status: 'in-progress',
    priority: 'high',
    technicianId: '2',
    technicianName: 'Mike Johnson',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    estimatedCompletion: new Date('2024-01-18'),
    estimatedCost: 14999.50,
    actualCost: 14999.50,
    parts: [
      {
        id: 'P001',
        name: 'iPhone 14 Pro Screen Assembly',
        partNumber: 'IP14P-SCR-001',
        cost: 12499.50,
        quantity: 1,
        ordered: true,
        received: true,
        supplier: 'Apple Parts Direct'
      }
    ],
    notes: [
      {
        id: 'N001',
        text: 'Customer dropped phone. Screen completely shattered.',
        authorId: '3',
        authorName: 'Sarah Wilson',
        timestamp: new Date('2024-01-15T10:30:00'),
        type: 'internal'
      },
      {
        id: 'N002',
        text: 'Started screen replacement. Will be ready by Thursday.',
        authorId: '2',
        authorName: 'Mike Johnson',
        timestamp: new Date('2024-01-16T14:15:00'),
        type: 'customer'
      }
    ],
    images: [
      'https://via.placeholder.com/400x300/2563EB/FFFFFF?text=iPhone+Screen+Damage',
      'https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Cracked+Screen+Closeup'
    ]
  },
  {
    id: 'J002',
    customerId: '1',
    customerName: 'John Smith',
    customerPhone: '(555) 123-4567',
    customerEmail: 'john.customer@email.com',
    deviceType: 'MacBook',
    deviceModel: 'MacBook Pro 13"',
    issueDescription: 'Battery drains quickly, won\'t hold charge',
    status: 'waiting-parts',
    priority: 'medium',
    technicianId: '2',
    technicianName: 'Mike Johnson',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-12'),
    estimatedCompletion: new Date('2024-01-20'),
    estimatedCost: 9999.50,
    parts: [
      {
        id: 'P002',
        name: 'MacBook Pro 13" Battery',
        partNumber: 'MBP13-BAT-001',
        cost: 7499.50,
        quantity: 1,
        ordered: true,
        received: false,
        supplier: 'Tech Parts Co'
      }
    ],
    notes: [
      {
        id: 'N003',
        text: 'Battery test shows 15% capacity. Needs replacement.',
        authorId: '2',
        authorName: 'Mike Johnson',
        timestamp: new Date('2024-01-10T09:00:00'),
        type: 'internal'
      }
    ],
    images: []
  },
  {
    id: 'J003',
    customerId: '5',
    customerName: 'Emily Davis',
    customerPhone: '(555) 789-0123',
    customerEmail: 'emily.davis@email.com',
    deviceType: 'Samsung Galaxy',
    deviceModel: 'Galaxy S23',
    issueDescription: 'Water damage, won\'t turn on',
    status: 'completed',
    priority: 'urgent',
    technicianId: '2',
    technicianName: 'Mike Johnson',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-08'),
    estimatedCompletion: new Date('2024-01-08'),
    actualCompletion: new Date('2024-01-08'),
    estimatedCost: 19999.50,
    actualCost: 17499.50,
    parts: [],
    notes: [
      {
        id: 'N004',
        text: 'Device was submerged in water. Attempting data recovery.',
        authorId: '2',
        authorName: 'Mike Johnson',
        timestamp: new Date('2024-01-05T11:00:00'),
        type: 'internal'
      },
      {
        id: 'N005',
        text: 'Successfully recovered all data. Device fully functional.',
        authorId: '2',
        authorName: 'Mike Johnson',
        timestamp: new Date('2024-01-08T16:30:00'),
        type: 'customer'
      }
    ],
    images: [
      'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Water+Damage+Phone',
      'https://via.placeholder.com/400x300/059669/FFFFFF?text=Repaired+Device'
    ]
  }
];

export const mockKPIs: KPI = {
  totalJobs: 247,
  completedJobs: 198,
  pendingJobs: 49,
  revenue: 2287500.00,
  averageCompletionTime: 2.5,
  customerSatisfaction: 4.8,
  techniciansActive: 6,
  partsValue: 625000.00
};

export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    title: 'Job Status Update',
    message: 'Your iPhone 14 Pro repair is now in progress',
    type: 'status-update',
    jobId: 'J001',
    read: false,
    createdAt: new Date('2024-01-16T14:15:00')
  },
  {
    id: '2',
    userId: '1',
    title: 'Parts Ordered',
    message: 'Parts for your MacBook Pro have been ordered',
    type: 'status-update',
    jobId: 'J002',
    read: false,
    createdAt: new Date('2024-01-12T10:30:00')
  },
  {
    id: '3',
    userId: '2',
    title: 'New Job Assignment',
    message: 'You have been assigned to job J004',
    type: 'assignment',
    jobId: 'J004',
    read: false,
    createdAt: new Date('2024-01-16T09:00:00')
  }
];

export const mockChartData = {
  jobsOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [45, 52, 48, 61, 55, 67],
      color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
      strokeWidth: 2
    }]
  },
  revenueOverTime: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [12500, 14200, 13800, 16500, 15200, 18900],
      color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
      strokeWidth: 2
    }]
  },
  jobsByStatus: {
    labels: ['Pending', 'In Progress', 'Waiting Parts', 'Completed'],
    datasets: [{
      data: [15, 22, 12, 51]
    }]
  }
};