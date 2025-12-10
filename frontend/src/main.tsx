import { AuthProvider } from './context/AuthContext';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import './index.css'

import ClientLayout from './layouts/ClientLayout'
import { AuthLayout } from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'

import NotFound from './pages/NotFound'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'


import Home from './pages/Home'
import About from './pages/About'
import Orders from './pages/Orders'
import MisTarjetas from './pages/MisTarjetas'
import { Profile } from './pages/Profile'
import Dashboard from './pages/admin/Dashboard'
import Category from './pages/admin/Category'
import User from './pages/admin/User'
import PreparacionPedidos from './pages/PreparacionPedidos'
import GestionProductos from './pages/GestionProductos'
import EntregaTienda from './pages/EntregaTienda'
import EntregaDomicilio from './pages/EntregaDomicilio'
import Product from './pages/admin/Product';
import Variant from './pages/admin/Variant';

import PedidosAdmin from './pages/admin/PedidosAdmin';

import MetodosPagoAdmin from './pages/admin/MetodosPagoAdmin';
import PromotionsAdmin from './pages/admin/PromotionsAdmin';
import ProtectedRoute from './components/ProtectedRoute';
import DeliveryZonesAdmin from './pages/admin/DeliveryZonesAdmin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientLayout />}>
            <Route index element={<Home />} />
            <Route path='nosotros' element={<About />} />
            <Route element={<ProtectedRoute />}>
              <Route path='perfil' element={<Profile />} />
              <Route path='pedidos' element={<Orders />} />
              <Route path='mis-tarjetas' element={<MisTarjetas />} />
            </Route>
          </Route>

          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Protegido: admin, almacen y logistica pueden acceder a /admin */}
          <Route path="/admin" element={<ProtectedRoute requiredRole={['admin', 'almacen', 'logistica', 'despachador', 'repartidor']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="categorias" element={<Category />} />
              <Route path="usuarios" element={<User />} />
              <Route path="productos" element={<Product />} />
              <Route path="variantes" element={<Variant />} />
              <Route path="metodos-pago" element={<MetodosPagoAdmin />} />
              <Route path="promociones" element={<PromotionsAdmin />} />
              <Route path="zonas" element={<DeliveryZonesAdmin />} />
              <Route path="pedidos" element={<PedidosAdmin />} />
              <Route path="preparacion-pedidos" element={<PreparacionPedidos />} />
              <Route path="gestion-productos" element={<GestionProductos />} />
              <Route path="entrega-tienda" element={<EntregaTienda />} />
              <Route path="entrega-domicilio" element={<EntregaDomicilio />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
