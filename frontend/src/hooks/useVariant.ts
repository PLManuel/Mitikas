import { useCallback, useEffect, useState } from 'react';
import type { VarianteProducto } from '../types/variant';

export function useVariant(productId?: number) {
  const [variants, setVariants] = useState<VarianteProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/variantes/producto/${productId}`);
      if (!res.ok) throw new Error('Error loading variants');
      const data = await res.json();
      setVariants(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const createVariant = useCallback(async (payload: Omit<VarianteProducto, 'id' | 'activo'>) => {
    const formData = new FormData();
    formData.append('idProducto', String(payload.id_producto));
    formData.append('tamano', payload.tamano);
    formData.append('precioVenta', String(payload.precioVenta));
    const res = await fetch('/api/variantes', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Error creating variant');
    }
    await fetchVariants();
  }, [fetchVariants]);

  const updateVariant = useCallback(async (id: number, payload: Partial<Omit<VarianteProducto, 'id' | 'activo'>>) => {
    const formData = new FormData();
    if (payload.tamano) formData.append('tamano', payload.tamano);
    if (payload.precioVenta !== undefined) formData.append('precioVenta', String(payload.precioVenta));
    const res = await fetch(`/api/variantes/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error updating variant');
    await fetchVariants();
  }, [fetchVariants]);

  const toggleVariant = useCallback(async (variant: VarianteProducto) => {
    const res = await fetch(`/api/variantes/${variant.id}/${variant.activo ? 'desactivar' : 'activar'}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error updating variant');
    await fetchVariants();
  }, [fetchVariants]);

  return {
    variants,
    loading,
    error,
    fetchVariants,
    createVariant,
    updateVariant,
    toggleVariant,
  };
}
