import { Outlet } from "react-router-dom";
import Header from '../components/Header';
import AdminNav from '../components/AdminNav';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-mtk-fondo">
      <Header nav={<AdminNav />} />
      <main className="container mx-auto px-4 mt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
