export interface PurchaseItem {
  producto_id: number;
  nombre_producto: string;
  categoria: string;
  cantidad: number;
  precio_unitario: number;
  importe: number;
}

export interface PurchaseOrder {
  id: number;
  folio: string;
  fecha: string;
  paypal_orden_id: string;
  paypal_estado: string;
  subtotal: number;
  iva: number;
  total: number;
  items: PurchaseItem[];
}
