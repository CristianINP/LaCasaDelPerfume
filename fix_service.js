const fs = require('fs');
const path = 'src/app/services/historial-compras/historial-compras.ts';
let content = fs.readFileSync(path, 'utf8');

// Agregar loading y error al inicio del método
const search1 = `  async obtenerCompraPorId(id: number): Promise<PurchaseOrder | null> {
    try {`;
const replace1 = `  async obtenerCompraPorId(id: number): Promise<PurchaseOrder | null> {
    this.loading.set(true);
    this.error.set(null);
    try {`;
content = content.replace(search1, replace1);

// Agregar finally block
const search2 = `    } catch (err) {
      console.error('Error al obtener la compra:', err);
      this.error.set('No se pudo cargar la compra.');
      return null;
    }
  }`;
const replace2 = `    } catch (err) {
      console.error('Error al obtener la compra:', err);
      this.error.set('No se pudo cargar la compra.');
      return null;
    } finally {
      this.loading.set(false);
    }
  }`;
content = content.replace(search2, replace2);

fs.writeFileSync(path, content);
console.log('Servicio actualizado correctamente');
