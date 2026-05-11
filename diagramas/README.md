# 📊 Diagramas PlantUML — La Casa del Perfume

Esta carpeta contiene **10 archivos `.puml`** con los diagramas técnicos completos del proyecto e-commerce Angular 21.

## 📁 Archivos incluidos

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| **A_DiagramaClases.puml** | UML Class | Modelos, Servicios, Componentes y sus relaciones |
| **B_DiagramaER.puml** | Entity-Relation | Estructura de base de datos MariaDB (3 tablas) |
| **C1_FlujoCatalogo.puml** | Activity | Flujo: Catálogo y búsqueda reactiva |
| **C2_FlujoCarrito.puml** | Activity | Flujo: Carrito con PayPal SDK dinámico |
| **C3_FlujoCheckout.puml** | Activity | Flujo: Checkout y procesamiento de pago |
| **C4_FlujoHistorial.puml** | Activity | Flujo: Historial y detalle de compras |
| **C5_FlujoPayPal.puml** | Activity | Flujo: Integración PayPal completa |
| **D_DiagramaNavegacion.puml** | State | Diagrama de navegación (rutas SPA) |
| **F_CasosDeUso.puml** | Use Case | 24 casos de uso con actores |
| **G_EstructuraXML.puml** | Class | Estructura jerárquica del recibo XML |

---

## 🛠️ Cómo visualizar los diagramas

### Opción 1: **PlantUML Online** (más rápido)
1. Ve a https://plantuml.com/plantuml/uml/
2. Copia el contenido completo de cualquier archivo `.puml`
3. Pégalo en el editor
4. ¡Listo! Se renderiza automáticamente

### Opción 2: **VS Code Extension** (recomendado)
1. Instala la extensión **PlantUML** (de jebbs):
   ```
   ext install jebbs.plantuml
   ```
2. Abre cualquier archivo `.puml` en VS Code
3. Presiona `Alt + D` para ver preview
4. Exporta: Click derecho → PlantUML → Export

### Opción 3: **IntelliJ / JetBrains** (integrado)
1. Instala el plugin **PlantUML Integration**
2. Abre cualquier `.puml` file
3. Click derecho → PlantUML → Show Diagram

### Opción 4: **CLI (Comando)**
```bash
# Instalar PlantUML (requiere Java)
brew install plantuml  # macOS
choco install plantuml # Windows
apt install plantuml   # Linux

# Generar PNG
plantuml A_DiagramaClases.puml

# Generar SVG
plantuml -tsvg A_DiagramaClases.puml

# Generar PDF
plantuml -tpdf A_DiagramaClases.puml
```

---

## 📋 Guía rápida de cada diagrama

### **A — Diagrama de Clases**
Muestra la **arquitectura completa**:
- **Modelos**: Producto, PurchaseOrder, CarritoItem, etc.
- **Servicios**: CarritoService, SearchService, ProductosService, HistorialComprasService, PayPalService
- **Componentes**: HomeComponent, NavbarComponent, CatalogoComponent, etc.
- **Relaciones**: Dependencias entre servicios y componentes

**Uso**: Entender la estructura del proyecto y cómo se comunican las clases.

---

### **B — Diagrama Entidad-Relación (ER)**
Base de datos MariaDB con 3 tablas:

```
┌─────────────────┐
│   PRODUCTOS     │
├─────────────────┤
│ id (PK)         │
│ nombre          │──────────┐
│ precio          │          │
│ stock           │          │
└─────────────────┘          │
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────┴─────────┐ ┌─────┴──────────┐
            │   PEDIDOS       │ │ DETALLES_PEDIDO│
            ├─────────────────┤ ├─────────────────┤
            │ id (PK)         │ │ id (PK)         │
            │ folio (UNIQUE)  │ │ pedido_id (FK)  │
            │ paypal_orden_id │ │ producto_id (FK)│
            │ paypal_estado   │ │ cantidad        │
            │ subtotal        │ │ precio_unitario │
            │ iva (16%)       │ │ importe         │
            │ total           │ └─────────────────┘
            └─────────────────┘
```

**Uso**: Entender cómo se almacenan pedidos y detalles, relaciones 1:N.

---

### **C1 — Flujo: Catálogo**
**Actores**: Usuario, ProductosService (API)

**Flujo**:
1. Usuario abre app → Home con Starfield
2. Navega a /catalogo
3. ProductosService → GET /api/productos
4. Renderiza grid de productos
5. Usuario escribe en búsqueda
6. SearchService.setSearch() → filtra reactivamente (Signals)
7. Usuario agrega producto → CarritoService.agregarProducto()
8. itemCount se actualiza automáticamente

**Uso**: Entender cómo funcionan las Signals reactivas para búsqueda.

---

### **C2 — Flujo: Carrito**
**Actores**: Usuario, CarritoComponent, PayPal SDK

**Flujo** (más importante):
1. Usuario navega a /carrito
2. CarritoComponent renderiza items agrupados
3. **ngAfterViewInit()** → loadPayPalSDK() carga JS dinámicamente
4. **setInterval(200ms)** monitorea cambios en carrito
5. PayPal buttons se renderiza en DOM
6. Usuario hace click → **createOrder()** → POST /api/paypal/create-order
7. PayPal retorna orderID → usuario aprueba en popup
8. **onApprove()** → POST /api/paypal/capture-order
9. Backend inserta pedidos + detalles_pedido
10. Frontend genera XML recibo
11. Redirige a /historial

**Uso**: Entender integración con PayPal y sincronización de SDK.

---

### **C3 — Flujo: Checkout**
**Actores**: Usuario, PayPal, Backend

**Diferencia con C2**: Checkout es una ruta "ligera" que redirecciona después del pago.

**Uso**: Entender flujo simplificado de pago.

---

### **C4 — Flujo: Historial**
**Actores**: Usuario, HistorialComprasService, Backend

**Flujo**:
1. Usuario navega a /historial
2. HistorialComprasService.obtenerCompras() → GET /api/pedidos/todos
3. Si backend falla → cargarComprasSimuladas() (fallback con datos de ejemplo)
4. Renderiza tarjetas con glass-morphism
5. Usuario click en "Ver detalle" → /historial/:id
6. GET /api/pedidos/:id + detalles
7. Muestra encabezado, productos, totales
8. Botón "Descargar Recibo" descarga XML

**Uso**: Entender gestión de compras históricas.

---

### **C5 — Flujo: PayPal**
**Actores**: Frontend, Backend, PayPal API

**Flujo técnico** (más detallado):
1. loadPayPalSDK() → inyecta `<script>` dinámicamente
2. window.paypal disponible → paypal.Buttons({createOrder, onApprove, onError})
3. Usuario click → createOrder()
   - POST /api/paypal/create-order
   - Backend: POST https://api.paypal.com/v2/checkout/orders
   - Retorna: {id: orderID}
4. Usuario aprueba en popup PayPal
5. onApprove(orderID) → POST /api/paypal/capture-order
   - Backend: POST https://api.paypal.com/v2/checkout/orders/{orderID}/capture
   - Retorna: detalles de transacción
6. POST /api/paypal/guardar-pedido
   - Backend: INSERT pedidos, INSERT detalles_pedido
7. Frontend: generarXMLRecibo() + limpiarCarrito()

**Uso**: Entender cómo funciona la API de PayPal integralmente.

---

### **D — Diagrama de Navegación**
**Rutas de la SPA**:

```
[*] → Home
      ├→ Catalogo
      ├→ Carrito → Checkout → Historial
      ├→ Historial → Detalle → Historial
      ├→ Contactos
      └→ Privacidad
```

**Auto-redirects**:
- Checkout (carrito vacío) → Catalogo
- Checkout (pago OK) → Historial

**Uso**: Entender flujo de navegación entre rutas.

---

### **F — Diagrama de Casos de Uso**
**24 casos de uso** en 4 categorías:

1. **Catálogo**: UC01-04 (ver, buscar, filtrar, detalles)
2. **Carrito**: UC05-08 (agregar, ver, modificar, eliminar)
3. **Pago**: UC09-11 (checkout, pagar, recibo XML)
4. **Historial**: UC12-14 (listar, detalle, descargar)

**Actores**:
- 👤 Cliente (Usuario)
- 💳 PayPal (Sistema externo)
- ⚙️ Backend API (Node.js)
- 🗄️ Base de Datos (MariaDB)

**Relaciones**:
- `<<include>>`: Caso requerido
- `<<extend>>`: Caso opcional (especialización)

**Uso**: Comunicar con stakeholders (PO, QA, clientes).

---

### **G — Estructura XML**
**Recibo generado por CarritoComponent.generarXMLRecibo()**

```xml
<recibo xmlns="LaCasaDelPerfume" version="1.0">
  <encabezado>
    <folio>ORD-1777507322236</folio>
    <fecha>2026-05-11T14:30:00</fecha>
    <estado>COMPLETED</estado>
    <paypal_id>xxx</paypal_id>
  </encabezado>
  
  <emisor>
    <nombre>La Casa del Perfume</nombre>
    <sistema>Angular 21 + Node.js</sistema>
    <moneda>MXN</moneda>
  </emisor>
  
  <productos>
    <producto>
      <nombre>Perfume X</nombre>
      <categoria>Fragancias</categoria>
      <cantidad>2</cantidad>
      <precio_unitario>500.00</precio_unitario>
      <importe>1000.00</importe>
    </producto>
  </productos>
  
  <totales>
    <subtotal>1000.00</subtotal>
    <iva tasa="16%">160.00</iva>
    <total>1160.00</total>
  </totales>
  
  <pie>
    <generado_por>CarritoComponent</generado_por>
    <timestamp>2026-05-11T14:30:00Z</timestamp>
  </pie>
</recibo>
```

**Uso**: Generar recibos imprimibles/descargables.

---

## 🎓 Recomendaciones

1. **Para developers**: Lee A (Clases), B (ER), C1-C5 (Flujos)
2. **Para QA/Testing**: Lee D (Navegación), F (Casos de Uso), C2 (Carrito)
3. **Para Product Owners**: Lee F (Casos de Uso), D (Navegación)
4. **Para DevOps/Backend**: Lee B (ER), C5 (PayPal), G (XML)

---

## ✏️ Cómo editar los diagramas

Si necesitas cambiar algo:

1. Abre el archivo `.puml` en VS Code o PlantUML Online
2. Edita el código (es texto plano)
3. Previsualiza en tiempo real (con extension)
4. Exporta como PNG/SVG/PDF

**Ejemplos de cambios comunes**:
- Agregar componente: Agregar clase en paquete correspondiente
- Cambiar flujo: Editar pasos en los diagramas de flujo
- Agregar relación: Agregar línea de conexión entre clases

---

## 📚 Referencias PlantUML

- **Documentación**: https://plantuml.com/
- **Class Diagrams**: https://plantuml.com/class-diagram
- **Activity Diagrams**: https://plantuml.com/activity-diagram-beta
- **Use Cases**: https://plantuml.com/use-case-diagram
- **State Diagrams**: https://plantuml.com/state-diagram
- **ER Diagrams**: https://plantuml.com/entity-relationship-diagram

---

## 📞 Soporte

Si encuentras errores o necesitas actualizar diagramas:
1. Edita el archivo `.puml`
2. Previsualiza en PlantUML Online
3. Guarda y confirma cambios
4. Cómpartelo con el equipo

---

**Última actualización**: Mayo 2026  
**Versión**: 2.0 (Mejorado - Signals, PayPal SDK dinámico, XML)
