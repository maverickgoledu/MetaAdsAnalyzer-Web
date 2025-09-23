import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  StartDate: string | null;
  EndDate: string | null;
  SelectedAdSet: string | null;
  AvailableAdSets: string[];
  UltimaCarga: string | null;
  TotalImporteGastado: number;
  TotalAlcance: number;
  TotalImpresiones: number;
  TotalResultados: number;
  CostoPromedioResultado: number;
  AlcanceVsImpresiones: number;
  TasaConversion: number;
  CostoPorMilImpresiones: number;
  PresupuestoDiarioPorConjunto: { [key: string]: number };
  ImporteGastadoPorConjunto: { [key: string]: number };
}

export interface MonthlyData {
  ImporteGastado: number[];
  Alcance: number[];
  Impresiones: number[];
  Resultados: number[];
}

export interface AdSetsData {
  ImporteGastado: { [key: string]: number };
  Alcance: { [key: string]: number };
  Impresiones: { [key: string]: number };
  Resultados: { [key: string]: number };
  CostoPorResultado: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getAdSets(params: any = {}): Observable<string[]> {
    const url = 'http://127.0.0.1:8000/api/dashboard/adsets';
    return this.http.get<string[]>(url, { params });
  }
  private getApiUrl(): string {
    if (typeof window !== 'undefined' && (window as any).API_ENDPOINT) {
      return (window as any).API_ENDPOINT;
    }
    return 'http://127.0.0.1:8000/api';
  }
  private getApiKey(): string {
    if (typeof window !== 'undefined' && (window as any).API_KEY) {
      return (window as any).API_KEY;
    }
    return 'MetaAdsAnalyzer1232*';
  }

  // ...existing code...

  getDashboardData(filters?: { startDate?: string; endDate?: string; adSetName?: string }): Observable<DashboardData> {
    let params = new HttpParams();
    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters?.adSetName) {
      params = params.set('adSetName', filters.adSetName);
    }
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
    return this.http.get<DashboardData>(`${this.getApiUrl()}/dashboard`, { params, headers });
  }

  getMonthlyData(year?: number): Observable<MonthlyData> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
    return this.http.get<MonthlyData>(`${this.getApiUrl()}/dashboard/monthly`, { params, headers });
  }

  getAdSetsData(): Observable<AdSetsData> {
  const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
  const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
  return this.http.get<AdSetsData>(`${this.getApiUrl()}/dashboard/adsets`, { headers });
  }
}
