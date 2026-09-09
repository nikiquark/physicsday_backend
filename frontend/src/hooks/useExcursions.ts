import { useState, useEffect } from 'react';
import { apiService, Institute, getErrorMessage } from '@/services/api';

export function useExcursions() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInstitutes = async () => {
    try {
      setError(null);
      const data = await apiService.getInstitutes();
      setInstitutes(data);
    } catch (err) {
      console.error('Error fetching institutes:', err);
      setError('Не удалось загрузить список институтов. Попробуйте обновить страницу.');
    } finally {
      setLoading(false);
    }
  };

  const refreshInstitutes = async () => {
    try {
      const data = await apiService.getInstitutes();
      setInstitutes(data);
    } catch (err) {
      console.error('Error refreshing institutes:', err);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  return {
    institutes,
    loading,
    error,
    refreshInstitutes,
    refetch: fetchInstitutes
  };
}

// Utility functions for excursions
export function getLimitText(x: number): string {
  if (x === 0) return 'Места закончились';
  if ((x % 100) > 10 && (x % 100) < 15) return `Осталось ${x} мест`;
  if (x % 10 === 1) return `Осталось ${x} место`;
  if (x % 10 > 1 && x % 10 < 5) return `Осталось ${x} места`;
  return `Осталось ${x} мест`;
}