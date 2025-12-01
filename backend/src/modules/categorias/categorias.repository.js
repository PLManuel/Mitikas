import pool from '../../config/db.js';

export const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, categoria, imagen, activo FROM categorias'
  );
  return rows;
};

export const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, categoria, imagen, activo FROM categorias WHERE id = ?',
    [id]
  );
  return rows[0] || null;
};

export const create = async (categoria) => {
  const { nombre, imagen } = categoria;

  const [result] = await pool.query(
    'INSERT INTO categorias (categoria, imagen, activo) VALUES (?, ?, TRUE)',
    [nombre, imagen]
  );

  return result.insertId;
};

export const updateActivo = async (id, activo) => {
  const [result] = await pool.query(
    'UPDATE categorias SET activo = ? WHERE id = ?',
    [activo, id]
  );
  return result.affectedRows;
};

export const update = async (id, categoria) => {
  const { nombre, imagen } = categoria;
  
  let query = 'UPDATE categorias SET categoria = ?';
  let params = [nombre];
  
  if (imagen !== undefined) {
    query += ', imagen = ?';
    params.push(imagen);
  }
  
  query += ' WHERE id = ?';
  params.push(id);
  
  const [result] = await pool.query(query, params);
  return result.affectedRows;
};

export const deleteById = async (id) => {
  const [result] = await pool.query(
    'DELETE FROM categorias WHERE id = ?',
    [id]
  );
  return result.affectedRows;
};
