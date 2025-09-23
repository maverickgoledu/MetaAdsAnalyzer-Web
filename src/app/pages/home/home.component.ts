import { Component } from '@angular/core';
import { HeaderHomeComponent } from '../../components/headerhome/header-home.component';
import { LucideAngularModule, LogIn, BarChart3, LineChart, Upload } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [HeaderHomeComponent, LucideAngularModule, RouterModule]
})
export class HomeComponent {
  readonly LogIn = LogIn;
  readonly BarChart3 = BarChart3;
  readonly LineChart = LineChart;
  readonly Upload = Upload;

  
}