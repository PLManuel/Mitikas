import { useCallback, useState } from 'react';
import type { CartItem, CartResumen, CartResponse } from '../types/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [resumen, setResumen] = useState<CartResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GET /api/carrito
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/carrito', { credentials: 'include' });
      if (!res.ok) throw new Error('Error al cargar el carrito');
      const data: CartResponse = await res.json();
      setItems(data.items);
      setResumen(data.resumen);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /api/carrito
  const addToCart = useCallback(async (payload: { idProducto: number; idVariante: number; cantidad?: number; idPromocion?: number | null }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/carrito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error al agregar al carrito');
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // PUT /api/carrito/:id
  const updateQuantity = useCallback(async (id: number, cantidad: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/carrito/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cantidad }),
      });
      if (!res.ok) throw new Error('Error al actualizar cantidad');
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // DELETE /api/carrito/:id
  const removeFromCart = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/carrito/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al eliminar del carrito');
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // DELETE /api/carrito
  const clearCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/carrito', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al vaciar el carrito');
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  // PATCH /api/carrito/:id/promocion
  const applyPromotion = useCallback(async (id: number, idPromocion: number | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/carrito/${id}/promocion`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idPromocion }),
      });
      if (!res.ok) throw new Error('Error al aplicar promoción');
      await fetchCart();
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  return {
    items,
    resumen,
    loading,
    error,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromotion,
  };
}
