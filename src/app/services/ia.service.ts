import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipar las respuestas
export interface AnalysisRequest {
  startDate: string;
  endDate: string;
  adSetName?: string;
}

export interface AnalysisSummary {
  TotalSpent: number;
  TotalReach: number;
  TotalImpressions: number;
  TotalResults: number;
  AdSetCount: number;
  CostPerResult: number;
}

export interface AnalysisResponse {
  Analysis: string;
  HasAnalysis: boolean;
  Summary: AnalysisSummary;
  AvailableAdSets: string[];
  StartDate: string;
  EndDate: string;
  SelectedAdSet: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class IaAnalysisService {
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

  constructor(private http: HttpClient) {}

  generateAnalysis(filters: AnalysisRequest): Observable<AnalysisResponse> {
    const url = `${this.getApiUrl()}/dashboard/generate-analysis`;

    const headers = new HttpHeaders({
      'API_KEY': this.getApiKey(),
      'Content-Type': 'application/json'
    });

    // Preparar el payload con los parámetros esperados por el backend
    const payload = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      ...(filters.adSetName && { adSetName: filters.adSetName }) // Solo incluir si no está vacío
    };

    return this.http.post<AnalysisResponse>(url, payload, { headers });
  }
}
