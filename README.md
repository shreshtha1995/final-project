# CampusSync

**Verified Co-living & Accommodation Platform for Employees.**

A closed, identity-verified platform where Cognizant employees and candidates can **offer**
(Provider) and **discover** (Seeker) shared rooms near their office, plus a trusted community
forum. Every user is verified against the Super Admin's company directory, so a flatmate is
always a genuine colleague.

This repo has two parts:

| Folder      | Tech                                              | Runs on |
|-------------|---------------------------------------------------|---------|
| `backend/`  | Spring Boot 3 · Spring Data JPA · Spring Security + JWT · MySQL | `:8081` |
| `frontend/` | Angular 21 (standalone components, signals)       | `:4200` |

---

## 1. Architecture (the 60-second pitch)

A classic **three-tier web app**:

```
Angular SPA  ──HTTP/JSON (JWT)──▶  Spring Boot REST API  ──JPA/Hibernate──▶  MySQL
 (frontend)                          (backend)                               (campus_sync)
```

- **Frontend** – Angular single-page app. Talks to the backend over REST. A JWT is stored in
  `localStorage` and attached to every request by an HTTP interceptor. A route guard protects
  the logged-in area.
- **Backend** – Stateless Spring Boot REST service. Layered as
  **Controller → Service → Repository → Entity**. Security is JWT-based (no server sessions).
  A `@Scheduled` job cleans up stale listings.
- **Database** – MySQL. Tables are generated from JPA entities (`ddl-auto=update`).

---

## 2. Backend layout

```
com.campussync
├── model/            JPA entities  (CompanyDirectory, User, Posting, Doubt, Answer) + enums
├── repository/       Spring Data JPA repositories (interfaces only)
├── dto/              Request/response records (auth, posting, forum)
├── service/          Business logic (AuthService, PostingService, DoubtService, scheduler)
├── controller/       REST endpoints (AuthController, PostingController, DoubtController)
├── security/         JwtUtil, JwtAuthenticationFilter, CustomUserDetailsService, CurrentUserService
├── config/           SecurityConfig (filter chain, CORS, BCrypt), DataSeeder
└── exception/        ApiException + GlobalExceptionHandler (clean JSON errors)
```

### Key design decisions to talk about
1. **Verified onboarding (FR-1).** Sign-up is a two-step flow: first the Cognizant ID is checked
   against `company_directory` (must *exist* and be *unused*); only then is the account created
   and the ID marked `is_registered = true` so it can never be reused.
2. **Server-side gender matching (FR-4).** The *seeker never sees ineligible rooms*. The filter
   lives in `PostingService.search()` / the repository query — a MALE seeker only gets
   `MALE_ONLY` + `ANYONE` listings. Doing it on the server (not the client) is the security point.
3. **Mandatory ratings (FR-6).** Bean Validation on `CreatePostingRequest`
   (`@Min(1) @Max(5)`, `@NotBlank`) blocks a listing from going live without food/service
   ratings and reviews.
4. **Stateless JWT auth.** `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`,
   validates it, and populates the `SecurityContext`. Passwords are BCrypt-hashed.
5. **Auto-cleanup (FR-9).** `ListingCleanupScheduler` runs daily (`@Scheduled` cron) and flips
   listings whose `expires_at` has passed to `EXPIRED`. Listings live 14 days
   (12-day prompt + 2-day grace); a provider can re-confirm to reset the clock.

---

## 3. API endpoints

| Method | Path                       | Auth | Purpose |
|--------|----------------------------|------|---------|
| POST   | `/api/auth/verify-id`      | ❌   | Check a Cognizant ID (step 1 of signup) |
| POST   | `/api/auth/signup`         | ❌   | Create account, returns JWT |
| POST   | `/api/auth/login`          | ❌   | Authenticate, returns JWT |
| GET    | `/api/postings`            | ✅   | Discover rooms (gender filter + optional sharing/location) |
| GET    | `/api/postings/locations`  | ✅   | Distinct office locations for the dropdown |
| GET    | `/api/postings/mine`       | ✅   | The logged-in provider's listings |
| GET    | `/api/postings/{id}`       | ✅   | Listing detail (incl. provider phone) |
| POST   | `/api/postings`            | ✅   | Create a listing (ratings required) |
| POST   | `/api/postings/{id}/confirm` | ✅ | Re-confirm a listing, extend expiry |
| POST   | `/api/postings/upload-image` | ✅ | Upload a PG image (multipart), returns its URL |
| GET    | `/api/doubts`              | ✅   | List forum questions (optional category) |
| GET    | `/api/doubts/{id}`         | ✅   | Question + its answers |
| POST   | `/api/doubts`              | ✅   | Ask a question |
| POST   | `/api/doubts/{id}/answers` | ✅   | Reply to a question |
| GET    | `/api/admin/directory`     | 🔒 admin | View all valid Cognizant IDs |
| POST   | `/api/admin/directory`     | 🔒 admin | Add a new valid Cognizant ID |
| GET    | `/uploads/{file}`          | ❌   | Serve an uploaded PG image |

---

## 4. Database schema

`COMPANY_DIRECTORY`, `USERS`, `POSTINGS`, `DOUBTS`, `ANSWERS` — created automatically from the
JPA entities on first run. Relationships: a `User` has many `Postings`, `Doubts`, and `Answers`;
a `Doubt` has many `Answers`.

---

## 5. How to run

### Prerequisites
- Java 21, Maven 3.9+
- Node 18+ and Angular CLI
- MySQL running on `localhost:3306` with user `root` / password `Root@123`
  *(change `spring.datasource.password` in `backend/src/main/resources/application.properties` if different)*

### Backend
```bash
cd backend
mvn spring-boot:run
```
On first start it creates the `campus_sync` database, generates the tables, seeds demo IDs,
and seeds a default **Super Admin** account. Uploaded PG images are stored in `backend/uploads/`
and served at `http://localhost:8081/uploads/<file>`. Runs on **http://localhost:8081**.

### Frontend
```bash
cd frontend
npm install      # already done if you scaffolded here
npm start        # ng serve
```
Runs on **http://localhost:4200**.

---

## 6. Demo flow

### Regular user
1. Go to `http://localhost:4200` → **Create an account**.
2. **Step 1** — choose **Current Employee** or **New Joinee**.
3. **Step 2** — enter a seeded ID for that role: employees `CTS1001–CTS1005`, candidates `CAND2001–CAND2003`.
4. **Step 3** — fill the profile (pick a gender) and sign up → you land on the **Home** page.
5. **List a Room**: pick city **Chennai** → area **Siruseri / Sholinganallur / Tambaram**, add ratings/reviews,
   and **upload a PG photo** → it appears under **My Listings** and in Browse.
6. **Browse Rooms** — filter by city/area & sharing type; you only see listings matching your gender (or co-ed).
7. **Forum** — ask a question, open it, post an answer.

### Super Admin
- Log in with **`admin@campussync.com`** / **`Admin@123`** → lands on the **Admin Panel**.
- View the full company directory and **add new valid Cognizant IDs** (which then become usable for sign-up).

> Tips:
> - Create one MALE and one FEMALE account to demo the server-side gender filter.
> - Revisiting `/login` (e.g. browser Back) clears your session — you must log in again to re-enter.
