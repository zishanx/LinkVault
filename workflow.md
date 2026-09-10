# LinkVault — Progress Tracker

> Paste this file's content at the start of a new chat to get Claude ("Cosmo") back up to speed instantly.

## ⚠️ Stack Note (per locked roadmap, Sept 2026)
Per the locked roadmap ("zizzy-the-road-ahead.md"), LinkVault's **frontend is to be built in TypeScript**, not plain JS. `AuthContext.jsx` was already written and fully reviewed in JS this session — it is NOT being thrown away. It's being kept as the **correct, tested reference logic**.

### Workflow (adopted this session): JS-first, then port to TS
For every new frontend piece from here on: **write the logic in JS first, get it working, then immediately port it to TS** in the same session. Rationale — this separates two hard problems instead of stacking them: JS pass = "does the logic work," TS pass = "what are the shapes here." Only the frontend uses this pattern (backend stays JS per the roadmap).
- Applies to: axios setup, React Router pages, `ProtectedRoute`, Login/Register, dashboard, etc.
- Port immediately after the JS version works, not later — waiting turns porting into "re-understand old code" instead of "add types to code I just reasoned through."
- **This is training wheels, not permanent.** After ~3-4 rounds of this (AuthContext, axios, maybe one more component), start typing as you write instead of after. Re-evaluate whether the JS-first step is still needed once type-thinking starts happening naturally.
- Current status: `AuthContext.jsx` is round 1 (JS done, TS port next). Axios setup will be round 2.

All frontend work from here forward — Router, ProtectedRoute, Login/Register, dashboard — ends up in `.tsx`/`.ts`, even if drafted in `.jsx`/`.js` first.

## What LinkVault Is
A subscription-gated link-in-bio + analytics tool (like Linktree, but with paid tiers).
- **Free tier:** up to 5 links
- **Paid tier (via Razorpay Subscriptions):** unlimited links, click analytics, custom themes
- Public profile page at `linkvault.com/:username`
- Purpose: revision vehicle for MERN concepts (post-2-month break) + learning Razorpay Subscriptions API + webhooks + **TypeScript on the frontend**

## Stack
- **Frontend:** React (Vite), **TypeScript**, Tailwind
- **Backend:** Node.js, Express (JS — no TS migration planned for backend at this stage)
- **DB:** MongoDB (Mongoose)
- **Auth:** JWT
- **Payments:** Razorpay Subscriptions API (not yet learned/integrated)

## Core Models (planned)
1. **User** — name, username, email, password, subscription tier
2. **Link** — belongs to User, url, title, click count, order/position
3. **Click** — tracks individual click events for analytics (belongs to Link)

## Folder Structure (as built so far)
```
linkvault/
├── server/
│   ├── models/
│   │   ├── User.js              ✅ done
│   │   └── Link.js              ✅ done
│   ├── controllers/
│   │   ├── authController.js    ✅ done (register + login + verifyAuth)
│   │   └── linkController.js    ✅ done + runtime-tested (createLink, getLinks, updateLink, deleteLink)
│   ├── routes/
│   │   ├── authRoutes.js        ✅ done — register, login, GET /verify (behind protect) all wired + tested
│   │   └── linkRoutes.js        ✅ done — full REST CRUD wired + verified end-to-end
│   ├── middleware/
│   │   ├── protect.js           ✅ done, confirmed working via Postman
│   │   └── clickTracker.js      🔲 not started (click-tracking middleware)
│   └── server.js                ✅ done (auth + links routes mounted, Mongo connects before listen)
└── client/
    ├── vite.config / tsconfig   🔲 not started — need to (re)init client as a TS Vite project (or add TS support if not already scaffolded as TS)
    ├── src/
    │   └── context/
    │       ├── AuthContext.jsx  ✅ done in JS — logic fully correct, reviewed, all bugs fixed (see below)
    │       └── AuthContext.tsx  🔲 NEXT — port the JS version above into typed TS
    └── 🔲 everything else not started — axios setup, React Router, Login/Register pages next (all in .tsx)
```

## Progress Log

### ✅ Done — Full Auth Layer (backend, JS — unaffected by TS migration)
User model, register/login controllers, protect middleware, authRoutes, server.js.

### ✅ Done — Link Model (`Link.js`)
name, link, user ref, clickCount default 0, order required, timestamps.

### ✅ Done — Full Link CRUD Layer (`linkController.js`)
All four routes runtime-tested end-to-end via Postman (createLink, getLinks, updateLink, deleteLink). No known open bugs. Treat as solid, tested ground — no need to re-verify unless something changes in that code.

### ✅ Done — Auth Verification Route (`verifyAuth`) — Postman-tested
- Route: `GET /api/auth/verify`, behind `protect`.
- Controller destructures `{ name, username, subscription }` from `req.user`, returns `200` with `{ message, name, username, subscription }`.
- **Postman-tested and confirmed working:** valid token → 200 with correct fields; no token / garbage token → 401 from `protect` itself (`verifyAuth` never runs in that case). No known open bugs.

### ✅ Done (JS) — `AuthContext.jsx` — built this session, logic locked in
**Built via heavy Socratic back-and-forth, then rewritten solo from scratch as a final check — second attempt was correct with only minor pointed corrections needed.**

Final state/shape:
```jsx
const [token, setToken] = useState(localStorage.getItem('token') || null)
const [user, setUser] = useState(null)
const [isLoading, setIsLoading] = useState(true)
```

Full flow reasoned through and internalized (this reasoning carries over 1:1 into the TS port — only the type annotations are new work):
- **Why three state variables, not two:** `user: null` is ambiguous on its own — it could mean "confirmed logged out" or "haven't checked yet." `isLoading` disambiguates between those two states so a future `ProtectedRoute` doesn't wrongly redirect a valid logged-in user during the brief window while the verify call is still in flight.
- **`useEffect` on mount:** if no `token` exists, immediately `setIsLoading(false)` and `return` early — no point calling the API for a token that doesn't exist.
- **`verify()` inner async function:** fetches `/api/auth/verify` with `Authorization: Bearer <token>` header (matches `protect`'s `split(' ')[1]` parsing). NOTE: fetch URL is currently `''` (placeholder) — needs real base URL wired in via axios.
- **Response handling:** `await res.json()`. On `res.ok`, `setUser(data)` with the flat `{ message, name, username, subscription }` object. Either branch (success or failure) always calls `setIsLoading(false)`.
- **`login(token, userData)`:** for explicit form-submit flow, not app-mount flow. Saves token + `JSON.stringify(userData)` to `localStorage`, sets both directly in state — no re-verification needed.
- **`logout()`:** clears `token`/`user` state and their `localStorage` entries.
- **Custom hook:** `export const useAuth = () => useContext(AuthContext)`.

**Full context/Provider/consumer syntax was also re-taught this session** (createContext → Provider component holding state → children prop → custom `useAuth` hook).

### 🔲 NEXT — Port `AuthContext.jsx` → `AuthContext.tsx`
This is now the first frontend task, ahead of axios setup. What it involves (to reason through Socratically, not just hand over):
- Define a `User` type/interface matching the `verifyAuth` response shape: `{ message: string; name: string; username: string; subscription: 'Free' | 'Premium' }` (or split `message` out if it's only relevant on the wire, not in stored state — worth deciding deliberately).
- Type the three state hooks: `useState<string | null>`, `useState<User | null>`, `useState<boolean>`.
- Define the shape of the context value itself (a `AuthContextType` interface: `token`, `user`, `isLoading`, `login`, `logout`) and type `createContext<AuthContextType | undefined>(undefined)` — this reintroduces the classic "context can be undefined outside a Provider" TS problem, which `useAuth()` should guard against (throw if `undefined`, so consumers get a non-null type back).
- Type `login`'s parameters (`token: string`, `userData: User`).
- Children prop typing: `{ children: React.ReactNode }`.

### ✅ Done — `linkRoutes.js`
Clean REST convention (`GET/POST /`, `PUT/DELETE /:id`), all behind `protect`. Confirmed working.

### ✅ Done — `server.js`
(unchanged)

### ✅ Done — First End-to-End Test (Postman) — link CRUD layer
Full flow tested: register → login → grab token → create/get/update/delete links, all via Postman. All four link routes confirmed working end-to-end. No known open bugs.

### 🔲 Immediate Next Steps (in order)
1. **Port `AuthContext.jsx` → `AuthContext.tsx`** (see above) — do this before anything else touches the frontend.
2. **Confirm/set up client as a TS Vite project** — if the client was scaffolded as JS, this may need `tsconfig.json` + renaming existing files, or a fresh `npm create vite@latest -- --template react-ts` if starting the client folder over is cleaner than retrofitting.
3. **Set up axios** with the real backend base URL — `verify()`'s fetch call currently has an empty `''` URL placeholder. Decide axios instance file (`api.ts` with `baseURL`) vs. plain `fetch` with a constant — leaning axios.
4. **Wire `AuthProvider` into the app** — wrap `<App />` with it in `main.tsx`.
5. **React Router setup** (`.tsx`) — routes for Login, Register, Home/Dashboard, and a `ProtectedRoute` component typed to accept `children: React.ReactNode`, using `isLoading` + `user` together (not just `user` alone) to decide render-vs-redirect.
6. **Login/Register pages** (`.tsx`) — forms that call `login(token, userData)` from `AuthContext` on successful API response.
- Still open/undiscussed: exact landing destination post-login (dashboard vs. public profile) — flagged as still to decide.

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (all `.tsx`): axios setup, React Router, Login/Register pages, `ProtectedRoute`, dashboard, public profile page, link management UI
- Custom themes feature
- Reorder/drag-and-drop for link `order` (own future endpoint, e.g. `reorderLinks` — not part of `updateLink`)
- Refactor bcrypt hashing from route-level → `pre('save')` Mongoose hook (deliberately deferred)

## Learning Notes / Decisions Made
- **bcrypt hashing approach:** route-level for now, deliberate "build it the way I know, then upgrade" — refactor to `pre('save')` hook later.
- Wanderly is the reference/revision codebase throughout.
- **`order` field strategy:** computed at insert time via `Link.countDocuments({ user })`, not user-supplied, not defaulted in schema.
- **Subscription gating:** backend is the source of truth for the 5-link free limit.
- **Status code philosophy:** internalized via cheat sheet in a prior session — applied consistently across all routes with no confusion.
- **Ownership-check pattern:** filter by `{ _id: id, user: req.user._id }` directly in the query, return `404` (not `403`) on mismatch to avoid leaking existence of a resource to an attacker.
- **List endpoint response shape:** always wrap arrays in a named key, e.g. `{ links: [...] }`, not a bare array.
- **Partial update pattern:** guard each optional field assignment with `if (field) {...}` rather than unconditionally overwriting.
- **Auth verification on app load:** a token's mere presence in `localStorage` doesn't prove it's valid. Correct pattern is to send it to a protected backend route on app mount and use that response's success/failure to decide auth state.
- **Middleware trust boundary:** once a request passes through `protect`, downstream controllers can trust `req.user` is a valid, existing user.
- **Schema-level field exclusion:** `select: false` on a schema field (used on `password`) excludes it from all queries by default, including inside middleware like `protect`. Must explicitly `.select('+password')` to get it back.
- **Three-state auth pattern:** `user` + `token` + `isLoading` as separate state variables — `isLoading` exists specifically to disambiguate "confirmed not logged in" from "haven't checked yet."
- **`login()` vs. mount-time `verify()`:** `login()` runs on explicit user action with freshly-trusted server data — no re-verification needed. Mount-time `useEffect` verify exists because a token surviving in `localStorage` is "unknown until proven."
- **`res.json()` is async:** returns a Promise, must be `await`-ed.
- **Bearer token header format:** must send `Authorization: Bearer <token>`, matching `protect`'s server-side `split(' ')[1]` parsing.
- **TS migration rationale (new):** locked roadmap specifies LinkVault frontend in TypeScript. JS `AuthContext.jsx` logic is correct and stays as the reference — the port to `.tsx` is purely about adding type safety on top of already-validated logic, not re-solving the auth flow from scratch.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question.
- Recurring pattern to watch: over-engineering a condition on first pass (e.g. redundant re-checking of auth status that `protect` already guarantees). Also watch for "right shape, wrong specific reference" errors (e.g. `useContext(AuthProvider)` instead of `useContext(AuthContext)`) and forgetting async/await.
- When rusty on syntax after a break, he asks directly for a refresher rather than guessing.
- Responds very well to "write it yourself first, then I'll review."
- **Full link CRUD layer is runtime-verified end-to-end via Postman. Treat as solid, tested ground.**
- **Auth verify route (`/api/auth/verify`) is Postman-tested and confirmed working. Treat as solid, tested ground.**
- **`AuthContext.jsx` logic is correct and reviewed — but it is JS, and the locked roadmap requires the frontend in TS.** Adopted workflow: draft each new frontend piece in JS first, then port to TS in the same session (see workflow note at top). Do not leave a `.jsx` file un-ported before moving to the next piece.
- **Next session starts at:** porting `AuthContext.jsx` → `AuthContext.tsx` (types for User, context value, useAuth guard) — this is round 1 of the JS-first-then-port workflow. Then draft axios in `.js` (round 2), port to `.ts`, then `AuthProvider` wiring into `main.tsx`, then React Router (Login/Register, `ProtectedRoute`, Home/Dashboard) using the same draft-then-port rhythm until it's no longer needed.