import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconUser, IconMail, IconLock, IconPhone, IconId, IconUserPlus, IconArrowRight } from '@tabler/icons-react';

const Register = () => {
  const { register, loading, error, setError } = useAuth();
  const [form, setForm] = useState({
    nombre: '', apellidos: '', dni: '', telefono: '', correo: '', password: ''
  });
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setError(null);
    if (Object.values(form).some(v => !v)) {
      setFormError('Completa todos los campos');
      return;
    }
    const res = await register(form);
    if (res.success) {
      navigate('/auth/login');
    } else {
      setFormError(res.message || 'Error al registrarse');
    }
  };

  return (
    <main className="min-h-screen bg-mtk-fondo flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-mtk-principal">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mtk-principal rounded-full mb-4">
            <IconUserPlus size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Crear cuenta</h2>
          <p className="text-gray-600 mt-2">Únete a la familia MÍTIKAS</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Nombre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconUser size={18} className="text-gray-400" />
                </div>
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                  name="nombre" 
                  value={form.nombre} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Apellidos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconUser size={18} className="text-gray-400" />
                </div>
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                  name="apellidos" 
                  value={form.apellidos} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">DNI</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconId size={18} className="text-gray-400" />
                </div>
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                  name="dni" 
                  value={form.dni} 
                  onChange={handleChange} 
                  maxLength={8}
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Teléfono</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IconPhone size={18} className="text-gray-400" />
                </div>
                <input 
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                  name="telefono" 
                  value={form.telefono} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconMail size={18} className="text-gray-400" />
              </div>
              <input 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                name="correo" 
                placeholder="tu@email.com"
                value={form.correo} 
                onChange={handleChange} 
                type="email" 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700 text-sm">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock size={18} className="text-gray-400" />
              </div>
              <input 
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                name="password" 
                placeholder="••••••••"
                value={form.password} 
                onChange={handleChange} 
                type="password" 
                required 
              />
            </div>
          </div>
          
          {(formError || error) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <span className="text-sm">{formError || error}</span>
            </div>
          )}
          
          <button 
            className="w-full bg-mtk-principal text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>Registrarme</span>
                <IconArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link className="text-mtk-principal font-semibold hover:text-red-700 transition-colors" to="/auth/login">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;
