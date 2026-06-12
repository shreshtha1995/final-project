import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DirectoryEntry, IdType, UserSummary } from '../../models/models';

const API = 'http://localhost:8081/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  directory(): Observable<DirectoryEntry[]> {
    return this.http.get<DirectoryEntry[]>(`${API}/directory`);
  }

  addId(cognizantId: string, idType: IdType): Observable<DirectoryEntry> {
    return this.http.post<DirectoryEntry>(`${API}/directory`, { cognizantId, idType });
  }

  deleteId(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API}/directory/${id}`);
  }

  users(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>(`${API}/users`);
  }

  deleteUser(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API}/users/${id}`);
  }

  runExpiryJob(): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${API}/run-expiry-job`, {});
  }
}
