import { useState } from 'react';

export interface Area {
  id: string;
  name: string;
  slug: string;
  postcode: string;
  description: string;
  response_time: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Areas (admin_areas_cover) are not used in this project.
 * Returns empty list without calling the API.
 */
export function useAreas() {
  const [areas] = useState<Area[]>([]);
  const loading = false;
  const error: string | null = null;
  return { areas, loading, error };
} 