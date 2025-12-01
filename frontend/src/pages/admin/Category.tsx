import { useRef, useState } from 'react';
import { useCategory } from '../../hooks/useCategory';
import {
  IconPlus,
  IconToggleLeft,
  IconToggleRight,
  IconCategory,
  IconPhoto,
  IconX,
} from '@tabler/icons-react';

export default function CategoryAdmin() {
  const { categorias, loading, error, createCategory, toggleCategory } = useCategory();
  const [name, setName] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleOpenDialog = () => {
    setName('');
    setImage(null);
    setFormError(null);
    dialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    dialogRef.current?.close();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name) {
      setFormError('Name is required');
      return;
    }
    setSaving(true);
    try {
      await createCategory(name, image || undefined);
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCategory = async (cat: any) => {
    try {
      await toggleCategory(cat);
    } catch (err: any) {
      setFormError(err.message || 'Error de red');
    }
  };

  return (
    <div className="min-h-screen bg-mtk-fondo p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal/10 p-3 rounded-xl">
                <IconCategory size={32} className="text-mtk-principal" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Categorías</h1>
                <p className="text-gray-600 mt-1">Gestiona las categorías de productos</p>
              </div>
            </div>
            <button
              onClick={handleOpenDialog}
              className="flex items-center gap-2 bg-mtk-principal text-white px-6 py-3 rounded-xl hover:bg-mtk-principal/90 transition-colors font-medium shadow-md"
            >
              <IconPlus size={20} />
              Nueva Categoría
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
            <div className="text-gray-500 text-lg">Cargando categorías...</div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <IconCategory size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay categorías registradas</p>
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
                  {categorias.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-mtk-fondo transition-colors"
                    >
                      <td className={`px-6 py-4 text-sm text-gray-900 font-medium ${!cat.activo ? 'opacity-60' : ''}`}>
                        #{cat.id}
                      </td>
                      <td className={`px-6 py-4 ${!cat.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2">
                          <IconCategory size={18} className="text-mtk-principal" />
                          <span className="font-medium text-gray-900">{cat.categoria}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center ${!cat.activo ? 'opacity-60' : ''}`}>
                        {cat.imagen ? (
                          <img
                            src={`/uploads/${cat.imagen}`}
                            alt={cat.categoria}
                            className="h-16 w-16 object-cover rounded-lg mx-auto border border-gray-200"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                            <IconPhoto size={24} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {cat.activo ? (
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
                            onClick={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                          >
                            <IconToggleLeft size={20} />
                          </button>
                          {openMenuId === cat.id && (
                            <>
                              <div
                                className="fixed inset-0"
                                onClick={() => setOpenMenuId(null)}
                              ></div>
                              <div className="absolute right-0 top-10 bg-white z-50 rounded-lg shadow-xl border border-gray-200 py-2 min-w-40">
                                <button
                                  className={`w-full flex items-center gap-2 px-4 py-2 transition-colors font-medium text-left ${
                                    cat.activo
                                      ? 'text-yellow-600 hover:bg-yellow-50'
                                      : 'text-green-600 hover:bg-green-50'
                                  }`}
                                  onClick={() => {
                                    handleToggleCategory(cat);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  {cat.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                  <span>{cat.activo ? 'Desactivar' : 'Activar'}</span>
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
          ref={dialogRef}
          className="rounded-2xl shadow-2xl backdrop:bg-black/30 p-0 max-w-2xl w-full m-auto"
        >
          <form onSubmit={handleCreateCategory} className="bg-white rounded-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-mtk-principal/10 p-2 rounded-lg">
                  <IconCategory size={24} className="text-mtk-principal" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Nueva Categoría</h2>
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
                  Nombre de la Categoría *
                </label>
                <div className="relative">
                  <IconCategory size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ej: Polos, Pantalones, Accesorios"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen (opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-mtk-principal/10 file:text-mtk-principal hover:file:bg-mtk-principal/20"
                  />
                </div>
                {image && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <IconPhoto size={16} />
                    <span>{image.name}</span>
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
                {saving ? 'Guardando...' : 'Crear Categoría'}
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
      </div>
    </div>
  );
}
