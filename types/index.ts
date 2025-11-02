// Base Types
export type UserRole = 'customer' | 'technician' | 'admin' | 'owner';
export type JobStatus = 'pending' | 'in-progress' | 'waiting-parts' | 'completed' | 'cancelled' | 'delivered';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'status-update' | 'payment' | 'assignment' | 'reminder';
export type NoteType = 'internal' | 'customer';
export type ReportType = 'jobs' | 'revenue' | 'technicians' | 'customers' | 'branches';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  permissions: string[];
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  deviceModel: string;
  deviceSerial?: string;
  issueDescription: string;
  status: JobStatus;
  priority: JobPriority;
  technicianId?: string;
  technicianName?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  estimatedCost?: number;
  actualCost?: number;
  parts: Part[];
  notes: Note[];
  images: string[];
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  cost: number;
  quantity: number;
  ordered: boolean;
  received: boolean;
  supplier?: string;
}

export interface Note {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  timestamp: Date;
  type: NoteType;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  jobId?: string;
  read: boolean;
  createdAt: Date;
}

export interface KPI {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  revenue: number;
  averageCompletionTime: number;
  customerSatisfaction: number;
  techniciansActive: number;
  partsValue: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  managerName?: string;
  technicians: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  branchId: string;
  branchName: string;
  specializations: string[];
  isActive: boolean;
  isAvailable: boolean;
  hireDate: Date;
  completedJobs: number;
  averageRating: number;
  workSchedule?: WorkSchedule;
}

export interface TechnicianProfile extends User {
  specializations: string[];
  branchId: string;
  branchName: string;
  isAvailable: boolean;
  workSchedule: WorkSchedule;
  completedJobs: number;
  averageRating: number;
}

export interface WorkSchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "17:00"
}

export interface UserSession {
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  deviceInfo: DeviceInfo;
  lastActivity: Date;
}

export interface DeviceInfo {
  platform: 'web' | 'ios' | 'android';
  userAgent: string;
  ipAddress: string;
}

export interface AdminReport {
  id: string;
  title: string;
  type: ReportType;
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

// Error Handling Types
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: Date;
  context: Record<string, any>;
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  jobId?: string;
  additionalData?: Record<string, any>;
}

// Component Props Interfaces
export interface JobCardProps {
  job: Job;
  onPress: (job: Job) => void;
  showCustomer?: boolean;
  showTechnician?: boolean;
}

export interface StatusBadgeProps {
  status: JobStatus;
  size?: BadgeSize;
}

export interface PriorityBadgeProps {
  priority: JobPriority;
  size?: BadgeSize;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
}

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: JobFilters) => void;
  statusOptions: FilterOption[];
  priorityOptions: FilterOption[];
  deviceTypeOptions: FilterOption[];
}

export interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: React.ComponentType<any>;
  label?: string;
}

export interface QuickActionsProps {
  actions: QuickAction[];
}

export interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
  onPress: () => void;
}

// Form Data Types
export interface CreateJobFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  deviceModel: string;
  deviceSerial: string;
  issueDescription: string;
  priority: JobPriority;
  estimatedCost: string;
  images: string[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface JobFilters {
  status: JobStatus[];
  priority: JobPriority[];
  deviceType: string[];
  technicianId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchFilters {
  query: string;
  filters: JobFilters;
}

// Validation Types
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationRules {
  [fieldName: string]: FieldValidationRule;
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  status: number;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse extends ApiResponse<User> {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Specific API Response Types
export interface JobResponse extends ApiResponse<Job> {}
export interface JobsResponse extends PaginatedResponse<Job> {}
export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends PaginatedResponse<User> {}
export interface NotificationResponse extends ApiResponse<Notification> {}
export interface NotificationsResponse extends PaginatedResponse<Notification> {}
export interface KPIResponse extends ApiResponse<KPI> {}

// Error Response Types
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    field?: string;
    timestamp: Date;
  };
  status: number;
}

export interface ValidationErrorResponse extends ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      fields: Array<{
        field: string;
        message: string;
        value: any;
      }>;
    };
    timestamp: Date;
  };
}

export interface AuthErrorResponse extends ApiErrorResponse {
  error: {
    code: 'AUTH_ERROR' | 'TOKEN_EXPIRED' | 'INVALID_CREDENTIALS' | 'INSUFFICIENT_PERMISSIONS';
    message: string;
    details?: {
      expiresAt?: Date;
      requiredRole?: UserRole;
    };
    timestamp: Date;
  };
}

export interface NetworkErrorResponse extends ApiErrorResponse {
  error: {
    code: 'NETWORK_ERROR' | 'TIMEOUT' | 'CONNECTION_FAILED';
    message: string;
    details?: {
      timeout?: number;
      retryAfter?: number;
    };
    timestamp: Date;
  };
}

export interface ServerErrorResponse extends ApiErrorResponse {
  error: {
    code: 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE' | 'DATABASE_ERROR';
    message: string;
    details?: {
      requestId?: string;
      service?: string;
    };
    timestamp: Date;
  };
}

// API Request Types
export interface CreateJobRequest {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deviceType: string;
  deviceModel: string;
  deviceSerial?: string;
  issueDescription: string;
  priority: JobPriority;
  estimatedCost?: number;
  technicianId?: string;
}

export interface UpdateJobRequest {
  status?: JobStatus;
  priority?: JobPriority;
  technicianId?: string;
  estimatedCompletion?: Date;
  estimatedCost?: number;
  actualCost?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface AddNoteRequest {
  jobId: string;
  text: string;
  type: NoteType;
}

export interface AddPartRequest {
  jobId: string;
  name: string;
  partNumber: string;
  cost: number;
  quantity: number;
  supplier?: string;
}

// Query Parameters Types
export interface JobQueryParams {
  page?: number;
  limit?: number;
  status?: JobStatus[];
  priority?: JobPriority[];
  technicianId?: string;
  customerId?: string;
  deviceType?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole[];
  search?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

// Type Guards
export const isJobStatus = (value: string): value is JobStatus => {
  return ['pending', 'in-progress', 'waiting-parts', 'completed', 'cancelled', 'delivered'].includes(value);
};

export const isJobPriority = (value: string): value is JobPriority => {
  return ['low', 'medium', 'high', 'urgent'].includes(value);
};

export const isUserRole = (value: string): value is UserRole => {
  return ['customer', 'technician', 'admin', 'owner'].includes(value);
};

export const isNotificationType = (value: string): value is NotificationType => {
  return ['status-update', 'payment', 'assignment', 'reminder'].includes(value);
};

// Utility Types
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Generic Types for Components
export interface ListItemProps<T> {
  item: T;
  onPress: (item: T) => void;
  isSelected?: boolean;
}

export interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  checkConnection: () => Promise<boolean>;
}

// Hook Return Types
export interface UseJobsReturn {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createJob: (jobData: CreateJobRequest) => Promise<Job>;
  updateJob: (jobId: string, updates: UpdateJobRequest) => Promise<Job>;
  deleteJob: (jobId: string) => Promise<void>;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
}