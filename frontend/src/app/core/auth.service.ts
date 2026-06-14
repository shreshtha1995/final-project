import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Profile, SignupRequest, VerifyIdResponse } from '../models/models';

const API = 'http://localhost:8081/api/auth';
const USERS_API = 'http://localhost:8081/api/users';
const STORAGE_KEY = 'campusSyncAuth';

/**
 * Holds the logged-in user + JWT.
 * The token lives in sessionStorage (NOT localStorage), so it is scoped to the
 * current tab and is dropped when the tab/browser is closed — reopening the app
 * forces a fresh login. A refresh in the same tab keeps you signed in.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private currentUser = signal<AuthResponse | null>(this.loadFromStorage());
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'SUPER_ADMIN');

  verifyId(cognizantId: string): Observable<VerifyIdResponse> {
    return this.http.post<VerifyIdResponse>(`${API}/verify-id`, { cognizantId });
  }

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/signup`, request).pipe(tap((res) => this.store(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/login`, { email, password }).pipe(tap((res) => this.store(res)));
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${USERS_API}/me`);
  }

  updatePhone(phoneNumber: string): Observable<Profile> {
    return this.http.put<Profile>(`${USERS_API}/me`, { phoneNumber });
  }

  deleteAccount(): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${USERS_API}/me`).pipe(tap(() => this.logout()));
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.currentUser.set(null);
  }

  get token(): string | null {
    return this.currentUser()?.token ?? null;
  }

  private store(res: AuthResponse): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    this.currentUser.set(res);
  }

  private loadFromStorage(): AuthResponse | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  }
}
