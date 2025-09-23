import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavComponent } from '../../components/nav/nav.component';
import { LucideAngularModule, Upload, ArrowLeft, Info, CheckCircle, AlertCircle, Loader2 } from 'lucide-angular';
import Swal from 'sweetalert2';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-cargar',
  standalone: true,
  templateUrl: './cargar.component.html',
  styleUrls: ['./cargar.component.css'],
  imports: [CommonModule, NavComponent, LucideAngularModule]
})
export class CargarComponent {
  selectedFile: File | null = null;
  isUploading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string = '';

  // Iconos de Lucide
  readonly Upload = Upload;
  readonly ArrowLeft = ArrowLeft;
  readonly Info = Info;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Loader2 = Loader2;

  constructor(private router: Router, private fileService: FileService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar que sea un archivo CSV
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        this.uploadError = 'Por favor selecciona un archivo CSV válido.';
        this.selectedFile = null;
        return;
      }

      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.uploadError = 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.';
        this.selectedFile = null;
        return;
      }

      this.selectedFile = file;
      this.uploadError = '';
      this.uploadSuccess = false;
    }
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    this.fileService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.uploadSuccess = true;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Archivo cargado correctamente',
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true
        });
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.uploadError = err?.error?.message || err?.error?.error || 'Error al cargar el archivo. Por favor intenta de nuevo.';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: this.uploadError,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        console.error('Error uploading file:', err);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  private simulateFileUpload(): Promise<void> {
    // Simular una carga que toma 2 segundos
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular un 90% de éxito
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Simulated upload error'));
        }
      }, 2000);
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  removeFile(event: Event): void {
    event.stopPropagation(); // Evitar que se abra el selector de archivos
    this.selectedFile = null;
    this.uploadError = '';
    this.uploadSuccess = false;

    // Resetear el input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // En una aplicación real, aquí procesarías el CSV
  private async processCSV(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        // Aquí procesarías el CSV
        // Por ejemplo, usando una librería como PapaParse
        console.log('CSV content:', text.substring(0, 100) + '...');
        resolve(text);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsText(file);
    });
  }
}
