import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Answer, CreateDoubtRequest, Doubt, DoubtCategory } from '../../models/models';

const API = 'http://localhost:8081/api/doubts';

@Injectable({ providedIn: 'root' })
export class ForumService {
  private http = inject(HttpClient);

  list(category?: DoubtCategory): Observable<Doubt[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<Doubt[]>(API, { params });
  }

  getById(id: number): Observable<Doubt> {
    return this.http.get<Doubt>(`${API}/${id}`);
  }

  ask(request: CreateDoubtRequest): Observable<Doubt> {
    return this.http.post<Doubt>(API, request);
  }

  answer(doubtId: number, content: string): Observable<Answer> {
    return this.http.post<Answer>(`${API}/${doubtId}/answers`, { content });
  }
}
