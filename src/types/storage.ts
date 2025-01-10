export interface StorageItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  location: string;
  created_at: string;
  x?: number;
  y?: number;
}
export interface StorageCategory {
  id: string;
  name: string;
  color: string;
  created_at: string; 
}