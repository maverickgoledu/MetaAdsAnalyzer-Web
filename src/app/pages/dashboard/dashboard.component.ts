import { Component, OnInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../components/nav/nav.component';
import { DashboardService, DashboardData, MonthlyData, AdSetsData } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, ChartType, BarController, BarElement, CategoryScale, LinearScale, PieController, ArcElement, LineController, LineElement, PointElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { forkJoin } from 'rxjs';

// Registrar manualmente los controladores y escalas necesarios para Chart.js
Chart.register(
  BarController, BarElement, CategoryScale, LinearScale,
  PieController, ArcElement,
  LineController, LineElement, PointElement,
  DoughnutController,
  Tooltip, Legend
);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule, NavComponent, FormsModule, BaseChartDirective],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  // AdSet seleccionado para la tendencia mensual
  selectedAdSetForTrend: string = '';
  // Método para manejar el cambio de AdSet en el select de tendencia mensual
  onAdSetChange(): void {
    this.loadMonthlyData();
    this.loadAdSetsData();
    this.cdr.markForCheck();
  }
  // Indica si los gráficos están listos para mostrarse
  chartsReady = false;
  @ViewChild('budgetChart') budgetChart?: BaseChartDirective;
  @ViewChild('spendChart') spendChart?: BaseChartDirective;
  @ViewChild('trendChart') trendChart?: BaseChartDirective;

  // Datos del dashboard
  dashboardData: DashboardData | null = null;
  monthlyData: MonthlyData | null = null;
  adSetsData: AdSetsData | null = null;
  isLoading = false;
  error = '';

  // Filtros
  filters = {
    startDate: '',
    endDate: '',
    adSetName: ''
  };

  // Gráfico seleccionado
  selectedMetric: 'ImporteGastado' | 'Alcance' | 'Impresiones' | 'Resultados' = 'ImporteGastado';

  // Configuraciones de los gráficos
  budgetChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
        labels: {
          boxWidth: 12
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  budgetChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Presupuesto diario (USD)',
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ]
    }]
  };

  spendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        display: true,
        labels: {
          boxWidth: 12,
          font: {
            size: 11
          }
        }
      }
    }
  };

  spendChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(153, 102, 255, 0.8)',
        'rgba(255, 159, 64, 0.8)'
      ]
    }]
  };

  trendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  trendChartData: ChartData<'line'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [{
      data: [],
      label: 'Tendencia',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      borderColor: 'rgba(147, 51, 234, 1)',
      borderWidth: 2,
      tension: 0.3,
      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true
    }]
  };

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this.isLoading = true;
    this.error = '';

    // Cargar todos los datos iniciales en paralelo
    const currentYear = new Date().getFullYear();

    forkJoin({
      dashboard: this.dashboardService.getDashboardData({}),
      monthly: this.dashboardService.getMonthlyData(currentYear),
      adSets: this.dashboardService.getAdSetsData()
    }).subscribe({
      next: (results) => {
        this.dashboardData = results.dashboard;
        this.monthlyData = results.monthly;
        this.adSetsData = results.adSets;

        // Actualizar todos los gráficos
        this.updateCharts();
        this.updateTrendChart();

        // Si hay datos de AdSets, puedes procesarlos aquí
        if (this.adSetsData) {
          console.log('Datos de AdSets cargados:', this.adSetsData);
          // Aquí puedes agregar lógica adicional para usar estos datos
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos iniciales:', error);
        this.error = 'Error al cargar los datos. Por favor intente nuevamente.';
        this.isLoading = false;

        // Intentar cargar los datos por separado si falla la carga en paralelo
        this.loadDataSeparately();

        this.cdr.markForCheck();
      }
    });
  }

  private loadDataSeparately(): void {
    // Cargar datos del dashboard
    this.loadDashboardData();

    // Cargar datos mensuales
    this.loadMonthlyData();

    // Cargar datos de AdSets
    this.loadAdSetsData();
  }

  loadDashboardData(): void {
    const filterParams: any = {};
    if (this.filters.startDate) filterParams.startDate = this.filters.startDate;
    if (this.filters.endDate) filterParams.endDate = this.filters.endDate;
    if (this.filters.adSetName) filterParams.adSetName = this.filters.adSetName;

    this.dashboardService.getDashboardData(filterParams).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateCharts();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.handleError(error, 'Error al cargar datos del dashboard');
        this.cdr.markForCheck();
      }
    });
  }

  loadMonthlyData(): void {
    const currentYear = new Date().getFullYear();
    this.dashboardService.getMonthlyData(currentYear).subscribe({
      next: (data) => {
        this.monthlyData = data;
        this.updateTrendChart();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos mensuales:', error);
        this.handleError(error, 'Error al cargar datos mensuales');
        this.cdr.markForCheck();
      }
    });
  }

  loadAdSetsData(): void {
    this.dashboardService.getAdSetsData().subscribe({
      next: (data) => {
        this.adSetsData = data;
        console.log('Datos de AdSets actualizados:', this.adSetsData);

        // Aquí puedes agregar lógica adicional para procesar o mostrar estos datos
        // Por ejemplo, podrías crear un nuevo gráfico o actualizar uno existente

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar datos de AdSets:', error);
        this.handleError(error, 'Error al cargar datos de AdSets');
        this.cdr.markForCheck();
      }
    });
  }

  private handleError(error: any, defaultMessage: string): void {
    if (error.status === 401) {
      this.error = 'Error de autenticación. Por favor inicie sesión nuevamente.';
    } else if (error.status === 404) {
      this.error = 'No se encontraron datos.';
    } else {
      this.error = error.error?.message || defaultMessage;
    }
  }

  applyFilters(): void {
    this.loadDashboardData();
    // Opcionalmente, también recargar AdSets con filtros si es necesario
    this.loadAdSetsData();
  }

  updateCharts(): void {
    if (!this.dashboardData) return;

    // Actualizar gráfico de presupuesto
    const budgetLabels = Object.keys(this.dashboardData.PresupuestoDiarioPorConjunto);
    const budgetData = Object.values(this.dashboardData.PresupuestoDiarioPorConjunto);

    this.budgetChartData.labels = budgetLabels;
    this.budgetChartData.datasets[0].data = budgetData;

    // Actualizar gráfico de gasto
    const spendLabels = Object.keys(this.dashboardData.ImporteGastadoPorConjunto);
    const spendData = Object.values(this.dashboardData.ImporteGastadoPorConjunto);

    this.spendChartData.labels = spendLabels;
    this.spendChartData.datasets[0].data = spendData;

    // Solo actualizar si los gráficos están listos
    if (this.chartsReady) {
      if (this.budgetChart && typeof this.budgetChart.update === 'function') {
        this.budgetChart.update();
      }
      if (this.spendChart && typeof this.spendChart.update === 'function') {
        this.spendChart.update();
      }
    } else {
      // Si los gráficos no están listos, intentar más tarde
      setTimeout(() => {
        this.updateCharts();
      }, 300);
    }
  }

  updateTrendChart(): void {
    if (!this.monthlyData) return;

    const data = this.monthlyData[this.selectedMetric];
    this.trendChartData.datasets[0].data = data;
    this.trendChartData.datasets[0].label = this.getMetricLabel(this.selectedMetric);

    // Forzar actualización del gráfico
    this.trendChart?.update();
  }

  onMetricChange(): void {
    this.updateTrendChart();
  }

  goToCargar(): void {
    this.router.navigate(['/cargar']);
  }

  goToIA(): void {
    this.router.navigate(['/ia']);
  }

  getMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      'ImporteGastado': 'Importe gastado',
      'Alcance': 'Alcance',
      'Impresiones': 'Impresiones',
      'Resultados': 'Resultados'
    };
    return labels[metric] || metric;
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null) return '$0.00';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null) return '0';
    return new Intl.NumberFormat('es-ES').format(Math.round(value));
  }

  formatPercentage(value: number | null | undefined): string {
    if (value == null) return '0.00%';
    return (value * 100).toFixed(2) + '%';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  }

  // Métodos helper para acceder a los datos de AdSets
  getAdSetMetricData(metric: keyof AdSetsData): { [key: string]: number } | null {
    return this.adSetsData ? this.adSetsData[metric] : null;
  }

  getTotalFromAdSetsData(metric: keyof AdSetsData): number {
    const data = this.getAdSetMetricData(metric);
    if (!data) return 0;

    return Object.values(data).reduce((sum, value) => sum + value, 0);
  }
}
