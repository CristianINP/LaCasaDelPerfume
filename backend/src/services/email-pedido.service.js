import nodemailer from 'nodemailer';

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(amount));
}

function generarCFDIXml(folio, items, subtotal, iva, total, datosUsuario = {}) {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const receptorRfc = datosUsuario.rfc || 'XAXX010101000';
  const receptorNombre = datosUsuario.nombre
    ? escapeXml(`${datosUsuario.nombre} ${datosUsuario.apellido || ''}`.trim())
    : 'PÚBLICO EN GENERAL';
  const usoCFDI = datosUsuario.usoCfdi || 'G03';
  const regimenFiscalReceptor = datosUsuario.regimenFiscal || '616';
  const totalIVA = Number(iva).toFixed(6);

  let conceptos = '';
  for (const item of items) {
    const importe = (Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2);
    const ivaConcepto = (Number(item.precio_unitario) * Number(item.cantidad) * 0.16).toFixed(6);
    conceptos += `
    <cfdi:Concepto ClaveProdServ="53101700" Cantidad="${item.cantidad}" ClaveUnidad="H87" Unidad="Pieza" Descripcion="${escapeXml(item.nombre_producto)}" ValorUnitario="${Number(item.precio_unitario).toFixed(6)}" Importe="${importe}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${importe}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${ivaConcepto}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/3"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
  Version="3.3"
  Serie="A"
  Folio="${escapeXml(folio)}"
  Fecha="${fecha}"
  Sello=""
  FormaPago="03"
  NoCertificado=""
  Certificado=""
  SubTotal="${Number(subtotal).toFixed(2)}"
  Moneda="MXN"
  Total="${Number(total).toFixed(2)}"
  TipoDeComprobante="I"
  MetodoPago="PUE"
  LugarExpedicion="44100"
  Exportacion="01">

  <cfdi:Emisor Rfc="EKU9003173C9" Nombre="LA CASA DEL PERFUME SA DE CV" RegimenFiscal="601"/>

  <cfdi:Receptor
    Rfc="${escapeXml(receptorRfc)}"
    Nombre="${receptorNombre}"
    DomicilioFiscalReceptor="44100"
    RegimenFiscalReceptor="${escapeXml(regimenFiscalReceptor)}"
    UsoCFDI="${escapeXml(usoCFDI)}"/>

  <cfdi:Conceptos>${conceptos}
  </cfdi:Conceptos>

  <cfdi:Impuestos TotalImpuestosTrasladados="${totalIVA}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${Number(subtotal).toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${totalIVA}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>

</cfdi:Comprobante>`;
}

export async function enviarConfirmacionPedido({ email, nombre, folio, paypalOrderId, items, subtotal, iva, total, datosUsuario = {} }) {
  if (!email) return;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const xmlContent = generarCFDIXml(folio, items, subtotal, iva, total, { ...datosUsuario, nombre });

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#c8d8f0;font-size:13px;">${escapeXml(item.nombre_producto)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#c8d8f0;text-align:center;font-size:13px;">${item.cantidad}</td>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#c8d8f0;text-align:right;font-size:13px;">${formatCurrency(item.precio_unitario)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid rgba(255,255,255,0.06);color:#4a9eff;text-align:right;font-weight:600;font-size:13px;">${formatCurrency(item.importe)}</td>
    </tr>
  `).join('');

  const nombreMostrar = escapeXml(nombre || 'Cliente');

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:20px;background:#04080f;font-family:Arial,sans-serif;">
  <div style="background:#080f1e;color:#e8eaf6;padding:40px;border-radius:16px;max-width:600px;margin:auto;border:1px solid rgba(74,158,255,0.12);">

    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="color:#4a9eff;letter-spacing:4px;font-size:18px;margin:0 0 6px;">LA CASA DEL PERFUME</h2>
      <p style="color:#6070a0;font-size:11px;letter-spacing:3px;margin:0;text-transform:uppercase;">Confirmación de Pedido</p>
    </div>

    <div style="background:rgba(74,158,255,0.07);border:1px solid rgba(74,158,255,0.18);border-radius:12px;padding:20px 24px;margin-bottom:24px;">
      <p style="color:#a0b0cc;font-size:14px;margin:0 0 6px;">Hola, <strong style="color:#e8eaf6;">${nombreMostrar}</strong></p>
      <p style="color:#8090b0;font-size:13px;margin:0;line-height:1.6;">
        Tu pago fue procesado exitosamente. A continuación encontrarás los detalles de tu compra.
        El recibo CFDI 3.3 está adjunto en este correo.
      </p>
    </div>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:14px 20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#6070a0;font-size:11px;letter-spacing:1px;padding:4px 0;">FOLIO</td>
          <td style="color:#4a9eff;font-size:13px;font-weight:700;font-family:monospace;text-align:right;padding:4px 0;">${escapeXml(folio)}</td>
        </tr>
        <tr>
          <td style="color:#6070a0;font-size:11px;letter-spacing:1px;padding:4px 0;">ORDEN PAYPAL</td>
          <td style="color:#8090b0;font-size:12px;font-family:monospace;text-align:right;padding:4px 0;">${escapeXml(paypalOrderId)}</td>
        </tr>
      </table>
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;border-radius:8px;overflow:hidden;border:1px solid rgba(255,255,255,0.06);">
      <thead>
        <tr style="background:rgba(74,158,255,0.1);">
          <th style="padding:12px 16px;text-align:left;color:#4a9eff;font-size:11px;letter-spacing:1px;">PRODUCTO</th>
          <th style="padding:12px 16px;text-align:center;color:#4a9eff;font-size:11px;letter-spacing:1px;">CANT.</th>
          <th style="padding:12px 16px;text-align:right;color:#4a9eff;font-size:11px;letter-spacing:1px;">P. UNIT.</th>
          <th style="padding:12px 16px;text-align:right;color:#4a9eff;font-size:11px;letter-spacing:1px;">IMPORTE</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#6070a0;font-size:13px;padding:5px 0;">Subtotal (sin IVA)</td>
          <td style="color:#a0b0cc;font-size:13px;text-align:right;padding:5px 0;">${formatCurrency(subtotal)}</td>
        </tr>
        <tr>
          <td style="color:#6070a0;font-size:13px;padding:5px 0;">IVA (16%)</td>
          <td style="color:#a0b0cc;font-size:13px;text-align:right;padding:5px 0;">${formatCurrency(iva)}</td>
        </tr>
        <tr>
          <td style="color:#e8eaf6;font-size:15px;font-weight:700;padding-top:12px;border-top:1px solid rgba(74,158,255,0.15);">Total</td>
          <td style="color:#4a9eff;font-size:15px;font-weight:700;text-align:right;padding-top:12px;border-top:1px solid rgba(74,158,255,0.15);">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>

    <div style="background:rgba(74,200,130,0.06);border:1px solid rgba(74,200,130,0.18);border-radius:8px;padding:12px 16px;margin-bottom:24px;">
      <p style="color:#7ed6a0;font-size:12px;margin:0;line-height:1.6;">
        📎 El archivo <strong>CFDI-${escapeXml(folio)}.xml</strong> está adjunto en este correo.
        Consérvalo para efectos fiscales y/o contables.
      </p>
    </div>

    <hr style="border:none;border-top:1px solid rgba(74,158,255,0.08);margin:24px 0;" />
    <p style="color:#3a4a70;font-size:11px;text-align:center;margin:0;">
      La Casa del Perfume · Tienda de perfumes · Este es un correo automático, por favor no respondas a este mensaje.
    </p>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: `"La Casa del Perfume" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Confirmación de pedido ${folio} — La Casa del Perfume`,
    html,
    attachments: [
      {
        filename: `CFDI-${folio}.xml`,
        content: xmlContent,
        contentType: 'application/xml; charset=utf-8',
      },
    ],
  });
}
