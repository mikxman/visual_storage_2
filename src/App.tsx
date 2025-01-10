import { useEffect, useState } from 'react';
import { StorageItem } from './types/storage';
import { getStorageItems } from './lib/supabase';
import StorageGrid from './components/StorageGrid';
import AddItemForm from './components/AddItemForm';
import VisualizationPage from './components/visualization/VisualizationPage';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';

export default function App() {
  const [items, setItems] = useState<StorageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'grid' | 'visualization'>('grid');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Visual Storage</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-md ${
                  view === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setView('visualization')}
                className={`px-4 py-2 rounded-md ${
                  view === 'visualization'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Visualizations
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'grid' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <AddItemForm />
            </div>
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-gray-500">Loading items...</p>
                </div>
              ) : (
                <StorageGrid items={items} />
              )}
            </div>
          </div>
        ) : (
          <VisualizationPage />
        )}
      </main>
    </div>
  );
}