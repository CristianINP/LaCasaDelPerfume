import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { InventarioService, Producto, ProductoForm } from '../../services/inventario/inventario';
import { Navbar } from '../navbar/navbar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule, DecimalPipe, Navbar],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class InventarioComponent implements OnInit {
  private inventarioService = inject(InventarioService);

  productos = signal<Producto[]>([]);
  loading = signal(false);
  error = signal('');
  guardando = signal(false);
  mostrarInactivos = signal(false);

  modoEdicion = signal(false);
  productoEditandoId = signal<number | null>(null);
  mostrarFormulario = signal(false);

  confirmModal = signal<{ accion: 'desactivar' | 'activar'; id: number } | null>(null);
  exitoModal = signal<'creado' | 'actualizado' | null>(null);

  form: ProductoForm = this.formVacio();

  productosFiltrados = computed(() => {
    const todos = this.productos();
    return this.mostrarInactivos() ? todos : todos.filter(p => p.activo === 1);
  });

  async ngOnInit() {
    await this.cargarInventario();
  }

  async cargarInventario() {
    this.loading.set(true);
    this.error.set('');
    try {
      const resp = await firstValueFrom(this.inventarioService.getInventario());
      this.productos.set(resp.data);
    } catch {
      this.error.set('Error al cargar el inventario');
    } finally {
      this.loading.set(false);
    }
  }

  abrirFormNuevo() {
    this.form = this.formVacio();
    this.modoEdicion.set(false);
    this.productoEditandoId.set(null);
    this.mostrarFormulario.set(true);
  }

  editarProducto(p: Producto) {
    this.form = {
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl ?? '',
      category: p.category ?? '',
      description: p.description ?? '',
      inStock: p.inStock === 1,
    };
    this.modoEdicion.set(true);
    this.productoEditandoId.set(p.id);
    this.mostrarFormulario.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelar() {
    this.mostrarFormulario.set(false);
    this.modoEdicion.set(false);
    this.productoEditandoId.set(null);
    this.form = this.formVacio();
  }

  async guardar() {
    if (!this.form.name.trim() || this.form.price == null) return;
    this.guardando.set(true);
    try {
      const fueEdicion = this.modoEdicion();
      if (fueEdicion && this.productoEditandoId() !== null) {
        await firstValueFrom(this.inventarioService.actualizarProducto(this.productoEditandoId()!, this.form));
      } else {
        await firstValueFrom(this.inventarioService.crearProducto(this.form));
      }
      this.cancelar();
      await this.cargarInventario();
      this.exitoModal.set(fueEdicion ? 'actualizado' : 'creado');
      setTimeout(() => this.exitoModal.set(null), 3000);
    } catch {
      this.error.set('Error al guardar el producto');
    } finally {
      this.guardando.set(false);
    }
  }

  desactivar(id: number) {
    this.confirmModal.set({ accion: 'desactivar', id });
  }

  activar(id: number) {
    this.confirmModal.set({ accion: 'activar', id });
  }

  cerrarConfirmModal() {
    this.confirmModal.set(null);
  }

  async ejecutarAccion() {
    const modal = this.confirmModal();
    if (!modal) return;
    this.confirmModal.set(null);
    try {
      if (modal.accion === 'desactivar') {
        await firstValueFrom(this.inventarioService.desactivarProducto(modal.id));
      } else {
        await firstValueFrom(this.inventarioService.activarProducto(modal.id));
      }
      await this.cargarInventario();
    } catch {
      this.error.set(`Error al ${modal.accion} el producto`);
    }
  }

  private formVacio(): ProductoForm {
    return { name: '', price: 0, imageUrl: '', category: '', description: '', inStock: true };
  }
}
