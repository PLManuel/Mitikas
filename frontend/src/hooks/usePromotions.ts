import { useCallback, useState, useEffect } from 'react';
import type { Promotion, PromotionVariant, PromotionWithVariants } from '../types/promotion';

export function usePromotions() {
  const [promotions, setPromotions] = useState<PromotionWithVariants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/promociones');
      if (!res.ok) throw new Error('Error al cargar promociones');
      setPromotions(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const createPromotion = useCallback(async (data: Omit<Promotion, 'id' | 'activo'> & { variantes?: number[] }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/promociones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al crear promoción');
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPromotions]);



  const deletePromotionReal = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar promoción');
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPromotions]);

  const updatePromotion = useCallback(async (id: number, data: Partial<Omit<Promotion, 'id'>>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al actualizar promoción');
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPromotions]);

  const deletePromotion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}/desactivar`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Error al desactivar promoción');
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPromotions]);

  const activatePromotion = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}/activar`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Error al activar promoción');
      await fetchPromotions();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchPromotions]);

  const fetchPromotionVariants = useCallback(async (id: number): Promise<PromotionVariant[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}/variantes`);
      if (!res.ok) throw new Error('Error al cargar variantes de promoción');
      return await res.json();
    } catch (e: any) {
      setError(e.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addVariantToPromotion = useCallback(async (id: number, idVariante: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}/variantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVariante }),
      });
      if (!res.ok) throw new Error('Error al agregar variante');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeVariantFromPromotion = useCallback(async (id: number, idVariante: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/promociones/${id}/variantes/${idVariante}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al quitar variante');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
    deletePromotionReal,
    activatePromotion,
    fetchPromotionVariants,
    addVariantToPromotion,
    removeVariantFromPromotion,
    setPromotions,
    setError,
  };
}
