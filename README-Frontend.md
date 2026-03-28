# 🚀 Frontend Developer Onboarding Guide

Welcome to the **Club Booking Frontend** project! This document is designed to help you understand the architecture, data flows, and code structure so you can start contributing within your first day.

---

## 1. 📌 Project Overview
The **Club Booking Frontend** is a modern web application designed to manage club event bookings, guest stay details, and food/catering requirements. It features a multi-step booking form, a real-time dashboard, role-based access control, and approval workflows.

*   **Backend Source**: Connects to a custom **Frappe (Python/MariaDB)** backend via REST APIs.
*   **Key Features**: Multi-tab Booking Forms, Dashboard Statistics, Approval/Rejection Workflows, Responsive Data Tables, and Role-Based Access Control (Academy User, Club Admin, etc.).

---

## 2. ⚙️ Tech Stack
*   **Framework**: Next.js 14+ (Using the modern **App Router**)
*   **Library**: React 18
*   **Styling**: Tailwind CSS + `cn()` utility (clsx + tailwind-merge)
*   **State Management**: React Context API (Auth) + Local Component State (Forms)
*   **API Handling**: Native `fetch` with a custom service wrapper (`services/api.ts`)
*   **UI Library**: ShadCN UI (Built on Radix UI primitives), Lucide React (Icons)
*   **Notifications**: Sonner (Toast notifications)

---

## 3. 🏗️ Project Architecture (Frontend-Focused)

### Rendering Strategy
*   **CSR (Client-Side Rendering)**: Used heavily for highly interactive forms (e.g., the booking multi-step form) and dynamic tables. Indicated by the `"use client"` directive.
*   **SSR (Server-Side Rendering)**: Used for initial page loads and layout scaffolding where SEO or immediate data availability is beneficial.

### Data Flow Example (API → State → UI)
`User Action (Click "Next")` ➡️ `Component executes async function` ➡️ `services/api.ts calls Frappe Backend` ➡️ `Response parsed` ➡️ `React State (useState) updated` ➡️ `UI Re-renders via Reconciliation`.

---

## 4. 📁 Folder Structure

*   **`app/`**: Next.js App Router core. Contains all pages, layouts, and API routes.
    *   *Usage*: Creating new routes (e.g., `app/dashboard/page.tsx`).
*   **`components/`**: Reusable React components.
    *   **`ui/`**: Dumb components (Buttons, Inputs, Dialogs - mostly ShadCN).
    *   **`club-booking/`**: Smart, feature-specific components (Forms, Tables).
    *   **`admin/`**: Admin layouts (Sidebar, Header).
*   **`context/`**: Global state providers (e.g., `auth-context.tsx`).
*   **`services/`**: API integration layer.
    *   `api.ts`: Core fetch wrappers and business logic API calls.
    *   `api-routes.ts`: Central registry of backend endpoints.
*   **`lib/`**: Utility functions (`utils.ts` for Tailwind, `date-utils.ts`, `booking-validation.ts`).
*   **`types/`**: TypeScript interfaces and types for strict type checking.

---

## 5. 🧭 Routing System (Next.js App Router)
We use Next.js **File-based routing** with Route Groups to organize layouts without affecting the URL.

*   **Route Groups**: `app/(afterlogin)/` enforces the admin layout without adding `/afterlogin` to the URL.
*   **Dynamic Routes**: `app/(afterlogin)/club-booking-list/[id]/page.tsx` handles specific booking views dynamically.
*   **Layouts**: `app/(afterlogin)/layout.tsx` wraps all inner pages with the persistent Sidebar and Header.

👉 **Example**: Navigating to `/dashboard` renders `app/(afterlogin)/dashboard/page.tsx` wrapped in `layout.tsx`.

---

## 6. 🔐 Authentication Flow
Security is handled through a combination of Frappe session cookies and Next.js state mechanisms.

1.  **Login Action**: User enters credentials ➡️ `api.login()` sends request to Frappe.
2.  **Session Establishment**: Frappe sets secure HTTP-Only cookies. A Next.js server sync is triggered to mirror this state for the Edge middleware.
3.  **State Hydration**: `AuthContext` fetches the user profile and roles, saving them in React State.
4.  **Middleware Guard**: `middleware.ts` intercepts route requests (like `/dashboard`) to ensure `isValidSession` is true before allowing access.

---

## 7. 🔄 Core User Flow: The Booking Creation
Here is a story of how a user creates a booking:

1.  **Start Generation**: User visits `/club-booking` and fills out the "Event Information" (Tab 1).
2.  **State Storage**: Input is stored in local React state (`setTab1`).
3.  **Intermediate Save**: User clicks "Next". The frontend validates the fields, calls `api.saveClubBooking()`, and the backend creates a Draft record, returning a `booking_id`.
4.  **URL Sync**: The `booking_id` is encrypted and appended to the URL (`?bid=XYZ&tab=2`). This ensures data isn't lost on refresh.
5.  **Child Tables**: In Tab 2 (Food), the user adds entries. Each "Add" triggers a silent background API call to save the row, preventing full-page flickers while keeping the DB perfectly in sync.

---

## 8. 🧩 Component Architecture
*   **Dumb Components (`components/ui/*`)**: Only care about props. They have no API logic (e.g., `<Button>`, `<Input>`).
*   **Smart Components (`components/club-booking/*`)**: Maintain state, call APIs, and handle complex business logic (e.g., `<ClubBookingForm>`).
*   **Modularity**: Large features are split. For example, the booking form isn't one huge file; it uses `<Tab1EventInfo>`, `<Tab2FoodCatering>`, etc., which are orchestrated by the parent `<ClubBookingForm>`.

---

## 9. 📡 API Integration Layer
All external communication happens in `services/api.ts`.
*   **Centralized Routes**: Endpoints are defined in `api-routes.ts` to prevent hardcoding URLs across the app.
*   **Wrapper**: We use `clientFetch` (a native fetch wrapper) to automatically handle JSON parsing, error throwing, and credentials inclusion.

👉 **Example**:
```typescript
async getClubBookingDetails(id: string): Promise<any> {
    const json = await clientFetch(`${API_ROUTES.clubBooking.getDetails}?name=${id}`);
    return json.message;
}
```

---

## 10. 🗄️ State Management
*   **Local State (`useState` / `useReducer`)**: Used for 95% of the app (Form inputs, toggling modals, loading spinners).
*   **Global Context (`useAuth`)**: Used strictly for App-wide state that many components need to read simultaneously (User Details, Roles, Authentication status).

---

## 11. 🎨 UI/UX Patterns Used
*   **Dynamic Accent Colors**: The app extensively uses the primary brand color **`#7D3FD0` (Purple)** for active states, buttons, and visual focus.
*   **Silent Background Refreshes**: When augmenting tables (Adding/Deleting rows), we use local state reconciliation to prevent the entire page from showing a loading spinner, preserving a smooth, app-like feel.
*   **Validation**: Real-time evaluation of logical states (e.g., ensuring dietary meal counts do not exceed total guest counts).

---

## 12. ⚙️ Environment Setup

### First-time Setup
1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Copy `.env.example` to `.env.local` if applicable, or ensure your local Frappe backend is running on the correct proxy port (Usually `http://localhost:8000`).
4.  Start development server:
    ```bash
    npm run dev
    ```

---

## 13. 🚀 Build & Deployment
*   **To verify production build locally**:
    ```bash
    npm run build
    npm start
    ```
*   **Deployment**: The project is optimized for deployment on Vercel or any Node.js environment supporting Next.js. Environment variables (like `NEXT_PUBLIC_API_URL`) must be set in the deployment dashboard.

---

## 14. ⚠️ Common Issues & Fixes
*   **Hydration Errors**: Occur if browser HTML differs from server HTML (e.g., rendering timestamps without strict control). Ensure client-only code runs in `useEffect` or use standard UTC formatting.
*   **Middleware Redirect Loops**: If you get stuck in a login/dashboard redirect loop, clear your local cookies (`app_session`) and Application Storage.
*   **CORS Issues**: Ensure the Frappe backend's `site_config.json` allows the frontend's origin (e.g., `http://localhost:3000`).

---

## 15. 🧠 Important Decisions
*   **Why App Router?** Provides cutting-edge React features like Server Components and streamlined Layout structures, making nested routing highly intuitive.
*   **Why No Redux/Zustand?** The complexity of this application revolves around Forms and CRUD operations. React's local state + custom Context is perfectly sufficient and keeps the bundle size incredibly small.

---

## 16. 🔁 Reusability & Scalability
*   **Adding a Feature**:
    1.  Create UI elements in `components/ui/` if missing.
    2.  Build the layout in `app/(afterlogin)/[new-feature]/page.tsx`.
    3.  Create feature-specific components in `components/[new-feature]/`.
    4.  Add backend routes to `services/api-routes.ts` and fetchers to `services/api.ts`.
*   **Never duplicate styles**: Always use Tailwind classes or build a reusable ShadCN component.

---

## 17. 📌 Coding Standards
*   **Naming**: Kebab-case for files (`club-booking-form.tsx`), PascalCase for React components (`ClubBookingForm`), camelCase for functions/variables.
*   **Type Safety**: Use TypeScript interfaces for all data structures. Never use `any` unless strictly interacting with untyped legacy payload structures.
*   **Imports**: Rely on the `@/` path alias pointing to the root `src` or base directory.

---

## ⚡ Quick Start Cheat Sheet & Where to Look

| I want to...                        | Look in this file/folder                                                           |
| :---------------------------------- | :--------------------------------------------------------------------------------- |
| **Change the Sidebar Navigation**   | `components/admin/admin-sidebar.tsx`                                               |
| **Add a new API call**              | `services/api.ts` & `services/api-routes.ts`                                       |
| **Modify Booking Form Fields**      | `components/club-booking/club-booking-form.tsx` (and its Tab children)             |
| **Update Global Brand Colors**      | Directly in the Tailwind classes of the Target Component, or `tailwind.config.ts`. |
| **Fix a Dashboard Graph**           | `app/(afterlogin)/dashboard/dynamic-dashboard-section.tsx`                         |
| **Adjust Booking Validation Logic** | `lib/booking-validation.ts`                                                        |
| **Change Route Guarding Rules**     | `middleware.ts` AND `context/auth-context.tsx`                                     |

*Happy Coding! 🎉*
