import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostingQueryService } from '../browse/posting-query.service';
import { PostingManagementService } from './posting-management.service';
import { AuthService } from '../../core/auth.service';
import { CreatePostingRequest, SharingType, TenantPreference } from '../../models/models';
import { API_ORIGIN, CITIES, LOCATIONS, toCampus } from '../../models/locations';
import { IconComponent } from '../../shared/icon.component';

interface Picked { file: File; preview: string; }

/** Create or edit a listing. Candidates (new joinees) post without reviews. */
@Component({
  selector: 'app-create-listing',
  imports: [FormsModule, IconComponent],
  template: `
    <h1>{{ editId() ? 'Edit Listing' : 'List a Room' }}</h1>
    <p class="muted">
      {{ isCandidate()
        ? 'As a new joinee, just share what you know about the room — reviews are optional.'
        : 'Share your vacant bed. Fields marked * are required.' }}
    </p>

    <div class="card form-card">
      <label class="req">PG / Property name</label>
      <input [(ngModel)]="form.pgName" [class.invalid]="showErr() && !form.pgName" />

      <label class="req">Locality &amp; landmark</label>
      <input [(ngModel)]="form.localityAndLandmark" placeholder="e.g. near SIPCOT" [class.invalid]="showErr() && !form.localityAndLandmark" />

      <div class="row">
        <div>
          <label class="req">City</label>
          <select [(ngModel)]="city" (change)="area = ''">
            @for (c of cities; track c) { <option [ngValue]="c">{{ c }}</option> }
          </select>
        </div>
        <div>
          <label class="req">Office area</label>
          <select [(ngModel)]="area" [class.invalid]="showErr() && !area">
            <option value="" disabled>Select area</option>
            @for (a of areas(); track a) { <option [ngValue]="a">{{ a }}</option> }
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label class="req">Sharing type</label>
          <select [(ngModel)]="form.sharingType" (change)="clampBeds()">
            <option value="DOUBLE">Double (2 beds)</option>
            <option value="TRIPLE">Triple (3 beds)</option>
          </select>
        </div>
        <div>
          <label class="req">Vacant beds</label>
          <select [(ngModel)]="form.availableBeds">
            @for (n of bedOptions(); track n) { <option [ngValue]="n">{{ n }} of {{ totalBeds() }}</option> }
          </select>
        </div>
        <div>
          <label class="req">PG Type</label>
          <select [(ngModel)]="form.tenantPreference">
            @if (gender() === 'MALE') { <option value="MALE_ONLY">Gents PG (male only)</option> }
            @if (gender() === 'FEMALE') { <option value="FEMALE_ONLY">Ladies PG (female only)</option> }
            <option value="ANYONE">Co-Living PG (anyone)</option>
          </select>
        </div>
      </div>

      <label class="req">Rent (₹ / month)</label>
      <input type="number" [(ngModel)]="form.rentAmount" min="1" [class.invalid]="showErr() && form.rentAmount <= 0" />

      @if (!isCandidate()) {
        <div class="row">
          <div>
            <label class="req">Food rating</label>
            <select [(ngModel)]="form.foodRating">
              @for (n of [1,2,3,4,5]; track n) { <option [ngValue]="n">{{ n }} ★</option> }
            </select>
          </div>
          <div>
            <label class="req">Service rating</label>
            <select [(ngModel)]="form.serviceRating">
              @for (n of [1,2,3,4,5]; track n) { <option [ngValue]="n">{{ n }} ★</option> }
            </select>
          </div>
        </div>
        <label class="req">Food review</label>
        <textarea [(ngModel)]="form.foodReview" [class.invalid]="showErr() && !form.foodReview"></textarea>
        <label class="req">Service review</label>
        <textarea [(ngModel)]="form.serviceReview" [class.invalid]="showErr() && !form.serviceReview"></textarea>
      }

      <label>PG photos (optional, you can add several)</label>
      <div style="display:flex; align-items:center; gap:14px; flex-wrap:wrap">
        <label class="file-drop"><app-icon name="camera" [size]="18" /> Add photos
          <input type="file" accept="image/*" multiple hidden (change)="onFiles($event)" />
        </label>
        <span class="muted">{{ existingUrls().length + picked().length }} image(s)</span>
      </div>
      @if (existingUrls().length || picked().length) {
        <div class="preview-grid">
          @for (u of existingUrls(); track u; let i = $index) {
            <div class="preview-tile" [style.background-image]="'url(' + imgSrc(u) + ')'">
              <button type="button" class="rm" (click)="removeExisting(i)"><app-icon name="close" [size]="12" /></button>
            </div>
          }
          @for (p of picked(); track p.preview; let i = $index) {
            <div class="preview-tile" [style.background-image]="'url(' + p.preview + ')'">
              <button type="button" class="rm" (click)="removeNew(i)"><app-icon name="close" [size]="12" /></button>
            </div>
          }
        </div>
      }

      <div style="margin-top:20px">
        <button class="gradient" [disabled]="loading()" (click)="submit()">
          {{ loading() ? 'Saving...' : (editId() ? 'Save changes' : 'Publish listing') }}
        </button>
      </div>
      @if (error()) { <p class="error">{{ error() }}</p> }
    </div>
  `,
  styles: [`
    .form-card { max-width: 720px; }
    .preview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px,1fr)); gap: 10px; margin-top: 12px; }
    .preview-tile { position: relative; height: 90px; border-radius: 10px; background: var(--bg-2) center/cover no-repeat; border: 1px solid var(--border); }
    .rm { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; padding: 0; border-radius: 50%; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; }
  `]
})
export class CreateListingComponent implements OnInit {
  private postingQuery = inject(PostingQueryService);
  private postingService = inject(PostingManagementService);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cities = CITIES;
  city = CITIES[0];
  area = '';
  areas = () => LOCATIONS[this.city] ?? [];

  loading = signal(false);
  error = signal('');
  showErr = signal(false);
  picked = signal<Picked[]>([]);
  existingUrls = signal<string[]>([]);
  editId = signal<number | null>(null);

  isCandidate = () => this.auth.user()?.idType === 'CANDIDATE';
  gender = () => this.auth.user()?.gender;
  totalBeds = () => (this.form.sharingType === 'TRIPLE' ? 3 : 2);
  // The provider occupies one bed, so the most they can offer is (total - 1).
  // Plain method (not computed) so it re-evaluates when sharing type changes.
  bedOptions(): number[] {
    const max = this.totalBeds() - 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }

  form: CreatePostingRequest = {
    pgName: '', localityAndLandmark: '', officeCampus: '',
    sharingType: 'DOUBLE' as SharingType, tenantPreference: 'ANYONE' as TenantPreference,
    availableBeds: 1, rentAmount: 0,
    foodRating: 5, foodReview: '', serviceRating: 5, serviceReview: '', imageUrls: []
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(Number(id));
      this.postingQuery.getById(Number(id)).subscribe((p) => {
        this.form = {
          pgName: p.pgName, localityAndLandmark: p.localityAndLandmark, officeCampus: p.officeCampus,
          sharingType: p.sharingType, tenantPreference: p.tenantPreference,
          availableBeds: p.availableBeds, rentAmount: p.rentAmount,
          foodRating: p.foodRating, foodReview: p.foodReview, serviceRating: p.serviceRating,
          serviceReview: p.serviceReview, imageUrls: []
        };
        this.existingUrls.set(p.imageUrls ?? []);
        const [cityPart, areaPart] = p.officeCampus.split(' - ');
        if (cityPart && this.cities.includes(cityPart)) { this.city = cityPart; this.area = areaPart ?? ''; }
      });
    }
  }

  clampBeds(): void {
    const max = this.totalBeds() - 1; // provider keeps one bed
    if (this.form.availableBeds > max) this.form.availableBeds = max;
  }

  onFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const next = Array.from(input.files ?? []).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    this.picked.set([...this.picked(), ...next]);
    input.value = '';
  }
  removeNew(i: number): void { this.picked.set(this.picked().filter((_, idx) => idx !== i)); }
  removeExisting(i: number): void { this.existingUrls.set(this.existingUrls().filter((_, idx) => idx !== i)); }

  submit(): void {
    this.error.set('');
    this.showErr.set(true);
    const baseValid = !!this.form.pgName && !!this.form.localityAndLandmark && !!this.area && this.form.rentAmount > 0;
    const reviewsValid = this.isCandidate() || (!!this.form.foodReview && !!this.form.serviceReview);
    if (!baseValid || !reviewsValid) {
      this.error.set('Please fill all required (*) fields.');
      return;
    }
    this.form.officeCampus = toCampus(this.city, this.area);
    // New joinees don't review; never send rating data for them.
    if (this.isCandidate()) {
      this.form.foodRating = null;
      this.form.foodReview = null;
      this.form.serviceRating = null;
      this.form.serviceReview = null;
    }
    this.loading.set(true);

    const files = this.picked().map((p) => p.file);
    if (files.length) {
      this.postingService.uploadImages(files).subscribe({
        next: (res) => { this.form.imageUrls = [...this.existingUrls(), ...res.urls]; this.save(); },
        error: (err) => { this.error.set(this.readError(err)); this.loading.set(false); }
      });
    } else {
      this.form.imageUrls = [...this.existingUrls()];
      this.save();
    }
  }

  private save(): void {
    const obs = this.editId()
      ? this.postingService.update(this.editId()!, this.form)
      : this.postingService.create(this.form);
    obs.subscribe({
      next: () => this.router.navigateByUrl('/my-listings'),
      error: (err) => { this.error.set(this.readError(err)); this.loading.set(false); }
    });
  }

  imgSrc(url: string): string { return url.startsWith('http') ? url : API_ORIGIN + url; }
  private readError(err: any): string {
    if (err?.error?.fieldErrors) return Object.values(err.error.fieldErrors).join(' ');
    return err?.error?.message ?? 'Could not save the listing.';
  }
}
