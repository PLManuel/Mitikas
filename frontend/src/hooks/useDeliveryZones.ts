import { useCallback, useEffect, useState } from 'react';
import type { DeliveryZone, DeliveryZoneInput } from '../types/deliveryZone';

export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/zonas-delivery');
      if (!res.ok) throw new Error('Error loading zones');
      setZones(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const createZone = useCallback(async (data: DeliveryZoneInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/zonas-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error creating zone');
      await fetchZones();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchZones]);

  const updateZone = useCallback(async (id: number, data: Partial<DeliveryZoneInput>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zonas-delivery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error updating zone');
      await fetchZones();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchZones]);

  const toggleZone = useCallback(async (zone: DeliveryZone) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zonas-delivery/${zone.id}/${zone.activo ? 'desactivar' : 'activar'}`, { 
        method: 'PATCH' 
      });
      if (!res.ok) throw new Error(`Error ${zone.activo ? 'deactivating' : 'activating'} zone`);
      await fetchZones();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchZones]);

  const deleteZone = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/zonas-delivery/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting zone');
      await fetchZones();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchZones]);

  return {
    zones,
    loading,
    error,
    fetchZones,
    createZone,
    updateZone,
    toggleZone,
    deleteZone,
    setError,
  };
}
