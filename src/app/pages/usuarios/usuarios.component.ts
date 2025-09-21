import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { NavComponent } from '../../components/nav/nav.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';

import 'sweetalert2/src/sweetalert2.scss';
import Swal from 'sweetalert2';

interface User {
  Username: string;
  Email: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
  LastLogin: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.component.html',
  imports: [CommonModule, DatePipe, NavComponent, FormsModule],
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  roleFilter: string = '';
  statusFilter: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  Math = Math; // Para usar Math en el template
  private intervalId: any;

  // Modal y formulario de creación de usuario
  showCreateUserModal: boolean = false;
  loadingCreateUser: boolean = false;
  createUserError: string = '';
  newUser: any = {
    Username: '',
    Email: '',
    Password: '',
    Role: 'Usuario',
    IsActive: true
  };
  isEditMode: boolean = false;
  editUserId: string | null = null;

  constructor(
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone  // Añadir NgZone
  ) {}

  ngOnInit(): void {
    this.fetchUsers();
    this.intervalId = setInterval(() => this.fetchUsers(), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  openCreateUserModal(): void {
    this.showCreateUserModal = true;
    this.createUserError = '';
    this.isEditMode = false;
    this.editUserId = null;
    this.newUser = {
      Username: '',
      Email: '',
      Password: '',
      Role: 'Usuario',
      IsActive: true
    };
  }

  openEditUserModal(user: any): void {
    this.showCreateUserModal = true;
    this.createUserError = '';
    this.isEditMode = true;
    this.editUserId = user.id || user._id || user.Id || user.ID;
    this.newUser = {
      Username: user.Username,
      Email: user.Email,
      Password: '', // No se muestra el password actual
      Role: user.Role,
      IsActive: user.IsActive
    };
  }

  closeCreateUserModal(): void {
    this.showCreateUserModal = false;
    this.createUserError = '';
    this.loadingCreateUser = false;
    this.isEditMode = false;
    this.editUserId = null;
  }

  submitCreateUser(): void {
    if (this.loadingCreateUser) return;
    this.ngZone.run(() => {
      this.loadingCreateUser = true;
      this.createUserError = '';
    });

    if (this.isEditMode && this.editUserId) {
      // Editar usuario
      const userToUpdate = { ...this.newUser };
      if (!userToUpdate.Password) {
        delete userToUpdate.Password; // No enviar password si está vacío
      }
      this.usersService.updateUser(this.editUserId, userToUpdate).subscribe({
        next: (res: any) => {
          this.ngZone.run(() => {
            this.loadingCreateUser = false;
            this.closeCreateUserModal();
            this.fetchUsers();
            this.cdr.detectChanges();
            this.cdr.markForCheck();
          });
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Usuario editado correctamente',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
          });
        },
        error: (err: any) => {
          this.loadingCreateUser = false;
          this.createUserError = err?.error?.message || err?.error?.error || 'Error al editar usuario';
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          setTimeout(() => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: this.createUserError,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }, 100);
        }
      });
    } else {
      // Crear usuario
      this.usersService.createUser(this.newUser).subscribe({
        next: (res: any) => {
          this.ngZone.run(() => {
            this.loadingCreateUser = false;
            this.closeCreateUserModal();
            this.fetchUsers();
          });
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Usuario creado correctamente',
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
          });
        },
        error: (err: any) => {
          this.loadingCreateUser = false;
          this.createUserError = err?.error?.message || err?.error?.error || 'Error al crear usuario';
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          setTimeout(() => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: this.createUserError,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }, 100);
        }
      });
    }
  }

  fetchUsers() {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.users = Array.isArray(data) ? data : (data.users || []);
        this.filterUsers(); // Aplicar filtros después de obtener usuarios
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.users = [];
        this.filteredUsers = [];
        this.cdr.detectChanges();
        this.cdr.markForCheck();
      }
    });
  }

  // Métodos para las estadísticas
  getActiveUsers(): number {
    return this.users.filter(u => u.IsActive).length;
  }

  getAdminCount(): number {
    return this.users.filter(u => u.Role === 'Admin').length;
  }

  getRecentUsers(): number {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return this.users.filter(u => new Date(u.CreatedAt) > sevenDaysAgo).length;
  }

  // Método para filtrar usuarios
  filterUsers(): void {
    // Primero filtrar todos los usuarios sin paginación
    const filtered = this.users.filter(user => {
      const matchesSearch = !this.searchTerm ||
        user.Username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesRole = !this.roleFilter || user.Role === this.roleFilter;

      const matchesStatus = !this.statusFilter ||
        (this.statusFilter === 'active' && user.IsActive) ||
        (this.statusFilter === 'inactive' && !user.IsActive);

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Guardar todos los usuarios filtrados (sin paginar)
    this.filteredUsers = filtered;

    // Resetear a la primera página cuando se aplican filtros
    this.currentPage = 1;
  }

  // Método para obtener tiempo relativo
  getRelativeTime(date: string): string {
    if (!date) return 'Nunca';

    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} ${Math.floor(diffDays / 7) === 1 ? 'semana' : 'semanas'}`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) === 1 ? 'mes' : 'meses'}`;

    return past.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Métodos de paginación
  get paginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Métodos para acciones de usuario (para futura implementación)
  editUser(user: User): void {
    this.openEditUserModal(user);
  }

  deleteUser(user: User): void {
    Swal.fire({
      title: `¿Eliminar usuario ${user.Username}?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser((user as any).id || (user as any)._id || (user as any).Id || (user as any).ID).subscribe({
          next: () => {
            this.fetchUsers();
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Usuario eliminado correctamente',
              showConfirmButton: false,
              timer: 2500,
              timerProgressBar: true
            });
          },
          error: (err) => {
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'error',
              title: err?.error?.message || err?.error?.error || 'Error al eliminar usuario',
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true
            });
          }
        });
      }
    });
  }
}
