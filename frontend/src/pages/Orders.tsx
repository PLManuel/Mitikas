import { MisPedidos } from '../components/MisPedidos';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Orders() {
  useDocumentTitle('Mítikas | Mis Pedidos');
  return <MisPedidos />;
}
