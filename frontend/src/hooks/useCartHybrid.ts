import { useCallback, useEffect, useState } from 'react';
import type { CartItem, CartResumen, CartResponse } from '../types/cart';
import { usePromotions } from './usePromotions';

const LOCAL_KEY = 'mitikas_cart';

export function useCartHybrid(isAuthenticated: boolean, refreshSignal?: number) {
  const { promotions } = usePromotions();
  const [items, setItems] = useState<CartItem[]>([]);
  const [resumen, setResumen] = useState<CartResumen | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const calcResumen = useCallback((cartItems: CartItem[]): CartResumen => {
    const cantidadItems = cartItems.length;
    const cantidadProductos = cartItems.reduce((sum, i) => sum + i.cantidad, 0);
    const subtotal = cartItems.reduce((sum, i) => sum + i.precioUnitario * i.cantidad, 0);
    const descuentos = cartItems.reduce((sum, i) => sum + ((i.precioUnitario - i.precioConDescuento) * i.cantidad), 0);
    const total = subtotal - descuentos;
    return { cantidadItems, cantidadProductos, subtotal, descuentos, total };
  }, []);

  // Cargar carrito al iniciar y cuando refreshSignal cambia
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      const local = localStorage.getItem(LOCAL_KEY);
      const cart: CartItem[] = local ? JSON.parse(local) : [];
      setItems(cart);
      setResumen(calcResumen(cart));
    }
    // eslint-disable-next-line
  }, [isAuthenticated, refreshSignal]);

  // --- BACKEND ---
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

  // --- LOCAL ---
  const saveLocal = (cart: CartItem[]) => {
    setItems(cart);
    setResumen(calcResumen(cart));
    localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
  };

  // --- AGREGAR ---
  const addToCart = useCallback(async (item: Omit<CartItem, 'id' | 'idUsuario' | 'nombreProducto' | 'imagenProducto' | 'nombrePromocion' | 'tipoPromocion' | 'valorPromocion' | 'precioConDescuento' | 'descuento' | 'subtotal'>) => {
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/carrito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Error al agregar al carrito');
        await fetchCart();
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem(LOCAL_KEY);
      let cart: CartItem[] = local ? JSON.parse(local) : [];
      const idx = cart.findIndex(i => i.idProducto === item.idProducto && i.idVariante === item.idVariante);

      const now = new Date();
      const promo = promotions.find(p => {
        if (!p.activo) return false;
        const start = new Date(p.fechaInicio);
        const end = new Date(p.fechaFin);
        if (now < start || now > end) return false;
        return p.variantes?.some(v => Number(v.idVariante) === Number(item.idVariante));
      });

      const precioConDescuento = promo
        ? promo.tipo === 'porcentaje'
          ? item.precioUnitario * (1 - promo.valor / 100)
          : promo.valor
        : item.precioUnitario;

      const idPromocion = promo?.id ?? null;
      const nombrePromocion = promo?.nombre ?? null;
      const tipoPromocion = promo?.tipo ?? null;
      const valorPromocion = promo?.valor ?? null;

      if (idx >= 0) {
        const updatedItem = cart[idx];
        updatedItem.cantidad += item.cantidad || 1;
        Object.assign(updatedItem, {
          idPromocion,
          nombrePromocion,
          tipoPromocion,
          valorPromocion,
          precioConDescuento,
          subtotal: precioConDescuento * updatedItem.cantidad,
          descuento: (updatedItem.precioUnitario - precioConDescuento) * updatedItem.cantidad,
        });
      } else {
        cart.push({
          ...item,
          id: Date.now(),
          idUsuario: 0,
          nombreProducto: (item as any).nombreProducto || '',
          imagenProducto: (item as any).imagenProducto || '',
          tamano: (item as any).tamano || '',
          precioUnitario: item.precioUnitario,
          precioConDescuento,
          idPromocion,
          nombrePromocion,
          tipoPromocion,
          valorPromocion,
          subtotal: precioConDescuento * (item.cantidad || 1),
          descuento: (item.precioUnitario - precioConDescuento) * (item.cantidad || 1),
        });
      }
      saveLocal(cart);
    }
  }, [isAuthenticated, fetchCart, promotions]);

  const removeFromCart = useCallback(async (idVariante: number) => {
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      try {
        const item = items.find(i => i.idVariante === idVariante);
        if (!item) throw new Error('No existe en el carrito');
        const res = await fetch(`/api/carrito/${item.id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error('Error al eliminar del carrito');
        await fetchCart();
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    } else {
      const local = localStorage.getItem(LOCAL_KEY);
      const cart: CartItem[] = local ? JSON.parse(local) : [];
      saveLocal(cart.filter(i => i.idVariante !== idVariante));
    }
  }, [isAuthenticated, fetchCart, items]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/carrito', { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error('Error al vaciar el carrito');
        await fetchCart();
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    } else {
      saveLocal([]);
    }
  }, [isAuthenticated, fetchCart]);

  // --- SINCRONIZAR LOCAL -> BACK ---
  const syncLocalToBackend = useCallback(async () => {
    const local = localStorage.getItem(LOCAL_KEY);
    const cart: CartItem[] = local ? JSON.parse(local) : [];

    // Si no hay nada en local, no hacemos nada
    if (!cart.length) return;

    try {
      setLoading(true);
      setError(null);

      // 1) Leer carrito actual del backend (de la cuenta)
      const res = await fetch('/api/carrito', { credentials: 'include' });
      if (!res.ok) {
        throw new Error('No se pudo leer el carrito del usuario');
      }

      const data: CartResponse = await res.json();
      const backendItems = data.items ?? [];

      // 2) Mezclar: por cada item local, sumar al backend
      for (const localItem of cart) {
        const existing = backendItems.find(
          (i) => i.idVariante === localItem.idVariante
        );

        if (existing) {
          // Ya existe en el carrito de la cuenta → sumamos cantidades
          const nuevaCantidad = existing.cantidad + localItem.cantidad;

          const updateRes = await fetch(`/api/carrito/${existing.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ cantidad: nuevaCantidad }),
          });

          if (!updateRes.ok) {
            throw new Error('Error al actualizar cantidad al fusionar carritos');
          }

          // Actualizamos también en memoria por si hay más merges
          existing.cantidad = nuevaCantidad;
        } else {
          // No existe en el carrito de la cuenta → lo creamos
          const createRes = await fetch('/api/carrito', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              idProducto: localItem.idProducto,
              idVariante: localItem.idVariante,
              cantidad: localItem.cantidad,
              precioUnitario: localItem.precioUnitario,
            }),
          });

          if (!createRes.ok) {
            throw new Error('Error al crear item al fusionar carritos');
          }
        }
      }

      // 3) Limpiar carrito local SOLO cuando la sync fue bien
      localStorage.removeItem(LOCAL_KEY);

      // 4) Recargar carrito desde backend (ya fusionado)
      await fetchCart();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al sincronizar carrito local con la cuenta');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (idVariante: number, cantidad: number) => {
    if (cantidad <= 0) return removeFromCart(idVariante);

    if (isAuthenticated) {
      setLoading(true);
      setError(null);
      try {
        const item = items.find(i => i.idVariante === idVariante);
        if (!item) throw new Error('No existe en el carrito');

        const res = await fetch(`/api/carrito/${item.id}`, {
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
    } else {
      const local = localStorage.getItem(LOCAL_KEY);
      const cart: CartItem[] = local ? JSON.parse(local) : [];
      const idx = cart.findIndex(i => i.idVariante === idVariante);
      if (idx === -1) return;

      cart[idx].cantidad = cantidad;
      cart[idx].subtotal = cart[idx].precioConDescuento * cantidad;
      saveLocal(cart);
    }
  }, [isAuthenticated, fetchCart, removeFromCart, items]);



  return {
    items,
    resumen,
    loading,
    error,
    addToCart,
    removeFromCart,
    clearCart,
    syncLocalToBackend,
    fetchCart,
    updateQuantity,
  };
}
