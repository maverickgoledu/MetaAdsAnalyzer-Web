import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { InicioComponent } from './pages/inicio/inicio.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CargarComponent } from './pages/cargar/cargar.component';

import { IaComponent } from './pages/ia/ia.component';

export const routes: Routes = [
    {
  path: 'inicio',
  component: InicioComponent,
  canActivate: [AuthGuard],
  title: 'Inicio - Meta ADS Analyzer'
    },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    title: 'Dashboard - Meta ADS Analyzer'
  },
    {
    path: 'ia',
    component: IaComponent,
    canActivate: [AuthGuard],
    title: 'IA - Meta ADS Analyzer'
  },
    {
    path: 'cargar',
    component: CargarComponent,
    canActivate: [AuthGuard],
    title: 'Cargar Datos - Meta ADS Analyzer'
  },
  {
    path: 'usuarios',
    component: UsuariosComponent,
    canActivate: [AuthGuard],
    title: 'Usuarios - Meta ADS Analyzer'
  },
  { path: '', component: HomeComponent, title: 'Inicio - Meta ADS Analyzer' },
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión - Meta ADS Analyzer' },

];
