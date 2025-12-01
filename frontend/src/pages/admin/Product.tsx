import { useRef, useState } from 'react';
import { useProduct } from '../../hooks/useProduct';
import { useCategory } from '../../hooks/useCategory';
import type { Producto } from '../../types/product';
import {
  IconPlus,
  IconEdit,
  IconToggleLeft,
  IconToggleRight,
  IconPackage,
  IconPhoto,
  IconX,
  IconCategory,
  IconFileText,
} from '@tabler/icons-react';

export default function ProductAdmin() {
  const { products, loading, error, createProduct, updateProduct, toggleProduct } = useProduct();
  const { categorias } = useCategory();
  const [form, setForm] = useState<Partial<Producto> & { imagen?: File }>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  const handleOpenDialog = () => {
    setForm({});
    setFormError(null);
    dialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    dialogRef.current?.close();
  };

  const handleOpenEditDialog = (product: Producto) => {
    const { imagen, ...rest } = product;
    setForm({ ...rest });
    setFormError(null);
    editDialogRef.current?.showModal();
  };

  const handleCloseEditDialog = () => {
    editDialogRef.current?.close();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.nombre || !form.descripcion || !form.idCategoria) {
      setFormError('Todos los campos son requeridos');
      return;
    }
    setSaving(true);
    try {
      await createProduct(form as any);
      handleCloseDialog();
      setForm({});
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.id || !form.nombre || !form.descripcion || !form.idCategoria) {
      setFormError('Todos los campos son requeridos');
      return;
    }
    setSaving(true);
    try {
      await updateProduct(form.id, form as any);
      handleCloseEditDialog();
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleProduct = async (product: Producto) => {
    try {
      await toggleProduct(product);
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    }
  };

  return (
    <div className="min-h-screen bg-mtk-fondo p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal/10 p-3 rounded-xl">
                <IconPackage size={32} className="text-mtk-principal" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
                <p className="text-gray-600 mt-1">Gestiona los productos del catálogo</p>
              </div>
            </div>
            <button
              onClick={handleOpenDialog}
              className="flex items-center gap-2 bg-mtk-principal text-white px-6 py-3 rounded-xl hover:bg-mtk-principal/90 transition-colors font-medium shadow-md"
            >
              <IconPlus size={20} />
              Nuevo Producto
            </button>
          </div>
        </div>

        {/* Error Message */}
        {(error || formError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
            {error || formError}
          </div>
        )}

        {/* Table Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-500 text-lg">Cargando productos...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <IconPackage size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay productos registrados</p>
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
                      Producto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Imagen
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
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-mtk-fondo transition-colors"
                    >
                      <td className={`px-6 py-4 text-sm text-gray-900 font-medium ${!product.activo ? 'opacity-60' : ''}`}>
                        #{product.id}
                      </td>
                      <td className={`px-6 py-4 ${!product.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <IconPackage size={18} className="text-mtk-principal" />
                          <span className="font-medium text-gray-900">{product.nombre}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!product.activo ? 'opacity-60' : ''}`}>
                        <span className="text-sm text-gray-600 line-clamp-2">{product.descripcion}</span>
                      </td>
                      <td className={`px-6 py-4 ${!product.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <IconCategory size={16} className="text-blue-600" />
                          <span className="text-sm text-gray-700">
                            {categorias.find(c => c.id === product.idCategoria)?.categoria || '-'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center ${!product.activo ? 'opacity-60' : ''}`}>
                        {product.imagen ? (
                          <img
                            src={`/uploads/${product.imagen}`}
                            alt={product.nombre}
                            className="h-16 w-16 object-cover rounded-lg mx-auto border border-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                            <IconPhoto size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.activo ? (
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
                            onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                          >
                            <IconEdit size={20} />
                          </button>
                          {openMenuId === product.id && (
                            <>
                              <div
                                className="fixed inset-0"
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-10 bg-white z-50 rounded-lg shadow-xl border border-gray-200 py-2 min-w-40">
                                <button
                                  className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-left"
                                  onClick={() => {
                                    handleOpenEditDialog(product);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <IconEdit size={18} />
                                  <span>Editar</span>
                                </button>
                                <button
                                  className={`w-full flex items-center gap-2 px-4 py-2 transition-colors font-medium text-left ${
                                    product.activo
                                      ? 'text-yellow-600 hover:bg-yellow-50'
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  onClick={() => {
                                    handleToggleProduct(product);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {product.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                  <span>{product.activo ? 'Desactivar' : 'Activar'}</span>
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
          ref={dialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-2xl w-full m-auto"
        >
          <form onSubmit={handleCreateProduct} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-mtk-principal/10 p-2 rounded-lg">
                  <IconPackage size={24} className="text-mtk-principal" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Nuevo Producto</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <div className="relative">
                  <IconPackage size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={form.nombre || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: Polo Básico, Pantalón Casual"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <div className="relative">
                  <IconFileText size={20} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="descripcion"
                    required
                    value={form.descripcion || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Descripción detallada del producto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="relative">
                  <IconCategory size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="idCategoria"
                    required
                    value={form.idCategoria || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.filter(c => c.activo).map(c => (
                      <option key={c.id} value={c.id}>{c.categoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen (opcional)
                </label>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-mtk-principal/10 file:text-mtk-principal hover:file:bg-mtk-principal/20"
                />
                {form.imagen && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <IconPhoto size={16} />
                    <span>{form.imagen.name}</span>
                  </div>
                )}
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-mtk-principal text-white py-2.5 px-4 rounded-lg hover:bg-mtk-principal/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Crear Producto'}
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                disabled={saving}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </dialog>

        {/* Edit Dialog */}
        <dialog
          ref={editDialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-2xl w-full m-auto"
        >
          <form onSubmit={handleUpdateProduct} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <IconEdit size={24} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Editar Producto</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseEditDialog}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconX size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <div className="relative">
                  <IconPackage size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    required
                    value={form.nombre || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: Polo Básico, Pantalón Casual"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <div className="relative">
                  <IconFileText size={20} className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    name="descripcion"
                    required
                    value={form.descripcion || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Descripción detallada del producto"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="relative">
                  <IconCategory size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="idCategoria"
                    required
                    value={form.idCategoria || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {categorias.filter(c => c.activo).map(c => (
                      <option key={c.id} value={c.id}>{c.categoria}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen (dejar en blanco para mantener la actual)
                </label>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-mtk-principal/10 file:text-mtk-principal hover:file:bg-mtk-principal/20"
                />
                {form.imagen && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <IconPhoto size={16} />
                    <span>{form.imagen.name}</span>
                  </div>
                )}
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={handleCloseEditDialog}
                disabled={saving}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
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
