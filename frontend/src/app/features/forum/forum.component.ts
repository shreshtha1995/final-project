import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ForumService } from './forum.service';
import { Answer, CreateDoubtRequest, Doubt, DoubtCategory } from '../../models/models';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-forum',
  imports: [FormsModule, DatePipe, IconComponent],
  template: `
    <div class="page-head">
      <div>
        <h1>Community Forum</h1>
        <p class="muted">Ask verified colleagues about cities, transport, PGs and more.</p>
      </div>
      <button class="gradient" (click)="showAsk.set(!showAsk())">{{ showAsk() ? 'Close' : '+ Ask a question' }}</button>
    </div>

    <div class="chips-bar">
      <button class="chip" [class.active]="!category" (click)="setCategory(undefined)">All</button>
      @for (c of categories; track c) {
        <button class="chip" [class.active]="category === c" (click)="setCategory(c)">{{ label(c) }}</button>
      }
    </div>

    @if (showAsk()) {
      <div class="card ask-card">
        <h3>Ask the community</h3>
        <label class="req">Title</label>
        <input [(ngModel)]="newDoubt.title" placeholder="Short summary of your question" />
        @if (!category) {
          <label class="req">Category</label>
          <select [(ngModel)]="newDoubt.category">
            @for (c of categories; track c) { <option [ngValue]="c">{{ label(c) }}</option> }
          </select>
        } @else {
          <p class="muted">Posting under <strong>{{ label(category!) }}</strong></p>
        }
        <label class="req">Question</label>
        <textarea [(ngModel)]="newDoubt.content" placeholder="Describe your question..."></textarea>
        <div style="margin-top:12px"><button class="gradient" (click)="ask()">Post question</button></div>
        @if (error()) { <p class="error">{{ error() }}</p> }
      </div>
    }

    @if (doubts().length === 0) {
      <div class="card empty">No questions in this category yet. Be the first to ask!</div>
    } @else {
      @for (d of visibleDoubts(); track d.id) {
        <div class="card post">
          <span class="tag">{{ label(d.category) }}</span>
          <h3 class="q-title">{{ d.title }}</h3>
          <p class="q-body">{{ d.content }}</p>
          <div class="meta">Asked by {{ d.askedByName }} · {{ d.createdAt | date: 'medium' }}</div>

          <button class="replies-toggle" (click)="toggle(d)">
            <app-icon name="chat" [size]="16" /> {{ d.answerCount || 0 }} {{ (d.answerCount === 1) ? 'reply' : 'replies' }}
            <span class="caret">
              <app-icon [name]="isOpen(d.id) ? 'chevron-up' : 'chevron-down'" [size]="14" />
              {{ isOpen(d.id) ? 'hide' : 'view' }}
            </span>
          </button>

          @if (isOpen(d.id)) {
            <div class="comments">
              @for (a of answers()[d.id] || []; track a.id) {
                <div class="comment">
                  <span class="c-avatar">{{ initials(a.answeredByName) }}</span>
                  <div class="c-body">
                    <div class="c-head"><strong>{{ a.answeredByName }}</strong>
                      <span class="muted">{{ a.createdAt | date: 'short' }}</span></div>
                    <div>{{ a.content }}</div>
                  </div>
                </div>
              } @empty {
                <p class="muted no-c">No replies yet — start the conversation.</p>
              }
              <div class="reply-box">
                <input [(ngModel)]="replyText[d.id]" placeholder="Add a reply..." (keyup.enter)="reply(d)" />
                <button class="gradient" (click)="reply(d)">Reply</button>
              </div>
            </div>
          }
        </div>
      }

      @if (visible() < doubts().length) {
        <div class="center" style="margin-top:8px">
          <button class="secondary" (click)="visible.set(visible() + pageSize)">Load more questions ({{ doubts().length - visible() }} more)</button>
        </div>
      }
    }
  `,
  styles: [`
    .chips-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
    .chip { background: var(--card); color: var(--muted); border: 1px solid var(--border); border-radius: 999px; padding: 7px 16px; font-weight: 600; }
    .chip.active { background: var(--brand); color: #fff; border-color: var(--brand); }
    .ask-card { max-width: 680px; margin-bottom: 18px; }
    .post { margin-bottom: 14px; }
    .q-title { margin: 8px 0 4px; }
    .q-body { color: var(--text); margin: 0 0 8px; }
    .meta { color: var(--muted); font-size: 13px; }
    .replies-toggle { background: var(--brand-soft); color: var(--brand-dark); margin-top: 12px; display: inline-flex; gap: 10px; align-items: center; }
    .caret { font-size: 12px; opacity: .8; display: inline-flex; align-items: center; gap: 3px; }
    .comments { margin-top: 14px; border-top: 1px solid var(--border); padding-top: 14px; max-height: 320px; overflow-y: auto; }
    .comment { display: flex; gap: 10px; padding: 8px 0; }
    .c-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--grad); color: #fff; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; flex: 0 0 auto; }
    .c-body { flex: 1; } .c-head { display: flex; gap: 8px; align-items: baseline; } .no-c { padding: 6px 0; }
    .reply-box { display: flex; gap: 8px; margin-top: 10px; } .reply-box input { flex: 1; } .reply-box button { flex: 0 0 auto; }
  `]
})
export class ForumComponent implements OnInit {
  private forum = inject(ForumService);

  categories: DoubtCategory[] = ['CITIES', 'TRANSPORT', 'PG', 'GENERAL'];
  doubts = signal<Doubt[]>([]);
  answers = signal<Record<number, Answer[]>>({});
  openIds = signal<Set<number>>(new Set());
  showAsk = signal(false);
  error = signal('');

  pageSize = 5;
  visible = signal(this.pageSize);
  visibleDoubts = computed(() => this.doubts().slice(0, this.visible()));

  category?: DoubtCategory;
  replyText: Record<number, string> = {};
  newDoubt: CreateDoubtRequest = { title: '', content: '', category: 'GENERAL' };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.visible.set(this.pageSize);
    this.forum.list(this.category).subscribe((data) => this.doubts.set(data));
  }

  setCategory(c?: DoubtCategory): void {
    this.category = c;
    this.newDoubt.category = c ?? 'GENERAL';
    this.load();
  }

  isOpen(id: number): boolean { return this.openIds().has(id); }

  toggle(d: Doubt): void {
    const set = new Set(this.openIds());
    if (set.has(d.id)) { set.delete(d.id); } else { set.add(d.id); this.loadAnswers(d.id); }
    this.openIds.set(set);
  }

  private loadAnswers(id: number): void {
    this.forum.getById(id).subscribe((full) => {
      this.answers.set({ ...this.answers(), [id]: full.answers ?? [] });
    });
  }

  reply(d: Doubt): void {
    const text = (this.replyText[d.id] ?? '').trim();
    if (!text) return;
    this.forum.answer(d.id, text).subscribe(() => {
      this.replyText[d.id] = '';
      this.loadAnswers(d.id);
      this.doubts.set(this.doubts().map((x) => x.id === d.id ? { ...x, answerCount: (x.answerCount || 0) + 1 } : x));
    });
  }

  ask(): void {
    this.error.set('');
    if (!this.newDoubt.title.trim() || !this.newDoubt.content.trim()) {
      this.error.set('Title and question are required.');
      return;
    }
    this.forum.ask(this.newDoubt).subscribe(() => {
      this.newDoubt = { title: '', content: '', category: this.category ?? 'GENERAL' };
      this.showAsk.set(false);
      this.load();
    });
  }

  label(c: DoubtCategory): string {
    return { CITIES: 'Cities', TRANSPORT: 'Transport', PG: 'PG / Housing', GENERAL: 'General' }[c];
  }
  initials(name: string): string {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  }
}
