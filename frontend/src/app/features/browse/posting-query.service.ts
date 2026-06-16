import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Posting, SharingType, TenantPreference } from '../../models/models';

const API = 'http://localhost:8081/api/postings';

/** Listing discovery / browse — read side of the posting contract. */
@Injectable({ providedIn: 'root' })
export class PostingQueryService {
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
}
