import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Usuario, LoginPayload, RegisterPayload, LoginResponse, CreateUserResponse } from '../types/user';
import { useCartHybrid } from '../hooks/useCartHybrid';

interface AuthContextProps {
  user: Usuario | null;
  loading: boolean;
  error: string | null;
  setError: (err: string | null) => void;
  login: (payload: LoginPayload) => Promise<{ success: boolean; message?: string; user?: Usuario; }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<Usuario | null>;
  setUser: (u: Usuario | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Para sincronizar carrito local/backend
  const { syncLocalToBackend, clearCart } = useCartHybrid(!!user);

  // Recupera la sesión actual
  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usuarios/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return null;
      }
      const data = await res.json();
      setUser(data || null);
      setLoading(false);
      return data;
    } catch (err) {
      setUser(null);
      setLoading(false);
      return null;
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  // Login
  const login = useCallback(
    async (payload: LoginPayload): Promise<{ success: boolean; message?: string; user?: Usuario }> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/usuarios/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
        const data: LoginResponse = await res.json();

        if (!res.ok || !data.usuario) {
          setError(data.message || 'Error al iniciar sesión');
          setLoading(false);
          setUser(null);
          return { success: false, message: data.message };
        }

        // Sincronizar carrito local al backend ANTES de setUser
        await syncLocalToBackend();
        setUser(data.usuario);
        setLoading(false);
        return { success: true, user: data.usuario };
      } catch (err) {
        setError('Error de red');
        setLoading(false);
        setUser(null);
        return { success: false, message: 'Error de red' };
      }
    },
    [syncLocalToBackend]
  );

  // Registro
  const register = useCallback(async (payload: RegisterPayload): Promise<{ success: boolean; message?: string }> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data: CreateUserResponse | { message?: string } = await res.json();
      if (!res.ok || !('id' in data)) {
        setError((data as any).message || 'Error al registrarse');
        setLoading(false);
        return { success: false, message: (data as any).message };
      }
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError('Error de red');
      setLoading(false);
      return { success: false, message: 'Error de red' };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/usuarios/logout', { method: 'POST', credentials: 'include' });
    } catch { }
    setUser(null);
    // Limpiar carrito local al cerrar sesión
    await clearCart();
    setLoading(false);
  }, [clearCart]);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, refresh: fetchMe, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
