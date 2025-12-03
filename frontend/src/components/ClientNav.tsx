import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconHome, IconInfoCircle, IconPackage, IconCreditCard, IconShield, IconUser } from '@tabler/icons-react';

export default function ClientNav() {
  const { user, loading } = useAuth();

  return (
    <ul className="flex gap-6 items-center">
      <li>
        <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
          <IconHome size={20} />
          <span>Inicio</span>
        </Link>
      </li>
      {(user?.rol === 'admin' || user?.rol === 'almacen' || user?.rol === 'logistica') && (
        <li>
          <Link to="/admin" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
            <IconShield size={20} />
            <span>Admin</span>
          </Link>
        </li>
      )}
      <li>
        <Link to="/nosotros" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
          <IconInfoCircle size={20} />
          <span>Nosotros</span>
        </Link>
      </li>
      {!loading && user && (
        <>
          <li>
            <Link to="/perfil" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
              <IconUser size={20} />
              <span>Mi perfil</span>
            </Link>
          </li>
          <li>
            <Link to="/pedidos" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
              <IconPackage size={20} />
              <span>Mis pedidos</span>
            </Link>
          </li>
          <li>
            <Link to="/mis-tarjetas" className="flex items-center gap-2 text-gray-700 hover:text-mtk-principal transition-colors font-medium">
              <IconCreditCard size={20} />
              <span>Mis tarjetas</span>
            </Link>
          </li>
        </>
      )}
    </ul>
  );
}
