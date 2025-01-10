import { StorageItem } from '../types/storage';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface StorageCardProps {
  item: StorageItem;
}

export default function StorageCard({ item }: StorageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [x, setX] = useState(item.x?.toString() || '0');
  const [y, setY] = useState(item.y?.toString() || '0');

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('storage_items')
        .update({ x: parseFloat(x), y: parseFloat(y) })
        .eq('id', item.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating coordinates:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
      <div className="mt-2">
        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
        <p className="text-sm text-gray-600">Location: {item.location}</p>
        <div className="mt-2">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">X:</label>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
                <label className="text-sm text-gray-600">Y:</label>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Coordinates: ({item.x || 0}, {item.y || 0})
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
              >
                Edit
              </button>
            </div>
          )}
        </div>
        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {item.category}
        </span>
      </div>
    </div>
  );
}