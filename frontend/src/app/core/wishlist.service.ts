import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Posting } from '../models/models';

const API = 'http://localhost:8081/api/wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);

  list(): Observable<Posting[]> {
    return this.http.get<Posting[]>(API);
  }

  savedIds(): Observable<number[]> {
    return this.http.get<number[]>(`${API}/ids`);
  }

  add(postingId: number): Observable<{ status: string }> {
    return this.http.post<{ status: string }>(`${API}/${postingId}`, {});
  }

  remove(postingId: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API}/${postingId}`);
  }
}
