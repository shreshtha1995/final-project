import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostingRequest, Posting } from '../../models/models';

const API = 'http://localhost:8081/api/postings';

/** Listing creation, editing, image upload and re-confirmation — write side of the posting contract. */
@Injectable({ providedIn: 'root' })
export class PostingManagementService {
  private http = inject(HttpClient);

  create(request: CreatePostingRequest): Observable<Posting> {
    return this.http.post<Posting>(API, request);
  }

  update(id: number, request: CreatePostingRequest): Observable<Posting> {
    return this.http.put<Posting>(`${API}/${id}`, request);
  }

  /** Upload one or more PG image files; returns the stored URLs to attach to a listing. */
  uploadImages(files: File[]): Observable<{ urls: string[] }> {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return this.http.post<{ urls: string[] }>(`${API}/upload-images`, form);
  }

  confirm(id: number): Observable<Posting> {
    return this.http.post<Posting>(`${API}/${id}/confirm`, {});
  }
}
