import { useEffect, useState } from 'react';
import { IconPackage, IconUser, IconHome, IconReceipt, IconClock, IconCheck, IconDiscount } from '@tabler/icons-react';

interface ProductoPedido {
  id: number;
  idVariante: number;
  nombreProducto: string;
  tamano: string;
  cantidad: number;
  precioUnitario: number;
  precioPromocion: number | null;
}

interface Pedido {
  id: number;
  fecha: string;
  proceso: string;
  total: number;
  nombre: string;
  apellido: string;
  costoEnvio: number;
  subtotal: number;
  descuentos: number;
  productos: ProductoPedido[];
}

export default function EntregaTienda() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) throw new Error('Error al cargar pedidos');
      const data = await res.json();
      // Filtrar pedidos de recojo en tienda (costoEnvio === 0) que estén listos para recoger
      const pedidosTienda = Array.isArray(data) 
        ? data.filter((p: Pedido) => p.costoEnvio === 0 && p.proceso === 'listo_para_recoger') 
        : [];
      setPedidos(pedidosTienda);
    } catch (e) {
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const marcarComoEntregado = async (idPedido: number) => {
    if (!confirm('¿Confirmar que el pedido fue entregado?')) return;
    
    try {
      const res = await fetch(`/api/pedidos/${idPedido}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proceso: 'entregado' }),
        credentials: 'include'
      });
      
      if (!res.ok) throw new Error('Error al actualizar estado');
      
      alert('Pedido marcado como entregado');
      fetchPedidos();
    } catch (e) {
      alert('Error al marcar como entregado');
    }
  };

  const getEstadoConfig = (estado: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'solicitud_recibida': { label: 'Solicitud Recibida', color: 'bg-blue-100 text-blue-800' },
      'en_preparacion': { label: 'En Preparación', color: 'bg-yellow-100 text-yellow-800' },
      'listo_para_recoger': { label: 'Listo para Recoger', color: 'bg-indigo-100 text-indigo-800' },
      'en_camino': { label: 'En Camino', color: 'bg-purple-100 text-purple-800' },
      'entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
    };
    return configs[estado] || configs['solicitud_recibida'];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border-t-4 border-mtk-principal p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mtk-principal/10 rounded-xl">
            <IconHome className="w-8 h-8 text-mtk-principal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Entrega en Tienda</h1>
            <p className="text-gray-500 mt-1">Pedidos listos para recoger en tienda</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-mtk-principal"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <IconHome className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay pedidos listos para recoger</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pedidos.map(pedido => {
            const estadoConfig = getEstadoConfig(pedido.proceso);
            return (
              <div key={pedido.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header del pedido */}
                <div className="bg-linear-to-r from-indigo-50 to-indigo-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <IconReceipt className="w-5 h-5 text-mtk-principal" />
                      <span className="font-bold text-gray-800">Pedido #{pedido.id}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${estadoConfig.color}`}>
                      {estadoConfig.label}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <IconClock className="w-4 h-4" />
                      {new Date(pedido.fecha).toLocaleDateString('es-PE', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-gray-700">
                      <IconUser className="w-4 h-4" />
                      <span className="font-semibold">{pedido.nombre} {pedido.apellido}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  {/* Tipo de entrega */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <IconHome className="w-4 h-4 text-blue-700" />
                      <span className="font-semibold text-sm text-blue-700">Recojo en tienda</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-6 mt-1">Av. Aviación 5095, Galería Nuevo Polvos Rosados</p>
                  </div>

                  {/* Productos */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <IconPackage className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-sm text-gray-800">Productos:</span>
                    </div>
                    <div className="space-y-2">
                      {pedido.productos?.map(prod => (
                        <div key={prod.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-gray-800">{prod.nombreProducto}</div>
                              <div className="text-xs text-gray-600">Talla: {prod.tamano} • Cantidad: {prod.cantidad}</div>
                            </div>
                            <div className="text-right">
                              {prod.precioPromocion !== null && prod.precioPromocion < prod.precioUnitario ? (
                                <div className="flex flex-col items-end">
                                  <span className="line-through text-gray-400 text-xs">S/. {(prod.precioUnitario * prod.cantidad).toFixed(2)}</span>
                                  <span className="text-green-600 font-bold text-sm">S/. {(prod.precioPromocion * prod.cantidad).toFixed(2)}</span>
                                </div>
                              ) : (
                                <span className="font-bold text-sm text-gray-800">S/. {(prod.precioUnitario * prod.cantidad).toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <IconReceipt className="w-3 h-3" />
                        Subtotal:
                      </span>
                      <span className="font-semibold">S/. {pedido.subtotal?.toFixed(2) ?? '0.00'}</span>
                    </div>
                    {Number(pedido.descuentos) > 0 && (
                      <div className="flex justify-between text-xs text-green-600">
                        <span className="flex items-center gap-1">
                          <IconDiscount className="w-3 h-3" />
                          Descuentos:
                        </span>
                        <span className="font-semibold">-S/. {pedido.descuentos?.toFixed(2) ?? '0.00'}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-gray-300">
                      <span className="flex items-center gap-1">
                        <IconCheck className="w-4 h-4 text-mtk-principal" />
                        Total:
                      </span>
                      <span className="text-mtk-principal">S/. {pedido.total?.toFixed(2) ?? '0.00'}</span>
                    </div>
                  </div>

                  {/* Botón de entrega */}
                  <button
                    onClick={() => marcarComoEntregado(pedido.id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-2"
                  >
                    <IconCheck className="w-5 h-5" />
                    Marcar como Entregado
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
