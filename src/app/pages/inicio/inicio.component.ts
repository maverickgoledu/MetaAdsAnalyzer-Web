import { Component } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { LucideAngularModule, LogIn, BarChart3, LineChart, Upload } from 'lucide-angular';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [NavComponent, LucideAngularModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  readonly LogIn = LogIn;
  readonly BarChart3 = BarChart3;
  readonly LineChart = LineChart;
  readonly Upload = Upload;
}
