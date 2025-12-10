import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  IconCreditCard, 
  IconUsers, 
  IconCategory, 
  IconShirt, 
  IconResize, 
  IconPackage, 
  IconMapPin, 
  IconDiscount,
  IconHome
} from '@tabler/icons-react';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.rol === 'admin';
  const isAlmacen = user.rol === 'almacen';
  const isLogistica = user.rol === 'logistica';
  const isDespachador = user.rol === 'despachador';
  const isRepartidor = user.rol === 'repartidor';

  const cards: { to: string; label: string; description: string; icon: React.ReactNode; color: string }[] = [];

  if (isAdmin) {
    cards.push(
      { 
        to: '/admin/metodos-pago', 
        label: 'Métodos de pago', 
        description: 'Gestiona los métodos de pago disponibles',
        icon: <IconCreditCard size={32} />,
        color: 'bg-blue-500'
      },
      { 
        to: '/admin/usuarios', 
        label: 'Usuarios', 
        description: 'Administra usuarios del sistema',
        icon: <IconUsers size={32} />,
        color: 'bg-purple-500'
      },
      { 
        to: '/admin/zonas', 
        label: 'Zonas de entrega', 
        description: 'Configura zonas y costos de envío',
        icon: <IconMapPin size={32} />,
        color: 'bg-green-500'
      },
      { 
        to: '/admin/promociones', 
        label: 'Promociones', 
        description: 'Crea y gestiona promociones',
        icon: <IconDiscount size={32} />,
        color: 'bg-orange-500'
      }
    );
  }

  if (isAlmacen) {
    cards.push(
      { 
        to: '/admin/categorias', 
        label: 'Categorías', 
        description: 'Gestiona categorías de productos',
        icon: <IconCategory size={32} />,
        color: 'bg-teal-500'
      },
      { 
        to: '/admin/productos', 
        label: 'Productos', 
        description: 'Administra el catálogo de productos',
        icon: <IconShirt size={32} />,
        color: 'bg-indigo-500'
      },
      { 
        to: '/admin/variantes', 
        label: 'Variantes', 
        description: 'Configura tallas y variantes',
        icon: <IconResize size={32} />,
        color: 'bg-pink-500'
      },
      { 
        to: '/admin/preparacion-pedidos', 
        label: 'Preparar Pedidos', 
        description: 'Prepara y verifica pedidos para entrega',
        icon: <IconPackage size={32} />,
        color: 'bg-yellow-500'
      }
    );
  }

  if (isLogistica) {
    cards.push(
      { 
        to: '/admin/pedidos', 
        label: 'Pedidos', 
        description: 'Gestiona y monitorea pedidos',
        icon: <IconPackage size={32} />,
        color: 'bg-red-500'
      },
      { 
        to: '/admin/gestion-productos', 
        label: 'Gestión de Productos', 
        description: 'Gestiona solicitudes y proveedores',
        icon: <IconPackage size={32} />,
        color: 'bg-cyan-500'
      }
    );
  }

  if (isDespachador) {
    cards.push({ 
      to: '/admin/entrega-tienda', 
      label: 'Entrega en Tienda', 
      description: 'Gestiona entregas de pedidos en tienda',
      icon: <IconHome size={32} />,
      color: 'bg-yellow-500'
    });
  }

  if (isRepartidor) {
    cards.push({ 
      to: '/admin/entrega-domicilio', 
      label: 'Entrega a Domicilio', 
      description: 'Gestiona entregas de pedidos a domicilio',
      icon: <IconPackage size={32} />,
      color: 'bg-purple-500'
    });
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
      <p className="text-gray-600 mb-8">Bienvenido, {user.nombre}. Selecciona una sección para comenzar.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <Link 
            key={card.to}
            to={card.to}
            className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-mtk-principal"
          >
            <div className="p-6">
              <div className={`${card.color} w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-mtk-principal transition-colors">
                {card.label}
              </h3>
              <p className="text-gray-600 text-sm">
                {card.description}
              </p>
            </div>
            <div className="bg-mtk-fondo px-6 py-3 text-sm text-gray-700 font-medium group-hover:bg-mtk-principal group-hover:text-white transition-colors">
              Ir a {card.label} →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
