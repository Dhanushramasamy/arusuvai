# ARUSUVAI — THE HOME KITCHEN
## Complete Build Specification v2.0
### For AI-assisted implementation in Next.js

> **Instructions for AI system:** This is a complete, self-contained specification. Build the entire application from scratch using the tech stack, database schema, page specifications, wireframes, API routes, and business logic described below. Do not ask clarifying questions — all decisions are made here. Follow every section in order.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Project Setup](#2-tech-stack--project-setup)
3. [Branding & Design Tokens](#3-branding--design-tokens)
4. [Database Schema](#4-database-schema)
5. [Authentication & Role System](#5-authentication--role-system)
6. [Business Logic Rules](#6-business-logic-rules)
7. [File Structure](#7-file-structure)
8. [TypeScript Types](#8-typescript-types)
9. [API Routes](#9-api-routes)
10. [Page Specifications & Wireframes](#10-page-specifications--wireframes)
    - [10.1 Login](#101-login-page)
    - [10.2 Client — Home](#102-client--home)
    - [10.3 Client — Skip Meal](#103-client--skip-meal)
    - [10.4 Client — History](#104-client--history)
    - [10.5 Admin — Today's Orders](#105-admin--todays-orders)
    - [10.6 Admin — Clients](#106-admin--clients)
    - [10.7 Admin — Delivery Persons](#107-admin--delivery-persons)
    - [10.8 Admin — Pricing](#108-admin--pricing)
    - [10.9 Admin — Payments](#109-admin--payments)
    - [10.10 Delivery Person — Today's List](#1010-delivery-person--todays-list)
11. [i18n — English & Tamil](#11-i18n--english--tamil)
12. [Deployment — Vercel + Neon](#12-deployment--vercel--neon)

---

## 1. PROJECT OVERVIEW

**App name:** Arusuvai — The Home Kitchen  
**Purpose:** Tiffin (meal subscription) management system for a home kitchen serving 70–100 office subscribers. Manages subscriptions, daily Lunch & Dinner delivery, skip requests, and delivery-person assignments.  
**Current stack being replaced:** React + Vite + Express + Neon (v1)  
**New stack:** Next.js 14 App Router + TypeScript + Tailwind CSS + Neon PostgreSQL

### Three Roles

| Role | How account is created | Primary job |
|---|---|---|
| **client** | Admin adds manually | View subscription, skip meals, see history |
| **admin** | Seeded in DB | Full control over clients, deliveries, pricing, payments |
| **delivery_person** | Admin adds manually | View assigned deliveries, mark as delivered |

### Service Rules
- Meals offered: **Lunch** and **Dinner** only (no Breakfast)
- Service days: **Monday – Friday** (Saturday and Sunday excluded from all day counts)
- Subscriptions are set manually by admin with a start date, end date, and amount
- When subscription expires, client sees an "expired — contact admin" screen
- Admin has full override ability on all operations
- Skip requests from clients require admin approval before taking effect
- Admin can skip a meal for a client silently (no notification to client)
- Delivery persons see only their assigned list; they cannot access admin features

---

## 2. TECH STACK & PROJECT SETUP

### Stack
```
Framework:      Next.js 14+ (App Router, TypeScript)
Styling:        Tailwind CSS v4
Database:       Neon DB (Serverless PostgreSQL) — existing project
ORM/Driver:     pg (node-postgres) with connection pooling
Icons:          lucide-react
i18n:           i18next + react-i18next + i18next-browser-languagedetector
Animation:      motion (Framer Motion)
Deployment:     Vercel (free tier)
```

### `package.json` dependencies to install
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "~5.5.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "pg": "^8.12.0",
    "lucide-react": "^0.400.0",
    "i18next": "^23.11.0",
    "react-i18next": "^14.1.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "motion": "^11.0.0",
    "dotenv": "^16.4.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/pg": "^8.11.0"
  }
}
```

### Environment variables (`.env.local`)
```env
DATABASE_URL=postgresql://...   # Neon connection string
SESSION_SECRET=<random 32-char string>
NEXT_PUBLIC_APP_NAME=Arusuvai
```

### Session / Auth approach
Use **iron-session** or **jose** for JWT stored in an HttpOnly cookie.  
On login: query `users` table, compare `password_hash`, issue JWT with `{ id, name, role }`.  
Middleware (`middleware.ts`) reads the cookie and redirects based on role:
- `/client/*` — requires role = `client`
- `/admin/*` — requires role = `admin`
- `/delivery/*` — requires role = `delivery_person`
- `/` — redirects to role-appropriate dashboard if logged in, else `/login`

---

## 3. BRANDING & DESIGN TOKENS

### Colors
```css
/* globals.css — CSS custom properties */
:root {
  --color-primary:        #2C5E2E;  /* dark forest green — main brand */
  --color-primary-dark:   #1E4020;  /* hover / active states */
  --color-primary-light:  #EBF5EB;  /* backgrounds, tinted surfaces */
  --color-accent:         #F5A623;  /* warm golden amber — highlights */
  --color-accent-dark:    #D4891A;  /* accent hover */
  --color-accent-light:   #FEF3DC;  /* accent tinted backgrounds */

  --color-surface:        #FFFFFF;
  --color-bg:             #F7F8F5;  /* very light green-tinted page background */
  --color-border:         #E2E8E2;
  --color-text:           #1A2E1A;  /* near-black with green tint */
  --color-text-muted:     #5C6E5C;
  --color-text-light:     #8FA48F;

  /* Status colors */
  --color-success:        #22C55E;
  --color-warning:        #F59E0B;
  --color-error:          #EF4444;
  --color-info:           #3B82F6;
}
```

### Tailwind config additions (`tailwind.config.ts`)
```ts
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#2C5E2E',
        dark:    '#1E4020',
        light:   '#EBF5EB',
      },
      accent: {
        DEFAULT: '#F5A623',
        dark:    '#D4891A',
        light:   '#FEF3DC',
      },
    },
    fontFamily: {
      display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      body:    ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

### Logo usage
- The Arusuvai logo uses "Arusuvai" in dark forest green serif and "THE HOME KITCHEN" in golden amber uppercase sans-serif with four-pointed star decorators.
- On dark backgrounds: invert to white wordmark with amber subtitle.
- In the app header: show "Arusuvai" text in `--color-primary` serif + "The Home Kitchen" small amber label below.
- Favicon: a golden four-pointed star (✦) on green background.

### UI Component conventions
- **Cards**: white background, `border border-[--color-border]`, `rounded-2xl`, `shadow-sm`
- **Primary buttons**: `bg-[--color-primary] hover:bg-[--color-primary-dark] text-white rounded-xl font-bold`
- **Accent buttons**: `bg-[--color-accent] hover:bg-[--color-accent-dark] text-white rounded-xl font-bold`
- **Ghost buttons**: `border border-[--color-border] bg-white hover:bg-[--color-bg] rounded-xl`
- **Tab active**: `bg-[--color-primary] text-white rounded-xl`
- **Tab inactive**: `text-[--color-text-muted] hover:bg-[--color-bg] rounded-xl`
- **Input fields**: `border border-[--color-border] rounded-xl px-4 py-2.5 focus:border-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20`
- **Status badges**:
  - Active / Delivered: green (`bg-green-50 text-green-700 border border-green-200`)
  - Pending / Unpaid: amber (`bg-amber-50 text-amber-700 border border-amber-200`)
  - Expired / Error: red (`bg-red-50 text-red-600 border border-red-200`)
  - Skipped: gray (`bg-gray-100 text-gray-600`)

---

## 4. DATABASE SCHEMA

Run this SQL on your Neon project's query editor. It is a clean v2 schema — drop existing v1 tables first if migrating.

```sql
-- ================================================================
-- ARUSUVAI v2 — DATABASE SCHEMA
-- ================================================================

-- CLEANUP (drops v1 tables too)
DROP TABLE IF EXISTS payments          CASCADE;
DROP TABLE IF EXISTS daily_deliveries  CASCADE;
DROP TABLE IF EXISTS skip_requests     CASCADE;
DROP TABLE IF EXISTS subscriptions     CASCADE;
DROP TABLE IF EXISTS orders            CASCADE;
DROP TABLE IF EXISTS delivery_charges  CASCADE;
DROP TABLE IF EXISTS meal_prices       CASCADE;
DROP TABLE IF EXISTS location_fares    CASCADE;
DROP TABLE IF EXISTS users             CASCADE;

-- ----------------------------------------------------------------
-- TABLE: users
-- ----------------------------------------------------------------
CREATE TABLE users (
    id               VARCHAR(50)  PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    phone_number     VARCHAR(20)  DEFAULT '',
    role             VARCHAR(20)  NOT NULL
                       CHECK (role IN ('client', 'admin', 'delivery_person')),
    location         VARCHAR(255) DEFAULT '',
    username         VARCHAR(50)  UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    delivery_note    TEXT         DEFAULT '',
    is_active        BOOLEAN      NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ  DEFAULT NOW(),
    created_by       VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- TABLE: subscriptions
-- ----------------------------------------------------------------
CREATE TABLE subscriptions (
    id               VARCHAR(50)   PRIMARY KEY,
    client_id        VARCHAR(50)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type             VARCHAR(50)   NOT NULL DEFAULT 'Monthly',
    amount           NUMERIC(10,2) NOT NULL,
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    status           VARCHAR(20)   NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active', 'expired', 'cancelled')),
    notes            TEXT          DEFAULT '',
    created_at       TIMESTAMPTZ   DEFAULT NOW(),
    created_by       VARCHAR(50)   REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ----------------------------------------------------------------
-- TABLE: skip_requests
-- ----------------------------------------------------------------
CREATE TABLE skip_requests (
    id                   VARCHAR(50)  PRIMARY KEY,
    client_id            VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date                 DATE         NOT NULL,
    meal_type            VARCHAR(10)  NOT NULL CHECK (meal_type IN ('Lunch', 'Dinner')),
    status               VARCHAR(20)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'approved', 'rejected')),
    is_admin_initiated   BOOLEAN      NOT NULL DEFAULT false,
    requested_by         VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL,
    requested_at         TIMESTAMPTZ  DEFAULT NOW(),
    approved_at          TIMESTAMPTZ,
    approved_by          VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT unique_skip UNIQUE (client_id, date, meal_type)
);

-- ----------------------------------------------------------------
-- TABLE: daily_deliveries
-- Status lifecycle: pending → assigned → delivered | not_available | skipped
-- ----------------------------------------------------------------
CREATE TABLE daily_deliveries (
    id                   VARCHAR(50)  PRIMARY KEY,
    client_id            VARCHAR(50)  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delivery_person_id   VARCHAR(50)  REFERENCES users(id) ON DELETE SET NULL,
    date                 DATE         NOT NULL,
    meal_type            VARCHAR(10)  NOT NULL CHECK (meal_type IN ('Lunch', 'Dinner')),
    status               VARCHAR(20)  NOT NULL DEFAULT 'pending'
                           CHECK (status IN (
                               'pending', 'assigned', 'delivered',
                               'not_available', 'skipped'
                           )),
    skip_request_id      VARCHAR(50)  REFERENCES skip_requests(id) ON DELETE SET NULL,
    assigned_at          TIMESTAMPTZ,
    delivered_at         TIMESTAMPTZ,
    delivery_note        TEXT         DEFAULT '',
    created_at           TIMESTAMPTZ  DEFAULT NOW(),
    CONSTRAINT unique_delivery UNIQUE (client_id, date, meal_type)
);

-- ----------------------------------------------------------------
-- TABLE: location_fares
-- ----------------------------------------------------------------
CREATE TABLE location_fares (
    location        VARCHAR(255)  PRIMARY KEY,
    charge          NUMERIC(10,2) NOT NULL,
    effective_from  DATE          NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- TABLE: payments
-- id convention: "{client_id}-{year}-{month}"
-- ----------------------------------------------------------------
CREATE TABLE payments (
    id               VARCHAR(100)  PRIMARY KEY,
    client_id        VARCHAR(50)   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id  VARCHAR(50)   REFERENCES subscriptions(id) ON DELETE SET NULL,
    month            INTEGER       NOT NULL CHECK (month BETWEEN 1 AND 12),
    year             INTEGER       NOT NULL,
    amount           NUMERIC(10,2),
    status           VARCHAR(10)   NOT NULL DEFAULT 'unpaid'
                       CHECK (status IN ('paid', 'unpaid')),
    settled_at       DATE,
    created_at       TIMESTAMPTZ   DEFAULT NOW(),
    CONSTRAINT unique_payment UNIQUE (client_id, year, month)
);

-- ----------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------
CREATE INDEX idx_skip_date_status        ON skip_requests(date, status);
CREATE INDEX idx_skip_client_date        ON skip_requests(client_id, date);
CREATE INDEX idx_delivery_date           ON daily_deliveries(date);
CREATE INDEX idx_delivery_person_date    ON daily_deliveries(delivery_person_id, date);
CREATE INDEX idx_delivery_client_date    ON daily_deliveries(client_id, date);
CREATE INDEX idx_subscription_client     ON subscriptions(client_id, status);

-- ----------------------------------------------------------------
-- SEED: default admin account
-- IMPORTANT: change password after first login
-- ----------------------------------------------------------------
INSERT INTO users (id, name, phone_number, role, location, username, password_hash)
VALUES ('admin_1', 'Arusuvai Admin', '', 'admin', 'Kitchen HQ', 'admin', 'admin123');
```

---

## 5. AUTHENTICATION & ROLE SYSTEM

### Login flow
1. User submits username + password at `/login`
2. Server queries `SELECT * FROM users WHERE LOWER(username) = LOWER($1) AND password_hash = $2 AND is_active = true`
3. On match: create a signed JWT `{ id, name, role, location }` → set as HttpOnly cookie `arusuvai_session` (7-day expiry)
4. Redirect to role-appropriate dashboard:
   - `client` → `/client`
   - `admin` → `/admin`
   - `delivery_person` → `/delivery`
5. On failure: show error "Invalid username or password"

### Middleware (`middleware.ts`)
```ts
// Protect all routes under /client, /admin, /delivery
// Read cookie → verify JWT → check role matches path prefix
// Redirect to /login if unauthenticated
// Redirect to own dashboard if role doesn't match path
```

### Route groups in `app/` directory
```
app/
  (public)/login/page.tsx          — unauthenticated
  (client)/client/layout.tsx       — requires role: client
  (admin)/admin/layout.tsx         — requires role: admin
  (delivery)/delivery/layout.tsx   — requires role: delivery_person
```

---

## 6. BUSINESS LOGIC RULES

### Service day counting (Mon–Fri only)

```ts
// Count weekdays (Mon=1 … Fri=5, skip Sat=6, Sun=0) between two dates inclusive
function countServiceDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const d = new Date(startDate);
  while (d <= endDate) {
    const dow = d.getDay(); // 0=Sun, 6=Sat
    if (dow !== 0 && dow !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// Days remaining from today (inclusive) to end date
function servicesDaysRemaining(endDate: Date): number {
  return countServiceDays(new Date(), endDate);
}
```

### Subscription status (computed, not stored)
```ts
function getSubscriptionStatus(sub: Subscription): 'active' | 'expired' | 'not_started' {
  const today = new Date(); today.setHours(0,0,0,0);
  const start = new Date(sub.start_date);
  const end   = new Date(sub.end_date);
  if (today < start) return 'not_started';
  if (today > end)   return 'expired';
  return 'active';
}
```

### Today view — delivery list generation
When admin opens Today tab, call `POST /api/admin/generate-today` which:
1. Queries all users where `role = 'client' AND is_active = true`
2. Checks if today's date has an active subscription (`start_date <= today <= end_date`)
3. For each eligible client, for each meal type (`Lunch`, `Dinner`):
   - Check `skip_requests` for an **approved** skip for this client/date/meal — if found, insert a `daily_deliveries` row with `status = 'skipped'`
   - Otherwise insert with `status = 'pending'`
   - Use `ON CONFLICT (client_id, date, meal_type) DO NOTHING` for idempotency
4. Returns the full delivery list for today

### Skip request flow
```
CLIENT                    SERVER                     ADMIN
  │                          │                         │
  ├─ Submit skip request ───►│                         │
  │                          ├─ INSERT skip_requests   │
  │                          │   status='pending'      │
  │                          │                        ◄├─ Opens Today tab
  │                          │                         ├─ Sees pending badge on row
  │                          │                        ◄├─ Clicks "Approve"
  │                          │◄── PATCH skip_requests ─┤
  │                          │    status='approved'    │
  │                          ├─ UPDATE daily_deliveries│
  │                          │   status='skipped'      │
  │◄── Status update ────────┤                         │
  │    "Lunch skipped —      │                         │
  │     approved by admin"   │                         │
```

### Admin-initiated skip (silent)
- Admin selects a client and a meal from Today's view and clicks "Skip for this user"
- Server: `INSERT skip_requests (is_admin_initiated=true, status='approved')` + `UPDATE daily_deliveries status='skipped'`
- No notification shown to client

### Admin manual add to delivery
- Admin can add a client back to a delivery for a given day (skip reversal or override)
- Server: `DELETE skip_requests` for that client/date/meal (if exists) + `UPDATE daily_deliveries status='pending'`

### Delivery mark as "not available"
- Delivery person opens their list, taps a row, selects "Client not available at site"
- Server: `UPDATE daily_deliveries SET status='not_available', delivery_note='Client not available at site'`
- Row moves out of the delivery person's active list; admin sees it in a separate "Issues" section

### Subscription expiry check
- On every client page load, re-fetch the active subscription
- If `end_date < today`, show the expired screen regardless of stored `status`
- Nightly Vercel cron (optional): `UPDATE subscriptions SET status='expired' WHERE end_date < CURRENT_DATE AND status='active'`

---

## 7. FILE STRUCTURE

```
arusuvai/
├── app/
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (client)/
│   │   └── client/
│   │       ├── layout.tsx              ← client nav shell
│   │       ├── page.tsx                ← home / subscription
│   │       ├── skip/page.tsx
│   │       └── history/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx              ← admin nav shell
│   │       ├── page.tsx                ← today's orders
│   │       ├── clients/page.tsx
│   │       ├── delivery-persons/page.tsx
│   │       ├── pricing/page.tsx
│   │       └── payments/page.tsx
│   ├── (delivery)/
│   │   └── delivery/
│   │       ├── layout.tsx              ← delivery nav shell
│   │       └── page.tsx                ← today's list
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── client/
│       │   ├── subscription/route.ts
│       │   ├── skip-requests/route.ts
│       │   └── history/route.ts
│       ├── admin/
│       │   ├── generate-today/route.ts
│       │   ├── today/route.ts
│       │   ├── skip-requests/[id]/route.ts
│       │   ├── clients/route.ts
│       │   ├── clients/[id]/route.ts
│       │   ├── delivery-persons/route.ts
│       │   ├── assign/route.ts
│       │   ├── pricing/route.ts
│       │   └── payments/route.ts
│       └── delivery/
│           ├── today/route.ts
│           └── deliveries/[id]/route.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Tabs.tsx
│   │   └── LanguageSwitcher.tsx
│   ├── brand/
│   │   └── Logo.tsx
│   ├── client/
│   │   ├── SubscriptionCard.tsx
│   │   ├── SkipMealForm.tsx
│   │   └── OrderHistoryTable.tsx
│   ├── admin/
│   │   ├── TodayDeliveryList.tsx
│   │   ├── SkipRequestBadge.tsx
│   │   ├── AssignDeliveryModal.tsx
│   │   ├── AddClientForm.tsx
│   │   ├── AddDeliveryPersonForm.tsx
│   │   └── PaymentReconciliation.tsx
│   └── delivery/
│       └── DeliveryCard.tsx
├── lib/
│   ├── db.ts                           ← pg Pool singleton
│   ├── auth.ts                         ← JWT sign/verify helpers
│   ├── dateUtils.ts                    ← service day counting
│   └── session.ts                      ← cookie read/write
├── middleware.ts
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       └── ta.json
├── public/
│   └── logo.png
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## 8. TYPESCRIPT TYPES

```ts
// types/index.ts

export type Role = 'client' | 'admin' | 'delivery_person';
export type MealType = 'Lunch' | 'Dinner';
export type SkipStatus = 'pending' | 'approved' | 'rejected';
export type DeliveryStatus = 'pending' | 'assigned' | 'delivered' | 'not_available' | 'skipped';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'not_started';
export type PaymentStatus = 'paid' | 'unpaid';

export interface User {
  id: string;
  name: string;
  phone_number: string;
  role: Role;
  location: string;
  username: string;
  delivery_note: string;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  client_id: string;
  type: string;
  amount: number;
  start_date: string;   // YYYY-MM-DD
  end_date: string;     // YYYY-MM-DD
  status: SubscriptionStatus;
  notes: string;
  // computed on client:
  total_service_days?: number;
  remaining_service_days?: number;
}

export interface SkipRequest {
  id: string;
  client_id: string;
  client_name?: string;    // joined
  phone_number?: string;   // joined
  date: string;
  meal_type: MealType;
  status: SkipStatus;
  is_admin_initiated: boolean;
  requested_at: string;
  approved_at: string | null;
}

export interface DailyDelivery {
  id: string;
  client_id: string;
  client_name?: string;    // joined
  phone_number?: string;   // joined
  location?: string;       // joined
  delivery_note_client?: string; // client's standing note
  delivery_person_id: string | null;
  delivery_person_name?: string; // joined
  date: string;
  meal_type: MealType;
  status: DeliveryStatus;
  skip_request_id: string | null;
  assigned_at: string | null;
  delivered_at: string | null;
  delivery_note: string;   // delivery-time note
}

export interface LocationFare {
  location: string;
  charge: number;
}

export interface Payment {
  id: string;
  client_id: string;
  client_name?: string;
  subscription_id: string | null;
  month: number;
  year: number;
  amount: number | null;
  status: PaymentStatus;
  settled_at: string | null;
}

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  location: string;
}
```

---

## 9. API ROUTES

All routes return `{ success: boolean, data?: any, error?: string }`.  
All admin routes verify `session.role === 'admin'`.  
All delivery routes verify `session.role === 'delivery_person'`.

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | `{ username, password }` → set session cookie |
| POST | `/api/auth/logout` | Clear session cookie |

### Client
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/client/subscription` | Get active subscription for session user |
| GET | `/api/client/history?year=&month=` | Order history for session user |
| GET | `/api/client/skip-requests` | All skip requests for session user |
| POST | `/api/client/skip-requests` | `{ date, meal_type }` → create pending skip request |

### Admin — Today
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/admin/generate-today` | Generate daily_delivery rows for today (idempotent) |
| GET | `/api/admin/today?date=` | Get all deliveries for a given date with skip badges |
| PATCH | `/api/admin/skip-requests/[id]` | `{ status: 'approved'|'rejected' }` |
| POST | `/api/admin/skip-admin` | `{ client_id, date, meal_type }` → admin-initiated silent skip |
| POST | `/api/admin/restore-delivery` | `{ client_id, date, meal_type }` → remove skip, restore to pending |
| POST | `/api/admin/assign` | `{ delivery_ids: string[], delivery_person_id: string }` → bulk assign |

### Admin — Clients
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/clients` | All clients with active subscription summary |
| POST | `/api/admin/clients` | Add new client `{ name, phone_number, location, username, password_hash, subscription: { amount, start_date, end_date } }` |
| PATCH | `/api/admin/clients/[id]` | Update client fields |
| DELETE | `/api/admin/clients/[id]` | Soft delete (`is_active = false`) |
| POST | `/api/admin/clients/[id]/subscription` | Add/renew subscription for client |

### Admin — Delivery Persons
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/delivery-persons` | All delivery persons |
| POST | `/api/admin/delivery-persons` | Add delivery person `{ name, phone_number, username, password_hash }` |
| DELETE | `/api/admin/delivery-persons/[id]` | Soft delete |

### Admin — Pricing & Payments
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/pricing` | All location fares |
| PUT | `/api/admin/pricing` | `{ location, charge }` → upsert |
| GET | `/api/admin/payments?year=&month=` | All client payments for month |
| PUT | `/api/admin/payments` | Toggle payment status |

### Delivery Person
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/delivery/today` | Get deliveries assigned to session user for today |
| PATCH | `/api/delivery/deliveries/[id]` | `{ status: 'delivered'|'not_available', delivery_note? }` |

---

## 10. PAGE SPECIFICATIONS & WIREFRAMES

> Each wireframe below is annotated HTML. Use it to understand layout and component placement. Apply Arusuvai branding (green primary, amber accent) when rendering.

---

### 10.1 LOGIN PAGE

**Route:** `/login`  
**Access:** Public  
**Purpose:** Single login form for all three roles. Role is determined from the database after authentication.

```html
<!-- WIREFRAME: Login Page -->
<html>
<body style="min-height:100vh; background:#1E4020; display:flex; align-items:center; justify-content:center; font-family:sans-serif;">

  <!-- Background: dark green gradient or photo overlay of food/kitchen -->

  <div style="background:white; border-radius:24px; padding:40px; width:420px; box-shadow:0 24px 48px rgba(0,0,0,0.2);">

    <!-- Brand header -->
    <div style="text-align:center; margin-bottom:32px;">
      <!-- Logo icon: gold four-pointed star or leaf on green circle -->
      <div style="width:64px;height:64px;background:#2C5E2E;border-radius:16px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#F5A623;font-size:28px;">✦</span>
      </div>
      <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:900;color:#2C5E2E;margin:0;">Arusuvai</h1>
      <p style="color:#F5A623;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:4px 0 0;">✦ THE HOME KITCHEN ✦</p>
    </div>

    <!-- Form -->
    <form>
      <!-- Username field -->
      <div style="margin-bottom:16px;">
        <label style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:6px;">
          Username
        </label>
        <div style="position:relative;">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8FA48F;">👤</span>
          <input type="text" placeholder="Enter your username"
            style="width:100%;padding:12px 12px 12px 38px;border:1.5px solid #E2E8E2;border-radius:12px;font-size:14px;font-weight:600;color:#1A2E1A;background:#F7F8F5;box-sizing:border-box;" />
        </div>
      </div>

      <!-- Password field -->
      <div style="margin-bottom:24px;">
        <label style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:6px;">
          Password
        </label>
        <div style="position:relative;">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8FA48F;">🔒</span>
          <input type="password" placeholder="••••••••"
            style="width:100%;padding:12px 12px 12px 38px;border:1.5px solid #E2E8E2;border-radius:12px;font-size:14px;font-weight:600;color:#1A2E1A;background:#F7F8F5;box-sizing:border-box;" />
        </div>
      </div>

      <!-- Error message (hidden by default) -->
      <div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:700;color:#DC2626;margin-bottom:16px;display:none;">
        ⚠ Invalid username or password
      </div>

      <!-- Submit button -->
      <button type="submit"
        style="width:100%;padding:14px;background:linear-gradient(135deg,#2C5E2E,#1E4020);color:white;font-weight:800;font-size:14px;border:none;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
        Sign In to Dashboard →
      </button>
    </form>

    <!-- Language switcher -->
    <div style="text-align:center;margin-top:20px;">
      <button style="background:none;border:1px solid #E2E8E2;border-radius:20px;padding:6px 14px;font-size:12px;font-weight:700;color:#5C6E5C;cursor:pointer;">
        தமிழ் / English
      </button>
    </div>
  </div>

</body>
</html>
```

---

### 10.2 CLIENT — HOME

**Route:** `/client`  
**Access:** role = client  
**Purpose:** Shows subscription status, service day count, and today's meal delivery status.

**Data needed:** active subscription, today's daily_delivery rows for this client, any pending skip requests.

**Logic:**
- If subscription is expired: show expired banner, hide meal cards
- If subscription is active: show subscription card + today's Lunch and Dinner cards
- Each meal card shows status: `pending` (will be delivered), `skipped` (skip approved), `delivered` (done), `not_available` (delivery issue)

```html
<!-- WIREFRAME: Client Home -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">

  <!-- HEADER (sticky) -->
  <header style="background:white;border-bottom:1px solid #E2E8E2;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;">
    <div style="display:flex;align-items:center;gap:12px;">
      <div style="width:40px;height:40px;background:#2C5E2E;border-radius:12px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#F5A623;font-size:18px;">✦</span>
      </div>
      <div>
        <div style="font-size:11px;color:#8FA48F;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Good morning</div>
        <div style="font-size:18px;font-weight:800;color:#1A2E1A;font-family:Georgia,serif;">Ramesh Kumar</div>
      </div>
    </div>
    <button style="background:none;border:1px solid #E2E8E2;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;color:#5C6E5C;cursor:pointer;">Sign Out</button>
  </header>

  <!-- BOTTOM TAB NAV -->
  <!-- (shown as top nav here for wireframe clarity) -->
  <nav style="background:white;border-bottom:1px solid #E2E8E2;display:flex;padding:6px;">
    <button style="flex:1;padding:10px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">🏠 Home</button>
    <button style="flex:1;padding:10px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:13px;cursor:pointer;">⏭ Skip Meal</button>
    <button style="flex:1;padding:10px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:13px;cursor:pointer;">📋 History</button>
  </nav>

  <main style="max-width:480px;margin:0 auto;padding:20px 16px;">

    <!-- SUBSCRIPTION CARD -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:20px;padding:20px;margin-bottom:16px;position:relative;overflow:hidden;">
      <!-- Green left stripe -->
      <div style="position:absolute;left:0;top:0;bottom:0;width:4px;background:#2C5E2E;border-radius:2px;"></div>
      <div style="padding-left:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;">Monthly Subscription</span>
          <!-- Status badge -->
          <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">● Active</span>
        </div>

        <!-- Amount -->
        <div style="font-size:28px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;">₹2,500</div>
        <div style="font-size:11px;color:#8FA48F;margin-top:2px;">Monthly plan — Lunch + Dinner</div>

        <!-- Date range row -->
        <div style="display:flex;gap:20px;margin-top:14px;">
          <div>
            <div style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;">Start</div>
            <div style="font-size:13px;font-weight:700;color:#1A2E1A;">01 Jun 2026</div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;">End</div>
            <div style="font-size:13px;font-weight:700;color:#1A2E1A;">30 Jun 2026</div>
          </div>
          <div>
            <div style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;">Service Days</div>
            <div style="font-size:13px;font-weight:700;color:#1A2E1A;">21 days</div>
          </div>
        </div>

        <!-- Remaining days progress bar -->
        <div style="margin-top:14px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span style="font-size:11px;color:#5C6E5C;font-weight:600;">Remaining service days</span>
            <span style="font-size:11px;font-weight:800;color:#2C5E2E;">14 days left</span>
          </div>
          <div style="background:#EBF5EB;border-radius:4px;height:6px;">
            <div style="background:#2C5E2E;height:6px;border-radius:4px;width:66%;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- EXPIRED SUBSCRIPTION STATE (hidden when active) -->
    <div style="background:#FEF2F2;border:1.5px solid #FECACA;border-radius:20px;padding:20px;margin-bottom:16px;text-align:center;display:none;">
      <div style="font-size:28px;margin-bottom:8px;">⚠️</div>
      <div style="font-size:16px;font-weight:800;color:#DC2626;margin-bottom:6px;">Subscription Expired</div>
      <div style="font-size:13px;color:#7F1D1D;">Your subscription ended on 30 May 2026. Please contact the admin to renew.</div>
    </div>

    <!-- TODAY'S MEALS HEADER -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <h2 style="font-size:15px;font-weight:800;color:#1A2E1A;font-family:Georgia,serif;">Today's Meals</h2>
      <span style="font-size:11px;color:#8FA48F;font-weight:600;">Mon, 22 Jun 2026</span>
    </div>

    <!-- LUNCH CARD -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:16px;padding:16px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;background:#EBF5EB;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;">🍱</div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#1A2E1A;">Lunch</div>
            <div style="font-size:11px;color:#8FA48F;">Delivery expected 12:00 – 1:00 PM</div>
          </div>
        </div>
        <!-- Status: pending = green outline "Scheduled", delivered = filled green, skipped = gray -->
        <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;">Scheduled</span>
      </div>
    </div>

    <!-- DINNER CARD (skipped example) -->
    <div style="background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:16px;padding:16px;margin-bottom:10px;opacity:0.8;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:40px;height:40px;background:#F3F4F6;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;">🌙</div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#6B7280;text-decoration:line-through;">Dinner</div>
            <div style="font-size:11px;color:#9CA3AF;">Skipped — approved by admin</div>
          </div>
        </div>
        <span style="background:#F3F4F6;color:#6B7280;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;">Skipped</span>
      </div>
    </div>

    <!-- Delivery note (client's standing note) -->
    <div style="background:#FEF3DC;border:1px solid #F5A623;border-radius:12px;padding:12px;margin-top:8px;">
      <div style="font-size:11px;font-weight:700;color:#D4891A;margin-bottom:2px;">📝 Your Delivery Note</div>
      <div style="font-size:12px;color:#78350F;">"Please ring the bell at Gate 2 — 3rd floor"</div>
    </div>

  </main>
</body>
</html>
```

---

### 10.3 CLIENT — SKIP MEAL

**Route:** `/client/skip`  
**Access:** role = client, active subscription only  
**Purpose:** Client selects a date and meal to skip. A confirmation dialog appears before submission. The skip request is created with `status = 'pending'` and awaits admin approval.

**States:**
- Default: date picker + meal selector
- After submit: "Skip request sent — awaiting admin approval"
- If a skip already exists for that date/meal: show current status
- Cannot submit a skip if one already exists (show existing status instead)

```html
<!-- WIREFRAME: Client Skip Meal -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">

  <!-- Same header as Home (omitted for brevity) -->

  <main style="max-width:480px;margin:0 auto;padding:20px 16px;">

    <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin-bottom:4px;">Skip a Meal</h2>
    <p style="font-size:13px;color:#5C6E5C;margin-bottom:24px;">Select the date and meal you want to skip. Your request will be sent to the admin for approval.</p>

    <!-- Date selection -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:16px;padding:16px;margin-bottom:14px;">
      <label style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:10px;">1. Select Date</label>

      <!-- Quick options -->
      <div style="display:flex;gap:8px;margin-bottom:10px;">
        <button style="flex:1;padding:10px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">Today</button>
        <button style="flex:1;padding:10px;background:#F7F8F5;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">Tomorrow</button>
      </div>

      <!-- Or pick date -->
      <div style="font-size:11px;color:#8FA48F;margin-bottom:6px;">Or pick a specific date:</div>
      <input type="date"
        style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;font-weight:600;color:#1A2E1A;background:#F7F8F5;box-sizing:border-box;" />
    </div>

    <!-- Meal selection -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:16px;padding:16px;margin-bottom:14px;">
      <label style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;display:block;margin-bottom:10px;">2. Select Meal</label>
      <div style="display:flex;gap:8px;">
        <!-- Selected state -->
        <button style="flex:1;padding:14px;background:#2C5E2E;color:white;border:none;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-size:22px;">🍱</span>
          <span>Lunch</span>
        </button>
        <!-- Unselected state -->
        <button style="flex:1;padding:14px;background:#F7F8F5;color:#5C6E5C;border:1.5px solid #E2E8E2;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;">
          <span style="font-size:22px;">🌙</span>
          <span>Dinner</span>
        </button>
      </div>
    </div>

    <!-- Submit button -->
    <button style="width:100%;padding:14px;background:#F5A623;color:white;border:none;border-radius:12px;font-weight:800;font-size:14px;cursor:pointer;">
      Request Skip →
    </button>

    <!-- CONFIRMATION MODAL (shown on button click) -->
    <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:50;">
      <div style="background:white;border-radius:20px;padding:24px;width:340px;margin:16px;">
        <div style="text-align:center;margin-bottom:20px;">
          <div style="font-size:36px;margin-bottom:8px;">⏭</div>
          <h3 style="font-size:18px;font-weight:800;color:#1A2E1A;margin:0 0 6px;">Confirm Skip Request</h3>
          <p style="font-size:13px;color:#5C6E5C;">Are you sure you want to skip your <strong>Lunch</strong> on <strong>Monday, 22 Jun</strong>?</p>
          <p style="font-size:12px;color:#8FA48F;margin-top:6px;">Your request will be sent to the admin for approval.</p>
        </div>
        <div style="display:flex;gap:8px;">
          <button style="flex:1;padding:12px;background:#F7F8F5;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Cancel</button>
          <button style="flex:1;padding:12px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Yes, Skip It</button>
        </div>
      </div>
    </div>

    <!-- EXISTING SKIP REQUESTS LIST -->
    <div style="margin-top:24px;">
      <h3 style="font-size:13px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:10px;">My Skip Requests</h3>

      <!-- Pending -->
      <div style="background:white;border:1.5px solid #FEF3DC;border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#1A2E1A;">Lunch — 24 Jun 2026</div>
          <div style="font-size:11px;color:#8FA48F;">Requested 22 Jun</div>
        </div>
        <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Pending</span>
      </div>

      <!-- Approved -->
      <div style="background:white;border:1.5px solid #E2E8E2;border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#1A2E1A;">Dinner — 20 Jun 2026</div>
          <div style="font-size:11px;color:#8FA48F;">Approved by admin</div>
        </div>
        <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Approved</span>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.4 CLIENT — HISTORY

**Route:** `/client/history`  
**Access:** role = client  
**Purpose:** Monthly billing history. Shows all deliveries, payment status for the month.

```html
<!-- WIREFRAME: Client History -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">
  <main style="max-width:480px;margin:0 auto;padding:20px 16px;">
    <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin-bottom:16px;">Billing & History</h2>

    <!-- Month selector pills -->
    <div style="display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;">
      <button style="padding:8px 16px;background:#2C5E2E;color:white;border:none;border-radius:20px;font-weight:700;font-size:12px;white-space:nowrap;cursor:pointer;">Jun 2026</button>
      <button style="padding:8px 16px;background:white;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:20px;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">May 2026</button>
      <button style="padding:8px 16px;background:white;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:20px;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">Apr 2026</button>
    </div>

    <!-- Summary card -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:20px;padding:18px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:11px;color:#8FA48F;font-weight:700;text-transform:uppercase;margin-bottom:4px;">June 2026 Summary</div>
          <div style="font-size:28px;font-weight:900;color:#2C5E2E;font-family:Georgia,serif;">₹2,500</div>
        </div>
        <!-- Payment status badge -->
        <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700;">Unpaid</span>
      </div>
      <div style="display:flex;gap:20px;margin-top:12px;padding-top:12px;border-top:1px solid #E2E8E2;">
        <div><div style="font-size:10px;color:#8FA48F;font-weight:700;">Deliveries</div><div style="font-weight:800;color:#1A2E1A;">34</div></div>
        <div><div style="font-size:10px;color:#8FA48F;font-weight:700;">Skipped</div><div style="font-weight:800;color:#1A2E1A;">2</div></div>
        <div><div style="font-size:10px;color:#8FA48F;font-weight:700;">Not available</div><div style="font-weight:800;color:#1A2E1A;">0</div></div>
      </div>
    </div>

    <!-- Delivery log rows -->
    <h3 style="font-size:12px;font-weight:700;color:#8FA48F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Delivery Log</h3>

    <!-- Row: delivered -->
    <div style="background:white;border:1px solid #E2E8E2;border-radius:12px;padding:14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#EBF5EB;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:9px;font-weight:700;color:#5C6E5C;text-transform:uppercase;">MON</span>
          <span style="font-size:14px;font-weight:800;color:#1A2E1A;">16</span>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#1A2E1A;">Lunch</div>
          <div style="font-size:11px;color:#8FA48F;">Delivered 12:34 PM</div>
        </div>
      </div>
      <span style="background:#EBF5EB;color:#2C5E2E;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">✓ Delivered</span>
    </div>

    <!-- Row: skipped -->
    <div style="background:#FAFAFA;border:1px solid #E2E8E2;border-radius:12px;padding:14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;opacity:0.75;">
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;background:#F3F4F6;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">TUE</span>
          <span style="font-size:14px;font-weight:800;color:#6B7280;">17</span>
        </div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#6B7280;text-decoration:line-through;">Dinner</div>
          <div style="font-size:11px;color:#9CA3AF;">Skipped</div>
        </div>
      </div>
      <span style="background:#F3F4F6;color:#6B7280;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Skipped</span>
    </div>

  </main>
</body>
</html>
```

---

### 10.5 ADMIN — TODAY'S ORDERS

**Route:** `/admin`  
**Access:** role = admin  
**Purpose:** Core operational view. Shows all deliveries for a selected date, split by Lunch and Dinner. Each section has "To Be Delivered" and "Delivered" sub-sections. Pending skip requests show inline badges. Admin can approve/reject skips, assign delivery persons, add a manual skip, or restore a delivery.

**Key interactions:**
- Date navigator (prev/next day buttons)
- Lunch tab / Dinner tab
- Skip request badge → approve/reject inline
- Checkbox select rows → "Assign to delivery person" button appears
- Each row: name, phone, location, delivery note, status, pending skip badge
- "Mark skip" button per row (admin-initiated silent skip)
- Rows move between "To Be Delivered" and "Delivered" in real time

```html
<!-- WIREFRAME: Admin Today's Orders -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">

  <!-- HEADER -->
  <header style="background:white;border-bottom:1px solid #E2E8E2;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:36px;height:36px;background:#2C5E2E;border-radius:10px;display:flex;align-items:center;justify-content:center;">
        <span style="color:#F5A623;">✦</span>
      </div>
      <div>
        <div style="font-size:10px;color:#8FA48F;font-weight:700;text-transform:uppercase;">Admin</div>
        <div style="font-size:16px;font-weight:800;color:#2C5E2E;font-family:Georgia,serif;">Arusuvai</div>
      </div>
    </div>
    <button style="background:none;border:1px solid #E2E8E2;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;color:#5C6E5C;cursor:pointer;">Sign Out</button>
  </header>

  <!-- ADMIN NAV TABS (horizontal scroll on mobile) -->
  <nav style="background:white;border-bottom:1px solid #E2E8E2;display:flex;padding:6px;gap:4px;overflow-x:auto;">
    <button style="padding:9px 16px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:12px;white-space:nowrap;cursor:pointer;">📦 Today</button>
    <button style="padding:9px 16px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">👥 Clients</button>
    <button style="padding:9px 16px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">🛵 Delivery</button>
    <button style="padding:9px 16px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">⚙️ Pricing</button>
    <button style="padding:9px 16px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:12px;white-space:nowrap;cursor:pointer;">💳 Payments</button>
  </nav>

  <main style="max-width:900px;margin:0 auto;padding:20px 16px;">

    <!-- DATE NAVIGATOR -->
    <div style="background:white;border:1px solid #E2E8E2;border-radius:16px;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
      <button style="width:36px;height:36px;background:#EBF5EB;border:none;border-radius:10px;font-size:16px;cursor:pointer;">‹</button>
      <div style="text-align:center;">
        <div style="font-size:10px;color:#8FA48F;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Delivery Date</div>
        <div style="font-size:18px;font-weight:800;color:#2C5E2E;font-family:Georgia,serif;">Today — Monday, 22 Jun 2026</div>
      </div>
      <button style="width:36px;height:36px;background:#EBF5EB;border:none;border-radius:10px;font-size:16px;cursor:pointer;">›</button>
    </div>

    <!-- SUMMARY PILLS -->
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
      <div style="background:white;border:1px solid #E2E8E2;border-radius:12px;padding:10px 14px;font-size:12px;">
        <span style="color:#8FA48F;font-weight:600;">Total subscribers</span>
        <span style="font-weight:800;color:#1A2E1A;margin-left:6px;">52</span>
      </div>
      <div style="background:white;border:1px solid #E2E8E2;border-radius:12px;padding:10px 14px;font-size:12px;">
        <span style="color:#8FA48F;font-weight:600;">To be delivered</span>
        <span style="font-weight:800;color:#1A2E1A;margin-left:6px;">48</span>
      </div>
      <div style="background:#EBF5EB;border:1px solid #A8D4A8;border-radius:12px;padding:10px 14px;font-size:12px;">
        <span style="color:#2C5E2E;font-weight:600;">Delivered</span>
        <span style="font-weight:800;color:#2C5E2E;margin-left:6px;">12</span>
      </div>
      <div style="background:#FEF3DC;border:1px solid #F5A623;border-radius:12px;padding:10px 14px;font-size:12px;">
        <span style="color:#D4891A;font-weight:600;">Pending approval</span>
        <span style="font-weight:800;color:#D4891A;margin-left:6px;">3 skips</span>
      </div>
    </div>

    <!-- LUNCH / DINNER TABS -->
    <div style="display:flex;gap:6px;background:white;border:1px solid #E2E8E2;border-radius:14px;padding:5px;margin-bottom:16px;">
      <button style="flex:1;padding:10px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">🍱 Lunch (52)</button>
      <button style="flex:1;padding:10px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:13px;cursor:pointer;">🌙 Dinner (52)</button>
    </div>

    <!-- BULK ASSIGN BAR (appears when checkboxes selected) -->
    <div style="background:#EBF5EB;border:1px solid #A8D4A8;border-radius:12px;padding:12px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:13px;font-weight:700;color:#2C5E2E;">5 users selected</span>
      <div style="display:flex;gap:8px;">
        <select style="padding:8px 12px;border:1px solid #A8D4A8;border-radius:8px;font-size:12px;font-weight:600;background:white;color:#1A2E1A;">
          <option>Assign to: Murugan (Driver)</option>
          <option>Assign to: Selvam (Driver)</option>
        </select>
        <button style="padding:8px 16px;background:#2C5E2E;color:white;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">Assign →</button>
      </div>
    </div>

    <!-- ─── TO BE DELIVERED SECTION ─── -->
    <div style="margin-bottom:24px;">
      <h3 style="font-size:12px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;padding-left:4px;">
        📦 To Be Delivered — 36 users
      </h3>

      <!-- Row with pending skip request badge -->
      <div style="background:white;border:1.5px solid #FEF3DC;border-radius:14px;padding:14px;margin-bottom:8px;">
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <input type="checkbox" style="margin-top:4px;accent-color:#2C5E2E;" />
          <div style="flex:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
              <div>
                <span style="font-size:14px;font-weight:800;color:#1A2E1A;">Ramesh Kumar</span>
                <span style="font-size:12px;color:#5C6E5C;margin-left:8px;">📞 98765 43210</span>
              </div>
              <!-- PENDING SKIP BADGE — requires admin action -->
              <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">⚠ Skip Requested</span>
            </div>
            <div style="font-size:12px;color:#8FA48F;margin-top:3px;">📍 Anna Nagar, 2nd Street</div>
            <div style="font-size:11px;color:#D4891A;margin-top:4px;font-style:italic;">Note: "Please ring bell twice"</div>
            <!-- Approve / Reject buttons inline -->
            <div style="display:flex;gap:6px;margin-top:8px;">
              <button style="padding:6px 14px;background:#2C5E2E;color:white;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">✓ Approve Skip</button>
              <button style="padding:6px 14px;background:white;color:#DC2626;border:1px solid #FECACA;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">✗ Reject</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Normal row (assigned to delivery person) -->
      <div style="background:white;border:1px solid #E2E8E2;border-radius:14px;padding:14px;margin-bottom:8px;">
        <div style="display:flex;align-items:flex-start;gap:10px;">
          <input type="checkbox" style="margin-top:4px;accent-color:#2C5E2E;" />
          <div style="flex:1;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
              <div>
                <span style="font-size:14px;font-weight:800;color:#1A2E1A;">Priya Sharma</span>
                <span style="font-size:12px;color:#5C6E5C;margin-left:8px;">📞 91234 56789</span>
              </div>
              <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Assigned — Murugan</span>
            </div>
            <div style="font-size:12px;color:#8FA48F;margin-top:3px;">📍 T. Nagar, 5th Avenue</div>
            <!-- Admin actions row -->
            <div style="display:flex;gap:6px;margin-top:8px;">
              <button style="padding:5px 10px;background:#F7F8F5;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:8px;font-weight:600;font-size:11px;cursor:pointer;">Skip for user</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── DELIVERED SECTION ─── -->
    <div>
      <h3 style="font-size:12px;font-weight:700;color:#2C5E2E;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;padding-left:4px;">
        ✅ Delivered — 12 users
      </h3>

      <!-- Delivered row -->
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;opacity:0.85;">
        <div>
          <span style="font-size:13px;font-weight:700;color:#1A2E1A;">Suresh Babu</span>
          <span style="font-size:11px;color:#5C6E5C;margin-left:8px;">📍 Adyar</span>
        </div>
        <div style="text-align:right;">
          <span style="background:#22C55E;color:white;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">✓ Delivered</span>
          <div style="font-size:10px;color:#8FA48F;margin-top:2px;">12:45 PM — Murugan</div>
        </div>
      </div>

      <!-- Not available row -->
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:14px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <span style="font-size:13px;font-weight:700;color:#1A2E1A;">Kavitha Raj</span>
          <span style="font-size:11px;color:#5C6E5C;margin-left:8px;">📍 Velachery</span>
        </div>
        <div style="text-align:right;">
          <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Not Available</span>
          <div style="font-size:10px;color:#8FA48F;margin-top:2px;">Client not at site</div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.6 ADMIN — CLIENTS

**Route:** `/admin/clients`  
**Access:** role = admin  
**Purpose:** View all clients, add new clients (with initial subscription), manage subscriptions, delete/deactivate clients.

**Add client form fields:** Name, Phone number, Location (area), Username, Password, Subscription type (Monthly), Subscription amount, Start date, End date, Delivery note (optional).

**Client card shows:** Name, phone, location, username, active subscription summary (amount + end date + days remaining), payment status for current month.

```html
<!-- WIREFRAME: Admin Clients -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">
  <main style="max-width:900px;margin:0 auto;padding:20px 16px;">

    <!-- Header row -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <div>
        <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin:0;">Clients</h2>
        <p style="font-size:12px;color:#8FA48F;margin:2px 0 0;">52 active subscribers</p>
      </div>
      <button style="padding:10px 18px;background:#2C5E2E;color:white;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;">+ Add Client</button>
    </div>

    <!-- ADD CLIENT FORM (collapsible) -->
    <div style="background:white;border:1.5px solid #A8D4A8;border-radius:20px;padding:20px;margin-bottom:20px;">
      <h3 style="font-size:14px;font-weight:800;color:#2C5E2E;margin:0 0 16px;">Register New Client</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Full Name *</label>
          <input placeholder="e.g. Ramesh Kumar" style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Phone Number *</label>
          <input placeholder="e.g. 98765 43210" style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Location / Area *</label>
          <select style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;background:white;">
            <option>Anna Nagar</option>
            <option>T. Nagar</option>
            <option>Adyar</option>
            <option value="NEW">+ Add new area...</option>
          </select>
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Username *</label>
          <input placeholder="e.g. ramesh" style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Password *</label>
          <input type="text" placeholder="Initial password" style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Delivery Note</label>
          <input placeholder="e.g. Gate 2, ring bell" style="width:100%;padding:10px 14px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
      </div>

      <!-- Subscription section -->
      <div style="background:#EBF5EB;border-radius:14px;padding:14px;margin-top:14px;">
        <div style="font-size:11px;font-weight:700;color:#2C5E2E;text-transform:uppercase;margin-bottom:10px;">Subscription Details</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
          <div>
            <label style="font-size:10px;font-weight:700;color:#5C6E5C;text-transform:uppercase;display:block;margin-bottom:4px;">Type</label>
            <select style="width:100%;padding:8px 12px;border:1px solid #A8D4A8;border-radius:8px;font-size:12px;background:white;box-sizing:border-box;">
              <option>Monthly</option>
            </select>
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;color:#5C6E5C;text-transform:uppercase;display:block;margin-bottom:4px;">Amount (₹)</label>
            <input type="number" placeholder="2500" style="width:100%;padding:8px 12px;border:1px solid #A8D4A8;border-radius:8px;font-size:12px;box-sizing:border-box;" />
          </div>
          <div><!-- spacer --></div>
          <div>
            <label style="font-size:10px;font-weight:700;color:#5C6E5C;text-transform:uppercase;display:block;margin-bottom:4px;">Start Date</label>
            <input type="date" style="width:100%;padding:8px 12px;border:1px solid #A8D4A8;border-radius:8px;font-size:12px;box-sizing:border-box;" />
          </div>
          <div>
            <label style="font-size:10px;font-weight:700;color:#5C6E5C;text-transform:uppercase;display:block;margin-bottom:4px;">End Date</label>
            <input type="date" style="width:100%;padding:8px 12px;border:1px solid #A8D4A8;border-radius:8px;font-size:12px;box-sizing:border-box;" />
          </div>
          <div style="display:flex;align-items:flex-end;">
            <div style="background:white;border:1px solid #A8D4A8;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#2C5E2E;width:100%;text-align:center;box-sizing:border-box;">
              21 service days
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px;">
        <button style="padding:10px 18px;background:#F7F8F5;color:#5C6E5C;border:1px solid #E2E8E2;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Cancel</button>
        <button style="padding:10px 20px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Register Client</button>
      </div>
    </div>

    <!-- CLIENT CARDS GRID -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

      <!-- Client card — active subscription -->
      <div style="background:white;border:1.5px solid #E2E8E2;border-radius:16px;padding:16px;position:relative;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#2C5E2E;border-radius:16px 16px 0 0;"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#1A2E1A;">Ramesh Kumar</div>
            <div style="font-size:12px;color:#8FA48F;">📞 98765 43210</div>
            <div style="font-size:11px;color:#8FA48F;margin-top:2px;">📍 Anna Nagar</div>
          </div>
          <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;">Active</span>
        </div>
        <div style="background:#F7F8F5;border-radius:10px;padding:10px;font-size:11px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:#8FA48F;">Subscription</span><span style="font-weight:700;color:#1A2E1A;">₹2,500 / month</span></div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;"><span style="color:#8FA48F;">Expires</span><span style="font-weight:700;color:#1A2E1A;">30 Jun 2026</span></div>
          <div style="display:flex;justify-content:space-between;margin-top:4px;"><span style="color:#8FA48F;">Days remaining</span><span style="font-weight:700;color:#2C5E2E;">14 days</span></div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;">
          <button style="flex:1;padding:7px;background:#EBF5EB;color:#2C5E2E;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">Renew Sub</button>
          <button style="padding:7px 10px;background:white;color:#DC2626;border:1px solid #FECACA;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">Delete</button>
        </div>
      </div>

      <!-- Client card — expired -->
      <div style="background:white;border:1.5px solid #FECACA;border-radius:16px;padding:16px;position:relative;opacity:0.85;">
        <div style="position:absolute;top:0;left:0;right:0;height:3px;background:#EF4444;border-radius:16px 16px 0 0;"></div>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#1A2E1A;">Suresh Babu</div>
            <div style="font-size:12px;color:#8FA48F;">📞 77665 44321</div>
            <div style="font-size:11px;color:#8FA48F;margin-top:2px;">📍 Adyar</div>
          </div>
          <span style="background:#FEF2F2;color:#DC2626;border:1px solid #FECACA;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;">Expired</span>
        </div>
        <div style="background:#FEF2F2;border-radius:10px;padding:10px;font-size:11px;">
          <div style="color:#DC2626;font-weight:600;">Subscription ended 31 May 2026</div>
        </div>
        <div style="margin-top:10px;">
          <button style="width:100%;padding:8px;background:#2C5E2E;color:white;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">+ Renew Subscription</button>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.7 ADMIN — DELIVERY PERSONS

**Route:** `/admin/delivery-persons`  
**Access:** role = admin  
**Purpose:** Add and manage delivery persons. Each delivery person has a user account. Admin can see how many deliveries they've done today.

```html
<!-- WIREFRAME: Admin Delivery Persons -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">
  <main style="max-width:700px;margin:0 auto;padding:20px 16px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin:0;">Delivery Persons</h2>
      <button style="padding:10px 18px;background:#2C5E2E;color:white;border:none;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;">+ Add Person</button>
    </div>

    <!-- Add form (collapsible) -->
    <div style="background:white;border:1.5px solid #A8D4A8;border-radius:16px;padding:18px;margin-bottom:20px;">
      <h3 style="font-size:13px;font-weight:800;color:#2C5E2E;margin:0 0 14px;">Add Delivery Person</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Name *</label>
          <input placeholder="e.g. Murugan" style="width:100%;padding:10px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Phone *</label>
          <input placeholder="e.g. 99001 23456" style="width:100%;padding:10px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Username *</label>
          <input placeholder="e.g. murugan_driver" style="width:100%;padding:10px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
        <div>
          <label style="font-size:10px;font-weight:700;color:#8FA48F;text-transform:uppercase;display:block;margin-bottom:4px;">Password *</label>
          <input placeholder="Initial password" style="width:100%;padding:10px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:13px;box-sizing:border-box;" />
        </div>
      </div>
      <button style="padding:10px 20px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">Add →</button>
    </div>

    <!-- Delivery person cards -->
    <div style="display:flex;flex-direction:column;gap:10px;">

      <div style="background:white;border:1.5px solid #E2E8E2;border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;background:#2C5E2E;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:16px;">M</div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#1A2E1A;">Murugan</div>
            <div style="font-size:12px;color:#8FA48F;">📞 99001 23456 · @murugan_driver</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px;font-weight:900;color:#2C5E2E;">18</div>
          <div style="font-size:10px;color:#8FA48F;font-weight:600;">delivered today</div>
        </div>
      </div>

      <div style="background:white;border:1.5px solid #E2E8E2;border-radius:14px;padding:14px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;background:#F5A623;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:16px;">S</div>
          <div>
            <div style="font-size:15px;font-weight:800;color:#1A2E1A;">Selvam</div>
            <div style="font-size:12px;color:#8FA48F;">📞 98877 65432 · @selvam_driver</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:20px;font-weight:900;color:#2C5E2E;">14</div>
          <div style="font-size:10px;color:#8FA48F;font-weight:600;">delivered today</div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.8 ADMIN — PRICING

**Route:** `/admin/pricing`  
**Access:** role = admin  
**Purpose:** Manage delivery charges per location area. Simple list with inline edit.

```html
<!-- WIREFRAME: Admin Pricing -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">
  <main style="max-width:600px;margin:0 auto;padding:20px 16px;">
    <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin-bottom:20px;">Delivery Pricing</h2>

    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:20px;padding:20px;">
      <div style="font-size:12px;font-weight:700;color:#8FA48F;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;">Per-Location Delivery Charges</div>

      <!-- Location row — view mode -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:#F7F8F5;border-radius:10px;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">📍</span>
          <span style="font-size:13px;font-weight:700;color:#1A2E1A;">Anna Nagar</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:14px;font-weight:800;color:#1A2E1A;">₹25.00</span>
          <button style="padding:5px 10px;background:white;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">Edit</button>
        </div>
      </div>

      <!-- Location row — edit mode -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:#EBF5EB;border:1px solid #A8D4A8;border-radius:10px;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="font-size:16px;">📍</span>
          <span style="font-size:13px;font-weight:700;color:#1A2E1A;">T. Nagar</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:12px;color:#5C6E5C;font-weight:600;">₹</span>
          <input type="number" value="30" style="width:70px;padding:6px 10px;border:1.5px solid #A8D4A8;border-radius:8px;font-size:13px;font-weight:700;text-align:center;" />
          <button style="padding:6px 12px;background:#2C5E2E;color:white;border:none;border-radius:8px;font-weight:700;font-size:11px;cursor:pointer;">Save</button>
          <button style="padding:6px 10px;background:white;color:#6B7280;border:1px solid #E2E8E2;border-radius:8px;font-weight:600;font-size:11px;cursor:pointer;">×</button>
        </div>
      </div>

      <!-- Add new location -->
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #E2E8E2;">
        <div style="font-size:11px;font-weight:700;color:#8FA48F;text-transform:uppercase;margin-bottom:8px;">Add New Location</div>
        <div style="display:flex;gap:8px;">
          <input placeholder="Area name" style="flex:2;padding:9px 12px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:12px;" />
          <input type="number" placeholder="₹ charge" style="flex:1;padding:9px 12px;border:1.5px solid #E2E8E2;border-radius:10px;font-size:12px;" />
          <button style="padding:9px 16px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">Add</button>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.9 ADMIN — PAYMENTS

**Route:** `/admin/payments`  
**Access:** role = admin  
**Purpose:** Monthly payment reconciliation grid. Toggle paid/unpaid per client per month.

```html
<!-- WIREFRAME: Admin Payments -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">
  <main style="max-width:900px;margin:0 auto;padding:20px 16px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
      <h2 style="font-size:20px;font-weight:900;color:#1A2E1A;font-family:Georgia,serif;margin:0;">Payments</h2>
      <!-- Month selector -->
      <div style="display:flex;gap:6px;background:white;border:1px solid #E2E8E2;border-radius:12px;padding:4px;">
        <button style="padding:7px 14px;background:#2C5E2E;color:white;border:none;border-radius:8px;font-weight:700;font-size:12px;cursor:pointer;">Jun 2026</button>
        <button style="padding:7px 14px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:12px;cursor:pointer;">May 2026</button>
      </div>
    </div>

    <!-- Summary row -->
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
      <div style="background:white;border:1px solid #E2E8E2;border-radius:12px;padding:12px 16px;flex:1;min-width:140px;">
        <div style="font-size:10px;color:#8FA48F;font-weight:700;text-transform:uppercase;">Total clients</div>
        <div style="font-size:22px;font-weight:900;color:#1A2E1A;">52</div>
      </div>
      <div style="background:#EBF5EB;border:1px solid #A8D4A8;border-radius:12px;padding:12px 16px;flex:1;min-width:140px;">
        <div style="font-size:10px;color:#2C5E2E;font-weight:700;text-transform:uppercase;">Paid</div>
        <div style="font-size:22px;font-weight:900;color:#2C5E2E;">34</div>
      </div>
      <div style="background:#FEF3DC;border:1px solid #F5A623;border-radius:12px;padding:12px 16px;flex:1;min-width:140px;">
        <div style="font-size:10px;color:#D4891A;font-weight:700;text-transform:uppercase;">Unpaid</div>
        <div style="font-size:22px;font-weight:900;color:#D4891A;">18</div>
      </div>
      <div style="background:white;border:1px solid #E2E8E2;border-radius:12px;padding:12px 16px;flex:1;min-width:140px;">
        <div style="font-size:10px;color:#8FA48F;font-weight:700;text-transform:uppercase;">Collected</div>
        <div style="font-size:22px;font-weight:900;color:#1A2E1A;">₹85,000</div>
      </div>
    </div>

    <!-- Payment cards grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">

      <!-- Paid card -->
      <div style="background:white;border:1.5px solid #E2E8E2;border-radius:16px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div>
            <div style="font-size:14px;font-weight:800;color:#1A2E1A;">Ramesh Kumar</div>
            <div style="font-size:11px;color:#8FA48F;">Anna Nagar · Jun 1–30</div>
          </div>
          <span style="background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Paid</span>
        </div>
        <div style="background:#F7F8F5;border-radius:10px;padding:10px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;"><span style="color:#8FA48F;">Subscription</span><span style="font-weight:700;color:#1A2E1A;">₹2,500</span></div>
          <div style="display:flex;justify-content:space-between;font-size:11px;"><span style="color:#8FA48F;">Settled</span><span style="font-weight:700;color:#1A2E1A;">15 Jun 2026</span></div>
        </div>
        <button style="width:100%;padding:9px;background:#EBF5EB;color:#2C5E2E;border:1px solid #A8D4A8;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">✓ Mark as Unpaid</button>
      </div>

      <!-- Unpaid card -->
      <div style="background:white;border:1.5px solid #FED7AA;border-radius:16px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
          <div>
            <div style="font-size:14px;font-weight:800;color:#1A2E1A;">Priya Sharma</div>
            <div style="font-size:11px;color:#8FA48F;">T. Nagar · Jun 1–30</div>
          </div>
          <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Unpaid</span>
        </div>
        <div style="background:#FFF7ED;border-radius:10px;padding:10px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;"><span style="color:#8FA48F;">Subscription</span><span style="font-weight:700;color:#1A2E1A;">₹2,500</span></div>
        </div>
        <button style="width:100%;padding:9px;background:#F5A623;color:white;border:none;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">Mark as Paid →</button>
      </div>
    </div>
  </main>
</body>
</html>
```

---

### 10.10 DELIVERY PERSON — TODAY'S LIST

**Route:** `/delivery`  
**Access:** role = delivery_person  
**Purpose:** Shows only deliveries assigned to this delivery person for today. Split into Lunch and Dinner tabs. Each row shows client name, phone, location, delivery note. Delivery person can mark as Delivered or "Client not available".

**Restrictions:** Cannot see other delivery persons' lists. Cannot see payment data. Cannot approve skips. Cannot access admin routes.

```html
<!-- WIREFRAME: Delivery Person Today's List -->
<html>
<body style="min-height:100vh;background:#F7F8F5;font-family:sans-serif;">

  <!-- HEADER -->
  <header style="background:#2C5E2E;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:11px;color:#A8D4A8;font-weight:700;text-transform:uppercase;">Delivery</div>
      <div style="font-size:18px;font-weight:800;color:white;font-family:Georgia,serif;">Murugan</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#A8D4A8;">Mon, 22 Jun 2026</div>
      <div style="font-size:16px;font-weight:800;color:#F5A623;">18 assigned</div>
    </div>
  </header>

  <!-- LUNCH / DINNER TABS -->
  <div style="background:white;border-bottom:1px solid #E2E8E2;display:flex;padding:6px;gap:4px;">
    <button style="flex:1;padding:10px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">🍱 Lunch (10)</button>
    <button style="flex:1;padding:10px;background:none;border:none;color:#5C6E5C;font-weight:600;font-size:13px;cursor:pointer;">🌙 Dinner (8)</button>
  </div>

  <!-- PROGRESS BAR -->
  <div style="background:white;padding:12px 16px;border-bottom:1px solid #E2E8E2;">
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
      <span style="color:#5C6E5C;font-weight:600;">Lunch progress</span>
      <span style="color:#2C5E2E;font-weight:800;">4 of 10 delivered</span>
    </div>
    <div style="background:#EBF5EB;border-radius:4px;height:8px;">
      <div style="background:#2C5E2E;height:8px;border-radius:4px;width:40%;"></div>
    </div>
  </div>

  <main style="padding:12px 16px;max-width:600px;margin:0 auto;">

    <!-- ─── TO DELIVER ─── -->
    <div style="font-size:11px;font-weight:700;color:#5C6E5C;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">To Deliver — 6 remaining</div>

    <!-- Delivery card -->
    <div style="background:white;border:1.5px solid #E2E8E2;border-radius:14px;padding:14px;margin-bottom:8px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;">
        <div>
          <div style="font-size:16px;font-weight:800;color:#1A2E1A;">Ramesh Kumar</div>
          <div style="font-size:13px;color:#5C6E5C;margin-top:2px;">📞 98765 43210</div>
          <div style="font-size:12px;color:#8FA48F;margin-top:2px;">📍 Anna Nagar, 2nd Street, Door 14</div>
        </div>
        <div style="width:32px;height:32px;background:#EBF5EB;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#2C5E2E;font-weight:900;">1</div>
      </div>
      <!-- Client delivery note -->
      <div style="background:#FEF3DC;border-radius:8px;padding:8px 10px;font-size:11px;color:#78350F;margin-bottom:10px;">
        📝 "Ring bell twice at Gate 2"
      </div>
      <!-- Action buttons -->
      <div style="display:flex;gap:8px;">
        <button style="flex:2;padding:11px;background:#2C5E2E;color:white;border:none;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;">✓ Delivered</button>
        <button style="flex:1;padding:11px;background:white;color:#D4891A;border:1.5px solid #F5A623;border-radius:10px;font-weight:700;font-size:12px;cursor:pointer;">Not Available</button>
      </div>
    </div>

    <!-- ─── DELIVERED SECTION ─── -->
    <div style="font-size:11px;font-weight:700;color:#2C5E2E;text-transform:uppercase;letter-spacing:0.08em;margin-top:20px;margin-bottom:10px;">Delivered — 4</div>

    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:14px;padding:12px 14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:13px;font-weight:700;color:#1A2E1A;">Priya Sharma</div>
        <div style="font-size:11px;color:#5C6E5C;">📍 T. Nagar</div>
      </div>
      <div style="text-align:right;">
        <span style="background:#22C55E;color:white;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">✓ Done</span>
        <div style="font-size:10px;color:#8FA48F;margin-top:2px;">12:14 PM</div>
      </div>
    </div>

    <!-- Not available row -->
    <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:14px;padding:12px 14px;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:13px;font-weight:700;color:#1A2E1A;">Kavitha Raj</div>
        <div style="font-size:11px;color:#5C6E5C;">📍 Velachery</div>
      </div>
      <span style="background:#FEF3DC;color:#D4891A;border:1px solid #F5A623;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">Not at Site</span>
    </div>

  </main>
</body>
</html>
```

---

## 11. i18n — ENGLISH & TAMIL

Support English and Tamil. Place translation files at `i18n/locales/en.json` and `i18n/locales/ta.json`.

Key translation keys to implement:
```json
{
  "app.name": "Arusuvai",
  "app.tagline": "The Home Kitchen",
  "auth.username": "Username",
  "auth.password": "Password",
  "auth.signIn": "Sign In",
  "auth.signOut": "Sign Out",
  "nav.home": "Home",
  "nav.skip": "Skip Meal",
  "nav.history": "History",
  "nav.today": "Today",
  "nav.clients": "Clients",
  "nav.delivery": "Delivery",
  "nav.pricing": "Pricing",
  "nav.payments": "Payments",
  "sub.active": "Active",
  "sub.expired": "Expired — Contact Admin",
  "sub.daysLeft": "{{count}} days remaining",
  "sub.serviceDays": "{{count}} service days",
  "meal.lunch": "Lunch",
  "meal.dinner": "Dinner",
  "meal.scheduled": "Scheduled",
  "meal.delivered": "Delivered",
  "meal.skipped": "Skipped",
  "meal.notAvailable": "Not Available",
  "skip.title": "Skip a Meal",
  "skip.confirm": "Are you sure you want to skip {{meal}} on {{date}}?",
  "skip.pending": "Awaiting admin approval",
  "skip.approved": "Approved",
  "skip.rejected": "Rejected",
  "delivery.markDelivered": "Delivered",
  "delivery.notAvailable": "Not Available",
  "payment.paid": "Paid",
  "payment.unpaid": "Unpaid",
  "payment.markPaid": "Mark as Paid",
  "payment.markUnpaid": "Mark as Unpaid"
}
```

Add language toggle button (English ↔ தமிழ்) fixed at bottom-right of every page.

---

## 12. DEPLOYMENT — VERCEL + NEON

### `next.config.ts`
```ts
const nextConfig = {
  experimental: { serverActions: { allowedOrigins: ['*'] } },
};
export default nextConfig;
```

### Vercel deployment steps
1. Push repository to GitHub
2. Import project in Vercel dashboard
3. Set environment variables: `DATABASE_URL`, `SESSION_SECRET`
4. Deploy — Vercel auto-detects Next.js

### Neon connection pooling
Use `@neondatabase/serverless` for edge-compatible connections, or `pg` Pool in Node.js API routes with:
```ts
// lib/db.ts
import { Pool } from 'pg';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});
export default pool;
```

### Optional: nightly subscription expiry cron
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/expire-subscriptions",
      "schedule": "0 1 * * *"
    }
  ]
}
```
Route: `app/api/cron/expire-subscriptions/route.ts` — runs `UPDATE subscriptions SET status='expired' WHERE end_date < CURRENT_DATE AND status='active'`.

---

*End of Arusuvai v2 Build Specification — Version 2.0*  
*Prepared for AI-assisted implementation. All decisions are final as documented.*
