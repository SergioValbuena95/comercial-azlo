# Comercial Dashboard

Comercial Dashboard is a Nuxt 3 CRM-style application for tracking commercial projects, sales progress, payments, users, products, and configuration data. The app is designed for internal teams that need a searchable project pipeline, KPI cards, charts, and role-aware access to operational settings.

## Purpose

The project centralizes commercial follow-up work in one dashboard:

- Track projects by client/name, country, city, responsible person, dates, value, notes, payments, and current state.
- Show business metrics such as total projects, active projects, installed projects, closed projects, yearly sales, and monthly sales.
- Visualize project distribution by status, city, month, value by month, and responsible user.
- Manage supporting configuration such as users, roles, products, product types, and project types.

## Tech Stack

- Nuxt 3 and Vue 3 for the application shell and pages.
- TypeScript for typed composables and domain models.
- Tailwind CSS for the visual system and responsive layout.
- Firebase Auth for login, registration, password reset, and email verification.
- Firebase Firestore for users, roles, projects, products, and related collections.
- Supabase client configuration is present for Supabase-backed data or future integrations.
- Chart.js and vue-chartjs for dashboard visualizations.
- VueUse for utility composables.

## Main Features

- Auth-protected dashboard with global route middleware.
- Login, registration, password reset, and verified-email enforcement.
- Real-time project loading from Firestore with `onSnapshot`.
- Project CRUD actions: create, edit, delete, update notes, update payment checks, and change sub-state.
- Role-aware project visibility: admin users can see all projects, while regular users see projects created by them.
- KPI cards for project totals and sales goals.
- Charts for status, city, monthly activity, monthly value, and responsible users.
- Settings area for user and product configuration.
- Theme support through the local theme plugin/composable.

## Project Structure

```text
comercial-dashboard/
  assets/css/main.css              Global Tailwind styles
  components/                      Shared UI components
  components/settings/             Settings panels and layout
  composables/                     Data, auth, access, theme, and settings logic
  middleware/auth.global.ts        Client-side auth route guard
  pages/index.vue                  Main commercial dashboard
  pages/login.vue                  Auth screen
  pages/settings/                  Settings routes
  plugins/firebase.client.ts       Firebase app, auth, and Firestore provider
  plugins/supabase.client.ts       Supabase client provider
  types/database.types.ts          Database-related TypeScript types
  nuxt.config.ts                   Nuxt modules, runtime config, app metadata
```

## Environment Variables

Create a `.env` file from `.env.example` and fill in the Firebase and Supabase values:

```bash
cp .env.example .env
```

Required Firebase values:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Supabase values:

- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`

The Supabase plugin returns `null` for `$supabase` when the public URL or anon key is missing, so code that uses it should handle that case.

## Common Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Data Notes

The project currently uses Firebase as the main runtime data source for authentication and Firestore collections. Project records are normalized in `composables/useProjects.ts`, including defaults for payment data, state, notes, creator metadata, and sales values.

Important project state behavior:

- A project with `sub_state` equal to `facturado` is marked as sold.
- Active projects are any projects whose sub-state is not `facturado`.
- Installed projects are counted when the sub-state is `instalado`.
- Closed projects are counted when the sub-state is `facturado`.

## Access Model

Authentication is enforced by `middleware/auth.global.ts`:

- Unauthenticated users are redirected to `/login`.
- Authenticated users visiting `/login` are redirected to `/`.

Project visibility depends on the current user's profile and access role:

- Admin users can load all projects.
- Non-admin users load projects where `created_by` references their user document.

## Notes for Future Work

- Update the existing `README.md` encoding/content so it matches the current Firebase plus Supabase setup.
- Document Firestore collection schemas for `projects`, `users`, `roles`, `products`, `product_types`, and project type collections.
- Add automated checks for TypeScript and build validation in CI.
- Consider consolidating Firebase and Supabase responsibilities if one backend becomes the primary source of truth.
