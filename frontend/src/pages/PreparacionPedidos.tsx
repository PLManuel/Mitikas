import { useEffect, useState, useRef } from 'react';
import { IconPackage, IconUser, IconHome, IconTruck, IconClock, IconClipboardCheck, IconX, IconAlertCircle, IconCheck } from '@tabler/icons-react';

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
  direccion?: string;
  distrito?: string;
  idZonaDelivery?: number;
  costoEnvio: number;
  subtotal: number;
  descuentos: number;
  productos: ProductoPedido[];
}

export default function PreparacionPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [productosEstado, setProductosEstado] = useState<Record<number, string>>({});
  const [procesando, setProcesando] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchPedidos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/pedidos');
      if (!res.ok) throw new Error('Error al cargar pedidos');
      const data = await res.json();
      // Filtrar solo pedidos con estado "solicitud_recibida"
      const pedidosFiltrados = Array.isArray(data) ? data.filter((p: Pedido) => p.proceso === 'solicitud_recibida') : [];
      setPedidos(pedidosFiltrados);
    } catch (e) {
      setError('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const abrirModalPreparacion = async (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setProcesando(true);
    
    try {
      // Verificar solicitudes para los productos de este pedido
      const res = await fetch(`/api/solicitudes-productos/pedido/${pedido.id}`);
      if (!res.ok) throw new Error('Error al verificar disponibilidad');
      
      const solicitudes = await res.json();
      
      // Crear mapa de estado de productos
      const estado: Record<number, string> = {};
      
      pedido.productos.forEach(prod => {
        // Buscar si existe una solicitud para esta variante
        const solicitud = solicitudes.find(
          (sol: any) => sol.id_variante === prod.idVariante
        );
        
        if (solicitud) {
          estado[prod.id] = solicitud.estado;
        } else {
          estado[prod.id] = 'no_reportado';
        }
      });
      
      setProductosEstado(estado);
      dialogRef.current?.showModal();
    } catch (e) {
      alert('Error al verificar disponibilidad de productos');
      console.error(e);
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = () => {
    dialogRef.current?.close();
    setSelectedPedido(null);
    setProductosEstado({});
  };

  const confirmarPreparacion = async () => {
    if (!selectedPedido) return;
    setProcesando(true);
    try {
      // Aquí cambiarías el estado del pedido a "en_preparacion"
      const res = await fetch(`/api/pedidos/${selectedPedido.id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proceso: 'en_preparacion' })
      });
      if (!res.ok) throw new Error('Error al cambiar estado');
      alert('Pedido marcado como "En Preparación"');
      cerrarModal();
      fetchPedidos();
    } catch (e) {
      alert('Error al confirmar preparación');
    } finally {
      setProcesando(false);
    }
  };

  const reportarFaltantes = async () => {
    if (!selectedPedido) return;
    setProcesando(true);
    try {
      // Obtener productos faltantes (solo los que NO han sido reportados)
      const faltantes = selectedPedido.productos
        .filter(p => productosEstado[p.id] === 'no_reportado')
        .map(p => ({
          idVariante: p.idVariante,
          cantidad: p.cantidad
        }));

      if (faltantes.length === 0) {
        alert('No hay productos faltantes para reportar');
        return;
      }

      // Enviar al backend
      const res = await fetch('/api/solicitudes-productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPedido: selectedPedido.id,
          productosFaltantes: faltantes
        })
      });

      if (!res.ok) throw new Error('Error al reportar faltantes');

      alert('Faltantes reportados exitosamente a logística');
      cerrarModal();
      fetchPedidos();
    } catch (e) {
      alert('Error al reportar faltantes');
      console.error(e);
    } finally {
      setProcesando(false);
    }
  };

  const todosDisponibles = selectedPedido
    ? selectedPedido.productos.every(p => productosEstado[p.id] === 'recibido')
    : false;
  
  const hayProductosNoReportados = selectedPedido
    ? selectedPedido.productos.some(p => productosEstado[p.id] === 'no_reportado')
    : false;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md mb-6 border-t-4 border-mtk-principal">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <IconPackage className="w-6 h-6 text-mtk-principal" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Preparación de Pedidos</h1>
              <p className="text-sm text-gray-600">Gestiona y prepara los pedidos de los clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mtk-principal mb-4"></div>
          <p className="text-gray-600">Cargando pedidos...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <IconPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay pedidos para preparar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pedidos.map(pedido => {
            const esRecojo = pedido.costoEnvio === 0;
            return (
              <div key={pedido.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <IconPackage className="w-4 h-4 text-mtk-principal shrink-0" />
                        <span className="font-bold text-gray-800">#{pedido.id}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconUser className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-sm text-gray-700 font-medium">{pedido.nombre} {pedido.apellido}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <IconClock className="w-3.5 h-3.5" />
                        {new Date(pedido.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {esRecojo ? (
                        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          <IconHome className="w-3.5 h-3.5" />
                          Recojo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                          <IconTruck className="w-3.5 h-3.5" />
                          Delivery
                        </span>
                      )}
                      <span className="text-xs text-gray-600">
                        {pedido.productos.length} producto(s) • {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)} unidad(es)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-mtk-principal">S/. {pedido.total.toFixed(2)}</span>
                      <button
                        onClick={() => abrirModalPreparacion(pedido)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-mtk-principal hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                      >
                        <IconClipboardCheck className="w-4 h-4" />
                        Preparar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Preparación */}
      <dialog ref={dialogRef} className="rounded-2xl shadow-2xl backdrop:bg-black/60 p-0 max-w-3xl w-full m-auto">
        {selectedPedido && (
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-gray-50 to-white p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconClipboardCheck className="w-5 h-5 text-mtk-principal" />
                  <h2 className="text-lg font-bold text-gray-800">Verificar Disponibilidad - Pedido #{selectedPedido.id}</h2>
                </div>
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <IconX className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                {selectedPedido.productos.map(prod => {
                  const estadoProd = productosEstado[prod.id];
                  
                  let bgColor = 'bg-red-50 border-red-200';
                  let badgeColor = 'text-red-700 bg-red-100';
                  let badgeText = 'No reportado';
                  let badgeIcon = <IconAlertCircle className="w-3 h-3" />;
                  
                  if (estadoProd === 'recibido') {
                    bgColor = 'bg-green-50 border-green-200';
                    badgeColor = 'text-green-700 bg-green-100';
                    badgeText = 'Disponible';
                    badgeIcon = <IconCheck className="w-3 h-3" />;
                  } else if (estadoProd === 'pendiente' || estadoProd === 'en_proceso') {
                    bgColor = 'bg-yellow-50 border-yellow-200';
                    badgeColor = 'text-yellow-700 bg-yellow-100';
                    badgeText = estadoProd === 'pendiente' ? 'Ya reportado' : 'En proceso';
                    badgeIcon = <IconClock className="w-3 h-3" />;
                  }
                  
                  return (
                    <div
                      key={prod.id}
                      className={`rounded-lg p-3 border-2 ${bgColor}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-800">{prod.nombreProducto}</span>
                            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                              {badgeIcon}
                              {badgeText}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Talla: <span className="font-medium">{prod.tamano}</span> • 
                            Cantidad requerida: <span className="font-bold text-mtk-principal">{prod.cantidad}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">
                            S/. {((prod.precioPromocion ?? prod.precioUnitario) * prod.cantidad).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!todosDisponibles && hayProductosNoReportados && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IconAlertCircle className="w-5 h-5 text-yellow-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">Productos faltantes detectados</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Al reportar faltantes, el área de logística será notificada para solicitar estos productos al proveedor.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {!todosDisponibles && !hayProductosNoReportados && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <IconClock className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Esperando respuesta de logística</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Los productos faltantes ya fueron reportados y están siendo gestionados por el área de logística.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                {todosDisponibles && (
                  <button
                    onClick={confirmarPreparacion}
                    disabled={procesando}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-60"
                  >
                    {procesando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <IconCheck className="w-4 h-4" />
                        <span>Confirmar Preparación</span>
                      </>
                    )}
                  </button>
                )}
                {!todosDisponibles && hayProductosNoReportados && (
                  <button
                    onClick={reportarFaltantes}
                    disabled={procesando}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-yellow-600 to-yellow-700 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-60"
                  >
                    {procesando ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      <>
                        <IconAlertCircle className="w-4 h-4" />
                        <span>Reportar Faltantes</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
