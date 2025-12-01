import { useEffect, useState } from 'react';
import { IconShoppingCart, IconUser, IconMapPin, IconTruck, IconClock, IconReceipt, IconDiscount, IconPackage, IconHome, IconCheck } from '@tabler/icons-react';

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

interface PedidoAdmin {
  id: number;
  fecha: string;
  nombre: string;
  apellido: string;
  direccion?: string;
  idZonaDelivery?: number | null;
  distrito?: string;
  costoEnvio: number;
  subtotal: number;
  descuentos: number;
  total: number;
  proceso: string;
  productos: ProductoPedido[];
}

const ESTADOS = [
  { value: 'solicitud_recibida', label: 'Solicitud recibida', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'en_preparacion', label: 'En preparación', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  { value: 'en_camino', label: 'En camino', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-700 border-green-300' },
];

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPedidos() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/pedidos');
        const data = await res.json();
        setPedidos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError('Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    }
    fetchPedidos();
  }, []);

  const cambiarEstado = async (id: number, proceso: string) => {
    try {
      const res = await fetch(`/api/pedidos/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proceso }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      setPedidos(pedidos => pedidos.map(p => p.id === id ? { ...p, proceso } : p));
    } catch {
      alert('No se pudo cambiar el estado');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header moderno */}
      <div className="bg-white rounded-2xl shadow-lg border-t-4 border-mtk-principal p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-mtk-principal/10 rounded-xl">
            <IconShoppingCart className="w-8 h-8 text-mtk-principal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
            <p className="text-gray-500 mt-1">Administra y actualiza el estado de los pedidos</p>
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
          <IconShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay pedidos registrados</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {pedidos.map(p => {
            const estadoActual = ESTADOS.find(e => e.value === p.proceso) || ESTADOS[0];
            return (
            <li key={p.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Header del pedido */}
              <div className="bg-linear-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <IconReceipt className="w-5 h-5 text-mtk-principal" />
                    <span className="font-bold text-gray-800">Pedido #{p.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IconClock className="w-4 h-4" />
                    {new Date(p.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <IconUser className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">{p.nombre} {p.apellido}</span>
                  </div>
                </div>
              </div>

              {/* Contenido del pedido */}
              <div className="p-4 space-y-3">
                {/* Estado */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-gray-700">Estado:</label>
                  <select 
                    value={p.proceso} 
                    onChange={e => cambiarEstado(p.id, e.target.value)} 
                    className={`px-3 py-1.5 rounded-lg border-2 font-semibold text-sm transition-colors ${estadoActual.color}`}
                  >
                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>
                {/* Información de entrega */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {p.idZonaDelivery ? (
                      <><IconTruck className="w-4 h-4 text-blue-700" /><span className="font-semibold text-sm text-blue-700">A domicilio</span></>
                    ) : (
                      <><IconHome className="w-4 h-4 text-blue-700" /><span className="font-semibold text-sm text-blue-700">Recojo en tienda</span></>
                    )}
                  </div>
                  {p.idZonaDelivery && p.direccion && (
                    <div className="flex items-start gap-2 text-sm text-gray-700">
                      <IconMapPin className="w-4 h-4 mt-0.5 text-gray-600 shrink-0" />
                      <span>{p.direccion} <span className="font-semibold">({p.distrito})</span></span>
                    </div>
                  )}
                  {!p.idZonaDelivery && (
                    <p className="text-xs text-gray-600 ml-6">Av. Aviación 5095, Galería Nuevo Polvos Rosados</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <span className="text-gray-600">Costo de envío:</span>
                    <span className="font-bold text-gray-800">S/. {typeof p.costoEnvio === 'number' ? p.costoEnvio.toFixed(2) : '0.00'}</span>
                  </div>
                </div>
                {/* Productos */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IconPackage className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-sm text-gray-800">Productos:</span>
                  </div>
                  <div className="space-y-2">
                    {p.productos?.map(prod => (
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
                                {prod.nombrePromocion && (
                                  <span className="text-xs text-green-600">🎉 {prod.nombrePromocion}</span>
                                )}
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
                    <span className="font-semibold">S/. {p.subtotal?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  {Number(p.descuentos) > 0 && (
                    <div className="flex justify-between text-xs text-green-600">
                      <span className="flex items-center gap-1">
                        <IconDiscount className="w-3 h-3" />
                        Descuentos:
                      </span>
                      <span className="font-semibold">-S/. {p.descuentos?.toFixed(2) ?? '0.00'}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-gray-300">
                    <span className="flex items-center gap-1">
                      <IconCheck className="w-4 h-4 text-mtk-principal" />
                      Total:
                    </span>
                    <span className="text-mtk-principal">S/. {p.total?.toFixed(2) ?? '0.00'}</span>
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
