import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminService } from './admin.service';
import { DirectoryEntry, IdType, UserSummary } from '../../models/models';

type Filter = 'ALL' | 'EMPLOYEE' | 'CANDIDATE';

/** Super Admin panel: view, add, filter, paginate and delete valid Cognizant IDs. */
@Component({
  selector: 'app-admin',
  imports: [FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  // This is the admin service used to make API calls to the backend for admin related operations.
  // Methods inside this service allow you to:
  //  - Fetch the entire whitelist directory of company IDs
  //  - Pull a summary list of users who have signed up
  //  - Whitelist/add a new corporate identifier
  //  - Delete a registered user profile
  //  - Revoke/delete a whitelisted ID entry entirely
  //  - (Note: Can also be extended to trigger background administrative tasks like an expiry job)
  private admin = inject(AdminService);

  // ==========================================
  // STATE MANAGEMENT (ANGULAR SIGNALS)
  // ==========================================

  // Holds the complete list of corporate IDs loaded from the directory database
  entries = signal<DirectoryEntry[]>([]);

  // Holds the profiles of real users who have created accounts using those IDs
  users = signal<UserSummary[]>([]);

  // Stores the ID of a record undergoing a deletion check (used to toggle the inline "Are you sure?" confirmation layout)
  confirmId = signal<number | null>(null);

  // Tracks the current role filter setting selected by the administrator ('ALL', 'EMPLOYEE', or 'CANDIDATE')
  filter = signal<Filter>('ALL');

  // Tracks the active page index for the data table pagination grid (Starts at page 1)
  page = signal(1);

  // Configures the fixed maximum number of data rows to display simultaneously on a single table page
  pageSize = 8;

  // ==========================================
  // TWO-WAY DATA BINDINGS & TEMPLATE ALERTS
  // ==========================================

  // Standard string variable bound to the "Cognizant ID" text input field for creating new records
  newId = '';

  // Tracks the category assignment for the new ID field, defaulting to an 'EMPLOYEE' configuration
  newType: IdType = 'EMPLOYEE';

  // Reactive banner message text shown upon successful operations (e.g., "Added CTS1234 successfully")
  message = signal('');

  // Reactive warning text shown when user inputs fail strict client/server validation checks
  formError = signal('');

  // ==========================================
  // COMPUTED SIGNALS (AUTOMATIC STATE CALCULATIONS)
  // ==========================================

  // Calculates the count of IDs that have completed registration by looking for true flags
  registeredCount = computed(() => this.entries().filter((e) => e.registered).length);

  // Dynamically filters down the complete database list based on the active role filter selection
  filtered = computed(() =>
    this.filter() === 'ALL' ? this.entries() : this.entries().filter((e) => e.idType === this.filter())
  );

  // Divides total filtered items by the page size configuration to calculate total clickable pagination buttons needed
  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  // Generates an index array of page numbers (e.g., [1, 2, 3]) for rendering individual pagination select buttons
  pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

  // Grabs the exact mathematical slice of records matching the current page index to send to the UI grid table display
  paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  // ==========================================
  // LIFECYCLE HOOKS
  // ==========================================

  // Angular initialization event that automatically triggers data synchronization routines when the view loads
  ngOnInit(): void { this.load(); }

  // ==========================================
  // CORE COMPONENT BUSINESS METHODS
  // ==========================================

  // Fires parallel network requests via the admin service to populate both the whitelist directory and the active users list
  load(): void {
    this.admin.directory().subscribe((data) => this.entries.set(data));
    this.admin.users().subscribe((data) => this.users.set(data));
  }

  // Cross-references a specific directory record against the loaded users array to find the profile tied to that ID
  userFor(cognizantId: string): UserSummary | undefined {
    return this.users().find((u) => u.cognizantId === cognizantId);
  }

  // Helper utility method that tallies up entries belonging to a given ID type for the summary dashboard metric cards
  count(type: IdType): number {
    return this.entries().filter((e) => e.idType === type).length;
  }

  // Orchestrates submission checks and formatting validations before requesting the backend to add a new corporate ID
  add(): void {
    this.message.set('');
    this.formError.set('');

    // Normalize user string input to uppercase letters and trim empty spaces
    const id = this.newId.trim().toUpperCase();

    // Set strict validation patterns depending on whether the record type is an Employee or a Candidate
    const pattern = this.newType === 'EMPLOYEE' ? /^CTS\d{3,}$/ : /^CAND\d{3,}$/;

    // Block submission if text field is empty
    if (!id) {
      this.formError.set('ID is required.');
      return;
    }

    // Block submission if layout syntax doesn't follow expected formats (CTSxxx vs CANDxxx)
    if (!pattern.test(id)) {
      this.formError.set(this.newType === 'EMPLOYEE'
        ? 'Employee ID must look like CTS1006 (CTS + digits, no spaces).'
        : 'Candidate ID must look like CAND2004 (CAND + digits, no spaces).');
      return;
    }

    // Trigger the backend post call; loops back to page one and refreshes layout matrices upon successful handling
    this.admin.addId(id, this.newType).subscribe({
      next: () => {
        this.message.set(`Added ${id} as ${this.newType === 'EMPLOYEE' ? 'Employee' : 'Candidate'}.`);
        this.newId = '';
        this.page.set(1);
        this.load();
      },
      error: (err) => this.formError.set(err?.error?.message ?? 'Could not add the ID.')
    });
  }

  // Context-aware deletion method: If an active profile is bound to an ID, it wipes the profile (releasing the ID back to an open state).
  // Otherwise, if the ID is unclaimed, it deletes the whitelist clearance tracking number entirely from the system.
  remove(e: DirectoryEntry): void {
    this.message.set('');
    this.formError.set('');
    const user = this.userFor(e.cognizantId);

    // Success Callback utility: Resets safety dialog flags, pushes text confirmation notices, and updates UI boards
    const done = (msg: string) => {
      this.confirmId.set(null);
      this.message.set(msg);
      this.load();
    };

    // Failure Callback utility: Extracts backend response details to highlight problems during delete updates
    const fail = (err: any) => {
      this.confirmId.set(null);
      this.formError.set(err?.error?.message ?? 'Could not delete.');
    };

    // Case A: ID is already registered to a user. Wipe the user profile out, converting the tracking ID status back to "Available".
    if (e.registered && user) {
      this.admin.deleteUser(user.id).subscribe({
        next: () => done(`Deleted user ${user.name} (${e.cognizantId}); the ID is now available.`),
        error: fail
      });
    } else {
      // Case B: Open ID. Wipe the unlinked, whitelisted directory placeholder entry entirely from database tables.
      this.admin.deleteId(e.id).subscribe({
        next: () => done(`Deleted ID ${e.cognizantId}.`),
        error: fail
      });
    }
  }

  // Decrements pagination tracking down by one step if the table layout hasn't reached the first page limit
  prev(): void {
    if (this.page() > 1)
      this.page.set(this.page() - 1);
  }

  // Increments pagination tracking up by one step if the table layout hasn't reached the final page limit
  next(): void {
    if (this.page() < this.totalPages())
      this.page.set(this.page() + 1);
  }
}
