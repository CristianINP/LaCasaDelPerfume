import db from '../config/db.js';

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      'SELECT id_usuario AS id, nombre, apellido, email, telefono FROM usuarios WHERE id_usuario = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error en getProfile:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

// Obtener historial de compras del usuario autenticado
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT p.id, p.folio, p.paypal_orden_id, p.paypal_estado,
              p.subtotal, p.iva, p.total, p.fecha
       FROM pedidos p
       WHERE p.usuario_id = ?
       ORDER BY p.fecha DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error en getOrderHistory:', error.message);
    res.status(500).json({ mensaje: 'Error al obtener historial' });
  }
};
