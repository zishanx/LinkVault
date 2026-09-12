# LinkVault — Progress Tracker

> Paste this file's content at the start of a new chat to get Claude ("Cosmo") back up to speed instantly.

## ⚠️ Stack Note (UPDATED — Sept 2026)
Per the locked roadmap, LinkVault's frontend was originally slated for JS-first-then-port-per-piece. **This has been revised.** Decision made this session:

### Workflow (current): Full JS build → TS revision (independent, self-paced) → single port pass
- **Build the entire LinkVault frontend in JS**, no interruptions, stay in flow. No per-piece porting.
- **TS revision runs separately, on his own pace, outside of LinkVault build time.**
- **Port the whole frontend to TS once, at the end**, after TS revision is done — by then he's applying internalized concepts instead of learning and translating at the same time.
- Rationale: the old per-piece workflow caused context-switching between "what does LinkVault need next" (build-mode) and "what does TS's type system want here" (learn-mode) — this is what caused the stall on `createContext` generics. Separating the two problems fully (build now, port later) removes that friction.
- `AuthContext.jsx` (round 1 of the old workflow) stays as-is in JS — correct, tested, reviewed logic. It will be ported along with everything else in the final port pass, not before.
- **No more per-piece TS porting until the full JS frontend is built and TS revision is complete.**

All frontend work from here forward — axios, Router, ProtectedRoute, Login/Register, dashboard, link management UI, public profile — stays in `.js`/`.jsx` until the single end-of-build port phase.

## What LinkVault Is
A subscription-gated link-in-bio + analytics tool (like Linktree, but with paid tiers).
- **Free tier:** up to 5 links
- **Paid tier (via Razorpay Subscriptions):** unlimited links, click analytics, custom themes
- Public profile page at `linkvault.com/:username`
- Purpose: revision vehicle for MERN concepts (post-2-month break) + learning Razorpay Subscriptions API + webhooks + TypeScript (via separate revision track, ported into this project at the end)

## Stack
- **Frontend (for now):** React (Vite), JavaScript, Tailwind — will be ported to TypeScript in a single pass once TS revision is complete
- **Backend:** Node.js, Express (JS — no TS migration planned for backend at any stage)
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
└── client/ (JS/JSX for now — will be ported to TS in one pass at the end)
    ├── src/
    │   └── context/
    │       └── AuthContext.jsx  ✅ done in JS — logic fully correct, reviewed, all bugs fixed (see below)
    └── 🔲 everything else not started — axios setup, React Router, Login/Register pages next (all in .jsx)
```

## Progress Log

### ✅ Done — Full Auth Layer (backend, JS — permanent, no TS migration planned)
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

Full flow reasoned through and internalized (this reasoning carries over 1:1 into the eventual TS port — only type annotations will be new work):
- **Why three state variables, not two:** `user: null` is ambiguous on its own — it could mean "confirmed logged out" or "haven't checked yet." `isLoading` disambiguates between those two states so a future `ProtectedRoute` doesn't wrongly redirect a valid logged-in user during the brief window while the verify call is still in flight.
- **`useEffect` on mount:** if no `token` exists, immediately `setIsLoading(false)` and `return` early — no point calling the API for a token that doesn't exist.
- **`verify()` inner async function:** fetches `/api/auth/verify` with `Authorization: Bearer <token>` header (matches `protect`'s `split(' ')[1]` parsing). NOTE: fetch URL is currently `''` (placeholder) — needs real base URL wired in via axios.
- **Response handling:** `await res.json()`. On `res.ok`, `setUser(data)` with the flat `{ message, name, username, subscription }` object. Either branch (success or failure) always calls `setIsLoading(false)`.
- **`login(token, userData)`:** for explicit form-submit flow, not app-mount flow. Saves token + `JSON.stringify(userData)` to `localStorage`, sets both directly in state — no re-verification needed.
- **`logout()`:** clears `token`/`user` state and their `localStorage` entries.
- **Custom hook:** `export const useAuth = () => useContext(AuthContext)`.

**Full context/Provider/consumer syntax was also re-taught this session** (createContext → Provider component holding state → children prop → custom `useAuth` hook).

### ✅ Done — `linkRoutes.js`
Clean REST convention (`GET/POST /`, `PUT/DELETE /:id`), all behind `protect`. Confirmed working.

### ✅ Done — `server.js`
(unchanged)

### ✅ Done — First End-to-End Test (Postman) — link CRUD layer
Full flow tested: register → login → grab token → create/get/update/delete links, all via Postman. All four link routes confirmed working end-to-end. No known open bugs.

### 🔲 Immediate Next Steps (in order — all JS/JSX)
1. **Set up axios** with the real backend base URL — `AuthContext.jsx`'s `verify()` fetch call currently has an empty `''` URL placeholder. Decide axios instance file (`api.js` with `baseURL`) vs. plain `fetch` with a constant — leaning axios.
2. **Wire `AuthProvider` into the app** — wrap `<App />` with it in `main.jsx`.
3. **React Router setup** (`.jsx`) — routes for Login, Register, Home/Dashboard, and a `ProtectedRoute` component using `isLoading` + `user` together (not just `user` alone) to decide render-vs-redirect.
4. **Login/Register pages** (`.jsx`) — forms that call `login(token, userData)` from `AuthContext` on successful API response.
5. **Dashboard / link management UI** — CRUD UI against the already-verified backend link routes.
6. **Public profile page** (`/:username`).
- Still open/undiscussed: exact landing destination post-login (dashboard vs. public profile) — flagged as still to decide.

### 🔲 Deferred to end-of-build TS port phase
- Full frontend port to `.tsx`/`.ts` (all files built in this JS phase)
- Types for `User`, `AuthContextType`, `useAuth` undefined-guard, etc. — same plan as before, just deferred
- Confirm/set up client as TS Vite project (or retrofit) at that point, not now

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (JS for now): axios setup, React Router, Login/Register pages, `ProtectedRoute`, dashboard, public profile page, link management UI
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
- **Workflow revision (Sept 2026, this session):** dropped per-piece JS-then-port workflow in favor of full JS build now, TS revision separately/self-paced, single port pass at the end. Reason: per-piece porting was forcing simultaneous build-mode and learn-mode context-switching, which is what caused the `createContext` generics stall.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question.
- Recurring pattern to watch: over-engineering a condition on first pass (e.g. redundant re-checking of auth status that `protect` already guarantees). Also watch for "right shape, wrong specific reference" errors (e.g. `useContext(AuthProvider)` instead of `useContext(AuthContext)`) and forgetting async/await.
- When rusty on syntax after a break, he asks directly for a refresher rather than guessing.
- Responds very well to "write it yourself first, then I'll review."
- **Full link CRUD layer is runtime-verified end-to-end via Postman. Treat as solid, tested ground.**
- **Auth verify route (`/api/auth/verify`) is Postman-tested and confirmed working. Treat as solid, tested ground.**
- **`AuthContext.jsx` logic is correct and reviewed. It stays in JS for now** — do NOT prompt for a TS port until the full frontend is built and his separate TS revision track is complete.
- **Do not reintroduce per-piece JS-then-port workflow.** Current plan is: build full frontend in JS → finish TS revision independently → port entire frontend to TS in one pass.
- **Next session starts at:** axios setup (`.js`) with real backend base URL, then `AuthProvider` wiring into `main.jsx`, then React Router (Login/Register, `ProtectedRoute`, Home/Dashboard) — all in JS.