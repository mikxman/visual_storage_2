import { StorageItem } from '../../types/storage';
import { useMemo } from 'react';

interface VisualizationStatsProps {
  items: StorageItem[];
}

export default function VisualizationStats({ items }: VisualizationStatsProps) {
  const stats = useMemo(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const uniqueCategories = new Set(items.map(item => item.category)).size;
    const uniqueLocations = new Set(items.map(item => item.location)).size;

    return {
      totalItems,
      uniqueCategories,
      uniqueLocations,
      itemTypes: items.length
    };
  }, [items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Total Items" value={stats.totalItems} />
      <StatCard title="Item Types" value={stats.itemTypes} />
      <StatCard title="Categories" value={stats.uniqueCategories} />
      <StatCard title="Locations" value={stats.uniqueLocations} />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}