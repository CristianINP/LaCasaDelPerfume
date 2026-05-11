import db from '../config/db.js';

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM pedidos ORDER BY fecha DESC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedidos'
    });
  }
};

// Obtener pedido por ID
export const getPedidoById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      'SELECT * FROM pedidos WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pedido no encontrado'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener pedido'
    });
  }
};

// Obtener detalles de un pedido
// Si detalles_pedido está vacío (productos eliminados), usa el snapshot JSON como fallback
export const getPedidoDetalles = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.promise().query(
      'SELECT * FROM detalles_pedido WHERE pedido_id = ?',
      [id]
    );

    if (rows.length > 0) {
      return res.json({ success: true, data: rows });
    }

    // Fallback: parsear snapshot JSON guardado en pedidos.detalle_json
    const [pedidoRows] = await db.promise().query(
      'SELECT detalle_json FROM pedidos WHERE id = ?',
      [id]
    );

    if (pedidoRows.length === 0 || !pedidoRows[0].detalle_json) {
      return res.json({ success: true, data: [] });
    }

    const itemsFromJson = JSON.parse(pedidoRows[0].detalle_json);
    return res.json({ success: true, data: itemsFromJson, source: 'snapshot' });

  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalles del pedido'
    });
  }
};

// Guardar nuevo pedido con snapshot JSON de items (Opción B)
export const guardarPedido = async (req, res) => {
  const connection = await db.promise().getConnection();

  try {
    const {
      folio,
      paypalOrderId,
      paypalEstado,
      subtotal,
      iva,
      total,
      items
    } = req.body;

    await connection.beginTransaction();

    // Insertar pedido con snapshot JSON de los items
    const [pedidoResult] = await connection.query(
      'INSERT INTO pedidos (folio, paypal_orden_id, paypal_estado, subtotal, iva, total, detalle_json) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [folio, paypalOrderId, paypalEstado, subtotal, iva, total, JSON.stringify(items)]
    );

    const pedidoId = pedidoResult.insertId;

    // Insertar detalles relacionales (fuente primaria)
    for (const item of items) {
      await connection.query(
        'INSERT INTO detalles_pedido (pedido_id, producto_id, nombre_producto, categoria, cantidad, precio_unitario, importe) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          pedidoId,
          item.producto_id || 0,
          item.nombre_producto,
          item.categoria || '',
          item.cantidad,
          item.precio_unitario,
          item.importe
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      pedidoId: pedidoId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error al guardar pedido:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar pedido'
    });
  } finally {
    connection.release();
  }
};
