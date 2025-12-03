import { useEffect, useState } from 'react';
import { PedidoModal } from './PedidoModal';
import { useAuth } from '../context/AuthContext';
import type { MetodoPago } from '../types/metodo-pago';
import type { DeliveryZone } from '../types/deliveryZone';
import type { OrderPayload } from '../types/order';

export function usePedidoModal(
  resumen: { total: number; subtotal: number; descuentos: number },
  clearCart?: () => void
) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [zonas, setZonas] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch('/api/metodos-pago').then(r => r.json()),
      fetch('/api/zonas-delivery').then(r => r.json())
    ]).then(([metodos, zonasData]) => {
      setMetodosPago(metodos);
      setZonas(zonasData);
    });
  }, [open]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (data: OrderPayload) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al procesar el pedido');
      
      const result = await res.json();
      const pedidoId = result.pedido?.id;
      
      setSuccess('¡Pedido realizado con éxito!');
      if (clearCart) clearCart();

      // Descargar la boleta automáticamente
      if (pedidoId) {
        setTimeout(async () => {
          try {
            const boletaRes = await fetch(`/api/pedidos/${pedidoId}/boleta`, {
              credentials: 'include',
            });
            if (boletaRes.ok) {
              const blob = await boletaRes.blob();
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `boleta_${pedidoId}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }
          } catch (err) {
            console.error('Error descargando boleta:', err);
          }
        }, 500);
      }

      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1200);
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <PedidoModal
      open={open}
      onClose={handleClose}
      metodosPago={metodosPago}
      zonas={zonas}
      onSubmit={handleSubmit}
      nombre={user?.nombre || ''}
      apellido={user?.apellidos || ''}
      resumen={resumen}
    />
  );

  return { open, handleOpen, handleClose, modal, loading, error, success };
}
