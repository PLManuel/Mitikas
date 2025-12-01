import { useCallback, useEffect, useState } from 'react';
import type { Producto } from '../types/product';

export function useProduct() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/productos', { credentials: 'include' });
      if (!res.ok) throw new Error('Error loading products');
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = useCallback(async (payload: Omit<Producto, 'id' | 'activo'> & { imagen?: File }) => {
    const formData = new FormData();
    formData.append('nombre', payload.nombre);
    formData.append('descripcion', payload.descripcion);
    formData.append('idCategoria', String(payload.idCategoria));
    if (payload.imagen) formData.append('imagen', payload.imagen);
    const res = await fetch('/api/productos', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error creating product');
    await fetchProducts();
  }, [fetchProducts]);

  const updateProduct = useCallback(async (id: number, payload: Partial<Omit<Producto, 'id' | 'activo'>> & { imagen?: File }) => {
    const formData = new FormData();
    if (payload.nombre) formData.append('nombre', payload.nombre);
    if (payload.descripcion) formData.append('descripcion', payload.descripcion);
    if (payload.idCategoria) formData.append('idCategoria', String(payload.idCategoria));
    if (payload.imagen) formData.append('imagen', payload.imagen);
    const res = await fetch(`/api/productos/${id}`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error updating product');
    await fetchProducts();
  }, [fetchProducts]);

  const toggleProduct = useCallback(async (product: Producto) => {
    const res = await fetch(`/api/productos/${product.id}/${product.activo ? 'desactivar' : 'activar'}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error updating product');
    await fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleProduct,
  };
}
