import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Obtener perfil del usuario autenticado
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT id_usuario AS id, nombre, apellido, email, telefono,
              rfc, regimen_fiscal, uso_cfdi
       FROM usuarios WHERE id_usuario = ?`,
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

// Actualizar perfil del usuario autenticado
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, apellido, telefono, email, rfc, regimen_fiscal, uso_cfdi, password } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    // Validar nuevo email si viene
    if (email) {
      const [emailCheck] = await db.promise().query(
        'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ mensaje: 'Ese correo electrónico ya está en uso por otra cuenta' });
      }
    }

    const rfcFinal         = rfc          || null;
    const regimenFinal     = regimen_fiscal || null;
    const usoCfdiFinal     = uso_cfdi      || null;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.promise().query(
        `UPDATE usuarios
         SET nombre=?, apellido=?, telefono=?, email=COALESCE(?,email),
             rfc=?, regimen_fiscal=?, uso_cfdi=?, password=?
         WHERE id_usuario=?`,
        [nombre, apellido || null, telefono || null, email || null,
         rfcFinal, regimenFinal, usoCfdiFinal, hashedPassword, userId]
      );
    } else {
      await db.promise().query(
        `UPDATE usuarios
         SET nombre=?, apellido=?, telefono=?, email=COALESCE(?,email),
             rfc=?, regimen_fiscal=?, uso_cfdi=?
         WHERE id_usuario=?`,
        [nombre, apellido || null, telefono || null, email || null,
         rfcFinal, regimenFinal, usoCfdiFinal, userId]
      );
    }

    // Devolver el email final para que el frontend actualice su sesión
    const [[updated]] = await db.promise().query(
      'SELECT email FROM usuarios WHERE id_usuario = ?', [userId]
    );

    res.json({ success: true, mensaje: 'Perfil actualizado correctamente', email: updated.email });
  } catch (error) {
    console.error('Error en updateProfile:', error.message);
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
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
