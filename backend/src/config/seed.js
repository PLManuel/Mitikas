import * as usuariosRepository from '../modules/usuarios/usuarios.repository.js';
import { hashPassword } from '../utils/password.js';

export const crearAdminPorDefecto = async () => {
  try {
    // Verificar si ya existe un admin
    const adminExistente = await usuariosRepository.findByCorreo('admin@mitikas.com');
    
    if (adminExistente) {
      console.log('✓ Usuario admin ya existe');
      return;
    }

    // Crear admin por defecto
    const passwordHasheado = await hashPassword('admin123');
    
    const adminData = {
      nombre: 'Admin',
      apellidos: 'Sistema',
      dni: '00000000',
      telefono: '999999999',
      correo: 'admin@mitikas.com',
      password: passwordHasheado,
      rol: 'admin',
      activo: true
    };

    await usuariosRepository.create(adminData);
    console.log('✓ Usuario admin creado exitosamente');
    console.log('  Correo: admin@mitikas.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('✗ Error al crear admin por defecto:', error.message);
  }
};
