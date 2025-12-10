import { config } from './config/env.js';
import app from './app.js';
import { crearAdminPorDefecto, crearMetodosPagoPorDefecto, crearCategoriasPorDefecto } from './config/seed.js';

const PORT = config.port;

// Crear datos iniciales al iniciar el servidor
const inicializarDatos = async () => {
  await crearAdminPorDefecto();
  await crearMetodosPagoPorDefecto();
  await crearCategoriasPorDefecto();
};

inicializarDatos();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
