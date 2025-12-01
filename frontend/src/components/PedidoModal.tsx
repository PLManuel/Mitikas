
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTarjetasSimuladas } from '../hooks/useTarjetasSimuladas';
import type { OrderPayload } from '../types/order';
import type { MetodoPago } from '../types/metodo-pago';
import type { DeliveryZone } from '../types/deliveryZone';
import { IconX, IconMapPin, IconHome, IconCreditCard, IconReceipt, IconDiscount, IconTruck, IconCash, IconShoppingCart } from '@tabler/icons-react';

interface PedidoModalProps {
  open: boolean;
  onClose: () => void;
  metodosPago: MetodoPago[];
  zonas: DeliveryZone[];
  onSubmit: (data: OrderPayload) => void;
  nombre: string;
  apellido: string;
  resumen: { total: number; subtotal: number; descuentos: number; };
}

export function PedidoModal({ open, onClose, metodosPago, zonas, onSubmit, nombre, apellido, resumen }: PedidoModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const loginDialogRef = useRef<HTMLDialogElement>(null);
  const [tipoEntrega, setTipoEntrega] = useState<'local' | 'domicilio'>('local');
  const [idZonaDelivery, setIdZonaDelivery] = useState<number | null>(null);
  const [direccion, setDireccion] = useState('');
  const [idMetodoPago, setIdMetodoPago] = useState<number | null>(null);
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', nombreTitular: '', expiracion: '', cvv: '' });
  const [errorTarjeta, setErrorTarjeta] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { tarjetas } = useTarjetasSimuladas();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    
    return () => dialog.removeEventListener('close', handleClose);
  }, [open, onClose]);

  useEffect(() => {
    const dialog = loginDialogRef.current;
    if (!dialog) return;
    showLoginModal ? dialog.showModal() : dialog.close();
  }, [showLoginModal]);

  const zonaSeleccionada = zonas.find(z => z.id === idZonaDelivery);
  const costoEnvio = tipoEntrega === 'domicilio' && zonaSeleccionada ? Number(zonaSeleccionada.costo) : 0;
  const precioFinal = resumen.total + costoEnvio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTarjeta(null);

    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!idMetodoPago) return;

    let idTarjetaSimulada: number | undefined;
    if (idMetodoPago === 2) {
      const match = tarjetas.find(t =>
        t.numeroTarjeta === datosTarjeta.numero &&
        t.nombreTitular.toLowerCase() === datosTarjeta.nombreTitular.toLowerCase() &&
        t.fechaExpiracion === datosTarjeta.expiracion &&
        t.cvv === datosTarjeta.cvv
      );
      if (!match) {
        setErrorTarjeta('No se encontró una tarjeta simulada con esos datos.');
        return;
      }
      idTarjetaSimulada = match.id;
    }
    onSubmit({
      nombre,
      apellido,
      direccion: tipoEntrega === 'domicilio' ? direccion : 'Av. Aviación 5095, Galería Nuevo Polvos Rosados - Tienda 78 y 79 (frente a la estación Cabitos)',
      idZonaDelivery: tipoEntrega === 'domicilio' ? idZonaDelivery : null,
      idMetodoPago,
      datosTarjeta: idMetodoPago === 2 ? datosTarjeta : undefined,
      idTarjetaSimulada,
    });
  };

  return (
    <>
      <dialog ref={dialogRef} className="rounded-2xl shadow-2xl m-auto p-0 max-w-lg w-full backdrop:bg-black/60">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="relative bg-linear-to-r from-mtk-principal to-red-700 px-4 py-3">
            <button
              type="button"
              className="absolute top-2.5 right-3 p-1 hover:bg-white/20 rounded-full transition-colors"
              onClick={onClose}
            >
              <IconX className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <IconShoppingCart className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Detalles del pedido</h2>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="flex items-center gap-1.5 font-bold text-gray-800 text-sm mb-2">
              <IconTruck className="w-4 h-4 text-mtk-principal" />
              Tipo de entrega:
            </label>
            <select 
              value={tipoEntrega} 
              onChange={e => setTipoEntrega(e.target.value as 'local' | 'domicilio')} 
              className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm"
            >
              <option value="local">🏪 En el local</option>
              <option value="domicilio">🚚 A domicilio</option>
            </select>
          </div>
          {tipoEntrega === 'domicilio' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div>
                <label className="flex items-center gap-1.5 font-bold text-gray-800 text-sm mb-2">
                  <IconMapPin className="w-4 h-4 text-mtk-principal" />
                  Distrito:
                </label>
                <select 
                  value={idZonaDelivery ?? ''} 
                  onChange={e => setIdZonaDelivery(Number(e.target.value))} 
                  className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm"
                  required
                >
                  <option value="">Selecciona un distrito</option>
                  {zonas.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.distrito} (S/. {Number(z.costo).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 font-bold text-gray-800 text-sm mb-2">
                  <IconHome className="w-4 h-4 text-mtk-principal" />
                  Dirección exacta:
                </label>
                <input 
                  type="text" 
                  className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  value={direccion} 
                  onChange={e => setDireccion(e.target.value)} 
                  required 
                  placeholder="Calle, número, referencia..."
                />
              </div>
            </div>
          )}
          <div>
            <label className="flex items-center gap-1.5 font-bold text-gray-800 text-sm mb-2">
              <IconCash className="w-4 h-4 text-mtk-principal" />
              Método de pago:
            </label>
            <select
              value={idMetodoPago !== null ? String(idMetodoPago) : ''}
              onChange={e => {
                const val = e.target.value;
                setIdMetodoPago(val === '' ? null : Number(val));
              }}
              className="border border-gray-300 px-3 py-2 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm"
              required
            >
              <option value="">Selecciona un método de pago</option>
              {metodosPago.map(m => (
                <option key={m.id} value={String(m.id)}>{m.metodo}</option>
              ))}
            </select>
          </div>
          {idMetodoPago === 2 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <IconCreditCard className="w-4 h-4 text-green-700" />
                <span className="font-bold text-sm text-green-700">Datos de la tarjeta</span>
              </div>
              {errorTarjeta && (
                <div className="text-red-700 text-xs font-semibold bg-red-100 border border-red-300 p-2 rounded-lg flex items-center gap-2">
                  <IconX className="w-4 h-4" />
                  {errorTarjeta}
                </div>
              )}
              <div>
                <label className="block mb-1.5 font-semibold text-xs text-gray-700">Número de tarjeta:</label>
                <input 
                  type="text" 
                  className="border border-gray-300 px-3 py-1.5 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  value={datosTarjeta.numero} 
                  onChange={e => setDatosTarjeta({ ...datosTarjeta, numero: e.target.value })} 
                  placeholder="1234 5678 9012 3456"
                  maxLength={16}
                  required 
                />
              </div>
              <div>
                <label className="block mb-1.5 font-semibold text-xs text-gray-700">Nombre del titular:</label>
                <input 
                  type="text" 
                  className="border border-gray-300 px-3 py-1.5 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                  value={datosTarjeta.nombreTitular} 
                  onChange={e => setDatosTarjeta({ ...datosTarjeta, nombreTitular: e.target.value })} 
                  placeholder="JUAN PEREZ"
                  required 
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1.5 font-semibold text-xs text-gray-700">Expiración:</label>
                  <input 
                    type="text" 
                    className="border border-gray-300 px-3 py-1.5 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                    placeholder="MM/AA" 
                    value={datosTarjeta.expiracion} 
                    onChange={e => setDatosTarjeta({ ...datosTarjeta, expiracion: e.target.value })} 
                    maxLength={5}
                    required 
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1.5 font-semibold text-xs text-gray-700">CVV:</label>
                  <input 
                    type="text" 
                    className="border border-gray-300 px-3 py-1.5 w-full rounded-lg focus:ring-2 focus:ring-mtk-principal focus:border-transparent text-sm" 
                    value={datosTarjeta.cvv} 
                    onChange={e => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value })} 
                    placeholder="123"
                    maxLength={3}
                    required 
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <IconReceipt className="w-3 h-3" />
                Subtotal:
              </span>
              <span className="font-semibold">S/. {resumen.subtotal.toFixed(2)}</span>
            </div>
            {Number(resumen.descuentos) > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span className="flex items-center gap-1">
                  <IconDiscount className="w-3 h-3" />
                  Descuentos:
                </span>
                <span className="font-semibold">-S/. {resumen.descuentos.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <IconTruck className="w-3 h-3" />
                Envío:
              </span>
              <span className="font-semibold">{costoEnvio === 0 ? 'Gratis' : `S/. ${costoEnvio.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 mt-2 border-t border-gray-300">
              <span>Total:</span>
              <span className="text-mtk-principal">S/. {precioFinal.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2 pt-3">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-linear-to-r from-mtk-principal to-red-700 hover:from-mtk-principal/90 hover:to-red-700/90 text-white rounded-lg transition-colors text-sm font-bold shadow-md"
            >
              <IconShoppingCart className="w-4 h-4" />
              Procesar compra
            </button>
          </div>
        </form>
        </div>
      </dialog>
      <dialog ref={loginDialogRef} className="rounded-2xl shadow-2xl m-auto p-0 max-w-sm w-full backdrop:bg-black/60">
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="bg-linear-to-r from-mtk-principal to-red-700 p-4">
            <h3 className="text-lg font-bold text-white text-center">Necesitas iniciar sesión</h3>
          </div>
          <div className="p-6">
            <p className="text-center text-gray-700 mb-6">Debes iniciar sesión para procesar tu compra.</p>
            <div className="flex gap-2">
              <button 
                type="button"
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors" 
                onClick={() => setShowLoginModal(false)}
              >
                Cerrar
              </button>
              <button 
                type="button"
                className="flex-1 px-4 py-2 bg-linear-to-r from-mtk-principal to-red-700 text-white rounded-lg font-bold hover:from-mtk-principal/90 hover:to-red-700/90 transition-colors shadow-md" 
                onClick={() => navigate('/auth/login')}
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
