import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersService {
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

  getUsers(): Observable<any> {
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
    return this.http.get(`${this.getApiUrl()}/users`, { headers });
  }

  createUser(user: any): Observable<any> {
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
    return this.http.post(`${this.getApiUrl()}/users`, user, { headers });
  }

    updateUser(id: string, user: any): Observable<any> {
    const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
    const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
    return this.http.put(`${this.getApiUrl()}/users/${id}`, user, { headers });
  }

    deleteUser(id: string): Observable<any> {
      const apiToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';
      const headers = new HttpHeaders({ 'API_KEY': this.getApiKey(), 'Authorization': `Bearer ${apiToken}` });
      return this.http.delete(`${this.getApiUrl()}/users/${id}`, { headers });
    }
}
