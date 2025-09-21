import { Platform } from 'react-native';

// Mock AsyncStorage for now
const mockAsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const item = localStorage.getItem(key);
      return item;
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Failed to save to storage:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from storage:', error);
    }
  },
  clear: async (): Promise<void> => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  },
};

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export class OfflineStorage {
  private static readonly PREFIX = 'offline_cache_';
  private static readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static async set<T>(
    key: string,
    data: T,
    ttl: number = OfflineStorage.DEFAULT_TTL
  ): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
      };

      const serialized = JSON.stringify(entry);
      await mockAsyncStorage.setItem(OfflineStorage.PREFIX + key, serialized);
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const serialized = await mockAsyncStorage.getItem(OfflineStorage.PREFIX + key);
      if (!serialized) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(serialized);
      
      // Check if expired
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        await OfflineStorage.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await mockAsyncStorage.removeItem(OfflineStorage.PREFIX + key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      // In a real implementation, we'd iterate through keys with our prefix
      await mockAsyncStorage.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static async isExpired(key: string): Promise<boolean> {
    try {
      const serialized = await mockAsyncStorage.getItem(OfflineStorage.PREFIX + key);
      if (!serialized) {
        return true;
      }

      const entry: CacheEntry<any> = JSON.parse(serialized);
      return entry.expiresAt ? Date.now() > entry.expiresAt : false;
    } catch {
      return true;
    }
  }

  static async getAge(key: string): Promise<number | null> {
    try {
      const serialized = await mockAsyncStorage.getItem(OfflineStorage.PREFIX + key);
      if (!serialized) {
        return null;
      }

      const entry: CacheEntry<any> = JSON.parse(serialized);
      return Date.now() - entry.timestamp;
    } catch {
      return null;
    }
  }
}

// Specialized cache for different data types
export class JobsCache {
  private static readonly KEY = 'jobs_list';

  static async set(jobs: any[], ttl?: number): Promise<void> {
    return OfflineStorage.set(JobsCache.KEY, jobs, ttl);
  }

  static async get(): Promise<any[] | null> {
    return OfflineStorage.get<any[]>(JobsCache.KEY);
  }

  static async clear(): Promise<void> {
    return OfflineStorage.remove(JobsCache.KEY);
  }
}

export class CustomersCache {
  private static readonly KEY = 'customers_list';

  static async set(customers: any[], ttl?: number): Promise<void> {
    return OfflineStorage.set(CustomersCache.KEY, customers, ttl);
  }

  static async get(): Promise<any[] | null> {
    return OfflineStorage.get<any[]>(CustomersCache.KEY);
  }

  static async clear(): Promise<void> {
    return OfflineStorage.remove(CustomersCache.KEY);
  }
}

export class NotificationsCache {
  private static readonly KEY = 'notifications_list';

  static async set(notifications: any[], ttl?: number): Promise<void> {
    return OfflineStorage.set(NotificationsCache.KEY, notifications, ttl);
  }

  static async get(): Promise<any[] | null> {
    return OfflineStorage.get<any[]>(NotificationsCache.KEY);
  }

  static async clear(): Promise<void> {
    return OfflineStorage.remove(NotificationsCache.KEY);
  }
}

// Queue for offline actions
export interface OfflineAction {
  id: string;
  type: 'CREATE_JOB' | 'UPDATE_JOB' | 'DELETE_JOB' | 'ADD_NOTE';
  payload: any;
  timestamp: number;
  retryCount: number;
}

export class OfflineQueue {
  private static readonly KEY = 'offline_queue';

  static async add(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const queue = await OfflineQueue.getAll();
      const newAction: OfflineAction = {
        ...action,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(newAction);
      await OfflineStorage.set(OfflineQueue.KEY, queue);
    } catch (error) {
      console.warn('Failed to add action to offline queue:', error);
    }
  }

  static async getAll(): Promise<OfflineAction[]> {
    const queue = await OfflineStorage.get<OfflineAction[]>(OfflineQueue.KEY);
    return queue || [];
  }

  static async remove(actionId: string): Promise<void> {
    try {
      const queue = await OfflineQueue.getAll();
      const filtered = queue.filter(action => action.id !== actionId);
      await OfflineStorage.set(OfflineQueue.KEY, filtered);
    } catch (error) {
      console.warn('Failed to remove action from offline queue:', error);
    }
  }

  static async clear(): Promise<void> {
    return OfflineStorage.remove(OfflineQueue.KEY);
  }

  static async incrementRetryCount(actionId: string): Promise<void> {
    try {
      const queue = await OfflineQueue.getAll();
      const action = queue.find(a => a.id === actionId);
      if (action) {
        action.retryCount++;
        await OfflineStorage.set(OfflineQueue.KEY, queue);
      }
    } catch (error) {
      console.warn('Failed to increment retry count:', error);
    }
  }
}

export default OfflineStorage;