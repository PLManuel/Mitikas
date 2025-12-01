import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, 
      p.nombre, 
      p.descripcion, 
      p.imagen, 
      p.idCategoria,
      c.categoria as nombreCategoria,
      p.activo 
    FROM productos p
    LEFT JOIN categorias c ON p.idCategoria = c.id
  `);
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, 
      p.nombre, 
      p.descripcion, 
      p.imagen, 
      p.idCategoria,
      c.categoria as nombreCategoria,
      p.activo 
    FROM productos p
    LEFT JOIN categorias c ON p.idCategoria = c.id
    WHERE p.id = ?
  `, [id]);
  return rows[0] || null;
};

export const findByCategoria = async (idCategoria) => {
  const [rows] = await pool.query(`
    SELECT 
      p.id, 
      p.nombre, 
      p.descripcion, 
      p.imagen, 
      p.idCategoria,
      c.categoria as nombreCategoria,
      p.activo 
    FROM productos p
    LEFT JOIN categorias c ON p.idCategoria = c.id
    WHERE p.idCategoria = ?
  `, [idCategoria]);
  return rows;
};

export const create = async (producto) => {
  const { nombre, descripcion, imagen, idCategoria } = producto;

  const [result] = await pool.query(
    'INSERT INTO productos (nombre, descripcion, imagen, idCategoria, activo) VALUES (?, ?, ?, ?, TRUE)',
    [nombre, descripcion, imagen, idCategoria]
  );

  return result.insertId;
};

export const update = async (id, producto) => {
  const { nombre, descripcion, imagen, idCategoria } = producto;
  
  let query = 'UPDATE productos SET nombre = ?, descripcion = ?, idCategoria = ?';
  let params = [nombre, descripcion, idCategoria];
  
  if (imagen !== undefined) {
    query += ', imagen = ?';
    params.push(imagen);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE productos SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};
