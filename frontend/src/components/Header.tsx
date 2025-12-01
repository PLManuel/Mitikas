import type { ReactNode } from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { IconLogout, IconUserCircle, IconShoppingCart, IconLogin } from '@tabler/icons-react';
import { CartSidebar } from './CartSidebar';
import logo from '../assets/mitikas.png';

interface HeaderProps {
  nav: ReactNode;
}

export default function Header({ nav }: HeaderProps) {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [cartRefresh, setCartRefresh] = useState(0);

  (window as any).setCartRefresh = setCartRefresh;

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <>
      <header className="bg-white shadow-sm border-b-2 border-mtk-principal">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-8">
          <img src={logo} alt="Mitikas logo" className="h-12" />
          <nav className="flex-1 flex justify-center">{nav}</nav>
          <div className="flex items-center gap-3">
            {!isAdminPage && (
              <button 
                onClick={() => setCartOpen(true)} 
                className="flex items-center gap-2 px-3 py-2 bg-mtk-principal text-white rounded-lg hover:bg-red-700 transition-colors font-medium" 
                aria-label="Abrir carrito"
              >
                <IconShoppingCart size={20} />
                <span>Carrito</span>
              </button>
            )}
            {!loading && !user && (
              <a 
                href="/auth/login"
                className="flex items-center gap-2 px-3 py-2 text-mtk-principal hover:text-white hover:bg-mtk-principal border-2 border-mtk-principal rounded-lg transition-colors font-medium"
              >
                <IconLogin size={20} />
                <span>Iniciar sesión</span>
              </a>
            )}
            {!loading && user && (
              <>
                <div className="flex items-center gap-2 text-gray-700">
                  <IconUserCircle size={20} className="text-mtk-principal" />
                  <span className="font-medium">{user.nombre}</span>
                  {user.rol !== 'cliente' && (
                    <span className="text-xs bg-mtk-principal text-white px-2 py-1 rounded-full font-medium">
                      {user.rol}
                    </span>
                  )}
                </div>
                <button 
                  className="flex items-center gap-1 text-mtk-principal hover:text-red-700 transition-colors" 
                  onClick={logout}
                >
                  <IconLogout size={18} />
                  <span className="text-sm font-medium">Salir</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <CartSidebar 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        refreshSignal={cartRefresh} 
      />
    </>
  );
}
