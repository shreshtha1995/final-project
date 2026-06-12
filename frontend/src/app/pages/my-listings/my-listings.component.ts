import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PostingService } from '../../core/posting.service';
import { Posting } from '../../models/models';
import { API_ORIGIN } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-my-listings',
  imports: [CurrencyPipe, DatePipe, IconComponent],
  template: `
    <div class="page-head">
      <h1>My Listings</h1>
      <button class="gradient new-btn" (click)="router.navigateByUrl('/create-listing')"><app-icon name="plus" [size]="16" /> New Listing</button>
    </div>

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (listings().length === 0) {
      <div class="card empty">You haven't listed any rooms yet.</div>
    } @else {
      <div class="grid">
        @for (p of listings(); track p.id) {
          <div class="card pg-card">
            @if (canReconfirm(p)) {
              <div class="reconfirm-banner"><app-icon name="clock" [size]="15" /> Posted 7+ days ago — re-confirm it's still vacant</div>
            }
            <div class="photo" [class.placeholder]="!p.imageUrls.length"
                 [style.background-image]="p.imageUrls.length ? 'url(' + imgUrl(p.imageUrls[0]) + ')' : ''"
                 (click)="open(p.id)">
              @if (!p.imageUrls.length) { <app-icon name="home" [size]="42" /> }
            </div>
            <div class="body">
              <div class="pg-name" (click)="open(p.id)" style="cursor:pointer">{{ p.pgName }}</div>
              <div class="muted loc-row"><app-icon name="pin" [size]="14" /> {{ p.officeCampus }}</div>
              <div class="card-row">
                <span class="rent">{{ p.rentAmount | currency: 'INR' : 'symbol' : '1.0-0' }}<span class="muted">/mo</span></span>
                <span class="badge" [class.expired]="p.status === 'EXPIRED'" [class.green]="p.status === 'AVAILABLE'">{{ p.status }}</span>
              </div>
              <div class="muted">{{ p.availableBeds }}/{{ p.totalBeds }} beds vacant · expires {{ p.expiresAt | date: 'mediumDate' }}</div>

              <div class="actions">
                <button class="secondary act" (click)="edit(p.id)"><app-icon name="edit" [size]="15" /> Edit</button>
                <button class="link act" style="color:var(--danger)" (click)="confirmDelete.set(p.id)"><app-icon name="trash" [size]="15" /> Delete</button>
              </div>

              @if (p.status === 'EXPIRED') {
                <button class="gradient act" (click)="reconfirm(p.id)"><app-icon name="refresh" [size]="16" /> Re-activate</button>
              } @else if (canReconfirm(p)) {
                <button class="gradient act" (click)="reconfirm(p.id)"><app-icon name="check" [size]="16" /> Re-confirm available</button>
              }

              @if (confirmDelete() === p.id) {
                <div class="del-confirm">
                  <span class="muted">Delete this listing?</span>
                  <button class="danger" (click)="remove(p.id)">Yes</button>
                  <button class="secondary" (click)="confirmDelete.set(null)">No</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
    @if (message()) { <p class="success">{{ message() }}</p> }
  `,
  styles: [`
    .pg-card { padding: 0; overflow: hidden; display: flex; flex-direction: column; }
    .reconfirm-banner { background: color-mix(in srgb, var(--accent) 22%, transparent); color: var(--warning); font-size: 13px; font-weight: 700; padding: 8px 14px; }
    .photo { height: 150px; background: var(--bg-2) center/cover no-repeat; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 42px; color: var(--muted); }
    .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; }
    .pg-name { font-size: 17px; font-weight: 700; }
    .loc-row { display: inline-flex; align-items: center; gap: 4px; }
    .card-row { display: flex; justify-content: space-between; align-items: center; }
    .rent { color: var(--brand); font-weight: 800; font-size: 16px; }
    .actions { display: flex; gap: 10px; align-items: center; }
    .act { display: inline-flex; align-items: center; gap: 6px; }
    .reconfirm-banner { display: flex; align-items: center; gap: 6px; }
    .new-btn { display: inline-flex; align-items: center; gap: 6px; }
    .del-confirm { display: flex; gap: 8px; align-items: center; }
    .del-confirm button { padding: 6px 12px; }
  `]
})
export class MyListingsComponent implements OnInit {
  private postingService = inject(PostingService);
  router = inject(Router);

  listings = signal<Posting[]>([]);
  loading = signal(false);
  message = signal('');
  confirmDelete = signal<number | null>(null);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.postingService.myListings().subscribe({
      next: (data) => { this.listings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  /** Reconfirm appears only 7+ days after posting (or once the backend flags it). */
  canReconfirm(p: Posting): boolean {
    if (p.status !== 'AVAILABLE') return false;
    if (p.needsReconfirmation) return true;
    const days = (Date.now() - new Date(p.createdAt).getTime()) / 86_400_000;
    return days >= 7;
  }

  reconfirm(id: number): void {
    this.postingService.confirm(id).subscribe(() => {
      this.message.set('Listing re-confirmed — it stays live for another 9 days.');
      this.load();
    });
  }

  edit(id: number): void { this.router.navigate(['/edit-listing', id]); }

  remove(id: number): void {
    this.postingService.remove(id).subscribe(() => {
      this.confirmDelete.set(null);
      this.message.set('Listing deleted.');
      this.load();
    });
  }

  open(id: number): void { this.router.navigate(['/listing', id]); }
  imgUrl(url: string): string { return url.startsWith('http') ? url : API_ORIGIN + url; }
}
