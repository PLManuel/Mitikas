import { useEffect, useState, useRef } from 'react';
import { IconCreditCard, IconPlus, IconTrash, IconDeviceFloppy, IconCalendar, IconLock, IconUser, IconCash, IconX } from '@tabler/icons-react';

interface TarjetaSimulada {
  id: number;
  numeroTarjeta: string;
  nombreTitular: string;
  fechaExpiracion: string;
  cvv: string;
  saldo: number;
}

interface NuevaTarjeta {
  numeroTarjeta: string;
  nombreTitular: string;
  fechaExpiracion: string;
  cvv: string;
  saldo: string;
}

export default function MisTarjetas() {
  const [tarjetas, setTarjetas] = useState<TarjetaSimulada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nueva, setNueva] = useState<NuevaTarjeta>({
    numeroTarjeta: '',
    nombreTitular: '',
    fechaExpiracion: '',
    cvv: '',
    saldo: '',
  });
  const [creando, setCreando] = useState(false);
  const [creaError, setCreaError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState<number | null>(null);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const fetchTarjetas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tarjetas');
      if (!res.ok) throw new Error('Error al cargar tarjetas');
      const data = await res.json();
      setTarjetas(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('Error al cargar tarjetas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTarjetas();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNueva({ ...nueva, [e.target.name]: e.target.value });
  };

  const crearTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setCreaError(null);
    try {
      const res = await fetch('/api/tarjetas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nueva),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al crear tarjeta');
      }
      setNueva({ numeroTarjeta: '', nombreTitular: '', fechaExpiracion: '', cvv: '', saldo: '' });
      dialogRef.current?.close();
      fetchTarjetas();
    } catch (e: any) {
      setCreaError(e.message);
    } finally {
      setCreando(false);
    }
  };

  const eliminarTarjeta = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;
    setEliminando(id);
    try {
      const res = await fetch(`/api/tarjetas/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar');
      }
      fetchTarjetas();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar tarjeta');
    } finally {
      setEliminando(null);
    }
  };

  const actualizarSaldoTarjeta = async (id: number, saldo: string) => {
    setActualizando(id);
    try {
      const res = await fetch(`/api/tarjetas/${id}/saldo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saldo }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar saldo');
      }
      fetchTarjetas();
    } catch (e: any) {
      alert(e.message || 'Error al actualizar saldo');
    } finally {
      setActualizando(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md mb-6 border-t-4 border-mtk-principal">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconCreditCard className="w-6 h-6 text-mtk-principal" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mis Tarjetas</h1>
                <p className="text-sm text-gray-600">Administra tus métodos de pago</p>
              </div>
            </div>
            <button
              onClick={() => dialogRef.current?.showModal()}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-mtk-principal to-red-700 text-white rounded-lg hover:shadow-lg transition-shadow text-sm font-medium"
            >
              <IconPlus className="w-4 h-4" />
              <span>Nueva Tarjeta</span>
            </button>
          </div>
        </div>
      </div>
      {/* Modal Form */}
      <dialog ref={dialogRef} className="rounded-2xl shadow-2xl backdrop:bg-black/30 m-auto p-0 max-w-2xl w-full">
        <div className="bg-white rounded-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="bg-linear-to-r from-gray-50 to-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconCreditCard className="w-5 h-5 text-mtk-principal" />
                <h2 className="text-lg font-bold text-gray-800">Nueva Tarjeta</h2>
              </div>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <IconX className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={crearTarjeta} className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <IconCreditCard className="w-4 h-4" />
                  Número de tarjeta
                </label>
                <input 
                  name="numeroTarjeta" 
                  value={nueva.numeroTarjeta} 
                  onChange={handleInput} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  placeholder="1234 5678 9012 3456" 
                  maxLength={16} 
                  required 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <IconUser className="w-4 h-4" />
                  Nombre del titular
                </label>
                <input 
                  name="nombreTitular" 
                  value={nueva.nombreTitular} 
                  onChange={handleInput} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  placeholder="Juan Pérez" 
                  required 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <IconCalendar className="w-4 h-4" />
                  Fecha de expiración
                </label>
                <input 
                  name="fechaExpiracion" 
                  value={nueva.fechaExpiracion} 
                  onChange={handleInput} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  placeholder="MM/AA" 
                  maxLength={5} 
                  required 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <IconLock className="w-4 h-4" />
                  CVV
                </label>
                <input 
                  name="cvv" 
                  value={nueva.cvv} 
                  onChange={handleInput} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  placeholder="123" 
                  maxLength={3} 
                  required 
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <IconCash className="w-4 h-4" />
                  Saldo inicial
                </label>
                <input 
                  name="saldo" 
                  type="number"
                  step="0.01"
                  min="0"
                  value={nueva.saldo} 
                  onChange={handleInput} 
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  placeholder="0.00" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-mtk-principal to-red-700 text-white py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-60 font-medium" 
              disabled={creando}
            >
              {creando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Agregando...</span>
                </>
              ) : (
                <>
                  <IconPlus className="w-4 h-4" />
                  <span>Agregar tarjeta</span>
                </>
              )}
            </button>
            {creaError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {creaError}
              </div>
            )}
          </form>
        </div>
      </dialog>
      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mtk-principal mb-4"></div>
          <p className="text-gray-600">Cargando tarjetas...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : tarjetas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <IconCreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No tienes tarjetas agregadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tarjetas.map(t => (
            <div key={t.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Card Header */}
              <div className="bg-linear-to-r from-gray-800 to-gray-900 p-4 text-white">
                <div className="flex items-start justify-between mb-4">
                  <IconCreditCard className="w-8 h-8" />
                  <button
                    type="button"
                    onClick={() => eliminarTarjeta(t.id)}
                    disabled={eliminando === t.id}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-60"
                    aria-label="Eliminar tarjeta"
                  >
                    {eliminando === t.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <IconTrash className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="font-mono text-xl tracking-wider mb-4">
                  {t.numeroTarjeta.match(/.{1,4}/g)?.join(' ')}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Titular</div>
                    <div className="font-medium">{t.nombreTitular}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-xs mb-1">Expira</div>
                    <div className="font-medium">{t.fechaExpiracion}</div>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 bg-gray-50">
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <IconLock className="w-4 h-4" />
                    <span>CVV</span>
                  </div>
                  <div className="font-mono text-lg font-medium text-gray-800">{t.cvv}</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <IconCash className="w-4 h-4" />
                    <span>Saldo disponible</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-mtk-principal focus:border-transparent"
                      value={t.saldo}
                      min={0}
                      step="0.01"
                      disabled={actualizando === t.id}
                      onChange={e => {
                        const val = e.target.value;
                        setTarjetas(ts => ts.map(card => card.id === t.id ? { ...card, saldo: Number(val) } : card));
                      }}
                    />
                    <button
                      type="button"
                      className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 text-sm font-medium transition-colors"
                      disabled={actualizando === t.id}
                      onClick={() => actualizarSaldoTarjeta(t.id, String(t.saldo))}
                      aria-label="Actualizar saldo"
                    >
                      {actualizando === t.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <IconDeviceFloppy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
