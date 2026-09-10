# LinkVault — Progress Tracker

> Paste this file's content at the start of a new chat to get Claude ("Cosmo") back up to speed instantly.

## What LinkVault Is
A subscription-gated link-in-bio + analytics tool (like Linktree, but with paid tiers).
- **Free tier:** up to 5 links
- **Paid tier (via Razorpay Subscriptions):** unlimited links, click analytics, custom themes
- Public profile page at `linkvault.com/:username`
- Purpose: revision vehicle for MERN concepts (post-2-month break) + learning Razorpay Subscriptions API + webhooks

## Stack
- **Frontend:** React (Vite), Tailwind
- **Backend:** Node.js, Express
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
    ├── src/
    │   └── context/
    │       └── AuthContext.jsx  ✅ done — written solo, reviewed, all bugs fixed (see below)
    └── 🔲 everything else not started — axios setup, React Router, Login/Register pages next
```

## Progress Log

### ✅ Done — Full Auth Layer (backend)
User model, register/login controllers, protect middleware, authRoutes, server.js.

### ✅ Done — Link Model (`Link.js`)
name, link, user ref, clickCount default 0, order required, timestamps.

### ✅ Done — Full Link CRUD Layer (`linkController.js`)
All four routes runtime-tested end-to-end via Postman (createLink, getLinks, updateLink, deleteLink). No known open bugs. Treat as solid, tested ground — no need to re-verify unless something changes in that code.

### ✅ Done — Auth Verification Route (`verifyAuth`) — Postman-tested this session
- Route: `GET /api/auth/verify`, behind `protect`.
- Controller destructures `{ name, username, subscription }` from `req.user`, returns `200` with `{ message, name, username, subscription }`.
- **Postman-tested and confirmed working:** valid token → 200 with correct fields; no token / garbage token → 401 from `protect` itself (`verifyAuth` never runs in that case). No known open bugs.

### ✅ Done — `AuthContext.jsx` (frontend) — built this session

**Built via heavy Socratic back-and-forth, then rewritten solo from scratch as a final check — second attempt was correct with only minor pointed corrections needed.**

Final state/shape:
```jsx
const [token, setToken] = useState(localStorage.getItem('token') || null)
const [user, setUser] = useState(null)
const [isLoading, setIsLoading] = useState(true)
```

Full flow reasoned through and internalized:
- **Why three state variables, not two:** `user: null` is ambiguous on its own — it could mean "confirmed logged out" or "haven't checked yet." `isLoading` disambiguates between those two states so a future `ProtectedRoute` doesn't wrongly redirect a valid logged-in user during the brief window while the verify call is still in flight.
- **`useEffect` on mount:** if no `token` exists, immediately `setIsLoading(false)` and `return` early — no point calling the API for a token that doesn't exist. (First draft forgot the `return`, caught on review — code fell through to calling `verify()` regardless.)
- **`verify()` inner async function:** fetches `/api/auth/verify` with `Authorization: Bearer <token>` header (matches `protect`'s `split(' ')[1]` parsing — reasoned through why the raw token alone would break that parse). NOTE: fetch URL is currently `''` (placeholder) — needs real base URL wired in next session via axios.
- **Response handling:** `await res.json()` (first draft forgot the `await`, caught on review — `res.json()` returns a Promise, not synchronous data). On `res.ok`, `setUser(data)` with the flat `{ message, name, username, subscription }` object (first draft mistakenly tried `data.data`, corrected after re-examining `verifyAuth`'s actual response shape). Either branch (success or failure) always calls `setIsLoading(false)` — the "checking" phase is over regardless of outcome.
- **`login(token, userData)`:** for explicit form-submit flow, not app-mount flow. Saves token + `JSON.stringify(userData)` to `localStorage`, sets both directly in state — no re-verification needed since this data is freshly trusted from a just-succeeded API call.
- **`logout()`:** clears `token`/`user` state and their `localStorage` entries.
- **Custom hook:** `export const useAuth = () => useContext(AuthContext)` — first draft mistakenly wrote `useContext(AuthProvider)` (wrong argument — passed the component instead of the context object) wrapped in `{ }` braces (which discarded the return value entirely, since arrow functions with `{ }` require an explicit `return`). Both caught and fixed on review.

**Full context/Provider/consumer syntax was also re-taught this session** (createContext → Provider component holding state → children prop → custom `useAuth` hook) since it had gone rusty after the break — he found this explanation clarifying.

### ✅ Done — `linkRoutes.js`
Clean REST convention (`GET/POST /`, `PUT/DELETE /:id`), all behind `protect`. Confirmed working.

### ✅ Done — `server.js`
(unchanged)

### ✅ Done — First End-to-End Test (Postman) — link CRUD layer
Full flow tested: register → login → grab token → create/get/update/delete links, all via Postman. All four link routes confirmed working end-to-end. No known open bugs.

### 🔲 Immediate Next Steps (session resumes here — picking up "later in the evening")
- **Set up axios** (or a shared fetch wrapper) with the real backend base URL — `AuthContext.jsx`'s `verify()` fetch call currently has an empty `''` URL placeholder that needs to be filled in. This is the very first thing to fix.
- **Decide:** axios instance file (e.g. `api.js` with `baseURL` preconfigured) vs. plain `fetch` with a constant — leaning toward axios since "we have to make calls always."
- **Wire `AuthProvider` into the app** — wrap `<App />` with it in `main.jsx`.
- **React Router setup** — routes for Login, Register, Home/Dashboard, and a `ProtectedRoute` component that uses `isLoading` + `user` together (not just `user` alone) to decide render-vs-redirect.
- **Login/Register pages** — forms that call `login(token, userData)` from `AuthContext` on successful API response.
- Still open/undiscussed: exact landing destination post-login (dashboard vs. public profile) — flagged as still to decide.

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend: axios setup, React Router, Login/Register pages, `ProtectedRoute`, dashboard, public profile page, link management UI
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
- **List endpoint response shape:** always wrap arrays in a named key, e.g. `{ links: [...] }`, not a bare array — leaves room to add metadata (counts, pagination) later.
- **Partial update pattern:** guard each optional field assignment with `if (field) {...}` rather than unconditionally overwriting, to avoid `undefined` overwrites failing schema validation.
- **Auth verification on app load:** a token's mere presence in `localStorage` doesn't prove it's valid. Correct pattern is to send it to a protected backend route on app mount and use that response's success/failure to decide auth state.
- **Middleware trust boundary:** once a request passes through `protect`, downstream controllers can trust `req.user` is a valid, existing user — no need to re-check "is logged in" logic inside the controller itself.
- **Schema-level field exclusion:** `select: false` on a schema field (used on `password`) means it's excluded from all queries by default, including ones inside middleware like `protect` — no manual `delete user.password` needed downstream. To get it back (e.g. comparing during login), must explicitly `.select('+password')` on that query.
- **Three-state auth pattern (new this session):** `user` + `token` + `isLoading` as separate state variables — `isLoading` exists specifically to disambiguate "confirmed not logged in" from "haven't checked yet," which a two-variable (`user`/`token` only) design cannot express. `ProtectedRoute` and similar consumers must check `isLoading` before trusting `user`'s null/non-null value.
- **`login()` vs. mount-time `verify()` (new this session):** `login()` runs on explicit user action with freshly-trusted server data — no re-verification needed, state is set directly. The mount-time `useEffect` verify exists specifically because a token surviving in `localStorage` from a previous session is "unknown until proven" — its mere presence doesn't guarantee validity.
- **`res.json()` is async (new this session):** returns a Promise, must be `await`-ed — easy to forget since the naming doesn't hint at it.
- **Bearer token header format (new this session):** must send `Authorization: Bearer <token>`, matching `protect`'s server-side `split(' ')[1]` parsing — sending the raw token alone breaks that parse.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question, and increasingly catches conceptual gaps (e.g. the `isLoading` ambiguity problem) once nudged toward the right frame, even when the correct answer isn't immediate.
- Recurring pattern to watch: over-engineering a condition on first pass (previously: redundant re-checking of auth status that `protect` already guarantees). No new instance of this specific pattern this session — instead, new first-draft bugs were more about *forgetting async/await* and *misnaming variables passed into hooks* (e.g. `useContext(AuthProvider)` instead of `useContext(AuthContext)`). Watch for this "right shape, wrong specific reference" error type going forward.
- When rusty on syntax after a break, he asks directly for a refresher rather than guessing — respond with a clear, structured explanation (this session: full Context/Provider/consumer pattern) before returning to Socratic mode on the actual bug-hunting.
- Responds very well to "write it yourself first, then I'll review" — his solo second-draft rewrite of `AuthContext.jsx` was nearly perfect, needing only three small corrections, all of which he found himself once pointed at the right question.
- **Full link CRUD layer is runtime-verified end-to-end via Postman. Treat as solid, tested ground going forward.**
- **Auth verify route (`/api/auth/verify`) is now Postman-tested and confirmed working (valid/no-token/bad-token all correct). Treat as solid, tested ground going forward.**
- **`AuthContext.jsx` is written, reviewed, and correct — but the `verify()` fetch call has an empty placeholder URL (`fetch('', {...})`) that must be filled in once axios/base URL is set up. Do not treat this file as fully wired until that's fixed.**
- **Next session starts at:** setting up axios (or a fetch wrapper) with the real backend base URL, wiring `AuthProvider` into `main.jsx`, then React Router setup (Login/Register pages, `ProtectedRoute`, Home/Dashboard) with the on-load token verification flow already built and ready to use.