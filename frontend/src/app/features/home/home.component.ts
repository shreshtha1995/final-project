import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { PostingQueryService } from '../browse/posting-query.service';
import { MyListingService } from '../my-collection/my-listing.service';
import { IconComponent } from '../../shared/icon.component';

/** Authenticated dashboard — a working control panel, distinct from the public Home/landing page. */
@Component({
  selector: 'app-dashboard',
  imports: [IconComponent],
  template: `
    <div class="greeting card">
      <div>
        <h1>Welcome, {{ auth.user()?.name }}</h1>
        <p class="muted">
          {{ auth.user()?.idType === 'CANDIDATE' ? 'New joinee' : 'Employee' }} · here's your CampusSync overview.
        </p>
      </div>
      <span class="avatar-xl">{{ initials() }}</span>
    </div>

    <div class="stats">
      <div class="stat card">
        <div class="num">{{ availableCount() }}</div>
        <div class="muted">Rooms available to you</div>
      </div>
      <div class="stat card">
        <div class="num">{{ myCount() }}</div>
        <div class="muted">Your active listings</div>
      </div>
      <div class="stat card forum-stat">
        <app-icon name="chat" [size]="30" />
        <div class="muted">Community forum</div>
      </div>
    </div>

    <h3 class="sec">Quick actions</h3>
    <div class="actions">
      <button class="action" (click)="go('/browse')"><app-icon name="search" [size]="26" /> Browse Rooms</button>
      <button class="action" (click)="go('/create-listing')"><app-icon name="home" [size]="26" /> List a Room</button>
      <button class="action" (click)="go('/my-listings')"><app-icon name="list" [size]="26" /> My Listings</button>
      <button class="action" (click)="go('/forum')"><app-icon name="help" [size]="26" /> Ask the Forum</button>
    </div>
  `,
  styles: [`
    .greeting { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 20px;
      position: relative; overflow: hidden; }
    .greeting::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--grad-vivid); }
    .greeting h1 { background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .avatar-xl { width: 58px; height: 58px; border-radius: 50%; background: var(--grad-vivid); color: #fff;
      display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 22px; flex: 0 0 auto; box-shadow: var(--glow); }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .stat { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 120px; }
    .stat .num { font-size: 36px; font-weight: 800; line-height: 1; background: var(--grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .forum-stat { color: var(--brand); }
    .sec { margin: 28px 0 14px; }
    .actions { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .action { background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: 16px;
      padding: 24px 14px; font-size: 15px; font-weight: 700; display: flex; flex-direction: column; gap: 10px; align-items: center; }
    .action app-icon { color: var(--brand); transition: transform var(--t); }
    .action:hover { border-color: var(--brand); color: var(--brand); transform: translateY(-5px); box-shadow: var(--shadow); }
    .action:hover app-icon { transform: scale(1.18); }
    @media (max-width: 720px) { .stats, .actions { grid-template-columns: 1fr 1fr; } }
  `]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private postingService = inject(PostingQueryService);
  private myListingService = inject(MyListingService);
  private router = inject(Router);

  availableCount = signal(0);
  myCount = signal(0);

  ngOnInit(): void {
    this.postingService.search().subscribe((list) => this.availableCount.set(list.length));
    this.myListingService.myListings().subscribe((list) => this.myCount.set(list.length));
  }

  go(path: string): void { this.router.navigateByUrl(path); }
  initials(): string {
    const n = this.auth.user()?.name ?? '?';
    return n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
