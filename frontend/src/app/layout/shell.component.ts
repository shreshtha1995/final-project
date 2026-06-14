import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { IconComponent } from '../shared/icon.component';

/** Authenticated app layout: top navbar + routed page content. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  template: `
    <header class="navbar">
      <a class="brand" [routerLink]="auth.isAdmin() ? '/admin' : '/dashboard'">CampusSync</a>
      <nav>
        @if (auth.isAdmin()) {
          <a routerLink="/admin" routerLinkActive="active">Admin Panel</a>
        } @else {
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/browse" routerLinkActive="active">Browse Rooms</a>
          <a routerLink="/create-listing" routerLinkActive="active">List a Room</a>
          <a routerLink="/my-listings" routerLinkActive="active">My Listings</a>
          <a routerLink="/wishlist" routerLinkActive="active">Wishlist</a>
          <a routerLink="/forum" routerLinkActive="active">Forum</a>
        }
      </nav>
      <div class="nav-right">
        <button class="icon-btn" (click)="theme.toggle()" [title]="theme.theme() === 'dark' ? 'Light mode' : 'Dark mode'">
          <app-icon [name]="theme.theme() === 'dark' ? 'sun' : 'moon'" [size]="19" />
        </button>
        <div class="menu-wrap">
          <span class="avatar" (click)="menuOpen.set(!menuOpen())">{{ initials() }}</span>
          @if (menuOpen()) {
            <div class="menu">
              <div class="menu-head">
                <div class="nm">{{ auth.user()?.name }}</div>
                <div class="muted">{{ auth.user()?.email }}</div>
              </div>
              @if (!auth.isAdmin()) {
                <button (click)="goProfile()"><app-icon name="user" [size]="16" /> My Profile</button>
              }
              <button (click)="logout()"><app-icon name="logout" [size]="16" /> Logout</button>
            </div>
          }
        </div>
      </div>
    </header>

    @if (menuOpen()) { <div class="backdrop" (click)="menuOpen.set(false)"></div> }

    <main class="container">
      <router-outlet />
    </main>
  `,
  styles: [`
    .backdrop { position: fixed; inset: 0; z-index: 40; }
  `]
})
export class ShellComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  private router = inject(Router);

  menuOpen = signal(false);

  initials = computed(() => {
    const name = this.auth.user()?.name ?? '?';
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  });

  goProfile(): void {
    this.menuOpen.set(false);
    this.router.navigateByUrl('/profile');
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
