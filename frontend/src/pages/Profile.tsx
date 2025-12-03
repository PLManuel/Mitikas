import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconUser, IconMail, IconPhone, IconId, IconLock, IconCheck, IconAlertCircle } from '@tabler/icons-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    correo: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        dni: user.dni || '',
        telefono: user.telefono || '',
        correo: user.correo || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validar contraseñas si se están cambiando
    if (showPasswordFields) {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }
      if (formData.password && formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }
    }

    try {
      const dataToSend: any = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        dni: formData.dni,
        telefono: formData.telefono,
        correo: formData.correo,
      };

      // Solo enviar password si se está cambiando
      if (showPasswordFields && formData.password) {
        dataToSend.password = formData.password;
      }

      const res = await fetch('/api/usuarios/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al actualizar el perfil');
      }

      setSuccess('Perfil actualizado correctamente');
      
      // Actualizar el contexto con los nuevos datos
      if (updateUser) {
        updateUser(data.usuario);
      }

      // Limpiar campos de contraseña
      if (showPasswordFields) {
        setFormData({ ...formData, password: '', confirmPassword: '' });
        setShowPasswordFields(false);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-mtk-principal to-red-700 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <IconUser className="w-10 h-10 text-mtk-principal" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                <p className="text-white/80 mt-1">Actualiza tu información personal</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Messages */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <IconAlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <IconCheck className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{success}</p>
              </div>
            )}

            {/* Nombre y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellidos *
                </label>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="Ingresa tus apellidos"
                  />
                </div>
              </div>
            </div>

            {/* DNI y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  DNI *
                </label>
                <div className="relative">
                  <IconId className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    required
                    maxLength={8}
                    pattern="[0-9]{8}"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono *
                </label>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    maxLength={9}
                    pattern="[0-9]{9}"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                    placeholder="987654321"
                  />
                </div>
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico *
              </label>
              <div className="relative">
                <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="correo"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Cambiar contraseña */}
            <div className="border-t pt-5">
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="flex items-center gap-2 text-mtk-principal hover:text-mtk-principal/80 font-semibold text-sm transition-colors"
              >
                <IconLock className="w-5 h-5" />
                {showPasswordFields ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
              </button>

              {showPasswordFields && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                        placeholder="Repite la contraseña"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-mtk-principal to-red-700 hover:from-mtk-principal/90 hover:to-red-700/90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
