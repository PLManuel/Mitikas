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

export const crearUsuariosRolesPorDefecto = async () => {
  try {
    const [usuarios] = await pool.query('SELECT COUNT(*) as count FROM usuarios WHERE rol != ?', ['admin']);

    if (usuarios[0].count > 0) {
      console.log('✓ Usuarios de roles ya existen');
      return;
    }

    const roles = [
      { nombre: 'Almacén', apellidos: 'Usuario', dni: '11111111', telefono: '911111111', correo: 'almacen@mitikas.com', rol: 'almacen' },
      { nombre: 'Logística', apellidos: 'Usuario', dni: '22222222', telefono: '922222222', correo: 'logistica@mitikas.com', rol: 'logistica' },
      { nombre: 'Despachador', apellidos: 'Usuario', dni: '33333333', telefono: '933333333', correo: 'despachador@mitikas.com', rol: 'despachador' },
      { nombre: 'Repartidor', apellidos: 'Usuario', dni: '44444444', telefono: '944444444', correo: 'repartidor@mitikas.com', rol: 'repartidor' }
    ];

    const passwordHasheado = await hashPassword('123');

    for (const rolData of roles) {
      await usuariosRepository.create({
        ...rolData,
        password: passwordHasheado,
        activo: true
      });
      console.log(`✓ Usuario ${rolData.rol} creado: ${rolData.correo}`);
    }

    console.log('  - Usuarios de roles creados exitosamente');
    console.log('  - Password para todos: 123');

  } catch (error) {
    console.error('✗ Error al crear usuarios de roles:', error.message);
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
  try {
    const [categorias] = await pool.query('SELECT COUNT(*) as count FROM categorias');

    if (categorias[0].count > 0) {
      console.log('✓ Categorías ya existen');
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

  } catch (error) {
    console.error('✗ Error al crear categorías:', error.message);
  }
};

export const crearZonasDeliveryPorDefecto = async () => {
  try {
    const [zonas] = await pool.query('SELECT COUNT(*) as count FROM zonas_delivery');

    if (zonas[0].count > 0) {
      console.log('✓ Zonas de delivery ya existen');
      return;
    }

    // Distritos de Lima con costos de envío
    const zonasDelivery = [
      // { distrito: 'Cercado de Lima', costo: 5.00, dias: 1 },
      // { distrito: 'Miraflores', costo: 8.00, dias: 1 },
      // { distrito: 'San Isidro', costo: 8.00, dias: 1 },
      // { distrito: 'Surco', costo: 10.00, dias: 2 },
      // { distrito: 'La Molina', costo: 10.00, dias: 2 },
      // { distrito: 'San Borja', costo: 8.00, dias: 1 },
      // { distrito: 'Barranco', costo: 8.00, dias: 1 },
      // { distrito: 'Chorrillos', costo: 10.00, dias: 2 },
      // { distrito: 'San Miguel', costo: 7.00, dias: 1 },
      // { distrito: 'Pueblo Libre', costo: 7.00, dias: 1 },
      // { distrito: 'Jesús María', costo: 7.00, dias: 1 },
      // { distrito: 'Lince', costo: 7.00, dias: 1 },
      // { distrito: 'Magdalena', costo: 8.00, dias: 1 },
      // { distrito: 'Breña', costo: 6.00, dias: 1 },
      { distrito: 'La Victoria', costo: 6.00, dias: 1 },
      // { distrito: 'Rímac', costo: 6.00, dias: 1 },
      { distrito: 'San Luis', costo: 9.00, dias: 1 },
      // { distrito: 'Ate', costo: 12.00, dias: 2 },
      // { distrito: 'Santa Anita', costo: 10.00, dias: 2 },
      { distrito: 'El Agustino', costo: 10.00, dias: 2 },
      { distrito: 'San Juan de Lurigancho', costo: 12.00, dias: 2 },
      // { distrito: 'Los Olivos', costo: 12.00, dias: 2 },
      // { distrito: 'Independencia', costo: 12.00, dias: 2 },
      { distrito: 'San Martín de Porres', costo: 10.00, dias: 2 },
      // { distrito: 'Comas', costo: 15.00, dias: 3 },
      { distrito: 'Callao', costo: 10.00, dias: 2 },
      // { distrito: 'Bellavista', costo: 10.00, dias: 2 },
      // { distrito: 'La Perla', costo: 10.00, dias: 2 },
      { distrito: 'Villa El Salvador', costo: 15.00, dias: 3 },
      // { distrito: 'Villa María del Triunfo', costo: 15.00, dias: 3 },
      { distrito: 'San Juan de Miraflores', costo: 12.00, dias: 2 }
    ];

    for (const zona of zonasDelivery) {
      await pool.query(
        `INSERT INTO zonas_delivery (distrito, costo, dias_estimados, activo) VALUES (?, ?, ?, true)`,
        [zona.distrito, zona.costo, zona.dias]
      );
    }

    console.log('✓ Zonas de delivery creadas exitosamente');
    console.log(`  ${zonasDelivery.length} distritos de Lima configurados`);

  } catch (error) {
    console.error('✗ Error al crear zonas de delivery:', error.message);
  }
};
