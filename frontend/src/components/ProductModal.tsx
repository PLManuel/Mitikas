import { useEffect, useRef, useState } from 'react';
import { usePromotions } from '../hooks/usePromotions';
import type { Producto } from '../types/product';
import type { VarianteProducto } from '../types/variant';
import { IconX, IconShoppingCart, IconRuler, IconDiscount, IconSparkles } from '@tabler/icons-react';

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  producto: Producto | null;
  variantes: VarianteProducto[];
  onAddToCart?: (data: { producto: Producto; variante: VarianteProducto; idPromocion?: number }) => void;
}

export function ProductModal({ open, onClose, producto, variantes, onAddToCart }: ProductModalProps) {
  const { promotions } = usePromotions();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedVar, setSelectedVar] = useState<VarianteProducto | null>(null);

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
    setSelectedVar(variantes.length > 0 ? variantes[0] : null);
  }, [producto, variantes]);

  if (!producto) return null;

  const now = new Date();
  const promoForVariant = selectedVar ? promotions.find(promo => {
    if (!promo.activo) return false;
    const start = new Date(promo.fechaInicio);
    const end = new Date(promo.fechaFin);
    if (now < start || now > end) return false;
    return promo.variantes?.some(v => Number(v.idVariante) === Number(selectedVar.id));
  }) : null;

  const precioVenta = selectedVar ? Number(selectedVar.precioVenta) : 0;
  const promoPrice = promoForVariant
    ? promoForVariant.tipo === 'porcentaje'
      ? precioVenta * (1 - Number(promoForVariant.valor) / 100)
      : Number(promoForVariant.valor)
    : null;

  return (
    <dialog
      ref={dialogRef}
      className="rounded-2xl shadow-2xl m-auto p-0 max-w-4xl w-full backdrop:bg-black/60"
    >
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative bg-linear-to-r from-mtk-principal to-red-700 p-4">
          <button
            type="button"
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <IconX className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-bold text-white pr-10 drop-shadow-lg">{producto.nombre}</h2>
        </div>

        <div className="flex">
          {/* Columna izquierda - Imagen */}
          <div className="w-2/5 bg-linear-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
            {producto.imagen ? (
              <img
                src={`/uploads/${producto.imagen}`}
                alt={producto.nombre}
                className="max-h-96 w-full object-contain"
              />
            ) : (
              <div className="text-gray-400 text-center">
                <IconSparkles className="w-16 h-16 mx-auto mb-2" />
                <p className="text-sm">Sin imagen</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Información */}
          <div className="w-3/5 p-4">
            {/* Descripción */}
            {producto.descripcion && (
              <div className="mb-4 p-3 bg-mtk-fondo rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

          {/* Selector de variante */}
          <div className="mb-4">
            <label className="flex items-center gap-2 mb-2 font-bold text-gray-800 text-sm">
              <IconRuler className="w-4 h-4 text-mtk-principal" />
              Selecciona tu talla:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {variantes.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVar(v)}
                  disabled={!v.activo}
                  className={`px-3 py-2 rounded-lg font-semibold transition-all border-2 text-sm ${
                    selectedVar?.id === v.id
                      ? 'bg-mtk-principal text-white border-mtk-principal shadow-md scale-105'
                      : v.activo
                      ? 'bg-white text-gray-700 border-gray-300 hover:border-mtk-principal hover:text-mtk-principal'
                      : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {v.tamano}
                  {!v.activo && <div className="text-xs mt-0.5">No disponible</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Precio y promoción */}
          {selectedVar && (
            <div className="mb-4 p-4 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
              {promoForVariant ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-green-600 font-bold">
                    <IconDiscount className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wide">¡Promoción activa!</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="line-through text-gray-500 text-lg">
                        S/. {precioVenta.toFixed(2)}
                      </span>
                      <span className="text-3xl font-bold text-green-600">
                        S/. {promoPrice!.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-xs">
                      <IconSparkles className="w-3 h-3" />
                      {promoForVariant.nombre}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <span className="text-gray-600 text-xs block mb-1">Precio</span>
                  <span className="text-3xl font-bold text-mtk-principal">
                    S/. {precioVenta.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="flex-2 px-4 py-3 bg-linear-to-r from-mtk-principal to-red-700 text-white rounded-lg font-bold hover:from-mtk-principal/90 hover:to-red-700/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
              disabled={!selectedVar || !selectedVar.activo}
              onClick={() => {
                if (selectedVar && producto) {
                  onAddToCart?.({ producto, variante: selectedVar, idPromocion: promoForVariant?.id });
                }
              }}
            >
              <IconShoppingCart className="w-4 h-4" />
              Agregar al carrito
            </button>
          </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
