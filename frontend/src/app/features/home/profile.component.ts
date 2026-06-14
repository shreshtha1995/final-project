import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Profile } from '../../models/models';

/** Shows the logged-in user's details and lets them edit phone / delete their account. */
@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  template: `
    <h1>My Profile</h1>
    <p class="muted">Your account details on CampusSync.</p>

    @if (profile(); as p) {
      <div class="card profile-card">
        <div class="phead">
          <span class="avatar-lg">{{ initials(p.name) }}</span>
          <div>
            <div class="pname">{{ p.name }}</div>
            <span class="badge">{{ p.idType === 'EMPLOYEE' ? 'Employee' : 'New Joinee' }}</span>
          </div>
        </div>
        <hr class="divider" />
        <div class="rows">
          <div class="prow"><span class="k">Cognizant ID</span><span class="v">{{ p.cognizantId }}</span></div>
          <div class="prow"><span class="k">Email</span><span class="v">{{ p.email }}</span></div>
          <div class="prow">
            <span class="k">Phone</span>
            @if (editingPhone()) {
              <span class="phone-edit">
                <input [(ngModel)]="phoneInput" maxlength="10" placeholder="10 digits" />
                <button class="secondary" (click)="savePhone()" [disabled]="savingPhone()">Save</button>
                <button class="link" (click)="editingPhone.set(false)">Cancel</button>
              </span>
            } @else {
              <span class="v phone-view">{{ p.phoneNumber }}
                <button class="link" (click)="startEditPhone(p.phoneNumber)">Edit</button>
              </span>
            }
          </div>
          <div class="prow"><span class="k">Gender</span><span class="v">{{ p.gender }}</span></div>
        </div>
        @if (phoneError()) { <p class="error">{{ phoneError() }}</p> }
        @if (phoneMsg()) { <p class="success">{{ phoneMsg() }}</p> }
      </div>

      <div class="card danger-zone">
        <h3>Delete account</h3>
        <p class="muted">This permanently removes your account, your listings, and your forum posts.
          Your Cognizant ID becomes available to register again. This cannot be undone.</p>
        @if (!confirming()) {
          <button class="danger" (click)="confirming.set(true)">Delete my account</button>
        } @else {
          <p class="error">Are you sure? This is permanent.</p>
          <div class="row" style="max-width:360px">
            <button class="danger" [disabled]="deleting()" (click)="remove()">{{ deleting() ? 'Deleting...' : 'Yes, delete' }}</button>
            <button class="secondary" (click)="confirming.set(false)">Cancel</button>
          </div>
        }
        @if (error()) { <p class="error">{{ error() }}</p> }
      </div>
    } @else {
      <p class="muted">Loading...</p>
    }
  `,
  styles: [`
    .profile-card { max-width: 560px; margin-bottom: 18px; }
    .phead { display: flex; align-items: center; gap: 16px; }
    .avatar-lg { width: 64px; height: 64px; border-radius: 50%; background: var(--grad); color: #fff;
      display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 24px; }
    .pname { font-size: 22px; font-weight: 700; }
    .rows { display: flex; flex-direction: column; gap: 12px; }
    .prow { display: flex; justify-content: space-between; gap: 16px; align-items: center; }
    .prow .k { color: var(--muted); }
    .prow .v { font-weight: 600; }
    .phone-view { display: inline-flex; align-items: center; gap: 10px; }
    .phone-edit { display: inline-flex; align-items: center; gap: 8px; }
    .phone-edit input { width: 150px; padding: 7px 10px; }
    .danger-zone { max-width: 560px; border-color: color-mix(in srgb, var(--danger) 40%, var(--border)); }
    .danger-zone h3 { color: var(--danger); }
  `]
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  profile = signal<Profile | null>(null);
  confirming = signal(false);
  deleting = signal(false);
  error = signal('');

  editingPhone = signal(false);
  savingPhone = signal(false);
  phoneInput = '';
  phoneError = signal('');
  phoneMsg = signal('');

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: () => this.error.set('Could not load your profile.')
    });
  }

  startEditPhone(current: string): void {
    this.phoneInput = current;
    this.phoneError.set('');
    this.phoneMsg.set('');
    this.editingPhone.set(true);
  }

  savePhone(): void {
    this.phoneError.set('');
    if (!/^\d{10}$/.test(this.phoneInput.trim())) {
      this.phoneError.set('Phone number must be exactly 10 digits.');
      return;
    }
    this.savingPhone.set(true);
    this.auth.updatePhone(this.phoneInput.trim()).subscribe({
      next: (p) => { this.profile.set(p); this.editingPhone.set(false); this.savingPhone.set(false); this.phoneMsg.set('Phone number updated.'); },
      error: (err) => { this.phoneError.set(err?.error?.message ?? 'Could not update phone.'); this.savingPhone.set(false); }
    });
  }

  remove(): void {
    this.deleting.set(true);
    this.auth.deleteAccount().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: (err) => { this.error.set(err?.error?.message ?? 'Could not delete the account.'); this.deleting.set(false); }
    });
  }

  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
