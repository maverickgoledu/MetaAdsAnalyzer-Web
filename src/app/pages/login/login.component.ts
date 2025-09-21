import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, LogIn } from 'lucide-angular';
import { HeaderHomeComponent } from '../../components/headerhome/header-home.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [LucideAngularModule, HeaderHomeComponent, FormsModule, CommonModule]
})
export class LoginComponent {
  readonly LogIn = LogIn;
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';
  emailError: string = '';
  passwordError: string = '';

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router  // Corregido - debe estar dentro de los parámetros
  ) {}

  onSubmit() {
    this.emailError = '';
    this.passwordError = '';
    this.error = '';
    let hasError = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!this.email) {
      this.emailError = 'El correo es obligatorio.';
      hasError = true;
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'El formato del correo no es válido.';
      hasError = true;
    }
    
    if (!this.password) {
      this.passwordError = 'La contraseña es obligatoria.';
      hasError = true;
    }
    
    if (hasError) {
      this.cdr.markForCheck();
      return;
    }
    
    this.loading = true;
    this.cdr.markForCheck();
    
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        // El token viene como 'access_token' en la respuesta
        if (res.access_token) {
          localStorage.setItem('access_token', res.access_token);
        }
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('userId', res.user.id);
        }
        this.cdr.markForCheck();
        // Redirigir a la página de inicio
       window.location.href = '/inicio';
      },
      error: (err) => {
        this.loading = false;
        this.emailError = '';
        this.passwordError = '';
        this.error = '';
        
        if (err.status === 401 && err.error?.error) {
          this.emailError = err.error.error;
        } else if (err.status === 0) {
          this.error = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          this.error = 'Error inesperado. Intenta nuevamente.';
        }
        
        console.log('Error asignado - loading:', this.loading);
        console.log('Error asignado - emailError:', this.emailError);
        
        this.cdr.markForCheck();
      }
    });
  }
}