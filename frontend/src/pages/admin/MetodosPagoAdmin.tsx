import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMetodosPago } from '../../hooks/useMetodosPago';
import { IconPlus, IconEdit, IconTrash, IconToggleLeft, IconToggleRight, IconCreditCard, IconX } from '@tabler/icons-react';

export default function MetodosPagoAdmin() {
  const { user } = useAuth();
  const { metodos, loading, error, createMetodo, updateMetodo, deleteMetodo, setError, fetchMetodos } = useMetodosPago();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editMetodo, setEditMetodo] = useState<{ id: number; metodo: string; activo: boolean } | null>(null);
  const [form, setForm] = useState({ metodo: '' });

  function openNew() {
    setEditMetodo(null);
    setForm({ metodo: '' });
    dialogRef.current?.showModal();
  }
  function openEdit(m: { id: number; metodo: string; activo: boolean }) {
    setEditMetodo(m);
    setForm({ metodo: m.metodo });
    dialogRef.current?.showModal();
  }
  function closeModal() {
    dialogRef.current?.close();
    setEditMetodo(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editMetodo) {
        await updateMetodo(editMetodo.id, { metodo: form.metodo });
      } else {
        await createMetodo({ metodo: form.metodo, activo: true });
      }
      closeModal();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('¿Eliminar método de pago?')) return;
    try {
      await deleteMetodo(id);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleToggleActivo(m: { id: number; metodo: string; activo: boolean }) {
    try {
      const endpoint = m.activo ? 'desactivar' : 'activar';
      const res = await fetch(`/api/metodos-pago/${m.id}/${endpoint}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Error al actualizar método');

      // Refrescar la lista
      await fetchMetodos();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!user || user.rol !== 'admin') return <div>No autorizado</div>;

  return (
    <div className="min-h-screen bg-mtk-fondo p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal p-3 rounded-xl">
                <IconCreditCard size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Métodos de Pago</h1>
                <p className="text-gray-600 mt-1">Gestiona los métodos de pago disponibles en la tienda</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-mtk-principal text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
              onClick={openNew}
            >
              <IconPlus size={20} />
              <span>Nuevo método</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-mtk-principal border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Cargando métodos de pago...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Método</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {metodos.map(m => (
                    <tr key={m.id} className="hover:bg-mtk-fondo transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">#{m.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <IconCreditCard size={20} className="text-gray-600" />
                          </div>
                          <span className="text-gray-800 font-medium">{m.metodo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {m.activo ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            <IconToggleRight size={18} />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                            <IconToggleLeft size={18} />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                            onClick={() => openEdit(m)}
                          >
                            <IconEdit size={18} />
                            <span>Editar</span>
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors font-medium"
                            onClick={() => handleToggleActivo(m)}
                          >
                            {m.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                            <span>{m.activo ? 'Desactivar' : 'Activar'}</span>
                          </button>
                          <button
                            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                            onClick={() => handleDelete(m.id)}
                          >
                            <IconTrash size={18} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {metodos.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <IconCreditCard size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No hay métodos de pago registrados</p>
                <p className="text-gray-500 text-sm mt-2">Comienza agregando un nuevo método</p>
              </div>
            )}
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="rounded-2xl shadow-2xl w-full max-w-md border-t-4 border-mtk-principal backdrop:bg-black/30 m-auto p-0"
      >
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-mtk-principal p-2 rounded-lg">
                <IconCreditCard size={24} className="text-white" />
              </div>
              {editMetodo ? 'Editar' : 'Nuevo'} método de pago
            </h2>
            <button
              type="button"
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del método
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                placeholder="Ej: Tarjeta de crédito, PayPal, Yape..."
                required
                value={form.metodo}
                onChange={e => setForm(f => ({ ...f, metodo: e.target.value }))}
              />
            </div>
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 rounded-b-2xl">
            <button
              type="submit"
              className="flex-1 bg-mtk-principal text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              onClick={closeModal}
            >
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
