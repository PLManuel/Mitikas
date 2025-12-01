import { useCallback, useEffect, useState } from 'react';
import type { MetodoPago } from '../types/metodo-pago';

export function useMetodosPago() {
  const [metodos, setMetodos] = useState<MetodoPago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/metodos-pago');
      if (!res.ok) throw new Error('Error al cargar métodos');
      setMetodos(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetodos();
  }, [fetchMetodos]);

  const createMetodo = useCallback(async (data: Omit<MetodoPago, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/metodos-pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear método');
      await fetchMetodos();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetodos]);

  const updateMetodo = useCallback(async (id: number, data: Partial<Omit<MetodoPago, 'id'>>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/metodos-pago/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar método');
      await fetchMetodos();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetodos]);

  const deleteMetodo = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/metodos-pago/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar método');
      await fetchMetodos();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchMetodos]);

  return {
    metodos,
    loading,
    error,
    fetchMetodos,
    createMetodo,
    updateMetodo,
    deleteMetodo,
    setMetodos,
    setError,
  };
}
