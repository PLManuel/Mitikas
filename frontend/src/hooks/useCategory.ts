import { useCallback, useEffect, useState } from 'react';
import type { Categoria } from '../types/category';

export function useCategory() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categorias');
      if (!res.ok) throw new Error('Error al cargar categorías');
      const data = await res.json();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message || 'Error de red');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const createCategory = useCallback(async (name: string, image?: File) => {
    const formData = new FormData();
    formData.append('categoria', name);
    if (image) formData.append('imagen', image);
    const res = await fetch('/api/categorias', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error creating category');
    await fetchCategorias();
  }, [fetchCategorias]);

  const toggleCategory = useCallback(async (cat: Categoria) => {
    const res = await fetch(`/api/categorias/${cat.id}/${cat.activo ? 'desactivar' : 'activar'}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!res.ok) {
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No tienes permisos para modificar categorías. Solo los administradores pueden realizar esta acción.');
      }
      if (res.status === 401) {
        throw new Error('Debes iniciar sesión para realizar esta acción.');
      }
      throw new Error('Error al actualizar la categoría');
    }
    await fetchCategorias();
  }, [fetchCategorias]);

  const deleteCategory = useCallback(async (id: number) => {
    const res = await fetch(`/api/categorias/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Error deleting category');
    }
    await fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    fetchCategorias,
    createCategory,
    toggleCategory,
    deleteCategory,
  };
}
