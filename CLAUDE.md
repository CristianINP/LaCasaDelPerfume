# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm run watch      # Dev build in watch mode
npm test           # Run unit tests with Vitest
npm run serve:ssr:ProAngular  # Run the SSR Express server (after building)
```

## Architecture

**ProAngular** is an Angular 21 e-commerce SPA with SSR enabled. It sells products with PayPal checkout and a space/nebula theme. It requires a separate backend running at `http://localhost:3000/api`.

### Backend Dependency

All data and payment processing depends on a local backend at `http://localhost:3000`:
- `GET /api/productos` — product catalog
- `POST /api/paypal/create-order` — create PayPal order
- `POST /api/paypal/capture-order` — capture PayPal payment
- `POST /api/paypal/guardar-pedido` — persist order to database

The PayPal Client ID and API base URL are in [src/environments/environment.ts](src/environments/environment.ts).

### State Management

Cart state lives entirely in **CarritoService** ([src/app/services/carrito/carrito/carrito.ts](src/app/services/carrito/carrito/carrito.ts)) using Angular Signals:
- `productosSignal` — raw list of added products
- `groupedItems` — `computed()` aggregating quantities per product
- `itemCount`, `subtotal`, `impuestos` (16% IVA), `totalConImpuestos` — all `computed()`
- `carrito` — `computed()` formatted for PayPal API payload

Search/filter state is in **SearchService** ([src/app/services/search/search.ts](src/app/services/search/search.ts)) via signals (`search`, `categoryFilter`).

### Component Responsibilities

| Component | Key Behavior |
|-----------|-------------|
| `Home` | Starfield canvas animation; hosts `Catalogo` on `/catalogo` route |
| `Catalogo` | Reads `SearchService` signals; filters/sorts products client-side via `computed()`; emits `ProductAddEvent` to parent |
| `CarritoComponent` | Loads PayPal JS SDK dynamically; polls cart with `setInterval(200ms)` to re-render PayPal buttons when cart changes; generates XML receipt on capture |
| `Checkout` | Lighter checkout view with PayPal button |
| `Navbar` | Writes to `SearchService`; displays `CarritoService.itemCount` |

### Key Patterns

- **All components are standalone** (`standalone: true`) — no NgModules.
- **Signals over RxJS subjects** for local state; RxJS is only used for HTTP (`HttpClient` returning `Observable`).
- **SSR** is enabled via `@angular/ssr`. Server entry is [src/server.ts](src/server.ts) (Express). SSR routes use `RenderMode.Prerender` ([src/app/app.routes.server.ts](src/app/app.routes.server.ts)).
- Starfield animation is canvas-based and appears in Home, Carrito, Contactos, and Privacidad — implemented independently in each component.
- Tax is always 16% IVA; subtotal and `totalConImpuestos` are computed automatically in `CarritoService`.

### Testing

Tests use **Vitest** (not Karma/Jasmine). Configuration is in [vitest.config.ts](vitest.config.ts) with `jsdom` as the environment.
