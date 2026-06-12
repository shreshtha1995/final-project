import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { WishlistService } from './wishlist.service';
import { Posting } from '../../models/models';
import { API_ORIGIN } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';

/** The user's saved listings. */
@Component({
  selector: 'app-wishlist',
  imports: [CurrencyPipe, IconComponent],
  template: `
    <div class="page-head">
      <div>
        <h1>My Wishlist</h1>
        <p class="muted">Rooms you saved. Tap the heart to remove one.</p>
      </div>
    </div>

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (listings().length === 0) {
      <div class="card empty">
        <app-icon name="heart" [size]="34" />
        <p>No saved rooms yet. Open a listing and tap the heart to save it here.</p>
      </div>
    } @else {
      <div class="grid">
        @for (p of listings(); track p.id) {
          <div class="card pg-card">
            <div class="photo" [class.placeholder]="!p.imageUrls.length"
                 [style.background-image]="p.imageUrls.length ? 'url(' + imgUrl(p.imageUrls[0]) + ')' : ''"
                 (click)="open(p.id)">
              @if (!p.imageUrls.length) { <app-icon name="home" [size]="44" /> }
              <span class="vac-pill">{{ p.availableBeds }}/{{ p.totalBeds }} beds free</span>
              <button class="heart-btn saved" (click)="remove(p.id, $event)" title="Remove from wishlist">
                <app-icon name="heart" [filled]="true" [size]="18" />
              </button>
            </div>
            <div class="body" (click)="open(p.id)">
              <div class="pg-name">{{ p.pgName }}</div>
              <div class="muted loc"><app-icon name="pin" [size]="14" /> {{ p.officeCampus }}</div>
              <div class="card-row">
                <span class="rent">{{ p.rentAmount | currency: 'INR' : 'symbol' : '1.0-0' }}<span class="muted">/mo</span></span>
                <span class="badge" [class.expired]="p.status === 'EXPIRED'">{{ p.status }}</span>
              </div>
              <button class="view-btn">View details <app-icon name="arrow-right" [size]="16" /></button>
            </div>
          </div>
        }
      </div>
    }
    @if (message()) { <p class="success">{{ message() }}</p> }
  `,
  styles: [`
    .pg-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
    .photo { height: 170px; background: var(--bg-2) center/cover no-repeat; position: relative; cursor: pointer;
      display: flex; align-items: center; justify-content: center; font-size: 46px; color: var(--muted); }
    .vac-pill { position: absolute; top: 10px; left: 10px; background: var(--success); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
    .heart-btn { position: absolute; top: 8px; right: 8px; width: 36px; height: 36px; border-radius: 50%; padding: 0;
      display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,.92); color: #e11d48; }
    .heart-btn:hover { transform: scale(1.1); box-shadow: none; }
    .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; cursor: pointer; }
    .pg-name { font-size: 17px; font-weight: 700; }
    .loc { font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
    .card-row { display: flex; justify-content: space-between; align-items: center; }
    .rent { color: var(--brand); font-weight: 800; font-size: 16px; }
    .view-btn { margin-top: 4px; width: 100%; background: var(--brand-soft); color: var(--brand-dark); display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
    .empty app-icon { color: #e11d48; display: block; margin: 0 auto 8px; }
  `]
})
export class WishlistComponent implements OnInit {
  private wishlist = inject(WishlistService);
  private router = inject(Router);

  listings = signal<Posting[]>([]);
  loading = signal(false);
  message = signal('');

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.wishlist.list().subscribe({
      next: (data) => { this.listings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  remove(id: number, event: Event): void {
    event.stopPropagation();
    this.wishlist.remove(id).subscribe(() => {
      this.message.set('Removed from wishlist.');
      this.load();
    });
  }

  open(id: number): void { this.router.navigate(['/listing', id]); }
  imgUrl(url: string): string { return url.startsWith('http') ? url : API_ORIGIN + url; }
}
