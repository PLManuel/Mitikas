import { useCartHybrid } from '../hooks/useCartHybrid';
import { useEffect, useState, useRef } from 'react';
import { usePedidoModal } from './usePedidoModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { IconX, IconShoppingCart, IconTrash, IconMinus, IconPlus, IconShoppingBag, IconReceipt, IconDiscount } from '@tabler/icons-react';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  refreshSignal?: number;
}

export function CartSidebar({ open, onClose, refreshSignal }: CartSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const loginDialogRef = useRef<HTMLDialogElement>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { items, resumen, removeFromCart, clearCart, fetchCart, updateQuantity, loading } =
    useCartHybrid(!!user, refreshSignal);
  const { handleOpen, modal } = usePedidoModal(resumen || { total: 0, subtotal: 0, descuentos: 0 }, clearCart);

  useEffect(() => {
    if (open && refreshSignal !== undefined && user) {
      fetchCart();
    }
  }, [refreshSignal, open, user, fetchCart]);

  useEffect(() => {
    const dialog = loginDialogRef.current;
    if (!dialog) return;
    showLoginModal ? dialog.showModal() : dialog.close();
  }, [showLoginModal]);

  if (!open) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      <aside className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 bg-linear-to-r from-mtk-principal to-red-700">
          <div className="flex items-center gap-2">
            <IconShoppingCart className="w-5 h-5 text-white" />
            <h2 className="text-lg font-bold text-white">Carrito</h2>
          </div>
          <button className="p-1 hover:bg-white/20 rounded-full transition-colors" onClick={onClose}>
            <IconX className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <IconShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map(item => {
                const hasDiscount = Number(item.precioConDescuento) < Number(item.precioUnitario);
                const totalItem = Number(item.precioConDescuento) * item.cantidad;
                const totalOriginal = Number(item.precioUnitario) * item.cantidad;
                
                return (
                <li key={item.id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <div className="flex gap-2 items-start">
                    {item.imagenProducto && (
                      <img src={`/uploads/${item.imagenProducto}`} alt={item.nombreProducto} className="h-14 w-14 object-contain rounded bg-white border border-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm line-clamp-1">{item.nombreProducto}</div>
                      <div className="text-xs text-gray-600 mb-1">Talla: {item.tamano}</div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          type="button"
                          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          disabled={loading || item.cantidad <= 1}
                          onClick={() => updateQuantity(item.idVariante, item.cantidad - 1)}
                        >
                          <IconMinus className="w-3 h-3" />
                        </button>

                        <input
                          type="number"
                          min={1}
                          className="w-10 text-center text-xs border border-gray-300 rounded py-0.5"
                          value={item.cantidad}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (isNaN(val) || val < 1) return;
                            updateQuantity(item.idVariante, val);
                          }}
                        />

                        <button
                          type="button"
                          className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
                          disabled={loading}
                          onClick={() => updateQuantity(item.idVariante, item.cantidad + 1)}
                        >
                          <IconPlus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-xs font-bold mt-1">
                        {hasDiscount ? (
                          <div className="flex items-center gap-1">
                            <span className="line-through text-gray-400 text-xs">
                              S/. {totalOriginal.toFixed(2)}
                            </span>
                            <span className="text-green-600 text-sm">
                              S/. {totalItem.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-900 text-sm">
                            S/. {totalItem.toFixed(2)}
                          </span>
                        )}
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.cantidad} x S/. {Number(hasDiscount ? item.precioConDescuento : item.precioUnitario).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button 
                      className="p-1 hover:bg-red-100 rounded transition-colors" 
                      onClick={() => removeFromCart(item.idVariante)} 
                      aria-label="Quitar del carrito"
                    >
                      <IconX className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t bg-gray-50 p-3">
          {resumen && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <IconShoppingBag className="w-3 h-3" />
                  Productos:
                </span>
                <span>{resumen.cantidadProductos}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <IconReceipt className="w-3 h-3" />
                  Subtotal:
                </span>
                <span>S/. {Number(resumen.subtotal).toFixed(2)}</span>
              </div>
              {Number(resumen.descuentos) > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span className="flex items-center gap-1">
                    <IconDiscount className="w-3 h-3" />
                    Descuentos:
                  </span>
                  <span>-S/. {Number(resumen.descuentos).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-300">
                <span>Total:</span>
                <span className="text-mtk-principal">S/. {Number(resumen.total).toFixed(2)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-sm font-semibold" onClick={clearCart}>
              <IconTrash className="w-4 h-4" />
              Vaciar
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-linear-to-r from-mtk-principal to-red-700 hover:from-mtk-principal/90 hover:to-red-700/90 text-white rounded-lg transition-colors text-sm font-bold shadow-md"
              onClick={() => {
                if (!user) {
                  setShowLoginModal(true);
                } else {
                  handleOpen();
                }
              }}
            >
              <IconShoppingCart className="w-4 h-4" />
              Procesar
            </button>
          </div>
        </div>
      </aside>
      {modal}

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