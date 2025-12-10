import { useEffect, useState, useRef } from 'react';
import { IconTruck, IconPackage, IconCheck, IconAlertCircle, IconX, IconShoppingCart, IconClock } from '@tabler/icons-react';

interface SolicitudAgrupada {
  id_variante: number;
  id_producto: number;
  nombre_producto: string;
  tamano: string;
  cantidad_total: number;
  cantidad_pedidos: number;
  ids_solicitudes: string;
  estado: string;
  fecha_primera_solicitud: string;
}

export default function GestionProductos() {
  const [solicitudes, setSolicitudes] = useState<SolicitudAgrupada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAgrupada | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/solicitudes-productos/agrupadas');
      if (!res.ok) throw new Error('Error al cargar solicitudes');
      const data = await res.json();
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const abrirModalPedido = (solicitud: SolicitudAgrupada) => {
    setSelectedSolicitud(solicitud);
    dialogRef.current?.showModal();
  };

  const cerrarModal = () => {
    dialogRef.current?.close();
    setSelectedSolicitud(null);
  };

  const solicitarProveedor = async () => {
    if (!selectedSolicitud) return;
    setProcesando(true);
    
    try {
      const idsSolicitudes = selectedSolicitud.ids_solicitudes.split(',').map(id => parseInt(id));
      
      const res = await fetch('/api/solicitudes-productos/estado', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idsSolicitudes,
          estado: 'en_proceso',
          fechaRecepcion: null
        })
      });

      if (!res.ok) throw new Error('Error al solicitar a proveedor');

      alert('Solicitud enviada al proveedor exitosamente');
      cerrarModal();
      fetchSolicitudes();
    } catch (e) {
      alert('Error al solicitar a proveedor');
      console.error(e);
    } finally {
      setProcesando(false);
    }
  };

  const marcarComoRecibido = async (solicitud: SolicitudAgrupada) => {
    if (!confirm(`¿Confirmar que se recibieron ${solicitud.cantidad_total} unidades de ${solicitud.nombre_producto} (${solicitud.tamano})?`)) {
      return;
    }

    setProcesando(true);
    try {
      const idsSolicitudes = solicitud.ids_solicitudes.split(',').map(id => parseInt(id));
      const fechaRecepcion = new Date().toISOString();

      const res = await fetch('/api/solicitudes-productos/estado', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idsSolicitudes,
          estado: 'recibido',
          fechaRecepcion
        })
      });

      if (!res.ok) throw new Error('Error al marcar como recibido');

      alert('Productos marcados como recibidos');
      fetchSolicitudes();
    } catch (e) {
      alert('Error al marcar como recibido');
      console.error(e);
    } finally {
      setProcesando(false);
    }
  };

  const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const solicitudesEnProceso = solicitudes.filter(s => s.estado === 'en_proceso');

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md mb-6 border-t-4 border-mtk-principal">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <IconTruck className="w-6 h-6 text-mtk-principal" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Productos</h1>
              <p className="text-sm text-gray-600">Solicita productos faltantes a proveedores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading/Error */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mtk-principal mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Solicitudes Pendientes */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconAlertCircle className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-800">
                Solicitudes Pendientes ({solicitudesPendientes.length})
              </h2>
            </div>
            
            {solicitudesPendientes.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                No hay solicitudes pendientes
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {solicitudesPendientes.map(sol => (
                  <div key={sol.id_variante} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-yellow-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1">{sol.nombre_producto}</h3>
                          <p className="text-sm text-gray-600">Talla: {sol.tamano}</p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                          Pendiente
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Cantidad total:</span>
                          <span className="text-lg font-bold text-mtk-principal">{sol.cantidad_total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Pedidos afectados:</span>
                          <span className="text-sm font-medium text-gray-700">{sol.cantidad_pedidos}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <IconClock className="w-3 h-3" />
                        <span>{new Date(sol.fecha_primera_solicitud).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => abrirModalPedido(sol)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
                      >
                        <IconShoppingCart className="w-4 h-4" />
                        <span>Solicitar a Proveedor</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Solicitudes En Proceso */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IconPackage className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">
                En Proceso ({solicitudesEnProceso.length})
              </h2>
            </div>
            
            {solicitudesEnProceso.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                No hay productos en proceso
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {solicitudesEnProceso.map(sol => (
                  <div key={sol.id_variante} className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-blue-500">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1">{sol.nombre_producto}</h3>
                          <p className="text-sm text-gray-600">Talla: {sol.tamano}</p>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                          En proceso
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Cantidad esperada:</span>
                          <span className="text-lg font-bold text-mtk-principal">{sol.cantidad_total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Pedidos afectados:</span>
                          <span className="text-sm font-medium text-gray-700">{sol.cantidad_pedidos}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => marcarComoRecibido(sol)}
                        disabled={procesando}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium disabled:opacity-60"
                      >
                        <IconCheck className="w-4 h-4" />
                        <span>Marcar como Recibido</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Simular Pedido a Proveedor */}
      <dialog ref={dialogRef} className="rounded-2xl shadow-2xl backdrop:bg-black/60 p-0 max-w-md w-full m-auto">
        {selectedSolicitud && (
          <div className="bg-white rounded-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-gray-50 to-white p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconShoppingCart className="w-5 h-5 text-mtk-principal" />
                  <h2 className="text-lg font-bold text-gray-800">Solicitar a Proveedor</h2>
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
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-gray-800 mb-2">{selectedSolicitud.nombre_producto}</h3>
                <p className="text-sm text-gray-600 mb-3">Talla: {selectedSolicitud.tamano}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cantidad a solicitar:</span>
                    <span className="text-2xl font-bold text-mtk-principal">{selectedSolicitud.cantidad_total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pedidos afectados:</span>
                    <span className="font-medium text-gray-800">{selectedSolicitud.cantidad_pedidos}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  onClick={solicitarProveedor}
                  disabled={procesando}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-60"
                >
                  {procesando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck className="w-4 h-4" />
                      <span>Confirmar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
