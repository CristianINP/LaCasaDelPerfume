import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'login',             renderMode: RenderMode.Prerender },
  { path: 'forgot-password',   renderMode: RenderMode.Client },
  { path: 'reset-password',    renderMode: RenderMode.Client },
  { path: '',                  renderMode: RenderMode.Client },
  { path: 'catalogo',          renderMode: RenderMode.Client },
  { path: 'carrito',           renderMode: RenderMode.Client },
  { path: 'checkout',          renderMode: RenderMode.Client },
  { path: 'privacidad',        renderMode: RenderMode.Client },
  { path: 'terminos',          renderMode: RenderMode.Client },
  { path: 'historial',         renderMode: RenderMode.Client },
  { path: 'historial/:id',     renderMode: RenderMode.Client },
  { path: 'admin/inventario',  renderMode: RenderMode.Client },
  { path: 'perfil',            renderMode: RenderMode.Client },
  { path: '**',                renderMode: RenderMode.Client },
];
