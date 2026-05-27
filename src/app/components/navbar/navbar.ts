import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../services/carrito/carrito/carrito';
import { SearchService } from '../../services/search/search';
import { UserService } from '../../services/user/user';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  searchQuery = signal('');
  userService = inject(UserService);

  constructor(
    public carritoService: CarritoService,
    private searchService: SearchService,
    private router: Router
  ) {}

  cerrarSesion(): void {
    this.userService.clearUsuario();
    this.router.navigate(['/login']);
  }

  onSearch() {
    this.searchService.setSearch(this.searchQuery());
    this.goToCatalog();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.searchService.setSearch('');
  }

  goHome() {
    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigateByUrl('/').then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
    }
  }

   goToCatalog() {
    const scrollToCatalog = () => {
      const catalog = document.getElementById('catalogo-section');
      if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => {
        const sidebar = document.querySelector('.sidebar') as HTMLElement;
        if (sidebar) {
          sidebar.scrollTop = 0;
        }
      }, 100);
    };

    const currentUrl = this.router.url;
    if (currentUrl === '/' || currentUrl === '') {
      scrollToCatalog();
    } else {
      this.router.navigateByUrl('/').then(() => {
        setTimeout(scrollToCatalog, 100);
      });
    }
  }

  goToHistorial() {
    const currentUrl = this.router.url;
    if (currentUrl === '/historial') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.router.navigateByUrl('/historial').then(() => {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      });
    }
  }
}
