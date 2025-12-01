import { useEffect, useState } from 'react';
import { IconShoppingBag, IconTruck, IconHome, IconMapPin, IconClock, IconPackage, IconReceipt, IconDiscount, IconSparkles } from '@tabler/icons-react';

interface ProductoPedido {
  id: number;
  nombreProducto: string;
  tamano: string;
  cantidad: number;
  precioUnitario: number;
  precioPromocion: number | null;
  idPromocion?: number | null;
  nombrePromocion?: string | null;
}

interface PedidoResumen {
  id: number;
  fecha: string;
  proceso: string;
  total: number;
  direccion?: string;
  tipoEntrega: string;
  costoEnvio: number;
  subtotal: number;
  descuentos: number;
  productos: ProductoPedido[];
}

export function MisPedidos() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      try {
        const res = await fetch('/api/pedidos/mis-pedidos');
        if (!res.ok) throw new Error('Error al cargar pedidos');
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (e) {
        setPedidos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  // Map estados to color classes
  const getEstadoConfig = (estado: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      'solicitud_recibida': { label: 'Solicitud Recibida', color: 'bg-blue-100 text-blue-800' },
      'en_preparacion': { label: 'En Preparación', color: 'bg-yellow-100 text-yellow-800' },
      'en_camino': { label: 'En Camino', color: 'bg-purple-100 text-purple-800' },
      'entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
    };
    return configs[estado] || { label: estado, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md mb-6 border-t-4 border-mtk-principal">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <IconShoppingBag className="w-6 h-6 text-mtk-principal" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mis Pedidos</h1>
              <p className="text-sm text-gray-600">Historial y estado de tus órdenes</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mtk-principal mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <IconShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tienes pedidos aún.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pedidos.map(p => {
            const estadoConfig = getEstadoConfig(p.proceso);
            return (
            <li key={p.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-linear-to-r from-gray-50 to-white p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <IconPackage className="w-5 h-5 text-mtk-principal shrink-0" />
                    <span className="font-bold text-gray-800">Pedido #{p.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <IconClock className="w-4 h-4" />
                      <span>{new Date(p.fecha).toLocaleDateString()}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoConfig.color}`}>
                      {estadoConfig.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-4 bg-blue-50 border-b border-blue-100">
                <div className="flex items-start gap-2">
                  {p.tipoEntrega === 'domicilio' ? (
                    <IconTruck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  ) : (
                    <IconHome className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-blue-900">
                      {p.tipoEntrega === 'domicilio' ? 'Delivery a domicilio' : 'Recojo en local'}
                    </span>
                    {p.tipoEntrega === 'domicilio' && p.direccion && (
                      <div className="flex items-start gap-1 mt-1">
                        <IconMapPin className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-blue-700">{p.direccion}</span>
                      </div>
                    )}
                    <div className="text-xs text-blue-700 mt-1">
                      Envío: <span className="font-semibold">S/. {p.costoEnvio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Products */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconShoppingBag className="w-4 h-4 text-gray-700" />
                  <span className="text-sm font-semibold text-gray-700">Productos</span>
                </div>
                <div className="space-y-2">
                  {p.productos.map(prod => {
                    const hasDiscount = prod.precioPromocion !== null && prod.precioPromocion < prod.precioUnitario;
                    const totalOriginal = prod.precioUnitario * prod.cantidad;
                    const totalConDescuento = (prod.precioPromocion ?? prod.precioUnitario) * prod.cantidad;
                    
                    return (
                    <div key={prod.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">
                            {prod.nombreProducto}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            Talla: {prod.tamano} • Cantidad: {prod.cantidad}
                          </div>
                          {hasDiscount && prod.nombrePromocion && (
                            <div className="flex items-center gap-1 mt-1">
                              <IconSparkles className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-700 font-medium">{prod.nombrePromocion}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {hasDiscount ? (
                            <>
                              <div className="text-xs line-through text-gray-500">S/. {totalOriginal.toFixed(2)}</div>
                              <div className="text-sm font-bold text-green-700">S/. {totalConDescuento.toFixed(2)}</div>
                            </>
                          ) : (
                            <div className="text-sm font-medium text-gray-800">S/. {totalOriginal.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              {/* Summary */}
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IconShoppingBag className="w-3 h-3" />
                      <span>Subtotal</span>
                    </div>
                    <span className="font-medium text-gray-800">S/. {p.subtotal.toFixed(2)}</span>
                  </div>
                  {p.descuentos > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <IconDiscount className="w-3 h-3" />
                        <span>Descuentos</span>
                      </div>
                      <span className="font-medium text-green-700">-S/. {p.descuentos.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IconTruck className="w-3 h-3" />
                      <span>Envío</span>
                    </div>
                    <span className="font-medium text-gray-800">S/. {p.costoEnvio.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900">
                        <IconReceipt className="w-4 h-4" />
                        <span className="font-bold">Total</span>
                      </div>
                      <span className="font-bold text-lg text-mtk-principal">S/. {p.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
