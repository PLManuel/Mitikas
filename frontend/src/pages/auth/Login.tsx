import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconMail, IconLock, IconLogin, IconArrowRight } from '@tabler/icons-react';

const Login = () => {
  const { login, loading, error, setError } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setError(null);
    if (!correo || !password) {
      setFormError('Completa todos los campos');
      return;
    }
    const res = await login({ correo, password });
    if (res.success) {
      const destino = res.user?.rol === 'cliente' ? '/' : '/admin';
      navigate(destino);
    } else {
      setFormError(res.message || 'Error al iniciar sesión');
    }
  };

  return (
    <main className="min-h-screen bg-mtk-fondo flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border-t-4 border-mtk-principal">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mtk-principal rounded-full mb-4">
            <IconLogin size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Iniciar sesión</h2>
          <p className="text-gray-600 mt-2">Bienvenido de vuelta a MÍTIKAS</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Correo electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconMail size={20} className="text-gray-400" />
              </div>
              <input 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                type="email" 
                placeholder="tu@email.com"
                value={correo} 
                onChange={e => setCorreo(e.target.value)} 
                required 
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium text-gray-700">Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock size={20} className="text-gray-400" />
              </div>
              <input 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mtk-principal focus:border-transparent transition-all" 
                type="password" 
                placeholder="••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
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
            className="w-full bg-mtk-principal text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <span>Cargando...</span>
            ) : (
              <>
                <span>Entrar</span>
                <IconArrowRight size={20} />
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link className="text-mtk-principal font-semibold hover:text-red-700 transition-colors" to="/auth/register">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
