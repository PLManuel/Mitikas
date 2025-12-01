import { useState, useRef } from 'react';
import type { DeliveryZone, DeliveryZoneInput } from '../../types/deliveryZone';
import { useDeliveryZones } from '../../hooks/useDeliveryZones';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconMapPin,
  IconClock,
  IconX,
} from '@tabler/icons-react';

export default function DeliveryZonesAdmin() {
  const {
    zones,
    loading,
    error,
    createZone,
    updateZone,
    toggleZone,
    deleteZone,
    setError,
  } = useDeliveryZones();

  const [editZone, setEditZone] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState<DeliveryZoneInput>({
    distrito: '',
    costo: 0,
    diasEstimados: 1,
  });
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  function openNew() {
    setForm({ distrito: '', costo: 0, diasEstimados: 1 });
    createDialogRef.current?.showModal();
  }

  function openEdit(z: DeliveryZone) {
    setEditZone(z);
    setForm({ distrito: z.distrito, costo: z.costo, diasEstimados: z.diasEstimados });
    editDialogRef.current?.showModal();
  }

  function closeCreateDialog() {
    createDialogRef.current?.close();
  }

  function closeEditDialog() {
    editDialogRef.current?.close();
    setEditZone(null);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createZone(form);
      closeCreateDialog();
      setForm({ distrito: '', costo: 0, diasEstimados: 1 });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editZone) return;
    try {
      await updateZone(editZone.id, form);
      closeEditDialog();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleToggleZone(zone: DeliveryZone) {
    try {
      await toggleZone(zone);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDeleteZone(zone: DeliveryZone) {
    if (window.confirm(`¿Estás seguro de eliminar la zona "${zone.distrito}"?`)) {
      try {
        await deleteZone(zone.id);
      } catch (e: any) {
        setError(e.message);
      }
    }
  }

  return (
    <div className="min-h-screen bg-mtk-fondo p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal/10 p-3 rounded-xl">
                <IconMapPin size={32} className="text-mtk-principal" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Zonas de Delivery</h1>
                <p className="text-gray-600 mt-1">Gestiona las zonas de entrega y sus tarifas</p>
              </div>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-mtk-principal text-white px-6 py-3 rounded-xl hover:bg-mtk-principal/90 transition-colors font-medium shadow-md"
            >
              <IconPlus size={20} />
              Nueva Zona
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Table Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-500 text-lg">Cargando zonas...</div>
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <IconMapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay zonas de delivery registradas</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Distrito
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Días Estimados
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {zones.map((zone: DeliveryZone) => (
                    <tr
                      key={zone.id}
                      className="hover:bg-mtk-fondo transition-colors"
                    >
                      <td className={`px-6 py-4 text-sm text-gray-900 font-medium ${!zone.activo ? 'opacity-60' : ''}`}>
                        #{zone.id}
                      </td>
                      <td className={`px-6 py-4 ${!zone.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <IconMapPin size={18} className="text-mtk-principal" />
                          <span className="font-medium text-gray-900">{zone.distrito}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!zone.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-1 text-gray-700">
                          <span className="font-semibold">S/ {Number(zone.costo).toFixed(2)}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!zone.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2 text-gray-700">
                          <IconClock size={18} className="text-blue-600" />
                          <span>{zone.diasEstimados} {zone.diasEstimados === 1 ? 'día' : 'días'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {zone.activo ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center relative">
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setOpenMenuId(openMenuId === zone.id ? null : zone.id)}
                          >
                            <IconEdit size={20} />
                          </button>
                          {openMenuId === zone.id && (
                            <>
                              <div
                                className="fixed inset-0"
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-10 bg-white z-50 rounded-lg shadow-xl border border-gray-200 py-2 min-w-40">
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-left"
                                  onClick={() => {
                                    openEdit(zone);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <IconEdit size={18} />
                                  <span>Editar</span>
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-4 py-2 transition-colors font-medium text-left ${zone.activo
                                      ? 'text-yellow-600 hover:bg-yellow-50'
                                      : 'text-green-600 hover:bg-green-50'
                                    }`}
                                  onClick={() => {
                                    handleToggleZone(zone);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {zone.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                  <span>{zone.activo ? 'Desactivar' : 'Activar'}</span>
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                                  onClick={() => {
                                    handleDeleteZone(zone);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <IconTrash size={18} />
                                  <span>Eliminar</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <dialog
          ref={createDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 m-auto p-0 max-w-2xl w-full"
        >
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-mtk-principal/10 p-2 rounded-lg">
                  <IconMapPin size={24} className="text-mtk-principal" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Nueva Zona de Delivery</h2>
              </div>
              <button
                type="button"
                onClick={closeCreateDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distrito *
                </label>
                <div className="relative">
                  <IconMapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.distrito}
                    onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: San Miguel, Lima"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Costo *
                  </label>
                  <div className="relative">
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>S/. </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={0.01}
                      value={form.costo}
                      onChange={(e) => setForm({ ...form, costo: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Días Estimados *
                  </label>
                  <div className="relative">
                    <IconClock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={form.diasEstimados}
                      onChange={(e) => setForm({ ...form, diasEstimados: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="submit"
                className="flex-1 bg-mtk-principal text-white py-2.5 px-4 rounded-lg hover:bg-mtk-principal/90 transition-colors font-semibold"
              >
                Crear Zona
              </button>
              <button
                type="button"
                onClick={closeCreateDialog}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </dialog>

        <dialog
          ref={editDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 m-auto p-0 max-w-2xl w-full"
        >
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <IconEdit size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Editar Zona de Delivery</h2>
              </div>
              <button
                type="button"
                onClick={closeEditDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Distrito *
                </label>
                <div className="relative">
                  <IconMapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.distrito}
                    onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: San Miguel, Lima"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Costo *
                  </label>
                  <div className="relative">
                    <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>S/. </span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={0.01}
                      value={form.costo}
                      onChange={(e) => setForm({ ...form, costo: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Días Estimados *
                  </label>
                  <div className="relative">
                    <IconClock size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      step={1}
                      value={form.diasEstimados}
                      onChange={(e) => setForm({ ...form, diasEstimados: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={closeEditDialog}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </div>
  );
}
