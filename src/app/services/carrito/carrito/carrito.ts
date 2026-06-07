import { Injectable, signal, computed, effect, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product } from '../../../models/producto/producto';
import { UserService } from '../../user/user';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private platformId = inject(PLATFORM_ID);
  private userService = inject(UserService);
  private currentUserId: number | null = null;

  private productosSignal = signal<Product[]>([]);

  productos = this.productosSignal.asReadonly();

  groupedItems = computed(() => {
    const items: CartItem[] = [];
    const productMap = new Map<number, CartItem>();

    for (const product of this.productosSignal()) {
      if (productMap.has(product.id)) {
        productMap.get(product.id)!.quantity++;
      } else {
        productMap.set(product.id, { product: { ...product }, quantity: 1 });
      }
    }

    productMap.forEach(item => items.push(item));
    return items;
  });

  itemCount = computed(() => this.productosSignal().length);

  subtotal = computed(() =>
    this.productosSignal().reduce((acc, p) => acc + p.price, 0)
  );

  impuestos = computed(() => this.subtotal() * 0.16);

  totalConImpuestos = computed(() => this.subtotal() * 1.16);

  total = this.totalConImpuestos;

  carrito = computed(() =>
    this.groupedItems().map(item => ({
      id: item.product.id,
      nombre: item.product.name,
      cantidad: item.quantity,
      precio: item.product.price
    }))
  );

  constructor() {
    // Effect 1: Cambio de usuario → guardar carrito anterior y cargar el del nuevo usuario
    effect(() => {
      const user = this.userService.usuario();
      const newId = user?.id_usuario ?? null;

      if (newId !== this.currentUserId) {
        if (this.currentUserId !== null) {
          this.saveCartToStorage(this.currentUserId);
        }
        this.currentUserId = newId;
        if (newId !== null) {
          this.loadCartFromStorage(newId);
        } else {
          this.productosSignal.set([]);
        }
      }
    }, { allowSignalWrites: true });

    // Effect 2: Auto-guardar cada vez que cambia el carrito
    effect(() => {
      const _ = this.productosSignal();
      if (this.currentUserId !== null) {
        this.saveCartToStorage(this.currentUserId);
      }
    });
  }

  private saveCartToStorage(userId: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(`carrito_user_${userId}`, JSON.stringify(this.productosSignal()));
    } catch { /* storage lleno o bloqueado */ }
  }

  private loadCartFromStorage(userId: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const raw = localStorage.getItem(`carrito_user_${userId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.productosSignal.set(parsed);
          return;
        }
      }
    } catch { /* datos corruptos */ }
    this.productosSignal.set([]);
  }

  agregar(producto: Product, cantidad: number = 1) {
    const p: Product = { ...producto, price: Number(producto.price) };
    const nuevosProductos = Array(cantidad).fill(null).map(() => ({ ...p }));
    this.productosSignal.update(lista => [...lista, ...nuevosProductos]);
  }

  quitar(id: number) {
    const lista = this.productosSignal();
    const index = lista.findIndex(p => p.id === id);
    if (index !== -1) {
      const nuevaLista = [...lista];
      nuevaLista.splice(index, 1);
      this.productosSignal.set(nuevaLista);
    }
  }

  removeAll(id: number) {
    this.productosSignal.update(lista => lista.filter(p => p.id !== id));
  }

  vaciar() {
    this.productosSignal.set([]);
  }

  descargarReciboXML(folio: string, paypalOrderId: string) {
    const items = this.groupedItems();
    const subtotal = this.subtotal();
    const iva = this.impuestos();
    const total = this.totalConImpuestos();

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fecha = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const user = this.userService.usuario() as any;
    const receptorRfc = user?.rfc || 'XAXX010101000';
    const receptorNombre = user
      ? this.escapeXml(`${user.nombre || ''} ${user.apellido || ''}`.trim())
      : 'PÚBLICO EN GENERAL';
    const usoCFDI = user?.usoCfdi || 'G03';
    const regimenFiscalReceptor = user?.regimenFiscal || '616';

    const totalIVA = iva.toFixed(6);

    let conceptos = '';
    for (const item of items) {
      const p = item.product;
      const importe = (p.price * item.quantity).toFixed(2);
      const ivaConcepto = (p.price * item.quantity * 0.16).toFixed(6);
      conceptos += `
    <cfdi:Concepto ClaveProdServ="53101700" Cantidad="${item.quantity}" ClaveUnidad="H87" Unidad="Pieza" Descripcion="${this.escapeXml(p.name)}" ValorUnitario="${p.price.toFixed(6)}" Importe="${importe}">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${importe}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${ivaConcepto}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
  xmlns:cfdi="http://www.sat.gob.mx/cfd/3"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
  Version="3.3"
  Serie="A"
  Folio="${this.escapeXml(folio)}"
  Fecha="${fecha}"
  Sello=""
  FormaPago="03"
  NoCertificado=""
  Certificado=""
  SubTotal="${subtotal.toFixed(2)}"
  Moneda="MXN"
  Total="${total.toFixed(2)}"
  TipoDeComprobante="I"
  MetodoPago="PUE"
  LugarExpedicion="44100"
  Exportacion="01">

  <cfdi:Emisor Rfc="EKU9003173C9" Nombre="LA CASA DEL PERFUME SA DE CV" RegimenFiscal="601"/>

  <cfdi:Receptor
    Rfc="${this.escapeXml(receptorRfc)}"
    Nombre="${receptorNombre}"
    DomicilioFiscalReceptor="44100"
    RegimenFiscalReceptor="${this.escapeXml(regimenFiscalReceptor)}"
    UsoCFDI="${this.escapeXml(usoCFDI)}"/>

  <cfdi:Conceptos>${conceptos}
  </cfdi:Conceptos>

  <cfdi:Impuestos TotalImpuestosTrasladados="${totalIVA}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${totalIVA}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>

</cfdi:Comprobante>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CFDI-${folio}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportarXML() {
    const folio = 'MANUAL-' + Date.now();
    this.descargarReciboXML(folio, 'N/A');
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');
  }
}
