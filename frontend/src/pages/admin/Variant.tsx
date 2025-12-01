import { useState, useRef, useEffect } from 'react';
import { useProduct } from '../../hooks/useProduct';
import type { Producto } from '../../types/product';
import type { VarianteProducto } from '../../types/variant';
import { IconPlus, IconEdit, IconToggleLeft, IconToggleRight, IconShirt, IconRuler, IconX, IconPackage } from '@tabler/icons-react';

export default function VariantAdmin() {
  const { products } = useProduct();
  const [allVariants, setAllVariants] = useState<(VarianteProducto & { producto?: Producto })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<VarianteProducto & { id_producto?: number }>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // refs a los dialogs
  const createDialogRef = useRef<HTMLDialogElement | null>(null);
  const editDialogRef = useRef<HTMLDialogElement | null>(null);

  // Cargar todas las variantes de todos los productos
  useEffect(() => {
    const fetchAllVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        const allVars: (VarianteProducto & { producto?: Producto })[] = [];
        for (const product of products) {
          const res = await fetch(`http://localhost:5173/api/variantes/producto/${product.id}`, {
            credentials: 'include'
          });
          if (res.ok) {
            const vars: VarianteProducto[] = await res.json();
            vars.forEach(v => allVars.push({ ...v, producto: product }));
          }
        }
        setAllVariants(allVars);
      } catch (err: any) {
        setError(err.message || 'Error al cargar variantes');
      } finally {
        setLoading(false);
      }
    };

    if (products.length > 0) {
      fetchAllVariants();
    }
  }, [products]);

  const handleOpenDialog = () => {
    setForm({});
    setFormError(null);
    createDialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    createDialogRef.current?.close();
  };

  const handleOpenEditDialog = (variant: VarianteProducto & { producto?: Producto }) => {
    setForm({ ...variant, id_producto: variant.id_producto || variant.producto?.id });
    setFormError(null);
    setOpenMenuId(null);
    editDialogRef.current?.showModal();
  };

  const handleCloseEditDialog = () => {
    editDialogRef.current?.close();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.id_producto || !form.tamano || !form.precioVenta) {
      setFormError('Todos los campos son requeridos');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('http://localhost:5173/api/variantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          idProducto: form.id_producto,
          tamano: form.tamano,
          precioVenta: Number(form.precioVenta)
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear variante');
      }
      const nuevaVariante = await res.json();
      handleCloseDialog();
      
      // Agregar la nueva variante al estado inmediatamente
      const product = products.find(p => p.id === form.id_producto);
      if (product && nuevaVariante) {
        setAllVariants(prev => [
          ...prev,
          {
            id: nuevaVariante.id,
            id_producto: nuevaVariante.idProducto,
            tamano: nuevaVariante.tamano,
            precioVenta: nuevaVariante.precioVenta,
            activo: nuevaVariante.activo,
            producto: product
          }
        ]);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.id || !form.tamano || !form.precioVenta) {
      setFormError('Todos los campos son requeridos');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5173/api/variantes/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tamano: form.tamano,
          precioVenta: Number(form.precioVenta)
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar variante');
      }
      handleCloseEditDialog();
      // Actualizar en el estado local inmediatamente
      setAllVariants(prev => prev.map(v => 
        v.id === form.id 
          ? { 
              ...v, 
              tamano: form.tamano!, 
              precioVenta: Number(form.precioVenta!) 
            } 
          : v
      ));
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVariant = async (variant: VarianteProducto) => {
    try {
      const endpoint = variant.activo ? 'desactivar' : 'activar';
      const res = await fetch(`http://localhost:5173/api/variantes/${variant.id}/${endpoint}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`Error al ${variant.activo ? 'desactivar' : 'activar'} variante`);
      // Actualizar en el estado local
      setAllVariants(prev => prev.map(v => 
        v.id === variant.id ? { ...v, activo: !v.activo } : v
      ));
      setOpenMenuId(null);
    } catch (err: any) {
      setError(err.message || 'Error de red');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header moderno */}
      <div className="bg-white rounded-2xl shadow-lg border-t-4 border-mtk-principal p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-mtk-principal/10 rounded-xl">
              <IconShirt className="w-8 h-8 text-mtk-principal" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Variantes de Productos</h1>
              <p className="text-gray-500 mt-1">Gestiona los tamaños y precios de cada producto</p>
            </div>
          </div>
          <button
            onClick={handleOpenDialog}
            className="flex items-center gap-2 bg-mtk-principal hover:bg-mtk-principal/90 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-md"
          >
            <IconPlus className="w-5 h-5" />
            Nueva Variante
          </button>
        </div>
      </div>

      {/* Tabla de variantes */}
      <div className="bg-white rounded-2xl shadow-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando variantes...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : allVariants.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay variantes registradas</div>
        ) : (
          <table className="w-full">
            <thead className="bg-linear-to-r from-mtk-principal to-red-700 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Producto</th>
                <th className="px-6 py-4 text-left font-semibold">Tamaño</th>
                <th className="px-6 py-4 text-left font-semibold">Precio</th>
                <th className="px-6 py-4 text-center font-semibold">Estado</th>
                <th className="px-6 py-4 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allVariants.map((variant) => (
                <tr
                  key={variant.id}
                  className={`hover:bg-mtk-fondo transition-colors ${
                    !variant.activo ? 'bg-gray-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <IconPackage className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-800">
                        {variant.producto?.nombre || 'Sin producto'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <IconRuler className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{variant.tamano}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">S/.</span>
                      <span className="font-semibold text-gray-800">
                        {Number(variant.precioVenta).toFixed(2)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        variant.activo
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {variant.activo ? (
                        <><IconToggleRight className="w-4 h-4" /> Activo</>
                      ) : (
                        <><IconToggleLeft className="w-4 h-4" /> Inactivo</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === variant.id ? null : variant.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openMenuId === variant.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                            <button
                              onClick={() => handleOpenEditDialog(variant)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-blue-700"
                            >
                              <IconEdit className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleToggleVariant(variant)}
                              className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 ${
                                variant.activo ? 'text-orange-700' : 'text-green-700'
                              }`}
                            >
                              {variant.activo ? (
                                <><IconToggleLeft className="w-4 h-4" /> Desactivar</>
                              ) : (
                                <><IconToggleRight className="w-4 h-4" /> Activar</>
                              )}
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
        )}
      </div>

      {/* Dialog para crear variante */}
      <dialog
        ref={createDialogRef}
        className="rounded-2xl shadow-2xl p-0 backdrop:bg-black/30 m-auto"
        onClose={handleCloseDialog}
      >
        <div className="bg-white rounded-2xl w-[500px]">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mtk-principal/10 rounded-lg">
                <IconShirt className="w-6 h-6 text-mtk-principal" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Nueva Variante</h2>
            </div>
            <button
              onClick={handleCloseDialog}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleCreateVariant} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <IconPackage className="w-4 h-4" />
                  Producto
                </div>
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                name="id_producto"
                value={form.id_producto || ''}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar producto...</option>
                {products.filter(p => p.activo).map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <IconRuler className="w-4 h-4" />
                  Tamaño
                </div>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                name="tamano"
                value={form.tamano || ''}
                onChange={handleChange}
                placeholder="Ej: S, M, L, XL"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">S/.</span>
                  Precio de Venta
                </div>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                name="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={form.precioVenta || ''}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseDialog}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-mtk-principal text-white rounded-lg hover:bg-mtk-principal/90 transition-colors font-semibold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Crear Variante'}
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Dialog para editar variante */}
      <dialog
        ref={editDialogRef}
        className="rounded-2xl shadow-2xl p-0 backdrop:bg-black/30 m-auto"
        onClose={handleCloseEditDialog}
      >
        <div className="bg-white rounded-2xl w-[500px]">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-mtk-principal/10 rounded-lg">
                <IconEdit className="w-6 h-6 text-mtk-principal" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Editar Variante</h2>
            </div>
            <button
              onClick={handleCloseEditDialog}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <IconX className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleUpdateVariant} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <IconPackage className="w-4 h-4" />
                  Producto
                </div>
              </label>
              <div className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                {allVariants.find(v => v.id === form.id)?.producto?.nombre || products.find(p => p.id === form.id_producto)?.nombre || 'N/A'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <IconRuler className="w-4 h-4" />
                  Tamaño
                </div>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                name="tamano"
                value={form.tamano || ''}
                onChange={handleChange}
                placeholder="Ej: S, M, L, XL"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">S/.</span>
                  Precio de Venta
                </div>
              </label>
              <input
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                name="precioVenta"
                type="number"
                step="0.01"
                min="0"
                value={form.precioVenta || ''}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseEditDialog}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-mtk-principal text-white rounded-lg hover:bg-mtk-principal/90 transition-colors font-semibold disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
