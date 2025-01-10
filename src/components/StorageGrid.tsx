import { useEffect, useState } from 'react';
import { StorageItem } from '../types/storage';
import StorageCard from './StorageCard';
import { supabase } from '../lib/supabase';

interface StorageGridProps {
  items: StorageItem[];
}

export default function StorageGrid({ items }: StorageGridProps) {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);

    // Subscribe to changes in the storage_items table
    const channel = supabase
      .channel('storage_items_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'storage_items'
        },
        (payload) => {
          setLocalItems(current =>
            current.map(item =>
              item.id === payload.new.id
                ? { ...item, ...payload.new }
                : item
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {localItems.map((item) => (
        <StorageCard key={item.id} item={item} />
      ))}
    </div>
  );
}