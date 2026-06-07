import { createPaypalOrder, capturePaypalOrder } from '../services/paypal.service.js';
import { enviarConfirmacionPedido } from '../services/email-pedido.service.js';
import db from '../config/db.js';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORIAL_DIR = join(__dirname, '..', '..', 'historial');

export async function createOrder(req, res) {
  try {
    const { items, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (!total || Number(total) <= 0) {
      return res.status(400).json({ error: 'El total es inválido' });
    }

    const order = await createPaypalOrder({ items, total });
    res.status(200).json({ id: order.id, status: order.status });
  } catch (error) {
    console.error('Error en createOrder:', error.message);
    res.status(500).json({ error: 'No se pudo crear la orden', detalle: error.message });
  }
}

export async function captureOrder(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId es obligatorio' });
    }
    const captureData = await capturePaypalOrder(orderId);
    res.status(200).json(captureData);
  } catch (error) {
    console.error('Error en captureOrder:', error.message);
    res.status(500).json({ error: 'No se pudo capturar la orden', detalle: error.message });
  }
}

export async function guardarPedido(req, res) {
  const { folio, paypalOrderId, paypalEstado, subtotal, iva, total, items, usuario_id, email_usuario, datos_fiscales } = req.body;

  if (!folio || !paypalOrderId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Datos incompletos para guardar el pedido' });
  }

  try {
    const snapshot = {
      folio,
      paypalOrderId,
      paypalEstado: paypalEstado || 'COMPLETED',
      fecha: new Date().toISOString(),
      usuario_id: usuario_id || null,
      subtotal: Number(subtotal),
      iva: Number(iva),
      total: Number(total),
      items,
    };

    const filename = `${folio}.json`;

    await mkdir(HISTORIAL_DIR, { recursive: true });
    await writeFile(join(HISTORIAL_DIR, filename), JSON.stringify(snapshot, null, 2), 'utf8');

    const [result] = await db.promise().query(
      `INSERT INTO pedidos (usuario_id, folio, paypal_orden_id, paypal_estado, subtotal, iva, total, detalle_json, archivo_historial)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id || null,
        folio,
        paypalOrderId,
        paypalEstado || 'COMPLETED',
        Number(subtotal).toFixed(2),
        Number(iva).toFixed(2),
        Number(total).toFixed(2),
        JSON.stringify(items),
        filename,
      ]
    );

    // Descontar stock de cada producto comprado
    for (const item of items) {
      const pid = Number(item.producto_id);
      const qty = Number(item.cantidad);
      if (!pid || !qty) {
        console.warn(`[Stock] Item inválido, saltando:`, item);
        continue;
      }
      try {
        const [upd] = await db.promise().query(
          'UPDATE productos SET inStock = GREATEST(0, COALESCE(inStock, 0) - ?) WHERE id = ?',
          [qty, pid]
        );
        console.log(`[Stock] Producto ${pid}: -${qty} unidades (filas afectadas: ${upd.affectedRows})`);
      } catch (stockErr) {
        console.error(`[Stock] Error descontando producto ${pid}:`, stockErr.message);
      }
    }

    res.status(201).json({ success: true, pedidoId: result.insertId });

    // Enviar correo de confirmación de forma asíncrona (no bloquea la respuesta)
    if (email_usuario) {
      let nombreUsuario = datos_fiscales?.nombre || null;

      // Si no viene el nombre en datos_fiscales, buscarlo en la BD
      if (!nombreUsuario && usuario_id) {
        try {
          const [rows] = await db.promise().query(
            'SELECT nombre, apellido FROM usuarios WHERE id_usuario = ?',
            [usuario_id]
          );
          if (rows.length > 0) nombreUsuario = `${rows[0].nombre} ${rows[0].apellido || ''}`.trim();
        } catch { /* no bloquear */ }
      }

      enviarConfirmacionPedido({
        email: email_usuario,
        nombre: nombreUsuario,
        folio,
        paypalOrderId,
        items,
        subtotal: Number(subtotal),
        iva: Number(iva),
        total: Number(total),
        datosUsuario: datos_fiscales || {},
      }).catch(err => console.error('Error enviando correo de confirmación:', err.message));
    }
  } catch (error) {
    console.error('Error al guardar pedido:', error.message);
    res.status(500).json({ error: 'No se pudo guardar el pedido', detalle: error.message });
  }
}
