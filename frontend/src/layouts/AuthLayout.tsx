import { Outlet, Link } from "react-router-dom";
import { IconHome } from "@tabler/icons-react";

export const AuthLayout = () => {
  return (
    <div className="bg-mtk-fondo min-h-screen">
      <div className="absolute top-6 left-6">
        <Link 
          to="/" 
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-mtk-principal hover:bg-white rounded-lg transition-colors font-medium shadow-sm bg-white/80 backdrop-blur-sm"
        >
          <IconHome size={20} />
          <span>Volver al inicio</span>
        </Link>
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};
