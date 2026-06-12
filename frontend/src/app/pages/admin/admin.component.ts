import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/admin.service';
import { DirectoryEntry, IdType, UserSummary } from '../../models/models';

type Filter = 'ALL' | 'EMPLOYEE' | 'CANDIDATE';

/** Super Admin panel: view, add, filter, paginate and delete valid Cognizant IDs. */
@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  template: `
    <div class="page-head">
      <h1>Company Directory</h1>
    </div>

    <div class="stats">
      <div class="stat card"><div class="num">{{ entries().length }}</div><div class="muted">Total IDs</div></div>
      <div class="stat card"><div class="num">{{ count('EMPLOYEE') }}</div><div class="muted">Employees</div></div>
      <div class="stat card"><div class="num">{{ count('CANDIDATE') }}</div><div class="muted">Candidates</div></div>
      <div class="stat card"><div class="num">{{ registeredCount() }}</div><div class="muted">Registered</div></div>
    </div>

    <div class="card add-card">
      <h3>Add a valid ID</h3>
      <div class="row add-row">
        <div>
          <label class="req">ID type</label>
          <select [(ngModel)]="newType" (change)="formError.set('')">
            <option value="EMPLOYEE">Employee</option>
            <option value="CANDIDATE">Candidate</option>
          </select>
        </div>
        <div>
          <label class="req">Cognizant ID</label>
          <input [(ngModel)]="newId" (input)="formError.set('')"
                 [placeholder]="newType === 'EMPLOYEE' ? 'e.g. CTS1006' : 'e.g. CAND2004'"
                 [class.invalid]="!!formError()" />
        </div>
        <div class="add-btn-col">
          <label aria-hidden="true">&nbsp;</label>
          <button class="gradient full-width" (click)="add()">Add ID</button>
        </div>
      </div>
      <div class="hint">{{ newType === 'EMPLOYEE' ? 'Format: CTS followed by digits (e.g. CTS1006)' : 'Format: CAND followed by digits (e.g. CAND2004)' }}</div>
      @if (formError()) { <p class="error">{{ formError() }}</p> }
      @if (message()) { <p class="success">{{ message() }}</p> }
    </div>

    <div class="toolbar">
      <div>
        <label>Show</label>
        <select [ngModel]="filter()" (ngModelChange)="filter.set($event); page.set(1)">
          <option value="ALL">All IDs</option>
          <option value="EMPLOYEE">Employees only</option>
          <option value="CANDIDATE">Candidates only</option>
        </select>
      </div>
    </div>

    <div class="card">
      <table>
        <thead>
          <tr><th>ID</th><th class="col-center">Type</th><th class="col-center">Status</th><th>Registered user</th><th></th></tr>
        </thead>
        <tbody>
          @for (e of paged(); track e.id) {
            <tr>
              <td><strong>{{ e.cognizantId }}</strong></td>
              <td class="col-center">{{ e.idType === 'EMPLOYEE' ? 'Employee' : 'Candidate' }}</td>
              <td class="col-center">
                @if (e.registered) { <span class="badge green">Registered</span> }
                @else { <span class="badge">Available</span> }
              </td>
              <td>
                @if (userFor(e.cognizantId); as u) {
                  <strong>{{ u.name }}</strong> <span class="muted">· {{ u.email }}</span>
                } @else { <span class="muted">—</span> }
              </td>
              <td style="text-align:right">
                @if (confirmId() === e.id) {
                  <span class="confirm-inline">
                    <span class="muted">{{ e.registered ? 'Delete this user?' : 'Delete ID?' }}</span>
                    <button class="link danger-link" (click)="remove(e)">Yes</button>
                    <button class="link" (click)="confirmId.set(null)">No</button>
                  </span>
                } @else {
                  <button class="link danger-link" (click)="confirmId.set(e.id)">Delete</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5" class="muted">No IDs to show.</td></tr>
          }
        </tbody>
      </table>

      @if (totalPages() > 1) {
        <div class="pagination">
          <button (click)="prev()" [disabled]="page() === 1">‹ Prev</button>
          @for (p of pages(); track p) {
            <button [class.active]="p === page()" (click)="page.set(p)">{{ p }}</button>
          }
          <button (click)="next()" [disabled]="page() === totalPages()">Next ›</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 18px; }
    .stat { text-align: center; } .stat .num { font-size: 30px; font-weight: 800; color: var(--brand); }
    .add-card { max-width: 680px; margin-bottom: 18px; }
    .add-row { align-items: flex-start; }
    .add-btn-col { display: flex; flex-direction: column; }
    .add-btn-col button { margin: 0; }
    .confirm-inline { display: inline-flex; align-items: center; gap: 12px; }
    .danger-link { color: var(--danger); }
    .col-center { text-align: center; }
    td .badge { white-space: nowrap; }
    @media (max-width: 720px) { .stats { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminComponent implements OnInit {
  private admin = inject(AdminService);

  entries = signal<DirectoryEntry[]>([]);
  users = signal<UserSummary[]>([]);
  confirmId = signal<number | null>(null);
  filter = signal<Filter>('ALL');
  page = signal(1);
  pageSize = 8;

  newId = '';
  newType: IdType = 'EMPLOYEE';
  message = signal('');
  formError = signal('');

  registeredCount = computed(() => this.entries().filter((e) => e.registered).length);

  filtered = computed(() =>
    this.filter() === 'ALL' ? this.entries() : this.entries().filter((e) => e.idType === this.filter())
  );
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.admin.directory().subscribe((data) => this.entries.set(data));
    this.admin.users().subscribe((data) => this.users.set(data));
  }

  /** The registered user (if any) behind a directory ID. */
  userFor(cognizantId: string): UserSummary | undefined {
    return this.users().find((u) => u.cognizantId === cognizantId);
  }

  count(type: IdType): number {
    return this.entries().filter((e) => e.idType === type).length;
  }

  add(): void {
    this.message.set('');
    this.formError.set('');
    const id = this.newId.trim().toUpperCase();
    const pattern = this.newType === 'EMPLOYEE' ? /^CTS\d{3,}$/ : /^CAND\d{3,}$/;
    if (!id) { this.formError.set('ID is required.'); return; }
    if (!pattern.test(id)) {
      this.formError.set(this.newType === 'EMPLOYEE'
        ? 'Employee ID must look like CTS1006 (CTS + digits, no spaces).'
        : 'Candidate ID must look like CAND2004 (CAND + digits, no spaces).');
      return;
    }
    this.admin.addId(id, this.newType).subscribe({
      next: () => { this.message.set(`Added ${id} as ${this.newType === 'EMPLOYEE' ? 'Employee' : 'Candidate'}.`); this.newId = ''; this.page.set(1); this.load(); },
      error: (err) => this.formError.set(err?.error?.message ?? 'Could not add the ID.')
    });
  }

  /** If the ID belongs to a registered user, delete that user (frees the ID); otherwise delete the ID. */
  remove(e: DirectoryEntry): void {
    this.message.set('');
    this.formError.set('');
    const user = this.userFor(e.cognizantId);
    const done = (msg: string) => { this.confirmId.set(null); this.message.set(msg); this.load(); };
    const fail = (err: any) => { this.confirmId.set(null); this.formError.set(err?.error?.message ?? 'Could not delete.'); };

    if (e.registered && user) {
      this.admin.deleteUser(user.id).subscribe({ next: () => done(`Deleted user ${user.name} (${e.cognizantId}); the ID is now available.`), error: fail });
    } else {
      this.admin.deleteId(e.id).subscribe({ next: () => done(`Deleted ID ${e.cognizantId}.`), error: fail });
    }
  }

  prev(): void { if (this.page() > 1) this.page.set(this.page() - 1); }
  next(): void { if (this.page() < this.totalPages()) this.page.set(this.page() + 1); }
}
