# Mítikas Artesanías 🎨

Sistema de comercio electrónico para artesanías peruanas, desarrollado con React, Node.js, Express y MySQL.

## 📋 Requisitos Previos

- **Node.js** v18 o superior
- **MySQL** v8.0 o superior
- **npm** o **yarn**

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd Mitikas
```

### 2. Instalar dependencias

```bash
npm run install:all
```

Este comando instalará automáticamente las dependencias del backend y frontend.

### 3. Configurar la base de datos

1. Crear la base de datos en MySQL:
```bash
mysql -u root -p
```

2. Ejecutar el script SQL ubicado en `backend/src/config/database.sql`:
```sql
CREATE DATABASE mitikas;
USE mitikas;
-- Copiar y ejecutar todo el contenido de database.sql
```

O ejecutar directamente desde la terminal:
```bash
mysql -u root -p < backend/src/config/database.sql
```

### 4. Configurar variables de entorno

Crear un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# Configuración del servidor
PORT=5000
NODE_ENV=development

# Configuración de la base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=mitikas
DB_PORT=3306

# Configuración de sesiones
SESSION_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
```

**Importante:** Cambia `DB_PASSWORD` por tu contraseña de MySQL.

## ▶️ Ejecutar el proyecto

### Modo desarrollo (Backend + Frontend simultáneamente)

```bash
npm run dev
```

Este comando ejecutará:
- **Backend** en `http://localhost:5000`
- **Frontend** en `http://localhost:5173`

### Ejecutar solo el backend

```bash
npm run dev:backend
```

### Ejecutar solo el frontend

```bash
npm run dev:frontend
```

## 🏗️ Estructura del Proyecto

```
Mitikas/
├── backend/              # Servidor Node.js/Express
│   ├── src/
│   │   ├── config/       # Configuraciones (DB, upload)
│   │   ├── middlewares/  # Middlewares de autenticación
│   │   ├── modules/      # Módulos por funcionalidad
│   │   └── routes/       # Rutas de la API
│   └── uploads/          # Imágenes subidas (creada automáticamente)
│
├── frontend/             # Aplicación React + Vite
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Páginas de la aplicación
│   │   ├── hooks/        # Custom hooks
│   │   └── assets/       # Imágenes y recursos estáticos
│   └── public/
│
└── package.json          # Scripts principales del proyecto
```

## 👤 Usuario Administrador por Defecto

Después de ejecutar el script SQL, se creará un usuario administrador:

- **Email:** `admin@mitikas.com`
- **Contraseña:** `admin123`

**Importante:** Cambia esta contraseña después del primer inicio de sesión.

## 🎨 Características

- ✅ Catálogo de productos con variantes (tallas)
- ✅ Carrito de compras híbrido (sesión + localStorage)
- ✅ Sistema de promociones y descuentos
- ✅ Gestión de pedidos con estados
- ✅ Panel de administración completo
- ✅ Zonas de delivery personalizables
- ✅ Métodos de pago (tarjeta/efectivo)
- ✅ Sistema de tarjetas simuladas para pruebas
- ✅ Autenticación con sesiones
- ✅ Roles de usuario (admin, almacen, logística, cliente)

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2
- express-session
- bcrypt
- multer (para subida de imágenes)

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS
- Tabler Icons

## 📦 Scripts Disponibles

```bash
npm run install:all   # Instalar dependencias de backend y frontend
npm run dev           # Ejecutar backend + frontend
npm run dev:backend   # Ejecutar solo backend
npm run dev:frontend  # Ejecutar solo frontend
npm run build         # Construir frontend para producción
```

## 🌐 API Endpoints

La API REST está disponible en `http://localhost:5000/api/`

Principales endpoints:
- `/api/usuarios` - Gestión de usuarios
- `/api/categorias` - Categorías de productos
- `/api/productos` - Productos
- `/api/variantes` - Variantes de productos
- `/api/promociones` - Promociones
- `/api/pedidos` - Pedidos
- `/api/carrito` - Carrito de compras
- `/api/zonas-delivery` - Zonas de entrega
- `/api/metodos-pago` - Métodos de pago
- `/api/tarjetas` - Tarjetas simuladas

## 🔒 Seguridad

- Las contraseñas se almacenan hasheadas con bcrypt
- Autenticación mediante sesiones HTTP
- Validación de permisos por rol
- Variables de entorno para datos sensibles
- Sanitización de inputs

## 📝 Notas Adicionales

- La carpeta `uploads/` se crea automáticamente al iniciar el backend
- Las imágenes de productos/categorías se sirven desde `/uploads`
- El frontend hace proxy al backend en modo desarrollo
- Los precios están en soles peruanos (S/.)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📧 Contacto

Para consultas sobre el proyecto, contacta a: manuel715pl@gmail.com

---

**Mítikas Artesanías** - Difundiendo el arte, tradición e identidad peruana 🇵🇪
