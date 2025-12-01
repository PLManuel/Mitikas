import { useEffect, useState } from 'react';
import type { Categoria } from '../types/category';
import type { Producto } from '../types/product';

interface CatalogoPorCategoria {
  categoria: Categoria;
  productos: Producto[];
}

export function useCatalog() {
  const [catalog, setCatalog] = useState<CatalogoPorCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      setLoading(true);
      setError(null);
      try {
        const resCat = await fetch('/api/categorias');
        if (!resCat.ok) throw new Error('Error al cargar categorías');
        const categorias: Categoria[] = await resCat.json();
        const catalogo: CatalogoPorCategoria[] = [];
        for (const categoria of categorias) {
          const resProd = await fetch(`/api/productos/categoria/${categoria.id}`);
          if (!resProd.ok) continue;
          const productos: Producto[] = await resProd.json();
          catalogo.push({ categoria, productos });
        }
        if (isMounted) setCatalog(catalogo);
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error de red');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  return { catalog, loading, error };
}
