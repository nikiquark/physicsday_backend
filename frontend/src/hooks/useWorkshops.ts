import { useState, useEffect } from 'react';
import { apiService, Workshop, getErrorMessage } from '@/services/api';

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkshops = async () => {
    try {
      setError(null);
      const data = await apiService.getWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Error fetching workshops:', err);
      setError('Не удалось загрузить список мастер-классов. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkshops = async () => {
    try {
      const data = await apiService.getWorkshops();
      setWorkshops(data);
    } catch (err) {
      console.error('Error refreshing workshops:', err);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  return {
    workshops,
    loading,
    error,
    refreshWorkshops,
    refetch: fetchWorkshops
  };
}

// Utility functions for workshops
export function getLimitText(x: number): string {
  if (x === 0) return 'Места закончились';
  if ((x % 100) > 10 && (x % 100) < 15) return `Осталось ${x} мест`;
  if (x % 10 === 1) return `Осталось ${x} место`;
  if (x % 10 > 1 && x % 10 < 5) return `Осталось ${x} места`;
  return `Осталось ${x} мест`;
}