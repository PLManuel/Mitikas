import { useCatalog } from '../../hooks/useCatalog';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePromotions } from '../../hooks/usePromotions';
import type { Promotion, PromotionType, PromotionVariant } from '../../types/promotion';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconDiscount,
  IconCalendar,
  IconPercentage,
  IconTag,
  IconX,
  IconShirt,
} from '@tabler/icons-react';

const PROMO_TYPES: { value: PromotionType; label: string }[] = [
  { value: 'porcentaje', label: 'Porcentaje' },
  { value: 'precio_fijo', label: 'Precio fijo' },
];

export default function PromotionsAdmin() {
  const { user } = useAuth();
  const {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,  
    updatePromotion,
    deletePromotion,
    deletePromotionReal,
    activatePromotion,
    fetchPromotionVariants,
    setError,
  } = usePromotions();
  const { catalog } = useCatalog();

  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<Omit<Promotion, 'id' | 'activo'> & { activo?: boolean }>({
    nombre: '',
    tipo: 'porcentaje',
    valor: 0,
    fechaInicio: '',
    fechaFin: '',
  });
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [availableVariants, setAvailableVariants] = useState<{ id: number; label: string }[]>([]);
  const [promoVariants, setPromoVariants] = useState<Record<number, PromotionVariant[]>>({});
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [viewingVariantsPromoId, setViewingVariantsPromoId] = useState<number | null>(null);

  const createDialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);
  const variantsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    async function fetchAvailableVariants() {
      const allVariants: { id: number; label: string }[] = [];
      for (const cat of catalog) {
        for (const prod of cat.productos) {
          const res = await fetch(`/api/variantes/producto/${prod.id}`);
          if (!res.ok) continue;
          const variants = await res.json();
          for (const v of variants) {
            allVariants.push({
              id: v.id,
              label: `${prod.nombre} - ${v.tamano} (S/ ${v.precioVenta})`,
            });
          }
        }
      }
      const resPromos = await fetch('/api/promociones/vigentes');
      const promos = resPromos.ok ? await resPromos.json() : [];
      const usedVariantIds = new Set<number>();
      for (const promo of promos) {
        if (editPromotion && promo.id === editPromotion.id) continue;
        const resVars = await fetch(`/api/promociones/${promo.id}/variantes`);
        if (!resVars.ok) continue;
        const vars = await resVars.json();
        for (const v of vars) usedVariantIds.add(v.idVariante);
      }
      let currentPromoVariantIds: number[] = [];
      if (editPromotion) {
        const resVars = await fetch(`/api/promociones/${editPromotion.id}/variantes`);
        if (resVars.ok) {
          const vars = await resVars.json();
          currentPromoVariantIds = vars.map((v: any) => v.idVariante);
        }
      }
      setAvailableVariants(
        allVariants.filter(v =>
          !usedVariantIds.has(v.id) || currentPromoVariantIds.includes(v.id)
        )
      );
    }
    if (createDialogRef.current?.open || editDialogRef.current?.open) fetchAvailableVariants();
  }, [catalog, createDialogRef.current?.open, editDialogRef.current?.open, editPromotion]);

  useEffect(() => {
    async function fetchAllPromoVariants() {
      const result: Record<number, PromotionVariant[]> = {};
      for (const promo of promotions) {
        const vars = await fetchPromotionVariants(promo.id);
        result[promo.id] = vars;
      }
      setPromoVariants(result);
    }
    if (promotions.length > 0) fetchAllPromoVariants();
  }, [promotions, fetchPromotionVariants]);

  function openNew() {
    setEditPromotion(null);
    setSelectedVariants([]);
    setForm({ nombre: '', tipo: 'porcentaje', valor: 0, fechaInicio: '', fechaFin: '' });
    createDialogRef.current?.showModal();
  }

  function openEdit(p: Promotion) {
    setEditPromotion(p);
    setForm({
      nombre: p.nombre,
      tipo: p.tipo,
      valor: p.valor,
      fechaInicio: p.fechaInicio.slice(0, 10),
      fechaFin: p.fechaFin.slice(0, 10),
    });
    fetchPromotionVariants(p.id).then(vars => {
      setSelectedVariants(vars.map(v => v.idVariante));
    });
    editDialogRef.current?.showModal();
  }

  function closeCreateDialog() {
    createDialogRef.current?.close();
    setSelectedVariants([]);
  }

  function closeEditDialog() {
    editDialogRef.current?.close();
    setEditPromotion(null);
    setSelectedVariants([]);
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPromotion({ ...form, variantes: selectedVariants });
      await fetchPromotions();
      closeCreateDialog();
      setForm({ nombre: '', tipo: 'porcentaje', valor: 0, fechaInicio: '', fechaFin: '' });
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editPromotion) return;
    try {
      await updatePromotion(editPromotion.id, form);
      const res = await fetch(`/api/promociones/${editPromotion.id}/variantes`);
      const current = res.ok ? await res.json() : [];
      const currentIds = current.map((v: any) => v.idVariante);
      const toAdd = selectedVariants.filter((id: number) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: number) => !selectedVariants.includes(id));
      await Promise.all([
        ...toAdd.map((idVariante: number) => fetch(`/api/promociones/${editPromotion.id}/variantes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idVariante })
        })),
        ...toRemove.map((idVariante: number) => fetch(`/api/promociones/${editPromotion.id}/variantes/${idVariante}`, {
          method: 'DELETE'
        }))
      ]);
      await fetchPromotions();
      closeEditDialog();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleTogglePromotion(promo: Promotion) {
    try {
      if (promo.activo) {
        await deletePromotion(promo.id);
      } else {
        await activatePromotion(promo.id);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDeletePromotion(promo: Promotion) {
    if (window.confirm(`¿Estás seguro de eliminar la promoción "${promo.nombre}"?`)) {
      try {
        await deletePromotionReal(promo.id);
      } catch (e: any) {
        setError(e.message);
      }
    }
  }

  if (!user || user.rol !== 'admin') return <div>No autorizado</div>;

  return (
    <div className="min-h-screen bg-mtk-fondo p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal/10 p-3 rounded-xl">
                <IconDiscount size={32} className="text-mtk-principal" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Promociones</h1>
                <p className="text-gray-600 mt-1">Gestiona las promociones y descuentos de productos</p>
              </div>
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-2 bg-mtk-principal text-white px-6 py-3 rounded-xl hover:bg-mtk-principal/90 transition-colors font-medium shadow-md"
            >
              <IconPlus size={20} />
              Nueva Promoción
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-500 text-lg">Cargando promociones...</div>
          </div>
        ) : promotions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <IconDiscount size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay promociones registradas</p>
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
                      Nombre
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo / Valor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vigencia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Variantes
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
                  {promotions.map((promo: Promotion) => (
                    <tr
                      key={promo.id}
                      className="hover:bg-mtk-fondo transition-colors"
                    >
                      <td className={`px-6 py-4 text-sm text-gray-900 font-medium ${!promo.activo ? 'opacity-60' : ''}`}>
                        #{promo.id}
                      </td>
                      <td className={`px-6 py-4 ${!promo.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <IconTag size={18} className="text-mtk-principal" />
                          <span className="font-medium text-gray-900">{promo.nombre}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!promo.activo ? 'opacity-60' : ''}`}>
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold w-fit ${
                            promo.tipo === 'porcentaje' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {promo.tipo === 'porcentaje' ? (
                              <>
                                <IconPercentage size={14} />
                                Porcentaje
                              </>
                            ) : (
                              <>
                                <span className="text-xs">S/.</span>
                                Precio Fijo
                              </>
                            )}
                          </span>
                          <span className="text-gray-700 font-bold">
                            {promo.tipo === 'porcentaje' ? `${promo.valor}%` : `S/ ${Number(promo.valor).toFixed(2)}`}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!promo.activo ? 'opacity-60' : ''}`}>
                        <div className="flex flex-col gap-1 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <IconCalendar size={16} className="text-blue-600" />
                            <span className="font-medium">Inicio:</span>
                            <span>{new Date(promo.fechaInicio).toLocaleDateString('es-PE')}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <IconCalendar size={16} className="text-red-600" />
                            <span className="font-medium">Fin:</span>
                            <span>{new Date(promo.fechaFin).toLocaleDateString('es-PE')}</span>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!promo.activo ? 'opacity-60' : ''}`}>
                        <div className="max-w-xs">
                          {promoVariants[promo.id]?.length ? (
                            <button
                              onClick={() => {
                                setViewingVariantsPromoId(promo.id);
                                variantsDialogRef.current?.showModal();
                              }}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                            >
                              <IconShirt size={16} />
                              {promoVariants[promo.id].length} {promoVariants[promo.id].length === 1 ? 'variante' : 'variantes'}
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm italic">Sin variantes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {promo.activo ? (
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
                            onClick={() => setOpenMenuId(openMenuId === promo.id ? null : promo.id)}
                          >
                            <IconEdit size={20} />
                          </button>
                          {openMenuId === promo.id && (
                            <>
                              <div
                                className="fixed inset-0"
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-10 bg-white z-50 rounded-lg shadow-xl border border-gray-200 py-2 min-w-40">
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-left"
                                  onClick={() => {
                                    openEdit(promo);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <IconEdit size={18} />
                                  <span>Editar</span>
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-4 py-2 transition-colors font-medium text-left ${
                                    promo.activo
                                      ? 'text-yellow-600 hover:bg-yellow-50'
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  onClick={() => {
                                    handleTogglePromotion(promo);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {promo.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                  <span>{promo.activo ? 'Desactivar' : 'Activar'}</span>
                                </button>
                                <hr className="my-1 border-gray-200" />
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                                  onClick={() => {
                                    handleDeletePromotion(promo);
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

        {/* Create Dialog */}
        <dialog
          ref={createDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-3xl w-full m-auto"
        >
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-mtk-principal/10 p-2 rounded-lg">
                  <IconDiscount size={24} className="text-mtk-principal" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Nueva Promoción</h2>
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
                  Nombre de la Promoción *
                </label>
                <div className="relative">
                  <IconTag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: Cyber Monday 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Promoción *
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as PromotionType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                  >
                    {PROMO_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      {form.tipo === 'porcentaje' ? '%' : 'S/.'}
                    </span>
                    <input
                      type="number"
                      required
                      min={0.01}
                      step={0.01}
                      value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <div className="relative">
                    <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={form.fechaInicio}
                      onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Fin *
                  </label>
                  <div className="relative">
                    <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={form.fechaFin}
                      onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecciona las variantes a aplicar la promoción:
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {availableVariants.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                      <IconShirt size={32} className="text-gray-300 mx-auto mb-2" />
                      No hay variantes disponibles
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableVariants.map(v => (
                        <label key={v.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedVariants.includes(v.id)}
                            onChange={e => {
                              setSelectedVariants(sel =>
                                e.target.checked
                                  ? [...sel, v.id]
                                  : sel.filter(id => id !== v.id)
                              );
                            }}
                            className="w-4 h-4 text-mtk-principal focus:ring-mtk-principal border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{v.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedVariants.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedVariants.length} {selectedVariants.length === 1 ? 'variante seleccionada' : 'variantes seleccionadas'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="submit"
                className="flex-1 bg-mtk-principal text-white py-2.5 px-4 rounded-lg hover:bg-mtk-principal/90 transition-colors font-semibold"
              >
                Crear Promoción
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

        {/* Edit Dialog */}
        <dialog
          ref={editDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-3xl w-full m-auto"
        >
          <form onSubmit={handleEditSubmit} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <IconEdit size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Editar Promoción</h2>
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
                  Nombre de la Promoción *
                </label>
                <div className="relative">
                  <IconTag size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: Cyber Monday 2024"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Promoción *
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as PromotionType })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                  >
                    {PROMO_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Valor *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                      {form.tipo === 'porcentaje' ? '%' : 'S/.'}
                    </span>
                    <input
                      type="number"
                      required
                      min={0.01}
                      step={0.01}
                      value={form.valor}
                      onChange={(e) => setForm({ ...form, valor: parseFloat(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Inicio *
                  </label>
                  <div className="relative">
                    <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={form.fechaInicio}
                      onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha Fin *
                  </label>
                  <div className="relative">
                    <IconCalendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={form.fechaFin}
                      onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selecciona las variantes a aplicar la promoción:
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {availableVariants.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-4">
                      <IconShirt size={32} className="text-gray-300 mx-auto mb-2" />
                      No hay variantes disponibles
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availableVariants.map(v => (
                        <label key={v.id} className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedVariants.includes(v.id)}
                            onChange={e => {
                              setSelectedVariants(sel =>
                                e.target.checked
                                  ? [...sel, v.id]
                                  : sel.filter(id => id !== v.id)
                              );
                            }}
                            className="w-4 h-4 text-mtk-principal focus:ring-mtk-principal border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700">{v.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {selectedVariants.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedVariants.length} {selectedVariants.length === 1 ? 'variante seleccionada' : 'variantes seleccionadas'}
                  </p>
                )}
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

        {/* Variants View Dialog */}
        <dialog
          ref={variantsDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-2xl w-full m-auto"
        >
          <div className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <IconShirt size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Variantes de la Promoción</h2>
                  {viewingVariantsPromoId && (
                    <p className="text-sm text-gray-600 mt-1">
                      {promotions.find(p => p.id === viewingVariantsPromoId)?.nombre}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  variantsDialogRef.current?.close();
                  setViewingVariantsPromoId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {viewingVariantsPromoId && promoVariants[viewingVariantsPromoId]?.length > 0 ? (
                <div className="space-y-2">
                  {promoVariants[viewingVariantsPromoId].map((v, index) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="shrink-0 w-8 h-8 bg-mtk-principal/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-mtk-principal">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{v.nombreProducto}</div>
                        <div className="text-sm text-gray-600">Tamaño: {v.tamano}</div>
                      </div>
                      <IconShirt size={20} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <IconShirt size={48} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hay variantes asociadas</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  variantsDialogRef.current?.close();
                  setViewingVariantsPromoId(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
