import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  IconHome, 
  IconDashboard, 
  IconCreditCard, 
  IconUsers, 
  IconCategory, 
  IconShirt, 
  IconResize, 
  IconPackage, 
  IconMapPin, 
  IconDiscount,
  IconTruck
} from '@tabler/icons-react';

export default function AdminNav() {
  const { user } = useAuth();
  if (!user) return null;

  const links: { to: string; label: string; icon: React.ReactNode }[] = [];
  const isAdmin = user.rol === 'admin';
  const isAlmacen = user.rol === 'almacen';
  const isLogistica = user.rol === 'logistica';
  const isDespachador = user.rol === 'despachador';
  const isRepartidor = user.rol === 'repartidor';

  if (isAdmin || isAlmacen || isLogistica || isDespachador || isRepartidor) {
    links.push(
      { to: '/', label: 'Principal', icon: <IconHome size={18} /> },
      { to: '/admin', label: 'Dashboard', icon: <IconDashboard size={18} /> }
    );
  }

  if (isAdmin) {
    links.push(
      { to: '/admin/metodos-pago', label: 'Métodos de pago', icon: <IconCreditCard size={18} /> },
      { to: '/admin/usuarios', label: 'Usuarios', icon: <IconUsers size={18} /> }
    );
  }

  if (isAlmacen) {
    links.push(
      { to: '/admin/categorias', label: 'Categorías', icon: <IconCategory size={18} /> },
      { to: '/admin/productos', label: 'Productos', icon: <IconShirt size={18} /> },
      { to: '/admin/variantes', label: 'Variantes', icon: <IconResize size={18} /> },
      { to: '/admin/preparacion-pedidos', label: 'Preparar Pedidos', icon: <IconPackage size={18} /> }
    );
  }

  if (isLogistica) {
    links.push(
      { to: '/admin/pedidos', label: 'Pedidos', icon: <IconPackage size={18} /> },
      { to: '/admin/gestion-productos', label: 'Gestión Productos', icon: <IconTruck size={18} /> }
    );
  }

  if (isAdmin) {
    links.push(
      { to: '/admin/zonas', label: 'Zonas', icon: <IconMapPin size={18} /> },
      { to: '/admin/promociones', label: 'Promociones', icon: <IconDiscount size={18} /> }
    );
  }

  if (isDespachador) {
    links.push(
      { to: '/admin/entrega-tienda', label: 'Entrega en Tienda', icon: <IconHome size={18} /> }
    );
  }

  if (isRepartidor) {
    links.push(
      { to: '/admin/entrega-domicilio', label: 'Entrega a Domicilio', icon: <IconTruck size={18} /> }
    );
  }

  return (
    <ul className="flex gap-2 items-center flex-wrap">
      {links.map(link => (
        <li key={link.to}>
          <Link 
            to={link.to} 
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-gray-700 hover:text-mtk-principal hover:bg-mtk-fondo rounded-lg transition-colors font-medium whitespace-nowrap"
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
