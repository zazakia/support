// Cross-platform storage utility that works in both React Native and web environments

interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
}

class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get item from localStorage:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set item in localStorage:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item from localStorage:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to remove multiple items from localStorage:', error);
      throw error;
    }
  }
}

class MemoryStorage implements StorageInterface {
  private storage: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => this.storage.delete(key));
  }
}

// Create storage instance based on environment
function createStorage(): StorageInterface {
  if (typeof window !== 'undefined' && window.localStorage) {
    return new WebStorage();
  }
  
  // Fallback to memory storage
  return new MemoryStorage();
}

export const AsyncStorage = createStorage();