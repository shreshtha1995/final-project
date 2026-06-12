import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostingRequest, Posting, SharingType, TenantPreference } from '../models/models';

const API = 'http://localhost:8081/api/postings';

@Injectable({ providedIn: 'root' })
export class PostingService {
  private http = inject(HttpClient);

  /** Discovery. Gender filtering happens on the server; we just pass optional filters. */
  search(filters: { sharingType?: SharingType; city?: string; officeCampus?: string; tenantPreference?: TenantPreference } = {}): Observable<Posting[]> {
    let params = new HttpParams();
    if (filters.sharingType) params = params.set('sharingType', filters.sharingType);
    if (filters.city) params = params.set('city', filters.city);
    if (filters.officeCampus) params = params.set('officeCampus', filters.officeCampus);
    if (filters.tenantPreference) params = params.set('tenantPreference', filters.tenantPreference);
    return this.http.get<Posting[]>(API, { params });
  }

  locations(): Observable<string[]> {
    return this.http.get<string[]>(`${API}/locations`);
  }

  getById(id: number): Observable<Posting> {
    return this.http.get<Posting>(`${API}/${id}`);
  }

  create(request: CreatePostingRequest): Observable<Posting> {
    return this.http.post<Posting>(API, request);
  }

  update(id: number, request: CreatePostingRequest): Observable<Posting> {
    return this.http.put<Posting>(`${API}/${id}`, request);
  }

  remove(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API}/${id}`);
  }

  /** Upload one or more PG image files; returns the stored URLs to attach to a listing. */
  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return this.http.post<{ urls: string[] }>(`${API}/upload-images`, form);
  }

  myListings(): Observable<Posting[]> {
    return this.http.get<Posting[]>(`${API}/mine`);
  }

  confirm(id: number): Observable<Posting> {
    return this.http.post<Posting>(`${API}/${id}/confirm`, {});
  }
}
