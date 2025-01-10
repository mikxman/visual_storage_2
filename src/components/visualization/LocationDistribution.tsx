import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StorageItem } from '../../types/storage';
import { useMemo } from 'react';

interface LocationDistributionProps {
  items: StorageItem[];
}

export default function LocationDistribution({ items }: LocationDistributionProps) {
  const locationData = useMemo(() => {
    const locations = items.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(locations).map(([name, value]) => ({
      name,
      quantity: value
    }));
  }, [items]);

  return (
    <div className="h-[300px] w-full">
      <h3 className="text-lg font-semibold mb-4">Items by Location</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={locationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantity" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}