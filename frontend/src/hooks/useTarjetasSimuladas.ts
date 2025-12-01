import { useCallback, useEffect, useState } from 'react';

export interface TarjetaSimulada {
  id: number;
  numeroTarjeta: string;
  nombreTitular: string;
  fechaExpiracion: string;
  cvv: string;
  saldo: number;
}

export function useTarjetasSimuladas() {
  const [tarjetas, setTarjetas] = useState<TarjetaSimulada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTarjetas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tarjetas');
      if (!res.ok) throw new Error('Error al cargar tarjetas');
      const data = await res.json();
      setTarjetas(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar tarjetas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTarjetas();
  }, [fetchTarjetas]);

  return { tarjetas, loading, error, fetchTarjetas };
}
