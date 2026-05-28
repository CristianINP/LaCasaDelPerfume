import db from '../config/db.js';

// Historial de pedidos del usuario autenticado
export const getHistorialUsuario = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      `SELECT id, folio, paypal_orden_id, paypal_estado, subtotal, iva, total, fecha, archivo_historial, detalle_json
       FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC`,
      [userId]
    );

    const data = rows.map(p => {
      let items = [];
      if (p.detalle_json) {
        try { items = JSON.parse(p.detalle_json); } catch { items = []; }
      }
      return { ...p, items, detalle_json: undefined };
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener historial' });
  }
};

// Obtener pedido por ID con items del detalle_json
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [rows] = await db.promise().query(
      'SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }

    const pedido = rows[0];
    let items = [];
    if (pedido.detalle_json) {
      try {
        items = JSON.parse(pedido.detalle_json);
      } catch {
        items = [];
      }
    }

    res.json({
      success: true,
      data: {
        id: pedido.id,
        folio: pedido.folio,
        paypal_orden_id: pedido.paypal_orden_id,
        paypal_estado: pedido.paypal_estado,
        subtotal: Number(pedido.subtotal),
        iva: Number(pedido.iva),
        total: Number(pedido.total),
        fecha: pedido.fecha,
        archivo_historial: pedido.archivo_historial,
        items,
      },
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error.message);
    res.status(500).json({ success: false, message: 'Error al obtener pedido' });
  }
};
