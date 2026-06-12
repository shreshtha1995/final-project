import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PostingService } from '../../core/posting.service';
import { AuthService } from '../../core/auth.service';
import { Posting, SharingType, TenantPreference } from '../../models/models';
import { API_ORIGIN, CITIES, LOCATIONS, toCampus } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';

@Component({
  selector: 'app-browse',
  imports: [FormsModule, CurrencyPipe, IconComponent, StarsComponent],
  template: `
    <div class="page-head">
      <div>
        <h1>Browse Rooms</h1>
        <p class="muted">For safe room-sharing, you only see rooms posted by {{ auth.user()?.gender }} colleagues — filtered on the server.</p>
      </div>
    </div>

    <div class="toolbar">
      <div>
        <label>City</label>
        <select [(ngModel)]="city" (change)="area = ''; load()">
          <option [ngValue]="''">All cities</option>
          @for (c of cities; track c) { <option [ngValue]="c">{{ c }}</option> }
        </select>
      </div>
      <div>
        <label>Area</label>
        <select [(ngModel)]="area" (change)="load()" [disabled]="!city">
          <option [ngValue]="''">All areas</option>
          @for (a of areas(); track a) { <option [ngValue]="a">{{ a }}</option> }
        </select>
      </div>
      <div>
        <label>Sharing</label>
        <select [(ngModel)]="sharingType" (change)="load()">
          <option [ngValue]="undefined">Any</option>
          <option value="DOUBLE">Double</option>
          <option value="TRIPLE">Triple</option>
        </select>
      </div>
      <div>
        <label>PG Type</label>
        <select [(ngModel)]="tenantPreference" (change)="load()">
          <option [ngValue]="undefined">Any</option>
          <option value="ANYONE">Co-Living</option>
          @if (auth.user()?.gender === 'MALE') { <option value="MALE_ONLY">Gents</option> }
          @if (auth.user()?.gender === 'FEMALE') { <option value="FEMALE_ONLY">Ladies</option> }
        </select>
      </div>
    </div>

    @if (loading()) {
      <p class="muted">Loading...</p>
    } @else if (listings().length === 0) {
      <div class="card empty">No matching rooms found. Try adjusting the filters.</div>
    } @else {
      <div class="grid">
        @for (p of listings(); track p.id) {
          <div class="card pg-card" (click)="open(p.id)">
            <div class="photo" [class.placeholder]="!p.imageUrls.length"
                 [style.background-image]="p.imageUrls.length ? 'url(' + imgUrl(p.imageUrls[0]) + ')' : ''">
              @if (!p.imageUrls.length) { <app-icon name="home" [size]="44" /> }
              <span class="vac-pill">{{ p.availableBeds }}/{{ p.totalBeds }} beds free</span>
            </div>
            <div class="body">
              <div class="pg-name">{{ p.pgName }}</div>
              <div class="muted loc"><app-icon name="pin" [size]="14" /> {{ p.officeCampus }}</div>
              <div class="card-row">
                <span class="rent">{{ p.rentAmount | currency: 'INR' : 'symbol' : '1.0-0' }}<span class="muted">/mo</span></span>
                <span class="badge">{{ pgType(p.tenantPreference) }}</span>
              </div>
              @if (p.foodRating) {
                <div class="muted rating-row">Food <app-stars [rating]="p.foodRating" [size]="15" /></div>
              } @else {
                <div class="muted">New listing · no reviews yet</div>
              }
              <button class="view-btn">View details <app-icon name="arrow-right" [size]="16" /></button>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .pg-card { padding: 0; overflow: hidden; cursor: pointer; display: flex; flex-direction: column;
      transition: transform var(--t), box-shadow var(--t), border-color var(--t); }
    .pg-card:hover { transform: translateY(-6px); box-shadow: var(--shadow); border-color: color-mix(in srgb, var(--brand) 45%, var(--border)); }
    .pg-card:hover .photo app-icon { transform: scale(1.12); transition: transform var(--t); }
    .photo { height: 170px; background: var(--bg-2) center/cover no-repeat; position: relative; display: flex; align-items: center; justify-content: center; font-size: 46px; color: var(--muted); overflow: hidden; }
    .vac-pill { position: absolute; top: 10px; right: 10px; background: var(--success); color: #fff; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
    .body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 8px; }
    .pg-name { font-size: 17px; font-weight: 700; line-height: 1.2; }
    .loc { font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
    .card-row { display: flex; justify-content: space-between; align-items: center; }
    .rent { color: var(--brand); font-weight: 800; font-size: 16px; }
    .rating-row { display: inline-flex; align-items: center; gap: 6px; }
    .view-btn { margin-top: 4px; width: 100%; background: var(--brand-soft); color: var(--brand-dark); display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
  `]
})
export class BrowseComponent implements OnInit {
  private postingService = inject(PostingService);
  private router = inject(Router);
  auth = inject(AuthService);

  cities = CITIES;
  city = '';
  area = '';
  areas = () => (this.city ? LOCATIONS[this.city] ?? [] : []);

  listings = signal<Posting[]>([]);
  loading = signal(false);
  sharingType?: SharingType;
  tenantPreference?: TenantPreference;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.postingService.search({
      sharingType: this.sharingType,
      city: this.city && !this.area ? this.city : undefined,
      officeCampus: this.city && this.area ? toCampus(this.city, this.area) : undefined,
      tenantPreference: this.tenantPreference
    }).subscribe({
      next: (data) => { this.listings.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  open(id: number): void { this.router.navigate(['/listing', id]); }
  imgUrl(url: string): string { return url.startsWith('http') ? url : API_ORIGIN + url; }
  pgType(p: string): string { return p === 'MALE_ONLY' ? 'Gents' : p === 'FEMALE_ONLY' ? 'Ladies' : 'Co-Living'; }
}
