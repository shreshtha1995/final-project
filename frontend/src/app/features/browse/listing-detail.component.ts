import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostingQueryService } from './posting-query.service';
//import { WishlistService } from '../my-collection/wishlist.service';
import { Posting } from '../../models/models';
import { API_ORIGIN } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';

/** Full details of a single listing (opened when a card is clicked). */
@Component({
  selector: 'app-listing-detail',
  imports: [CurrencyPipe, RouterLink, IconComponent, StarsComponent],
  template: `
    <a routerLink="/browse" class="back-link">← Back to listings</a>

    @if (posting(); as p) {
      <div class="detail">
        <div class="gallery">
          @if (images().length) {
            <div class="main-img" [style.background-image]="'url(' + images()[active()] + ')'"></div>
            @if (images().length > 1) {
              <div class="thumbs">
                @for (img of images(); track img; let i = $index) {
                  <div class="thumb" [class.sel]="i === active()" [style.background-image]="'url(' + img + ')'" (click)="active.set(i)"></div>
                }
              </div>
            }
          } @else {
            <div class="main-img placeholder"><app-icon name="home" [size]="64" /></div>
          }
        </div>

        <div class="info card">
          <div class="d-head">
            <h1>{{ p.pgName }}</h1>
            <div class="head-right">
              <span class="badge" [class.expired]="p.status === 'EXPIRED'">{{ p.status }}</span>
             <button class="heart-btn" [class.saved]="saved()"> 
                <!-- (click)="toggleWishlist(p.id)" [title]="saved() ? 'Remove from wishlist' : 'Save to wishlist'"> -->
                <app-icon name="heart" [filled]="saved()" [size]="22" />
              </button>
            </div>
          </div>
          <p class="muted">{{ p.localityAndLandmark }}</p>
          <div class="chips">
            <span class="badge">{{ p.officeCampus }}</span>
            <span class="badge amber">{{ p.sharingType }} sharing</span>
            <span class="badge green">{{ pgType(p.tenantPreference) }}</span>
          </div>

          <div class="rent">{{ p.rentAmount | currency: 'INR' : 'symbol' : '1.0-0' }} <span class="muted">/ month</span></div>

          <div class="vacancy">
            <span class="muted">Vacancy</span>
            <div class="beds">
              @for (b of bedArray(p); track $index) { <app-icon name="bed" [size]="22" class="bed" [class.free]="b" /> }
            </div>
            <strong>{{ p.availableBeds }} of {{ p.totalBeds }} beds vacant</strong>
          </div>

          @if (p.foodRating || p.serviceRating) {
            <hr class="divider" />
            <div class="reviews">
              @if (p.foodRating) {
                <div>
                  <div class="rev-label">Food <app-stars [rating]="p.foodRating" [size]="16" /></div>
                  @if (p.foodReview) { <p class="muted">“{{ p.foodReview }}”</p> }
                </div>
              }
              @if (p.serviceRating) {
                <div>
                  <div class="rev-label">Service <app-stars [rating]="p.serviceRating" [size]="16" /></div>
                  @if (p.serviceReview) { <p class="muted">“{{ p.serviceReview }}”</p> }
                </div>
              }
            </div>
          } @else {
            <hr class="divider" />
            <p class="muted">This listing was posted by a new joinee, so it has no lived-in reviews yet.</p>
          }

          <hr class="divider" />
          <div class="contact">
            <div><strong>{{ p.providerName }}</strong><div class="muted">Provider</div></div>
            <div class="phone"><app-icon name="phone" [size]="18" /> {{ p.providerPhone }}</div>
          </div>
          <p class="muted" style="margin-top:8px">Contact the provider to coordinate and finalise offline.</p>
        </div>
      </div>
    } @else if (error()) {
      <div class="card empty">{{ error() }}</div>
    } @else {
      <p class="muted">Loading...</p>
    }
  `,
  styles: [`
    .back-link { display: inline-block; margin-bottom: 14px; font-weight: 600; }
    .detail { display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px; align-items: start; }
    @media (max-width: 820px) { .detail { grid-template-columns: 1fr; } }
    .main-img { height: 340px; border-radius: 16px; background: var(--bg-2) center/cover no-repeat; box-shadow: var(--shadow-sm); }
    .main-img.placeholder { display: flex; align-items: center; justify-content: center; font-size: 64px; color: var(--muted); }
    .thumbs { display: flex; gap: 10px; margin-top: 12px; flex-wrap: wrap; }
    .thumb { width: 74px; height: 60px; border-radius: 10px; background: var(--bg-2) center/cover no-repeat; cursor: pointer; border: 2px solid transparent; }
    .thumb.sel { border-color: var(--brand); }
    .d-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .head-right { display: flex; align-items: center; gap: 10px; flex: 0 0 auto; }
    .heart-btn { background: var(--bg-2); color: var(--muted); width: 42px; height: 42px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center; padding: 0; transition: all var(--t); }
    .heart-btn:hover { color: #e11d48; transform: scale(1.1); box-shadow: none; }
    .heart-btn.saved { color: #e11d48; background: color-mix(in srgb, #e11d48 14%, transparent); }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0; }
    .rent { font-size: 26px; font-weight: 800; color: var(--brand); margin: 6px 0; }
    .beds { display: flex; gap: 6px; margin: 6px 0; }
    .bed { color: var(--muted); opacity: .45; }
    .bed.free { color: var(--success); opacity: 1; }
    .reviews { display: flex; flex-direction: column; gap: 14px; }
    .rev-label { font-weight: 700; display: inline-flex; align-items: center; gap: 8px; }
    .contact { display: flex; justify-content: space-between; align-items: center; }
    .phone { font-weight: 700; font-size: 18px; color: var(--brand-dark); display: inline-flex; align-items: center; gap: 8px; }
  `]
})
export class ListingDetailComponent implements OnInit {
  private postingService = inject(PostingQueryService);
  private route = inject(ActivatedRoute);

  //private wishlist = inject(WishlistService);

  posting = signal<Posting | null>(null);
  error = signal('');
  active = signal(0);
  saved = signal(false);
  images = computed(() => (this.posting()?.imageUrls ?? []).map((u) => this.imgUrl(u)));

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.postingService.getById(id).subscribe({
      next: (p) => this.posting.set(p),
      error: () => this.error.set('Listing not found.')
    });
    //this.wishlist.savedIds().subscribe((ids) => this.saved.set(ids.includes(id)));
  }

  // toggleWishlist(id: number): void {
  //   if (this.saved()) {
  //     this.wishlist.remove(id).subscribe(() => this.saved.set(false));
  //   } else {
  //     this.wishlist.add(id).subscribe(() => this.saved.set(true));
  //   }
  // }

  bedArray(p: Posting): boolean[] { return Array.from({ length: p.totalBeds }, (_, i) => i < p.availableBeds); }
  imgUrl(url: string): string { return url.startsWith('http') ? url : API_ORIGIN + url; }
  pgType(p: string): string { return p === 'MALE_ONLY' ? 'Gents PG' : p === 'FEMALE_ONLY' ? 'Ladies PG' : 'Co-Living PG'; }
}
