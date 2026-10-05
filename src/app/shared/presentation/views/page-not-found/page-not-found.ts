import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';

/**
 * @summary Vista de página no encontrada (404) de FuelGuard.
 * @remarks Se activa cuando el usuario navega a una ruta que no existe en
 * la aplicación. Muestra la ruta inválida y proporciona un botón para
 * redirigir al usuario a la vista de inicio. Utiliza ActivatedRoute para
 * obtener el segmento de URL que generó el error.
 * @author FuelGuard Platform
 */
@Component({
  selector: 'app-page-not-found',
  imports: [TranslatePipe, MatButton],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound implements OnInit {
  protected invalidPath: string = '';
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.invalidPath = this.route.snapshot.url.map((url) => url.path).join('/');
  }

  protected navigateToHome(): void {
    this.router.navigate(['home']).then();
  }
}
