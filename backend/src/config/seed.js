import * as usuariosRepository from '../modules/usuarios/usuarios.repository.js';
import { hashPassword } from '../utils/password.js';
import pool from './db.js';

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

export const crearMetodosPagoPorDefecto = async () => {
  try {
    // Verificar si ya existen métodos de pago
    const [metodos] = await pool.query('SELECT COUNT(*) as count FROM metodospago');

    if (metodos[0].count > 0) {
      console.log('✓ Métodos de pago ya existen');
      return;
    }

    // Crear métodos de pago por defecto
    await pool.query(
      `INSERT INTO metodospago (metodo, activo) VALUES 
       ('Contra Entrega', true),
       ('Tarjeta de Crédito', true)`
    );

    console.log('✓ Métodos de pago creados exitosamente');
    console.log('  - Contra Entrega');
    console.log('  - Tarjeta de Crédito');

  } catch (error) {
    console.error('✗ Error al crear métodos de pago:', error.message);
  }
};

export const crearCategoriasPorDefecto = async () => {
  const [categorias] = await pool.query('SELECT COUNT(*) as count FROM categorias');

  if (categorias[0].count > 0) {
    console.log('✓ Categorías y productos ya existen');
    return;
  }

  // Crear categorías por defecto
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Cerámica', null, true)`
  );
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Retablos', null, true)`
  );
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Peluches', null, true)`
  );
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Juegos', null, true)`
  );
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Piscos', null, true)`
  );
  await pool.query(
    `INSERT INTO categorias (categoria, imagen, activo) VALUES ('Decoración', null, true)`
  );

  console.log('✓ Categorias creadas exitosamente');
  console.log('  - Cerámica');
  console.log('  - Retablos');
  console.log('  - Peluches');
  console.log('  - Juegos');
  console.log('  - Piscos');
  console.log('  - Decoración');
};
