# AI App Generator

> **Track A — AI App Generator** | Full Stack Engineer  
> A metadata-driven application runtime that converts JSON configuration into working applications with dynamic UI, APIs, and database.

## Demo

- **Live URL:** *(Deploy to Vercel/Railway and paste here)*
- **Video:** *(Record 5-10 min Loom and paste link)*

## What This Builds

This platform lets you define an entire application — database schema, pages, components, and APIs — in a single JSON file. The runtime then:

1. **Validates** the configuration using Zod schemas
2. **Stores** the config in PostgreSQL as JSONB
3. **Generates** REST APIs for CRUD operations
4. **Renders** dynamic UI (tables, forms, stats, cards) from the config
5. **Handles** CSV import, notifications, and multi-auth out of the box

### Demo App Included

A **Contact Manager CRM** pre-seeded with:
- **2 tables:** `contacts` and `companies`
- **3 pages:** Dashboard, Contacts, Companies
- **5 contacts + 3 companies** with realistic data
- Full create, edit, delete, search, and CSV import functionality

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Config Builder  │────▶│  JSON Config    │────▶│  Dynamic UI     │
│  (React UI)      │     │  (Zod + TS)     │     │  (Renderer)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Dynamic API    │
                       │  (Next.js API)  │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  PostgreSQL     │
                       │  (JSONB)        │
                       └─────────────────┘
```

### Key Design Decisions

| Decision | Why |
|----------|-----|
| **JSONB for dynamic data** | Schema changes don't require migrations. Each app stores records flexibly. |
| **Zod for config validation** | Runtime validation with graceful error recovery. Unknown components don't crash the app. |
| **Coercion + validation pipeline** | API layer coerces types before validation, so `"42"` → `42` for number fields. |
| **Component-level error boundaries** | Each component renders independently. One broken component doesn't break the page. |
| **Single catch-all API route** | `/api/dynamic/[appId]/[action]` handles all CRUD. No code generation needed. |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js (Credentials + Google OAuth + GitHub OAuth) |
| Validation | Zod |
| CSV Parsing | PapaParse |
| Icons | Lucide React |

## Features

### Core Requirements
- ✅ **Dynamic UI Rendering** — Tables, forms, stats, cards from JSON config
- ✅ **Dynamic API Generation** — Auto-generated CRUD endpoints
- ✅ **Dynamic Database** — Flexible JSONB storage with PostgreSQL
- ✅ **Graceful Error Handling** — Unknown components fail gracefully, never crash the app
- ✅ **Config Validation** — Zod schemas validate and normalize config

### Extra Features (3 implemented)
- ✅ **CSV Import** — Bulk upload with row-level validation and error reporting
- ✅ **Notifications** — In-app bell with real-time polling, mark read/delete
- ✅ **Multi-Auth Login** — Email/password, Google OAuth, GitHub OAuth

### Additional Polish
- ✅ **Record Editing** — Inline edit form with pre-filled data
- ✅ **Search** — Real-time search across all table fields
- ✅ **Landing Page** — Marketing page for non-authenticated users
- ✅ **Health Check API** — `/api/health` for deployment monitoring
- ✅ **Responsive Design** — Mobile-friendly navbar and layouts

## Project Structure

```
ai-app-generator/
├── prisma/
│   ├── schema.prisma          # User, App, DynamicRecord, Notification models
│   └── seed.ts                # Demo CRM app with contacts + companies
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/
│   │   │   ├── auth/...       # NextAuth (credentials + OAuth)
│   │   │   ├── apps/...       # App CRUD APIs
│   │   │   ├── dynamic/...    # Dynamic CRUD runtime
│   │   │   ├── csv/import/    # CSV upload + validation
│   │   │   ├── notifications/ # Notification REST API
│   │   │   ├── register/      # User registration
│   │   │   └── health/        # Health check endpoint
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── page.tsx         # Landing / App list
│   │   │   ├── builder/         # Config builder UI
│   │   │   └── apps/[appId]/    # Dynamic app renderer
│   │   ├── login/              # Auth page
│   │   ├── layout.tsx           # Root layout + providers
│   │   ├── loading.tsx          # Global loading
│   │   ├── error.tsx            # Global error boundary
│   │   └── not-found.tsx        # 404 page
│   ├── components/
│   │   ├── dynamic-renderer/   # Core rendering engine
│   │   │   ├── dynamic-renderer.tsx   # Main router
│   │   │   ├── dynamic-table.tsx      # Table + search + edit + delete
│   │   │   ├── dynamic-form.tsx       # Create + edit form
│   │   │   ├── dynamic-stats.tsx      # Count cards
│   │   │   ├── dynamic-card.tsx     # Recent records cards
│   │   │   ├── unknown-component.tsx  # Graceful fallback
│   │   │   ├── csv-import-modal.tsx   # CSV upload modal
│   │   │   ├── loading-state.tsx
│   │   │   └── error-state.tsx
│   │   ├── config-builder/
│   │   │   └── config-builder.tsx     # JSON editor + preview
│   │   ├── notifications/
│   │   │   └── notification-bell.tsx  # Bell + dropdown
│   │   ├── auth/
│   │   │   ├── login-form.tsx         # Multi-auth login
│   │   │   └── logout-button.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── dashboard-layout.tsx
│   │   ├── ui/                     # Lightweight primitives
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   └── card.tsx
│   │   └── app-list.tsx            # App grid with delete
│   ├── lib/
│   │   ├── prisma.ts               # Singleton client
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── session.ts              # Auth helpers
│   │   └── utils.ts                # cn() helper
│   ├── types/
│   │   ├── config.ts               # Zod schemas + normalizer + validator
│   │   └── next-auth.d.ts          # Session type augmentation
│   └── middleware.ts               # Route protection
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### 1. Clone & Install
```bash
cd ai-app-generator
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_app_generator"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login
- Email: `demo@example.com`
- Or create a new account with email/password, Google, or GitHub

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Add build command: `prisma generate && next build`
5. Deploy

### Railway (Database + Hosting)
1. Create PostgreSQL database on Railway
2. Connect repo to Railway
3. Add `DATABASE_URL` from Railway
4. Deploy

## API Reference

### Dynamic CRUD
All dynamic APIs are scoped to the authenticated user.

```
GET    /api/dynamic/{appId}/list?table={tableName}
GET    /api/dynamic/{appId}/get?table={tableName}&id={recordId}
POST   /api/dynamic/{appId}/create
       body: { table, data: { ... } }
POST   /api/dynamic/{appId}/update
       body: { table, id, data: { ... } }
DELETE /api/dynamic/{appId}/delete?id={recordId}
```

### Apps
```
GET    /api/apps
GET    /api/apps?id={appId}
POST   /api/apps
       body: { name, description, config }
PUT    /api/apps
       body: { id, name, description, config }
DELETE /api/apps?id={appId}
```

### CSV Import
```
POST   /api/csv/import
       form-data: { file, appId, tableName }
```

### Notifications
```
GET    /api/notifications?unread=true
PATCH  /api/notifications
       body: { markAllRead: true } or { id }
DELETE /api/notifications?id={notificationId}
```

## Config Format

```json
{
  "name": "My App",
  "description": "...",
  "database": [
    {
      "name": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "done", "type": "boolean", "default": false }
      ]
    }
  ],
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "route": "/",
      "layout": "dashboard",
      "components": [
        { "id": "tasks", "type": "table", "table": "tasks" }
      ]
    }
  ]
}
```

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| Invalid/missing config fields | `normalizeConfig()` fills defaults. `parseConfig()` returns errors without throwing. |
| Unknown component type | `UnknownComponent` renders a warning card. Page continues. |
| Schema mismatch in API | API coerces values before validation. `"42"` → `42` for number fields. |
| Missing bonus/stock fields | Defaults to `0` or `""` based on field type. |
| Duplicate entries in CSV | Each row is validated independently. Invalid rows are skipped with error report. |
| Database connection failure | Health check returns 503. App shows error states. |
| OAuth user without password | `signIn` callback auto-creates user record. |

## License

MIT
