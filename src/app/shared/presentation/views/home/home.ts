import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Toolbar } from '../../component/toolbar/toolbar';

/**
 * @summary Vista de inicio (Home) de FuelGuard.
 * @remarks Página de bienvenida pública y presentación corporativa B2B
 * que expone las capacidades de telemetría IoT, asignación de flota
 * y trazabilidad satelital a clientes industriales y distribuidores.
 * @author FuelGuard Team
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Toolbar, TranslatePipe, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
