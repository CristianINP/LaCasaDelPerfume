import db from '../config/db.js';

export const getInventario = async (req, res) => {
  try {
    const [rows] = await db.promise().query('SELECT * FROM productos ORDER BY id');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al obtener inventario:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener inventario' });
  }
};

export const crearProducto = async (req, res) => {
  try {
    const { name, price, imageUrl, category, description, inStock } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'name y price son obligatorios' });
    }
    const [result] = await db.promise().query(
      'INSERT INTO productos (name, price, imageUrl, category, description, inStock, activo) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [name, Number(price), imageUrl || null, category || null, description || null, inStock ? 1 : 1]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(500).json({ success: false, message: 'Error al crear producto' });
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, imageUrl, category, description, inStock } = req.body;
    if (!name || price == null) {
      return res.status(400).json({ success: false, message: 'name y price son obligatorios' });
    }
    await db.promise().query(
      'UPDATE productos SET name=?, price=?, imageUrl=?, category=?, description=?, inStock=? WHERE id=?',
      [name, Number(price), imageUrl || null, category || null, description || null, inStock ? 1 : 0, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ success: false, message: 'Error al actualizar producto' });
  }
};

export const desactivarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('UPDATE productos SET activo=0 WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al desactivar producto:', error.message);
    res.status(500).json({ success: false, message: 'Error al desactivar producto' });
  }
};

export const activarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await db.promise().query('UPDATE productos SET activo=1 WHERE id=?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al activar producto:', error.message);
    res.status(500).json({ success: false, message: 'Error al activar producto' });
  }
};
