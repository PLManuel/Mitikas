import { config } from './config/env.js';
import app from './app.js';
import { crearAdminPorDefecto } from './config/seed.js';

const PORT = config.port;

// Crear admin por defecto al iniciar
crearAdminPorDefecto();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
