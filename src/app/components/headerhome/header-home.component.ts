import { Component, Input } from '@angular/core';
import { LucideAngularModule, LogIn } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header-home',
  templateUrl: './header-home.component.html',
  styleUrls: ['./header-home.component.css'],
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule]
})
export class HeaderHomeComponent {
  @Input() login: boolean = true;
  readonly LogIn = LogIn;
}