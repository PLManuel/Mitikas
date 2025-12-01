import { useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useCatalog } from "../hooks/useCatalog";
import { useVariant } from "../hooks/useVariant";
import { ProductModal } from "../components/ProductModal";
import { useCartHybrid } from "../hooks/useCartHybrid";
import { useAuth } from "../context/AuthContext";
import type { Producto } from "../types/product";
import { IconShirt, IconShoppingCart, IconSparkles } from '@tabler/icons-react';

type ProductCardHomeProps = {
  producto: Producto;
  onOpenModal: (prod: Producto, vars: any[]) => void;
};

const ProductCardHome = ({ producto, onOpenModal }: ProductCardHomeProps) => {
  const { variants, loading } = useVariant(producto.id);
  const activeVariants = variants.filter(v => v.activo);
  const minPrice = activeVariants.length > 0
    ? Math.min(...activeVariants.map(v => Number(v.precioVenta)))
    : 0;

  return (
    <div
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-mtk-principal/30 transform hover:-translate-y-1"
      onClick={() => onOpenModal(producto, variants)}
    >
      <div className="relative bg-linear-to-br from-gray-50 to-gray-100 p-6 h-56 flex items-center justify-center overflow-hidden">
        {producto.imagen ? (
          <img
            src={`/uploads/${producto.imagen}`}
            alt={producto.nombre}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <IconShirt className="w-12 h-12 text-gray-400" />
          </div>
        )}
        {activeVariants.length > 0 && (
          <div className="absolute top-3 right-3 bg-mtk-principal text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <IconSparkles className="w-3 h-3" />
            Disponible
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 min-h-14 group-hover:text-mtk-principal transition-colors">
          {producto.nombre}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">
              {loading
                ? "Cargando..."
                : `${activeVariants.length} talla${activeVariants.length === 1 ? "" : "s"}`}
            </span>
            {activeVariants.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Desde</span>
                <span className="text-lg font-bold text-mtk-principal">S/. {minPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="bg-mtk-principal/10 p-2.5 rounded-full group-hover:bg-mtk-principal group-hover:text-white transition-all">
            <IconShoppingCart className="w-5 h-5 text-mtk-principal group-hover:text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  useDocumentTitle("Mítikas | Inicio");
  const { catalog, loading, error } = useCatalog();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalProduct, setModalProduct] = useState<Producto | null>(null);
  const [modalVariants, setModalVariants] = useState<any[]>([]);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const { user } = useAuth();
  const { addToCart } = useCartHybrid(!!user);

  if (loading) {
    return <div className="text-center mt-8">Cargando catálogo...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 mt-8">{error}</div>;
  }

  const handleOpenModal = (prod: Producto, vars: any[]) => {
    setModalProduct(prod);
    setModalVariants(vars);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setAddMsg(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Catálogo de Productos</h1>
        <p className="text-gray-600">Descubre nuestra colección de productos exclusivos</p>
      </div>

      {catalog.map(({ categoria, productos }) => (
        <section key={categoria.id} className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-linear-to-r from-mtk-principal to-red-600 rounded-full"></div>
            <h2 className="text-3xl font-bold text-gray-800">
              {categoria.categoria}
            </h2>
            <div className="h-1 flex-1 bg-linear-to-r from-red-600/20 to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
                <IconShirt className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay productos en esta categoría.</p>
              </div>
            ) : (
              productos.map((producto) => (
                <ProductCardHome
                  key={producto.id}
                  producto={producto}
                  onOpenModal={handleOpenModal}
                />
              ))
            )}
          </div>
        </section>
      ))}

      {modalProduct && (
        <ProductModal
          open={modalOpen}
          onClose={handleCloseModal}
          producto={modalProduct}
          variantes={modalVariants}
          onAddToCart={async ({ producto, variante, idPromocion }) => {
            await addToCart({
              idProducto: producto.id,
              idVariante: variante.id,
              cantidad: 1,
              precioUnitario: variante.precioVenta,
              tamano: variante.tamano,
              ...(idPromocion ? { idPromocion } : {}),
            });
            setAddMsg('¡Agregado al carrito!');
            setModalOpen(false);
            // Refrescar el sidebar del carrito
            if ((window as any).setCartRefresh) (window as any).setCartRefresh((v: number) => v + 1);
            setTimeout(() => setAddMsg(null), 1200);
          }}
        />
      )}
      {addMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl shadow-2xl z-50 font-semibold flex items-center gap-3 animate-[slideDown_0.3s_ease-out] border-2 border-green-400/30">
          <div className="bg-white/20 rounded-full p-1">
            <IconShoppingCart className="w-5 h-5" />
          </div>
          {addMsg}
        </div>
      )}
    </div>
  );
};

export default Home;
