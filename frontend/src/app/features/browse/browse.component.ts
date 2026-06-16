<<<<<<< HEAD
import { Component } from '@angular/core';
=======
<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { PostingQueryService } from './posting-query.service';
import { AuthService } from '../../core/auth.service';
import { Posting, SharingType, TenantPreference } from '../../models/models';
import { API_ORIGIN, CITIES, LOCATIONS, toCampus } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';
import { StarsComponent } from '../../shared/stars.component';
>>>>>>> 16493f3e204aa3a0cbeb57d8b70bcf298dd0edce

/** STUB — implemented by M4 · Browse Rooms. See TEAM_PLAN.md. */
@Component({
  selector: 'app-browse',
  template: `
    <section class="card stub">
      <h2>Browse Rooms</h2>
      <p class="muted">Coming soon — owned by <strong>M4 · Browse (filters + detail)</strong>.</p>
    </section>
  `,
  styles: [`.stub { max-width: 560px; margin: 48px auto; text-align: center; }`]
})
<<<<<<< HEAD
export class BrowseComponent {}
=======
export class BrowseComponent implements OnInit {
  private postingService = inject(PostingQueryService);
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
=======
import { Component } from '@angular/core';

/** STUB — implemented by M4 · Browse Rooms. See TEAM_PLAN.md. */
@Component({
  selector: 'app-browse',
  template: `
    <section class="card stub">
      <h2>Browse Rooms</h2>
      <p class="muted">Coming soon — owned by <strong>M4 · Browse (filters + detail)</strong>.</p>
    </section>
  `,
  styles: [`.stub { max-width: 560px; margin: 48px auto; text-align: center; }`]
})
export class BrowseComponent {}
>>>>>>> origin/main
>>>>>>> 16493f3e204aa3a0cbeb57d8b70bcf298dd0edce
