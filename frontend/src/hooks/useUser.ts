import { useCallback, useEffect, useState } from 'react';
import type { Usuario, RegisterPayload } from '../types/user';

export function useUser() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/usuarios', { credentials: 'include' });
      if (!res.ok) throw new Error('Error loading users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (payload: RegisterPayload) => {
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Error creating user');
    await fetchUsers();
  }, [fetchUsers]);

  const toggleUser = useCallback(async (user: Usuario) => {
    const res = await fetch(`/api/usuarios/${user.id}/${user.activo ? 'desactivar' : 'activar'}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 403) {
        throw new Error('No tienes permisos para realizar esta acción. Solo administradores pueden activar/desactivar usuarios.');
      }
      throw new Error(data.message || 'Error updating user');
    }
    await fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: number, payload: Partial<RegisterPayload>) => {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Error updating user');
    }
    await fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (id: number) => {
    const res = await fetch(`/api/usuarios/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Error deleting user');
    }
    await fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    toggleUser,
    updateUser,
    deleteUser,
  };
}
