# CampusSync — 7-Member Team Plan

This document defines: **(1)** each person's feature and the exact files they own,
**(2)** the common baseline that must be merged to `main` *before* anyone branches, and
**(3)** the dependency flow + build order.

The codebase is already organised feature-by-feature (Angular `src/app/features/*`,
backend split per feature). That structure is what makes this split possible with
minimal merge conflicts.

---

## 0. Common baseline — merge to `main` FIRST

Nobody branches until this is on `main`, compiling and running. Everyone imports
from it; **treat every file here as read-only during feature work** (change it only
via a small, reviewed PR to `main`).

### Backend (`backend/src/main/java/com/campussync/`)
| Area | Files |
|---|---|
| Boot/config | `CampusSyncApplication.java`, `config/SecurityConfig.java`, `config/WebConfig.java`, `config/DataSeeder.java`, `resources/application.properties`, `pom.xml` |
| Security infra | `security/JwtUtil`, `JwtAuthenticationFilter`, `CurrentUserService`, `CustomUserDetailsService` |
| Errors | `exception/ApiException`, `exception/GlobalExceptionHandler` |
| Shared domain | `model/User`, `model/CompanyDirectory`, all `model/enums/*` (Role, Gender, IdType, PostingStatus, SharingType, TenantPreference, DoubtCategory) |
| Shared repos | `repository/UserRepository`, `repository/CompanyDirectoryRepository`, `repository/PostingRepository` |
| Shared services | `service/EmailService`, `service/PostingSupport` |
| Posting contract | `model/Posting`, `dto/posting/PostingResponse`, `dto/posting/CreatePostingRequest` |

### Frontend (`frontend/`)
| Area | Files |
|---|---|
| Build/config | `package.json`, `package-lock.json`, `angular.json`, `tsconfig*.json`, `.editorconfig`, `.prettierrc` |
| Bootstrap | `src/index.html`, `src/main.ts`, `src/app/app.ts`, `app.config.ts`, `app.html`, `app.css` |
| Routing | `src/app/app.routes.ts` *(already lists every route → no one edits it again)* |
| Design system | `src/app/styles.css` *(CSS variables; style against these — don't edit)* |
| Layout | `src/app/layout/shell.component.ts` *(nav bar already has every link)* |
| Core plumbing | `src/app/core/auth.service`, `auth.guard`, `admin.guard`, `auth.interceptor`, `theme.service` |
| Shared types/UI | `src/app/models/models.ts`, `models/locations.ts`, `shared/icon.component`, `shared/stars.component` |

**Why this kills conflicts:** the three files everyone would otherwise fight over —
`app.routes.ts`, `shell.component.ts` (nav), `SecurityConfig.java` — are already
fully populated in the baseline. Feature work only fills in the component/service a
route already points to. `SecurityConfig`'s `anyRequest().authenticated()` covers
every new endpoint automatically.

---

## 1. Feature ownership (one vertical slice per person)

### M1 — Home & Dashboard (+ Profile)
- **Backend:** `controller/UserController`, `service/UserService`, `dto/auth/ProfileResponse`, `dto/auth/UpdateProfileRequest`
- **Frontend:** `features/home/home.component.ts` (dashboard), `features/home/profile.component.ts`

### M2 — Super Admin
- **Backend:** `controller/AdminController`, `service/AdminService`, `dto/admin/*` (`AddDirectoryIdRequest`, `DirectoryEntryResponse`, `UserSummaryResponse`)
- **Frontend:** `features/admin/admin.component.ts`, `features/admin/admin.service.ts`

### M3 — Auth (Login / Landing / Register)
- **Backend:** `controller/AuthController`, `service/AuthService`, `dto/auth/*` (`LoginRequest`, `SignupRequest`, `AuthResponse`, `VerifyIdRequest`, `VerifyIdResponse`)
- **Frontend:** `features/auth/landing.component.ts`, `login.component.ts`, `signup.component.ts`

### M4 — Browse Rooms (filters + detail)
- **Backend:** `controller/PostingQueryController`, `service/PostingQueryService`
- **Frontend:** `features/browse/browse.component.ts`, `listing-detail.component.ts`, `posting-query.service.ts`

### M5 — List a Room (create / edit / images / expiry)
- **Backend:** `controller/PostingManagementController`, `service/PostingManagementService`, `service/ListingCleanupScheduler`, `service/storage/*` (`ImageStorage`, `LocalImageStorage`, `CloudinaryImageStorage`)
- **Frontend:** `features/list-room/create-listing.component.ts`, `posting-management.service.ts`

### M6 — My Listings + Wishlist
- **Backend:** `controller/MyListingController`, `service/MyListingService`, `controller/WishlistController`, `service/WishlistService`, `model/Wishlist`, `repository/WishlistRepository`
- **Frontend:** `features/my-collection/my-listings.component.ts`, `wishlist.component.ts`, `my-listing.service.ts`, `wishlist.service.ts`

### M7 — Doubts & Forum
- **Backend:** `controller/DoubtController`, `service/DoubtService`, `model/Doubt`, `model/Answer`, `repository/DoubtRepository`, `repository/AnswerRepository`, `dto/forum/*` (`CreateDoubtRequest`, `CreateAnswerRequest`, `DoubtResponse`, `AnswerResponse`)
- **Frontend:** `features/forum/forum.component.ts`, `forum.service.ts`

> Note: `dto/auth/` is shared at the *package* level — M1 owns `ProfileResponse` +
> `UpdateProfileRequest`, M3 owns the rest. Different files, so no conflict.

---

## 2. Dependency flow

### Backend
After the baseline, **every backend feature is self-contained.** All sharing happens
through baseline files (Posting contract, `PostingSupport`, `EmailService`,
`CompanyDirectory`). There are **no backend edges between M1–M7.**

### Frontend — the only cross-feature edges
These come from shared room/wishlist data. Each is a **single method call through an
agreed service interface**, not a shared file:

```
   M3 Auth ──(login → token)──> everyone can reach authenticated pages

   M4 Browse ............ PostingQueryService (search, getById)
        ▲  ▲
        │  └──────────── M5 List   (create-listing uses getById for edit mode)
        │
        └──────────────── M1 Home  (dashboard "rooms available" count = search)

   M6 My-collection ..... MyListingService (myListings) + WishlistService
        ▲  ▲  ▲
        │  │  └─────────── M4 Browse (listing-detail uses WishlistService save/unsave)
        │  └────────────── M1 Home  (dashboard "your listings" count = myListings)
        │
   M5 List ............... PostingManagementService (confirm)
        ▲
        └──────────────── M6 My-collection (my-listings "reconfirm" button = confirm)
```

Read as **"A ──> B" means A is used by B** (B depends on A).

| Depends on | …is needed by | Via |
|---|---|---|
| M3 Auth | everyone | login → JWT to reach any page |
| M4 Browse (`PostingQueryService`) | M1 Home, M5 List | `search`, `getById` |
| M5 List (`PostingManagementService`) | M6 My-collection | `confirm` |
| M6 My-collection (`MyListingService`, `WishlistService`) | M1 Home, M4 Browse | `myListings`, wishlist save/unsave |

---

## 3. Build order — what to do before what

The key distinction:

- **Contract dependency** = you need the *method signature*. → Already satisfied by the
  baseline (`models.ts`, the service classes' shapes are agreed). So **everyone can
  start coding right after Phase 0.**
- **Runtime dependency** = you need the other person's endpoint *live* to see real
  data. → Until it's ready, stub/mock the response; integrate when they merge.

### Phases
| Phase | Who | Why |
|---|---|---|
| **0. Baseline** | — | Merge §0 to `main`. **Blocks everyone.** |
| **1. Auth** | **M3** | Login/signup must work so any authenticated page is reachable & testable. (Seeded users exist via `DataSeeder`, but you still need the login endpoint.) |
| **2. Independent core** | **M2, M4, M5, M7** (parallel) | Each needs only the baseline + login. No edges between them. |
| **3. Collections** | **M6** | Wishlist is independent; `my-listings` consumes M5's `confirm` — start in parallel, integrate after M5. |
| **4. Dashboard** | **M1** | Home counts consume M4 `search` + M6 `myListings`. Build last, or with stubbed counts and wire up when M4/M6 land. |

### Practical rules for the team
1. Branch from the **Phase-0 baseline commit**: `git checkout -b feature/<module>`.
2. **Pull `main` into your branch daily** so integration stays small.
3. Never edit a §0 baseline file in a feature branch — if you must, open a tiny PR to `main` first and tell the team.
4. If you depend on another module's endpoint that isn't merged yet, **mock it** (hardcode the expected response) and swap to the real call after they merge.
5. One owner per file. PRs stay small; build must pass before merge.

### Critical path
```
Baseline ──> M3 Auth ──> { M2, M4, M5, M7 } ──> M6 ──> M1
                          (parallel)
```
M3 first, M1 last; the middle four run fully in parallel.
