# Coding Session Base

This document serves as the foundational knowledge base for any AI coding session in the **Comercial Dashboard** project. It provides an overview of the architecture, tech stack, and a summary of each project section.

## Project Overview

**Comercial Dashboard** is a Nuxt 3 CRM-style application used for tracking commercial projects, sales progress, payments, users, products, and configuration data. 

**Key Features:**
- **Auth & Access:** Protected dashboard via global middleware. Role-aware project visibility (admins see all, normal users see their own).
- **Data Source:** Primarily Firebase (Firestore & Auth) with real-time updates via `onSnapshot`.
- **UI & Visualization:** Uses Tailwind CSS for styling and Chart.js/vue-chartjs for dashboard metrics.

## Tech Stack
- **Framework:** Nuxt 3 & Vue 3
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend/DB:** Firebase (Auth & Firestore) 
- **Additional Backend:** Supabase client is configured for future integrations
- **Charts:** Chart.js + vue-chartjs

---

## Architecture & Sections

The repository is structured to follow standard Nuxt 3 conventions. Below is a summary of each main directory. (For more details, see the `README.md` file within each specific folder).

### `assets/`
- **Purpose:** Global styles (`main.css`), Tailwind configuration imports, and static assets like SVGs/images.
- **Rule of Thumb:** Use this for items that are processed by the bundler.

### `components/`
- **Purpose:** Vue 3 UI components automatically imported by Nuxt.
- **Structure:** Shared UI components live at the root, while feature-specific components are grouped in folders (e.g., `components/settings/`).
- **Rule of Thumb:** Keep components modular and focused.

### `composables/`
- **Purpose:** Auto-imported Vue composables for stateful logic and side effects.
- **Responsibilities:** Contains all Firestore data fetching/mutation logic (e.g., `useProjects.ts`, `useUsers.ts`), Firebase Auth session management, and global UI state.

### `middleware/`
- **Purpose:** Nuxt route middleware.
- **Responsibilities:** Primarily used for the `auth.global.ts` guard which restricts access to authenticated users and handles role-based redirects.

### `pages/`
- **Purpose:** File-based routing for the application.
- **Structure:** `index.vue` is the main dashboard. Subdirectories like `settings/` create nested routes.

### `plugins/`
- **Purpose:** Nuxt plugins for client-side initialization.
- **Responsibilities:** Sets up Firebase app/auth/db instances (`firebase.client.ts`) and Supabase client context (`supabase.client.ts`).

### `types/`
- **Purpose:** Shared TypeScript domain models and database interfaces.
- **Responsibilities:** Ensures type safety across composables and components (e.g., Project models, User roles).

### `supabase/`
- **Purpose:** Configurations and edge functions specific to Supabase.
- **Responsibilities:** Currently acts as a secondary/future backend alongside the primary Firebase setup.

---

## Coding Guidelines
1. **TypeScript First:** Always type responses and variables using the interfaces in `types/`.
2. **Composition API:** Use Vue 3 `<script setup>` syntax for all components.
3. **Data Fetching:** Do not fetch data directly in components; delegate to `composables/`.
4. **Styling:** Use Tailwind CSS utility classes exclusively. Avoid custom CSS unless absolutely necessary.
