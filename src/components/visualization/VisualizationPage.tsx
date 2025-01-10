import { useEffect, useState } from 'react';
import { StorageItem } from '../../types/storage';
import { getStorageItems } from '../../lib/supabase';
import CategoryChart from './CategoryChart';
import LocationDistribution from './LocationDistribution';
import VisualizationStats from './VisualizationStats';
import InfiniteMap from './InfiniteMap';

export default function VisualizationPage() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'charts' | 'map'>('charts');

  useEffect(() => {
    async function loadItems() {
      try {
        const data = await getStorageItems();
        setItems(data);
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadItems();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading visualizations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setView('charts')}
          className={`px-4 py-2 rounded-md ${
            view === 'charts'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Charts
        </button>
        <button
          onClick={() => setView('map')}
          className={`px-4 py-2 rounded-md ${
            view === 'map'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Map View
        </button>
      </div>

      <VisualizationStats items={items} />
      
      {view === 'charts' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CategoryChart items={items} />
          <LocationDistribution items={items} />
        </div>
      ) : (
        <InfiniteMap items={items} />
      )}
    </div>
  );
}