import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Producto {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  description: string | null;
  inStock: number;
  activo: number;
}

export interface ProductoForm {
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  inStock: number;
}

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/inventario`;

  getInventario() {
    return this.http.get<{ success: boolean; data: Producto[] }>(this.url);
  }

  crearProducto(producto: ProductoForm) {
    return this.http.post<{ success: boolean; id: number }>(this.url, producto);
  }

  actualizarProducto(id: number, producto: ProductoForm) {
    return this.http.put<{ success: boolean }>(`${this.url}/${id}`, producto);
  }

  desactivarProducto(id: number) {
    return this.http.patch<{ success: boolean }>(`${this.url}/${id}/desactivar`, {});
  }

  activarProducto(id: number) {
    return this.http.patch<{ success: boolean }>(`${this.url}/${id}/activar`, {});
  }
}
