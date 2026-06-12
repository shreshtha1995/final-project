import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-wrap">
      <div class="card auth-card">
        <div class="auth-logo">CampusSync</div>
        <p class="muted">Verified co-living for Cognizant employees. Sign in to continue.</p>

        <label>Email</label>
        <input type="email" [(ngModel)]="email" name="loginEmail" autocomplete="off" placeholder="you@cognizant.com" />

        <label>Password</label>
        <input type="password" [(ngModel)]="password" name="loginPwd" autocomplete="new-password" (keyup.enter)="login()" />

        <button class="full-width gradient" style="margin-top:18px" [disabled]="loading()" (click)="login()">
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <p class="muted" style="margin-top:18px">
          New joinee? <a routerLink="/signup">Create an account</a>
        </p>
        <p class="center" style="margin-top:6px"><a routerLink="/">← Back to home</a></p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  /**
   * Security fix: arriving on the login page always clears any existing session,
   * so pressing Back after logout (or revisiting /login) cannot silently re-enter
   * a protected page with a stale token. You must authenticate again.
   */
  ngOnInit(): void {
    this.auth.logout();
  }

  login(): void {
    this.error.set('');
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => this.router.navigateByUrl(res.role === 'SUPER_ADMIN' ? '/admin' : '/dashboard'),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Login failed.');
        this.loading.set(false);
      }
    });
  }
}
