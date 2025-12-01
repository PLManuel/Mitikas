import { useRef, useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../context/AuthContext';
import type { RegisterPayload, Role, Usuario } from '../../types/user';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconToggleLeft,
  IconToggleRight,
  IconUsers,
  IconX,
  IconMail,
  IconPhone,
  IconId,
  IconUser as IconUserSingle,
  IconShield,
  IconDots
} from '@tabler/icons-react';

const roles: Role[] = ['cliente', 'admin', 'almacen', 'logistica'];

const roleColors: Record<Role, string> = {
  cliente: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
  almacen: 'bg-green-100 text-green-700',
  logistica: 'bg-purple-100 text-purple-700',
};

export default function UserAdmin() {
  const { users, loading, error, createUser, toggleUser, updateUser, deleteUser } = useUser();
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [form, setForm] = useState<RegisterPayload>({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    correo: '',
    password: '',
    rol: 'cliente',
  });
  const [editForm, setEditForm] = useState<Partial<RegisterPayload>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editDialogRef = useRef<HTMLDialogElement>(null);

  const handleOpenDialog = () => {
    setForm({ nombre: '', apellidos: '', dni: '', telefono: '', correo: '', password: '', rol: 'cliente' });
    setFormError(null);
    dialogRef.current?.showModal();
  };

  const handleCloseDialog = () => {
    dialogRef.current?.close();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.nombre || !form.apellidos || !form.dni || !form.telefono || !form.correo || !form.password) {
      setFormError('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await createUser(form);
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleUser = async (user: any) => {
    try {
      await toggleUser(user);
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const handleOpenEditDialog = (user: Usuario) => {
    setEditingUser(user);
    setEditForm({
      nombre: user.nombre,
      apellidos: user.apellidos,
      dni: user.dni,
      telefono: user.telefono,
      correo: user.correo,
      rol: user.rol,
      password: '',
    });
    setFormError(null);
    editDialogRef.current?.showModal();
  };

  const handleCloseEditDialog = () => {
    setEditingUser(null);
    editDialogRef.current?.close();
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError(null);
    setSaving(true);
    try {
      // Si la contraseña está vacía, no enviarla
      const dataToUpdate: any = {
        nombre: editForm.nombre,
        apellidos: editForm.apellidos,
        dni: editForm.dni,
        telefono: editForm.telefono,
        correo: editForm.correo,
        rol: editForm.rol,
      };
      if (editForm.password && editForm.password.trim() !== '') {
        dataToUpdate.password = editForm.password;
      }
      await updateUser(editingUser.id, dataToUpdate);
      handleCloseEditDialog();
    } catch (err: any) {
      setFormError(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: Usuario) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${user.nombre} ${user.apellidos}?`)) return;
    try {
      await deleteUser(user.id);
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  return (
    <div className="min-h-screen bg-mtk-fondo p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-t-4 border-mtk-principal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-mtk-principal p-3 rounded-xl">
                <IconUsers size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Usuarios</h1>
                <p className="text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-mtk-principal text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md"
              onClick={handleOpenDialog}
            >
              <IconPlus size={20} />
              <span>Nuevo usuario</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block w-12 h-12 border-4 border-mtk-principal border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">DNI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Rol</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className={`hover:bg-mtk-fondo transition-colors`}>
                      <td className={`px-6 py-4 text-gray-700 font-medium ${!user.activo ? 'opacity-60' : ''}`}>#{user.id}</td>
                      <td className={`px-6 py-4 ${!user.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <IconUserSingle size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <div className="text-gray-800 font-medium">{user.nombre} {user.apellidos}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <IconMail size={14} />
                              {user.correo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!user.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2 text-gray-700">
                          <IconId size={16} className="text-gray-500" />
                          <span>{user.dni}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${!user.activo ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2 text-gray-700">
                          <IconPhone size={16} className="text-gray-500" />
                          <span>{user.telefono}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-center ${!user.activo ? 'opacity-60' : ''}`}>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.rol]}`}>
                          <IconShield size={16} />
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.activo ? (
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
                        {currentUser?.id === user.id ? (
                          <div className="flex items-center justify-center">
                            <span className="text-gray-400 text-sm italic">Tu cuenta</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center relative">
                            <button
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                            >
                              <IconDots size={20} />
                            </button>
                            {openMenuId === user.id && (
                              <>
                                <div
                                  className="fixed inset-0"
                                  onClick={() => setOpenMenuId(null)}
                                ></div>
                                <div className="absolute right-0 top-10 bg-white z-50 rounded-lg shadow-xl border border-gray-200 py-2 min-w-40">
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 transition-colors font-medium text-left"
                                    onClick={() => {
                                      handleOpenEditDialog(user);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    <IconEdit size={18} />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    className={`w-full flex items-center gap-2 px-4 py-2 transition-colors font-medium text-left ${user.activo
                                        ? 'text-yellow-600 hover:bg-yellow-50'
                                        : 'text-green-600 hover:bg-green-50'
                                      }`}
                                    onClick={() => {
                                      handleToggleUser(user);
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    {user.activo ? <IconToggleLeft size={18} /> : <IconToggleRight size={18} />}
                                    <span>{user.activo ? 'Desactivar' : 'Activar'}</span>
                                  </button>
                                  <hr className="my-1 border-gray-200" />
                                  <button
                                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
                                    onClick={() => {
                                      handleDeleteUser(user);
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
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                  <IconUsers size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg">No hay usuarios registrados</p>
                <p className="text-gray-500 text-sm mt-2">Comienza agregando un nuevo usuario</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog to create user */}
      <dialog
        ref={dialogRef}
        className="rounded-2xl shadow-2xl w-full max-w-2xl border-t-4 border-mtk-principal backdrop:bg-black/30 m-auto p-0"
      >
        <form onSubmit={handleCreateUser}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-mtk-principal p-2 rounded-lg">
                <IconUsers size={24} className="text-white" />
              </div>
              Nuevo usuario
            </h2>
            <button
              type="button"
              onClick={handleCloseDialog}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  maxLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="telefono"
                  value={form.telefono}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                name="correo"
                type="email"
                placeholder="usuario@email.com"
                value={form.correo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="rol"
                  value={form.rol}
                  onChange={handleChange}
                  required
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <span className="text-sm">{formError}</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 rounded-b-2xl">
            <button
              type="submit"
              className="flex-1 bg-mtk-principal text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Crear usuario'}
            </button>
            <button
              type="button"
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              onClick={handleCloseDialog}
            >
              Cancelar
            </button>
          </div>
        </form>
      </dialog>

      {/* Dialog to edit user */}
      <dialog
        ref={editDialogRef}
        className="rounded-2xl shadow-2xl w-full max-w-2xl border-t-4 border-mtk-principal backdrop:bg-black/30 m-auto p-0"
      >
        <form onSubmit={handleUpdateUser}>
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-mtk-principal p-2 rounded-lg">
                <IconEdit size={24} className="text-white" />
              </div>
              Editar usuario
            </h2>
            <button
              type="button"
              onClick={handleCloseEditDialog}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconX size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="nombre"
                  value={editForm.nombre || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellidos</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="apellidos"
                  value={editForm.apellidos || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">DNI</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="dni"
                  value={editForm.dni || ''}
                  onChange={handleEditChange}
                  maxLength={8}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="telefono"
                  value={editForm.telefono || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                name="correo"
                type="email"
                value={editForm.correo || ''}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                  <span className="text-xs text-gray-500 font-normal ml-2">(dejar vacío para no cambiar)</span>
                </label>
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={editForm.password || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rol</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all"
                  name="rol"
                  value={editForm.rol || 'cliente'}
                  onChange={handleEditChange}
                  required
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <span className="text-sm">{formError}</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 flex gap-3 rounded-b-2xl">
            <button
              type="submit"
              className="flex-1 bg-mtk-principal text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Actualizar usuario'}
            </button>
            <button
              type="button"
              className="flex-1 bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              onClick={handleCloseEditDialog}
            >
              Cancelar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
