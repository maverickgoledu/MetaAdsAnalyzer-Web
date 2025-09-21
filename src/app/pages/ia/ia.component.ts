import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../components/nav/nav.component';
import { IaAnalysisService, AnalysisResponse, AnalysisRequest } from '../../services/ia.service';
import { DashboardService } from '../../services/dashboard.service';
import Swal from 'sweetalert2'; // Importar correctamente SweetAlert2

@Component({
  selector: 'app-ia',
  standalone: true,
  templateUrl: './ia.component.html',
  styleUrls: ['./ia.component.css'],
  imports: [CommonModule, NavComponent, FormsModule],
  providers: [DashboardService, IaAnalysisService],
  changeDetection: ChangeDetectionStrategy.OnPush // Optimización de rendimiento
})
export class IaComponent implements OnInit {
  // Estado del análisis
  analysisData: AnalysisResponse | null = null;
  isLoading = false;
  error = '';

  // Filtros del formulario
  filters: AnalysisRequest = {
    startDate: this.getDefaultStartDate(),
    endDate: this.getDefaultEndDate(),
    adSetName: ''
  };

  // Lista de conjuntos de anuncios disponibles
  availableAdSets: string[] = [];

  constructor(
    private iaAnalysisService: IaAnalysisService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAvailableAdSets();
  }

  loadAvailableAdSets(): void {
    this.dashboardService.getDashboardData({}).subscribe({
      next: (data) => {
        this.availableAdSets = data.AvailableAdSets || [];
        console.log('Conjuntos de anuncios cargados:', this.availableAdSets);
        this.cdr.markForCheck(); // Solo usar markForCheck
      },
      error: (error) => {
        console.error('Error al cargar los conjuntos de anuncios:', error);
        this.handleError(error, 'Error al cargar los conjuntos de anuncios');
      }
    });
  }

  generateAnalysis(): void {
    // Validar formulario
    const validationError = this.validateFilters();
    if (validationError) {
      this.error = validationError;
      this.showErrorAlert(validationError);
      return;
    }

    this.isLoading = true;
    this.error = '';

    console.log('Enviando análisis con filtros:', this.filters);

    this.iaAnalysisService.generateAnalysis(this.filters).subscribe({
      next: (response) => {
        console.log('Respuesta del análisis recibida:', response);
        this.analysisData = response;

        // Actualizar la lista de AdSets si viene en la respuesta
        if (response.AvailableAdSets?.length > 0) {
          this.updateAvailableAdSets(response.AvailableAdSets);
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al generar el análisis:', error);
        this.isLoading = false;
        this.handleAnalysisError(error);
        this.cdr.markForCheck();
      }
    });
  }

  private validateFilters(): string | null {
    if (!this.filters.startDate || !this.filters.endDate) {
      return 'Por favor seleccione las fechas de inicio y fin';
    }

    if (new Date(this.filters.startDate) > new Date(this.filters.endDate)) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin';
    }

    return null;
  }

  private updateAvailableAdSets(newAdSets: string[]): void {
    this.availableAdSets = newAdSets;

    // Si el adSetName actual no está en la nueva lista, lo limpiamos
    if (this.filters.adSetName && !this.availableAdSets.includes(this.filters.adSetName)) {
      this.filters.adSetName = '';
    }

    console.log('AdSets actualizados:', this.availableAdSets);
  }

  private handleAnalysisError(error: any): void {
    let errorMessage = 'Error al generar el análisis. Por favor intente nuevamente.';

    switch (error.status) {
      case 401:
        errorMessage = 'Error de autenticación. API Key inválida.';
        break;
      case 404:
        errorMessage = error.error?.error || 'No hay datos disponibles para los filtros seleccionados.';
        if (errorMessage === 'No hay datos disponibles para los filtros seleccionados.') {
          this.showNoDataAlert();
          return;
        }
        break;
      default:
        if (error.error?.error) {
          errorMessage = error.error.error;
        }
    }

    this.error = errorMessage;
    this.showErrorAlert(errorMessage);
  }

  private handleError(error: any, defaultMessage: string): void {
    const errorMessage = error.error?.error || error.message || defaultMessage;
    this.error = errorMessage;
    this.cdr.markForCheck();
  }

  private showNoDataAlert(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Sin datos',
      text: 'No hay datos disponibles para los filtros seleccionados.',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#3085d6'
    });
  }

  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#d33'
    });
  }

  clearFilters(): void {
    this.filters = {
      startDate: this.getDefaultStartDate(),
      endDate: this.getDefaultEndDate(),
      adSetName: ''
    };
    this.analysisData = null;
    this.error = '';
    this.cdr.markForCheck();
  }

  // Métodos de formateo
  formatCurrency(value: number | null | undefined): string {
    if (value == null) return '$0.00';

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';

    return new Intl.NumberFormat('es-ES').format(Math.round(value));
  }

  formatMarkdown(text: string | null | undefined): string {
    if (!text) return '';

    // Para una solución más robusta, considera usar una librería como marked o markdown-it
    // Por ahora, mantenemos una versión mejorada de la implementación actual

    let html = text;

    // Escapar caracteres HTML peligrosos
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Headers (procesarlos antes que otras transformaciones)
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>');

    // Bold (procesar antes que itálicas)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    // Itálicas
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Listas numeradas
    const orderedListRegex = /^\d+\.\s+(.*)$/gm;
    html = html.replace(orderedListRegex, '<oli>$1</oli>'); // Marcador temporal

    // Listas con viñetas
    const unorderedListRegex = /^[-*]\s+(.*)$/gm;
    html = html.replace(unorderedListRegex, '<uli>$1</uli>'); // Marcador temporal

    // Saltos de línea
    html = html.replace(/\n/g, '<br>');

    // Convertir marcadores temporales a listas reales
    html = html.replace(/(<oli>.*?<\/oli>(<br>)?)+/g, (match) => {
      const items = match.replace(/<br>/g, '').replace(/<oli>/g, '<li>').replace(/<\/oli>/g, '</li>');
      return `<ol class="list-decimal list-inside mb-4">${items}</ol>`;
    });

    html = html.replace(/(<uli>.*?<\/uli>(<br>)?)+/g, (match) => {
      const items = match.replace(/<br>/g, '').replace(/<uli>/g, '<li>').replace(/<\/uli>/g, '</li>');
      return `<ul class="list-disc list-inside mb-4">${items}</ul>`;
    });

    // Párrafos (solo para líneas que no estén ya formateadas)
    html = html.replace(/^([^<].+)$/gm, '<p class="mb-2">$1</p>');

    return `<div class="prose max-w-none text-gray-700">${html}</div>`;
  }

  private getDefaultStartDate(): string {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.formatDateForInput(firstDay);
  }

  private getDefaultEndDate(): string {
    return this.formatDateForInput(new Date());
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Método para destruir suscripciones si las hubiera
  ngOnDestroy(): void {
    // Si agregas suscripciones manuales en el futuro, desuscríbete aquí
  }
}
