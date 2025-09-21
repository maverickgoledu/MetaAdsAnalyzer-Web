import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
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

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey() });
    return this.http.post(`${this.getApiUrl()}/login`, { email, password }, { headers });
  }

  logout(): Observable<any> {
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey() });
    return this.http.post(`${this.getApiUrl()}/logout`, { Authorization: `Bearer ${apiToken}` }, { headers });
  }
}
