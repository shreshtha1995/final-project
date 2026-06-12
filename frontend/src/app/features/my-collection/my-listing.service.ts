import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Posting } from '../../models/models';

const API = 'http://localhost:8081/api/postings';

/** A provider's own listings: list + delete. */
@Injectable({ providedIn: 'root' })
export class MyListingService {
  private http = inject(HttpClient);

  myListings(): Observable<Posting[]> {
    return this.http.get<Posting[]>(`${API}/mine`);
  }

  remove(id: number): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${API}/${id}`);
  }
}
