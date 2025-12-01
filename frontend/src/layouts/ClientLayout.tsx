import { Outlet } from "react-router-dom";
import Header from '../components/Header';
import ClientNav from '../components/ClientNav';

const ClientLayout = () => {
  return (
    <div className="min-h-screen bg-mtk-fondo">
      <Header nav={<ClientNav />} />
      <main className="container mx-auto px-4 mt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
