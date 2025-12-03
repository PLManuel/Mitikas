import { useEffect, useState } from "react";
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
  
  useEffect(() => {
    console.log(`[ProductCardHome] Producto: ${producto.nombre}, Variantes activas:`, activeVariants);
    
    // Calcular precio mínimo con promoción
    let minPrice = 0;
    let hasPromo = false;
    if (activeVariants.length > 0) {
      // Buscar variante con promoción de menor precio
      const variantesConPromo = activeVariants.filter(v => {
        const tienePromo = (v as any).idPromocion;
        console.log(`[ProductCardHome] Variante ${(v as any).id}: idPromocion=${tienePromo}, precioVenta=${v.precioVenta}`);
        return tienePromo;
      });
      console.log(`[ProductCardHome] Variantes con promo encontradas:`, variantesConPromo);
      if (variantesConPromo.length > 0) {
        minPrice = Math.min(...variantesConPromo.map(v => Number(v.precioVenta)));
        hasPromo = true;
        console.log(`[ProductCardHome] Precio mínimo con promo: ${minPrice}`);
      } else {
        // Si no hay promoción, usar el precio mínimo regular
        minPrice = Math.min(...activeVariants.map(v => Number(v.precioVenta)));
        console.log(`[ProductCardHome] Sin promo, precio mínimo regular: ${minPrice}`);
      }
    }
  }, [activeVariants, producto.nombre]);
  
  // Calcular precio mínimo con promoción
  let minPrice = 0;
  let hasPromo = false;
  if (activeVariants.length > 0) {
    // Buscar variante con promoción de menor precio
    const variantesConPromo = activeVariants.filter(v => (v as any).idPromocion);
    if (variantesConPromo.length > 0) {
      // Usar precioConPromo si existe, sino usar precioVenta
      minPrice = Math.min(...variantesConPromo.map(v => Number((v as any).precioConPromo || v.precioVenta)));
      hasPromo = true;
    } else {
      // Si no hay promoción, usar el precio mínimo regular
      minPrice = Math.min(...activeVariants.map(v => Number(v.precioVenta)));
    }
  }

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
            {hasPromo ? 'En promoción' : 'Disponible'}
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
                <span className={`text-lg font-bold ${hasPromo ? 'text-red-600' : 'text-mtk-principal'}`}>
                  S/. {minPrice.toFixed(2)}
                </span>
                {hasPromo && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">PROMO</span>}
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

  // Estado para filtrar por categoría
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  // Estado para búsqueda por nombre
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para filtro de precio con range
  const [priceFilter, setPriceFilter] = useState(0);
  const [maxPriceAll, setMaxPriceAll] = useState(0);
  // Estado para precios mínimos de productos
  const [preciosMinimos, setPreciosMinimos] = useState<{ [id: number]: number }>({});
  // Estado para ordenar productos
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  // Estado para filtro de promoción
  const [filterPromocion, setFilterPromocion] = useState(false);
  // Estado para variantes con promoción
  const [variantesConPromocion, setVariantesConPromocion] = useState<Set<number>>(new Set());

  // Efecto para calcular maxPriceAll y preciosMinimos usando API (cuando catalog cambia)
  useEffect(() => {
    const precios: { [id: number]: number } = {};
    let maxPrecio = 0;
    
    const fetchAllVariants = async () => {
      const allProductIds: number[] = [];
      catalog.forEach(({ productos }) => {
        productos.forEach(producto => {
          allProductIds.push(producto.id);
        });
      });

      console.log(`[FRONTEND] Iniciando fetch de variantes para ${allProductIds.length} productos`);
      const conPromo = new Set<number>();

      for (const id of allProductIds) {
        try {
          console.log(`[FRONTEND] Obteniendo variantes para producto: ${id}`);
          const response = await fetch(`/api/variantes/producto/${id}`);
          if (response.ok) {
            const variants = await response.json();
            console.log(`[FRONTEND] Variantes recibidas para producto ${id}:`, variants);
            const activos = variants.filter((v: any) => v.activo);
            console.log(`[FRONTEND] Variantes activas para producto ${id}:`, activos);
            if (activos.length > 0) {
              // Usar precioConPromo si existe, sino precioVenta
              const precios_variantes = activos.map((v: any) => Number(v.precioConPromo || v.precioVenta));
              const min = Math.min(...precios_variantes);
              const max = Math.max(...precios_variantes);
              precios[id] = min;
              if (max > maxPrecio) maxPrecio = max;
              // Verificar si alguna variante tiene promoción
              const tienePromo = activos.some((v: any) => v.idPromocion);
              if (tienePromo) {
                conPromo.add(id);
              }
            } else {
              precios[id] = 0;
            }
          }
        } catch (error) {
          console.error(`Error fetching variants for product ${id}:`, error);
          precios[id] = 0;
        }
      }
      console.log(`[FRONTEND] Max precio calculado: ${maxPrecio}`);
      setPreciosMinimos(precios);
      setMaxPriceAll(maxPrecio > 0 ? maxPrecio : 100);
      setPriceFilter(maxPrecio > 0 ? maxPrecio : 100);
      setVariantesConPromocion(conPromo);
    };
    
    if (catalog.length > 0) {
      fetchAllVariants();
    }
  }, [catalog.length]);

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

  // Obtener todas las categorías
  const categorias = catalog.map(({ categoria }) => categoria);

  // Filtrar catálogo según la categoría seleccionada
  let catalogFiltrado = selectedCategory
    ? catalog.filter(({ categoria }) => String(categoria.id) === selectedCategory)
    : catalog;

  // Filtrar productos por nombre y por precio mínimo <= filtro, y ordenar por precio
  catalogFiltrado = catalogFiltrado.map(({ categoria, productos }) => {
    let productosFiltrados = productos.filter(producto => {
      const nombreMatch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const precioMin = preciosMinimos[producto.id] ?? 0;
      // Solo mostrar productos cuyo precio mínimo sea <= al filtro
      const priceOk = precioMin <= priceFilter;
      // Filtrar por promoción si está activado
      const promocionOk = !filterPromocion || variantesConPromocion.has(producto.id);
      return nombreMatch && priceOk && promocionOk;
    });
    // Ordenar productos según sortOrder
    productosFiltrados.sort((a, b) => {
      const precioA = preciosMinimos[a.id] ?? 0;
      const precioB = preciosMinimos[b.id] ?? 0;
      return sortOrder === 'asc' ? precioA - precioB : precioB - precioA;
    });
    return { categoria, productos: productosFiltrados };
  });

  // Separar categorías con productos de categorías sin productos
  const categoriasConProductos = catalogFiltrado.filter(cat => cat.productos.length > 0);
  const categoriasSinProductos = catalogFiltrado.filter(cat => cat.productos.length === 0);
  
  // Combinar: primero con productos, luego sin productos
  const catalogOrdenado = [...categoriasConProductos, ...categoriasSinProductos];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Nav de categorías */}
      <nav className="mb-6 flex flex-wrap gap-2 justify-center">
        <button
          className={`px-3 py-1 text-sm rounded-full font-semibold border transition-colors ${selectedCategory === null ? 'bg-mtk-principal text-white border-mtk-principal' : 'bg-white text-mtk-principal border-gray-200 hover:bg-mtk-principal/10'}`}
          onClick={() => setSelectedCategory(null)}
        >
          Todas
        </button>
        {categorias.map(cat => (
          <button
            key={cat.id}
            className={`px-3 py-1 text-sm rounded-full font-semibold border transition-colors ${selectedCategory === String(cat.id) ? 'bg-mtk-principal text-white border-mtk-principal' : 'bg-white text-mtk-principal border-gray-200 hover:bg-mtk-principal/10'}`}
            onClick={() => setSelectedCategory(String(cat.id))}
          >
            {cat.categoria}
          </button>
        ))}
      </nav>

      {/* Buscador, filtro de precio y ordenamiento */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center flex-wrap">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mtk-principal w-full max-w-64"
        />
        <div className="flex gap-2 items-center">
          <label className="text-sm text-gray-600">Ordenar:</label>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-mtk-principal bg-white"
          >
            <option value="asc">Menor ↑</option>
            <option value="desc">Mayor ↓</option>
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">Precio:</span>
          <input
            type="range"
            min={0}
            max={Math.ceil(maxPriceAll)}
            step={0.1}
            value={priceFilter}
            onChange={e => setPriceFilter(Number(e.target.value))}
            className="w-32 cursor-pointer accent-mtk-principal h-1.5"
          />
          <span className="ml-1 font-bold text-mtk-principal text-sm min-w-16">S/. {priceFilter.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="checkbox"
            id="filterPromocion"
            checked={filterPromocion}
            onChange={e => setFilterPromocion(e.target.checked)}
            className="w-4 h-4 cursor-pointer accent-mtk-principal"
          />
          <label htmlFor="filterPromocion" className="text-sm text-gray-600 cursor-pointer">
            En promoción
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Catálogo de Productos</h1>
        <p className="text-sm text-gray-500">Descubre nuestra colección de productos exclusivos</p>
      </div>

      {catalogOrdenado.map(({ categoria, productos }) => (
        <section key={categoria.id} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-8 bg-linear-to-r from-mtk-principal to-red-600 rounded-full"></div>
            <h2 className="text-lg font-bold text-gray-800">
              {categoria.categoria}
            </h2>
            <div className="h-0.5 flex-1 bg-linear-to-r from-red-600/20 to-transparent rounded-full"></div>
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
