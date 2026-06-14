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
export class AdminComponent {}
