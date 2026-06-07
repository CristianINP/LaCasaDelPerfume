import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { Product } from '../../../models/producto/producto';
import { CarritoService } from '../../../services/carrito/carrito/carrito';

export interface ProductAddEvent {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<ProductAddEvent>();

  private carritoService = inject(CarritoService);

  quantity = signal(1);

  // Cuántas unidades de este producto ya están en el carrito
  cartQuantity = computed(() =>
    this.carritoService.groupedItems().find(i => i.product.id === this.product.id)?.quantity ?? 0
  );

  // Cuántas unidades más se pueden agregar (stock real - lo que ya está en carrito)
  availableToAdd = computed(() =>
    Math.max(0, this.product.inStock - this.cartQuantity())
  );

  atStockLimit = computed(() =>
    this.quantity() >= this.availableToAdd() || this.availableToAdd() === 0
  );

  stockWarning = computed(() =>
    this.atStockLimit() && this.product.inStock > 0
  );

  incrementQuantity() {
    if (this.quantity() < this.availableToAdd()) {
      this.quantity.update(q => q + 1);
    }
  }

  decrementQuantity() {
    this.quantity.update(q => Math.max(1, q - 1));
  }

  onAdd() {
    const canAdd = this.availableToAdd();
    if (canAdd > 0 && this.quantity() <= canAdd) {
      this.add.emit({ product: this.product, quantity: this.quantity() });
      this.quantity.set(1);
    }
  }
}
