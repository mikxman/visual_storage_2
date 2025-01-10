import { createClient } from '@supabase/supabase-js';
import type { StorageItem, StorageCategory } from '../types/storage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Configure Supabase client with better auth and rate limiting handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'visual-storage-auth',
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 1 // Reduce real-time events rate even further
    }
  },
  global: {
    headers: {
      'x-client-info': 'visual-storage'
    }
  }
});

// Add exponential backoff retry logic for rate-limited requests
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let retryCount = 0;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      retryCount++;
      
      if (retryCount === maxRetries || 
          (error.status !== 429 && !error.message?.includes('JWT'))) {
        throw error;
      }

      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      const jitter = Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
    }
  }
}

export async function getStorageItems() {
  try {
    const { data, error } = await retryWithBackoff(() => 
      supabase
        .from('storage_items')
        .select('*')
        .order('created_at', { ascending: false })
    );
    
    if (error) throw error;
    return data as StorageItem[];
  } catch (error) {
    console.error('Failed to fetch storage items:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('categories')
        .select('*')
        .order('name')
    );
    
    if (error) throw error;
    return data as StorageCategory[];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function updateStorageItem(id: string, updates: Partial<StorageItem>) {
  try {
    const { error } = await retryWithBackoff(() =>
      supabase
        .from('storage_items')
        .update(updates)
        .eq('id', id)
    );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to update storage item:', error);
    return false;
  }
}