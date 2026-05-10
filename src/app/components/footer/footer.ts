import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  constructor(private router: Router) {}

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
