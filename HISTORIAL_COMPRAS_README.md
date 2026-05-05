# 📦 Módulo de Historial de Compras

## Descripción
Este módulo permite a los usuarios visualizar el historial completo de sus compras realizadas en la tienda, con integración directa a la base de datos y PayPal.

## 🎨 Características

- ✅ **Visualización de compras**: Lista completa con todos los detalles
- ✅ **Filtros por estado**: Completado, Pendiente, Fallido
- ✅ **Detalle individual**: Ver información específica de cada compra
- ✅ **Integración PayPal**: Sincronización automática con pagos realizados
- ✅ **Estilo Nebula Theme**: Coherente con el resto del sitio
- ✅ **Fondo interactivo**: Starfield con nebulas y estrellas brillantes
- ✅ **Responsive**: Diseño adaptable a móviles y tablets

## 📁 Estructura del Proyecto

```
src/app/
├── models/orden/orden.ts              # Interfaces PurchaseItem, PurchaseOrder
├── services/historial-compras/        # Servicio de gestión de compras
│   └── historial-compras.ts
├── components/historial-compras/      # Lista de compras
│   ├── historial-compras.ts
│   ├── historial-compras.html
│   └── historial-compras.css
└── components/detalle-compra/         # Detalle individual
    ├── detalle-compra.ts
    ├── detalle-compra.html
    └── detalle-compra.css
```

## 🚀 Componentes

### 1. HistorialCompras (Lista)
- Muestra todas las compras registradas
- Tarjetas con efecto glass-morphism
- Animaciones hover y transiciones suaves
- Botones de navegación integrados

### 2. DetalleCompra
- Muestra información detallada de una compra específica
- Lista de productos con cantidades y precios
- Resumen de subtotal, IVA y total
- Estado de pago PayPal

## 🔗 Rutas

- `/historial` - Lista de compras
- `/historial/:id` - Detalle de compra específica

## 🎯 Integración con Navbar

El enlace "Historial" aparece en la barra de navegación principal junto a:
- Inicio
- Catálogo  
- Carrito

## 💾 Base de Datos

El servicio `HistorialComprasService` soporta:
- `obtenerCompras()` - GET todas las compras
- `obtenerCompraPorId(id)` - GET compra específica
- `guardarCompra(compra)` - POST nueva compra
- `cargarComprasSimuladas()` - Datos de ejemplo (fallback)

## ⚡ Integración con Checkout

Automáticamente después de un pago exitoso en PayPal:
1. Se guarda la compra en la base de datos
2. Se genera un folio único
3. Se registra el estado de PayPal
4. Se limpia el carrito

## 🎨 Variables CSS Utilizadas

Coincide con el Nebula Theme:
- `--electric` - Azul eléctrico (acentos)
- `--aurora` - Púrpura (gradientes)
- `--star-white` - Blanco estelar (texto)
- `--void` - Negro profundo (fondo)
- `--card-bg` - Tarjetas glass-morphism

## 📱 Responsive Design

- Desktop: 900px max-width
- Tablet: Ajustes de padding y flex-direction
- Mobile: Stack vertical completo

## 🌟 Efectos Visuales

1. **Starfield**: 280 estrellas con twinkle
2. **Nebula Clouds**: 3 nubes difuminadas animadas
3. **Shooting Stars**: Estrellas fugaces periódicas
4. **Glass Morphism**: Tarjetas translúcidas con backdrop blur
5. **Gradient Borders**: Bordes con gradientes eléctricos

## 🔄 Estados de Compra

- **Completado** (verde) - Pago exitoso
- **Pendiente** (amarillo) - En proceso
- **Fallido** (rojo) - Error en pago
- **Desconocido** (gris) - Estado no definido

## 📝 Notas Técnicas

- Usa `signal()` para reactividad
- Manejo de errores con estados reactivos
- Soporte SSR (Server-Side Rendering)
- Compatible con prerenderizado
- Formateo de moneda MXN
- Internacionalización de fechas
