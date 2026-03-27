# Club Booking Frontend — Complete Documentation

> Next.js 16 · React 19 · TypeScript · Frappe Backend

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Booking Form — Full Flow](#2-booking-form--full-flow)
3. [Tab 1 — Event Information](#3-tab-1--event-information)
4. [Tab 2 — Food & Catering](#4-tab-2--food--catering)
5. [Tab 3 — Stay](#5-tab-3--stay)
6. [Validation — Where & What](#6-validation--where--what)
7. [Global State (Context)](#7-global-state-context)
8. [URL Persistence](#8-url-persistence)
9. [API Layer](#9-api-layer)
10. [Types Reference](#10-types-reference)
11. [Utilities](#11-utilities)
12. [Master Data](#12-master-data)
13. [How to Add a New Field](#13-how-to-add-a-new-field)

---

## 1. Project Structure

```
club_booking_frontend/
│
├── app/
│   └── (afterlogin)/
│       └── club-booking/
│           ├── page.tsx                    ← Server component: fetches masterData
│           └── create-booking-wrapper.tsx  ← Client wrapper: passes router callbacks
│
├── components/
│   └── club-booking/
│       ├── club-booking-form.tsx           ← MAIN ORCHESTRATOR (tab shell + API calls)
│       ├── tab1-event-info.tsx             ← Tab 1 UI (pure presentational)
│       ├── tab2-food-catering.tsx          ← Tab 2 UI (draft form + entries table)
│       └── tab3-stay.tsx                  ← Tab 3 UI (draft form + entries table)
│
├── context/
│   └── club-booking-context.tsx           ← Global state (bookingId, tab1, food[], stay[])
│
├── lib/
│   ├── booking-validation.ts              ← ALL validation logic (Tab1, Tab2, Tab3)
│   ├── date-utils.ts                      ← generateDayOptions, formatDisplayDate
│   ├── encrypt.ts                         ← encryptId / decryptId for URL param
│   └── client-fetcher.ts                  ← Base HTTP fetch wrapper (Frappe-aware)
│
├── services/
│   ├── api.ts                             ← All client-side API calls
│   └── api-routes.ts                      ← Centralized Frappe endpoint paths
│
└── types/
    ├── club-booking.types.ts              ← All booking-specific TypeScript types
    └── index.ts                           ← Shared types (User, Country, State, etc.)
```

---

## 2. Booking Form — Full Flow

```
┌─────────────────────────────────────────────────────────┐
│  app/(afterlogin)/club-booking/page.tsx  (SERVER)       │
│  → fetches masterData (booking_for, food_preferences,   │
│    meal_type, service_type) from Frappe via apiServer   │
│  → renders <CreateBookingWrapper masterData={...} />    │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  create-booking-wrapper.tsx  (CLIENT)                   │
│  → provides router.push("/club-booking-list") onSuccess │
│  → renders <BookingForm masterData={...} onSuccess />   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  club-booking-form.tsx  (MAIN ORCHESTRATOR)             │
│  → wraps everything in <ClubBookingProvider>            │
│  → manages active tab, loaders, API calls               │
│  → reads ?bid= from URL on mount → hydrates state       │
│  → [Next] on Tab1: validate → CREATE/UPDATE → goToTab(2)│
│  → [+Add] on Tab2: validates → API addFoodCatering      │
│  → [+Add] on Tab3: validates → API addStay              │
│  → [Submit]: UPDATE booking {status:"Submitted"}        │
└─────────────────────────────────────────────────────────┘
          ↓                  ↓                  ↓
   Tab1EventInfo     Tab2FoodCatering       Tab3Stay
   (tab1-event-     (tab2-food-            (tab3-stay.tsx)
    info.tsx)        catering.tsx)
```

### Complete User Journey

| Step | User Action | What Happens in Code |
|------|-------------|----------------------|
| 1 | Opens `/club-booking` | Server fetches masterData; page renders empty form |
| 2 | On refresh with `?bid=xxx` | `decryptId(bid)` → `api.getClubBookingDetails(id)` → `hydrateFromServer(data)` |
| 3 | Fills Tab 1 fields | `handleTab1Change` → `setTab1({field: value})` → clears that field's error |
| 4 | Clicks **Next** | `validateTab1(tab1)` → if errors: show inline; else call /create_booking |
| 5 | CREATE/UPDATE success | Returns `{club_booking_id}` → `encryptId(id)` → stored in `?bid=` URL param |
| 6 | Moves to Tab 2 | `goToTab(2)` → updates `?tab=2` in URL |
| 7 | Fills food entry, clicks **+** | `validateTab2Draft(draft)` → if ok: add to local array + call `/create_booking` with full payload |
| 8 | Clicks **Next** (Tab 2→3) | `/create_booking` fires again to sync any edits/deletions → `goToTab(3)` |
| 9 | Fills stay entry, clicks **+** | `validateTab3Draft(draft)` → add to local array + call `/create_booking` with full payload |
| 10 | Clicks **Submit** | `/submit_booking` fired with full payload → toast → redirect |

---

## 3. Tab 1 — Event Information

**File:** `components/club-booking/tab1-event-info.tsx`

### Fields

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `guest_region` | Select | No | Hardcoded list | Domestics, International, North, South, East, West |
| `booking_for` | Select | ✅ Yes | `masterData.booking_for` | Drives Tab 2 layout (Academy vs Club House) |
| `event_name` | Text Input | ✅ Yes | User input | — |
| `from_date` | Date Input | ✅ Yes | User input | Used to generate Day-wise options in Tab 2 |
| `to_date` | Date Input | ✅ Yes | User input | `min` is locked to `from_date` |

### How Fields Work

- All fields are **controlled** — values live in `ClubBookingContext → tab1`
- Changes go through `handleTab1Change(field, value)` in `club-booking-form.tsx`
- That calls `setTab1({ [field]: value })` on the context
- Also clears that field's error entry from `tab1Errors` state

### Validation (Tab 1)

Validated in `lib/booking-validation.ts → validateTab1()`:

```
event_name  → must not be empty
from_date   → must not be empty
to_date     → must not be empty
to_date     → must be >= from_date (string comparison)
booking_for → must not be empty
```

Errors are shown **inline** below each field as red text (12px).

---

## 4. Tab 2 — Food & Catering

**File:** `components/club-booking/tab2-food-catering.tsx`

### How It Works

Tab 2 uses a **draft + entries table** pattern:
1. User fills the draft form at the top
2. Clicks **+** (the blue Plus button inside the Remark field)
3. Draft is validated → entry is built → pushed to `foodAndCatering[]` in context
4. API call `addFoodCatering(bookingId, entry)` is made if `bookingId` exists
5. Table below shows all added entries

### Layout Differences: Academy vs Club House

The form layout changes based on `tab1.booking_for`:

| Field | Academy | Club House |
|-------|---------|------------|
| Total Number of Guests | ✅ Required | ❌ Hidden |
| Distributors/Guest Name | ❌ Hidden | ✅ Required |
| Designation | ❌ Hidden | Optional |
| Firm/Hospital Name | ❌ Hidden | Optional |
| Repeat Guest | ❌ Hidden | Optional (Yes/No) |
| Country | ❌ Hidden | Optional (server-side search) |
| State | ❌ Hidden | Optional (loaded by country) |
| Stay Required checkbox | ❌ Hidden | ✅ Shown |
| Check-in / Check-out | ❌ Hidden | Shown if Stay Required = true |

### Dynamic Meal Count Fields

Once `meal_type` is selected, count input(s) appear **conditionally**:

```
meal_type contains "veg" (but NOT "non veg") → shows [Veg Count] input
meal_type contains "non veg"                  → shows [Non-Veg Count] input
meal_type contains "jain"                     → shows [Jain Count] input
meal_type contains "others"                   → shows [Others Count] input
```

This matching is case-insensitive `.toLowerCase().includes(...)`.

### Day Wise Plan Dropdown

Options are **auto-generated** from `from_date` and `to_date` (set in Tab 1).

```
from_date = 2026-02-22 | to_date = 2026-02-24
→ Day 1 (22 Feb 2026)  value: "2026-02-22"
→ Day 2 (23 Feb 2026)  value: "2026-02-23"
→ Day 3 (24 Feb 2026)  value: "2026-02-24"
```

- Generated by `lib/date-utils.ts → generateDayOptions(from, to)`
- Wrapped in **`useMemo`** so it only recalculates when dates change
- If Tab 1 dates are not set → dropdown shows "Set From/To date in Tab 1"

### Country & State Search (Club House only)

- Countries load via **server-side search** (`api.getCountries(search_name?)`)
- Default load on component mount (empty search = all countries)
- Debounced 300ms through `SearchableSelect → onSearch` prop
- States load **when country changes** via `api.getStates(country)`
- State field is **disabled** until a country is selected
- Both use defensive `Array.isArray()` check on response to prevent crashes

### Stay Required Toggle

When `stay_required` checkbox is checked (Club House only):
- Check-in Date field appears (required)
- Check-out Date field appears (required, `min` = check-in date)
- `check_out_date >= check_in_date` is validated

### Entry Table Columns

| Column | Academy | Club House |
|--------|---------|------------|
| Day Plan | ✅ | ✅ |
| Total Guests | ✅ | ❌ |
| Guest Name | ❌ | ✅ |
| Food Preference | ✅ | ✅ |
| Meal Type | ✅ | ✅ |
| Stay (Yes/No) | ❌ | ✅ |
| Check-in | ❌ | ✅ |
| Check-out | ❌ | ✅ |
| Remark | ✅ | ✅ |
| Delete (🗑) | ✅ | ✅ |

---

## 5. Tab 3 — Stay

**File:** `components/club-booking/tab3-stay.tsx`

Same draft + entries table pattern as Tab 2.

### Fields

| Field | Required | Notes |
|-------|----------|-------|
| Distributors/Guest Name | ✅ Yes | — |
| Designation | No | — |
| Firm/Hospital Name | No | — |
| Check-in Date | ✅ Yes | — |
| Check-out Date | ✅ Yes | Must be >= check-in |
| Repeat Guest | No | Yes / No dropdown |
| Country | No | Server-side search |
| State | No | Loaded from server by country; disabled until country selected |
| Remark | No | + button is here to submit the entry |

### Entry Table Columns

Sr. No. · Guest Name · Designation · Hospital/Firm · Check-in · Check-out · Repeat · Country · State · Delete (🗑)

---

## 6. Validation — Where & What

**File:** `lib/booking-validation.ts`

No external library (no zod, no yup). Pure TypeScript functions.

### `validateTab1(data: Tab1FormData)` — called in `club-booking-form.tsx`

| Rule | Field | Error Message |
|------|-------|--------------|
| Must not be empty | `event_name` | "Event name is required" |
| Must not be empty | `from_date` | "From date is required" |
| Must not be empty | `to_date` | "To date is required" |
| `to_date >= from_date` | `to_date` | "To date must be after From date" |
| Must not be empty | `booking_for` | "Booking for is required" |

**When triggered:** User clicks **Next** on Tab 1.

**Where errors show:** Inline under each input field in `tab1-event-info.tsx` via `errors` prop.

---

### `validateTab2Draft(data: Tab2Draft)` — called in `tab2-food-catering.tsx`

| Rule | Field | Error Message | Condition |
|------|-------|--------------|-----------|
| Must select | `day_wise_plan` | "Day-wise plan is required" | Always |
| Must select | `food_preference` | "Food preference is required" | Always |
| Must select | `meal_type` | "Meal type is required" | Always |
| Must not be empty | `guest_name` | "Guest name is required" | Only if `booking_for === "Club House"` |
| Must be > 0 | `total_number_of_guests` | "Total guests must be a positive number" | Only if `booking_for !== "Club House"` |
| Must not be empty | `check_in_date` | "Check-in date is required" | Only if `stay_required === true` |
| Must not be empty | `check_out_date` | "Check-out date is required" | Only if `stay_required === true` |
| `check_out >= check_in` | `check_out_date` | "Check-out must be after check-in" | Only if `stay_required === true` |

**When triggered:** User clicks **+** (Add) button in Tab 2.

**Where errors show:** Inline under each field in `tab2-food-catering.tsx`.

---

### `validateTab3Draft(data: Tab3Draft)` — called in `tab3-stay.tsx`

| Rule | Field | Error Message |
|------|-------|--------------|
| Must not be empty | `guest_name` | "Guest name is required" |
| Must not be empty | `check_in_date` | "Check-in date is required" |
| Must not be empty | `check_out_date` | "Check-out date is required" |
| `check_out >= check_in` | `check_out_date` | "Check-out must be after check-in" |

**When triggered:** User clicks **+** (Add) button in Tab 3.

**Where errors show:** Inline under each field in `tab3-stay.tsx`.

---

### `toErrorMap(errors[])` — helper used everywhere

Converts `ValidationError[] → Record<string, string>` so each component can do `errors.event_name` to get its specific message.

```ts
// Input:  [{ field: "event_name", message: "Event name is required" }]
// Output: { event_name: "Event name is required" }
```

---

## 7. Global State (Context)

**File:** `context/club-booking-context.tsx`

Wraps the entire form. Mounted at the root of `BookingForm`:

```tsx
export function BookingForm(...) {
  return (
    <ClubBookingProvider>     ← mounts context
      <BookingFormInner ... />
    </ClubBookingProvider>
  );
}
```

### State Shape

```ts
{
  bookingId: string | null       // Server-assigned ID (e.g. "CLUB-BOOK-0001")
  tab1: Tab1FormData             // All 5 Tab 1 field values
  foodAndCatering: FoodCateringEntry[]   // All Tab 2 added entries
  stay: StayEntry[]              // All Tab 3 added entries
}
```

### Available Actions (from `useClubBooking()`)

| Action | What It Does |
|--------|-------------|
| `setBookingId(id)` | Stores server-returned booking ID |
| `setTab1(partial)` | Updates one or more Tab 1 fields (merges with spread) |
| `addFoodEntry(entry)` | Appends a new food+catering entry |
| `removeFoodEntry(id)` | Removes a food entry by its local UUID |
| `addStayEntry(entry)` | Appends a new stay entry |
| `removeStayEntry(id)` | Removes a stay entry by its local UUID |
| `hydrateFromServer(data)` | Replaces ALL state from a server-fetched booking object |
| `resetBooking()` | Resets everything back to empty defaults |

### How `hydrateFromServer` Works

Called when the page loads with `?bid=` in the URL:

```ts
setState({
  bookingId: data.name ?? data.club_booking_id ?? null,
  tab1: {
    guest_region: data.guest_region ?? "",
    event_name: data.event_name ?? "",
    from_date: data.from_date ?? "",
    to_date: data.to_date ?? "",
    booking_for: data.booking_for ?? "",
  },
  foodAndCatering: (data.food_and_catering ?? []).map(e => ({ ...e, id: e.name })),
  stay: (data.stay ?? []).map(e => ({ ...e, id: e.name })),
});
```

---

## 8. URL Persistence

**File:** `lib/encrypt.ts` + `club-booking-form.tsx`

### Query Parameters

| Param | Example | Meaning |
|-------|---------|---------|
| `?bid=` | `?bid=CAkFBQ8CBAM-` | Encrypted booking ID |
| `?tab=` | `?tab=2` | Currently active tab (1, 2, or 3) |

### Encryption

- Algorithm: XOR with salt `"CB_2026"` → base64 → URL-safe (no `=`, `+`, `/`)
- **Not** cryptographic — it's obfuscation so raw Frappe IDs aren't exposed
- `encryptId("CLUB-BOOK-0001")` → `"CAkFBQ8CBAM-"` (example)
- `decryptId("CAkFBQ8CBAM-")` → `"CLUB-BOOK-0001"`

### Persistence Flow

```
User clicks Next (Tab 1)
  → API returns { booking_id: "CLUB-BOOK-0001" }
  → encryptId("CLUB-BOOK-0001") → encrypted
  → router.replace("?bid=<encrypted>&tab=1")
  → bookingId stored in context

Tab changes
  → router.replace("?tab=2") (bid stays in params)

User refreshes browser
  → page loads, useEffect reads searchParams.get("bid")
  → decryptId(bid) → "CLUB-BOOK-0001"
  → api.getClubBookingDetails("CLUB-BOOK-0001")
  → hydrateFromServer(data) → all tabs restored
  → searchParams.get("tab") → navigate to correct tab
```

---

## 9. API Layer

### Routes — `services/api-routes.ts`

All Frappe endpoint paths are centralized here:

```ts
clubMasterData: {
  get:          "/api/method/academy.api.club_master_data.get_club_masters",
  getCountries: "/api/method/academy.api.club_master_data.get_countries",
  getStates:    "/api/method/academy.api.club_master_data.get_states",
},
clubBooking: {
  create:         "/api/method/academy.api.club_booking.create_club_booking",
  update:         "/api/method/academy.api.club_booking.update_club_booking",
  getDetails:     "/api/method/academy.api.club_booking.get_club_booking_details",
  addFoodCatering:"/api/method/academy.api.club_booking.add_food_catering",
  addStay:        "/api/method/academy.api.club_booking.add_stay",
}
```

### Methods — `services/api.ts`

| Method | HTTP | Used In | Purpose |
|--------|------|---------|---------|
| `getClubMasterData()` | GET | `api-server.ts` (server) | Fetch booking_for, food_preferences, meal_type |
| `getCountries(search_name?)` | GET | Tab 2, Tab 3 | Server-side country search |
| `getStates(country)` | GET | Tab 2, Tab 3 | Load states for selected country |
| `createClubBooking(data)` | POST | `club-booking-form.tsx` | Create/Update booking → returns `{club_booking_id}` |
| `submitClubBooking(payload)` | POST | `club-booking-form.tsx` (handleSubmit) | Save and push into Approval Matrix |

### Request/Response Shape

**Save/Update Request (All Tabs):**
```json
POST /create_booking
Body: {
  "club_booking_id": "DDCES3444", 
  "event_name": "Dhoni Event",
  "from_date": "2026-02-22",
  "food_and_catering": [
     {
         "doctype": "Food and Stay Child",
         "guest_name": "Deepak Mathur"
     }
  ],
  "stay": []
}
Response: { "message": { "club_booking_id": "DDCES3444" } }
```

**Submit Request:**
`POST /submit_booking` — uses the exact same full payload as above.

**Get Details Response (used for hydration):**
```json
{
  "message": {
    "name": "CLUB-BOOK-0001",
    "club_booking_id": "CLUB-BOOK-0001",
    "event_name": "Dhoni Event",
    "from_date": "2026-02-22",
    "to_date": "2026-02-24",
    "booking_for": "Club House",
    "guest_region": "Domestics",
    "food_and_catering": [ { ... } ],
    "stay": [ { ... } ]
  }
}
```

### Error Handling

- All API methods have `try/catch`
- Methods used in "Next/Submit" flow (`createClubBooking`, `updateClubBooking`) **re-throw** errors so `club-booking-form.tsx` can show a toast
- Methods used for data loading (`getCountries`, `getStates`, `getClubBookingDetails`) **return empty/null** on error (silent fallback)
- Frappe error messages are extracted by `lib/client-fetcher.ts → extractErrorMessage()`

---

## 10. Types Reference

**File:** `types/club-booking.types.ts`

### `Tab1FormData`
```ts
{ guest_region, event_name, from_date, to_date, booking_for }
```

### `FoodCateringEntry` (one row in the Tab 2 table)
```ts
{
  id: string                    // local UUID (crypto.randomUUID())
  day_wise_plan: string         // ISO date value "2026-02-22"
  total_number_of_guests?: number   // Academy only
  guest_name?: string           // Club House only
  designation?: string
  firm_hospital_name?: string
  repeat_guest?: string
  state?: string
  country?: string
  food_preference: string
  meal_type: string
  veg?: number | non_veg?: number | jain?: number | others?: number
  stay_required: boolean
  check_in_date?: string
  check_out_date?: string
  remark: string
}
```

### `StayEntry` (one row in the Tab 3 table)
```ts
{
  id: string
  guest_name, designation, check_in_date, check_out_date,
  firm_hospital_name, repeat_guest, state, country, remark
}
```

### `DayOption`
```ts
{ label: "Day 1 (22 Feb 2026)", value: "2026-02-22" }
```

**File:** `types/index.ts`

### `ClubMasterData` (loaded server-side)
```ts
{
  booking_for: LookupItem[]       // [{ name: "Academy" }, { name: "Club House" }]
  food_preferences: LookupItem[]
  meal_type: LookupItem[]
  service_type: LookupItem[]
}
```

---

## 11. Utilities

### `lib/date-utils.ts`

#### `generateDayOptions(from_date, to_date): DayOption[]`
- Uses `date-fns`: `parseISO`, `differenceInDays`, `addDays`, `format`
- Returns empty array if dates invalid or `to < from`
- Used with **`useMemo`** in `tab2-food-catering.tsx`

#### `formatDisplayDate(dateStr): string`
- Converts `"2026-02-22"` → `"22 Feb 2026"`
- Returns `"-"` if empty, falls back to raw string on parse error

---

### `lib/encrypt.ts`

#### `encryptId(id: string): string`
- XOR each char of id with repeating salt `"CB_2026"`
- Base64 encode → replace `=` `+` `/` with URL-safe chars `-` `_`

#### `decryptId(encrypted: string): string`
- Reverse URL-safe chars → add base64 padding → atob → reverse XOR
- Returns `""` on any error

---

### `lib/booking-validation.ts`

Functions: `validateTab1`, `validateTab2Draft`, `validateTab3Draft`, `toErrorMap`
All return `ValidationError[] = { field: string, message: string }[]`

---

### `lib/client-fetcher.ts`

Base HTTP wrapper for all client-side Frappe calls:
- Sends `credentials: "include"` (Frappe session cookie)
- Throws `FrappeApiError` with human-readable message on non-2xx
- Parses `_server_messages`, `.message`, `.exception` from Frappe error format
- `buildUrl(route, params)` appends query string from a params object

---

## 12. Master Data

Loaded **server-side** in `app/(afterlogin)/club-booking/page.tsx`:

```ts
const masterData = await apiServer.getClubMasterData();
// → academy.api.club_master_data.get_club_masters
```

`masterData` is passed down as a prop through:
```
page.tsx → CreateBookingWrapper → BookingForm → BookingFormInner
         → Tab2FoodCatering (food_preferences, meal_type)
```

`masterData?.booking_for` populates the **Booking For** dropdown in Tab 1.

---

## 13. How to Add a New Field

### Adding a field to Tab 1

1. **Add to type** — `types/club-booking.types.ts → Tab1FormData`
2. **Add validation** — `lib/booking-validation.ts → validateTab1()`
3. **Add UI** — `components/club-booking/tab1-event-info.tsx` (add a `<Field>` block)
4. **Add to API payload** — `club-booking-form.tsx → handleNextFromTab1 → payload object`

### Adding a field to Tab 2 or Tab 3

1. **Add to type** — `FoodCateringEntry` or `StayEntry` in `types/club-booking.types.ts`
2. **Add to draft type** — `Tab2Draft` or `Tab3Draft` in `lib/booking-validation.ts`
3. **Add validation** — `validateTab2Draft()` or `validateTab3Draft()`
4. **Add UI** — inside the grid in `tab2-food-catering.tsx` or `tab3-stay.tsx`
5. **Map in `handleAdd`** — include the new field when building the `entry` object
6. **Add column to table** — add a `<TableHead>` and `<TableCell>` in the entries table

### Adding a new API endpoint

1. **Add route** — `services/api-routes.ts` under the appropriate namespace
2. **Add method** — `services/api.ts` (follow the existing pattern with try/catch)

---

## Dependencies Used

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.1 | Framework |
| `react` | 19.2.3 | UI |
| `sonner` | ^2.0.7 | Toast notifications (`toast.success`, `toast.error`) |
| `date-fns` | ^4.1.0 | Date math (day-wise generation, display formatting) |
| `lucide-react` | ^0.562.0 | Icons (FileText, Utensils, BedDouble, etc.) |
| `@radix-ui/react-select` | ^2.2.6 | Select dropdown primitive |
| `@radix-ui/react-popover` | ^1.1.15 | Used by SearchableSelect |
| `jose` | ^6.2.2 | JWT / session crypto (auth, not booking) |

> **Not used in booking module:** react-hook-form, zod, yup, zustand — native React state + Context is sufficient.
