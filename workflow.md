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
│   │   ├── authRoutes.js        ✅ done — register, login, GET /verify (behind protect) all wired
│   │   └── linkRoutes.js        ✅ done — full REST CRUD wired + verified end-to-end
│   ├── middleware/
│   │   ├── protect.js           ✅ done, confirmed working via Postman
│   │   └── clickTracker.js      🔲 not started (click-tracking middleware)
│   └── server.js                ✅ done (auth + links routes mounted, Mongo connects before listen)
└── client/
    └── 🔲 not started — starting next session (auth pages + AuthContext)
```

## Progress Log

### ✅ Done — Full Auth Layer
User model, register/login controllers, protect middleware, authRoutes, server.js.

### ✅ Done — Link Model (`Link.js`)
name, link, user ref, clickCount default 0, order required, timestamps.

### ✅ Done — Full Link CRUD Layer (`linkController.js`)
All four routes runtime-tested end-to-end via Postman (createLink, getLinks, updateLink, deleteLink). No known open bugs. Treat as solid, tested ground — no need to re-verify unless something changes in that code.

### ✅ Done — Auth Verification Route (`verifyAuth`) — built this session

**Motive (talked through Socratically this session):** the frontend will store the JWT in `localStorage`. On app load/refresh, the app has *only* a raw token string with zero guarantees — no proof it's still valid, no user info attached. `verifyAuth` is a **status check**, not a login: it sends the stored token to a protected route, and the success/failure of that response tells the frontend whether to treat the user as logged in.

- Route: `GET /api/auth/verify`, behind `protect`.
- Correctly reasoned that `protect` already does the real gatekeeping (decode token → find user by id → attach full doc to `req.user`, returning `401` itself on invalid/missing/expired token) — so `verifyAuth` never needs to re-check "is this user logged in," it can just trust `req.user` exists by the time it runs. Caught and removed a redundant `if/else` re-checking that on first pass.
- Correctly reasoned that `password` is already excluded from `req.user` automatically because the User schema field uses `select: false` — no manual stripping needed in the controller. (Also correctly recalled that `login` has to explicitly override this with `.select('+password')` to compare credentials.)
- Final controller:
```js
export const verifyAuth = async (req, res) => {
    try {
        const { name, username, subscription } = req.user;
        res.status(200).json({ message: "The user is logged in", name, username, subscription })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
}
```
- Noted (not fixed, no rush): `async` isn't doing anything here since there's no `await` in the body — harmless either way, purely a style choice.
- Route wired into `authRoutes.js`:
```js
router.get('/verify', protect, verifyAuth)
```
- **Not yet done:** Postman-testing this route (valid token → 200 with correct fields; no token / garbage token → 401 from `protect` itself, confirming `verifyAuth` never even runs in that case).

### ✅ Done — `linkRoutes.js`
Clean REST convention (`GET/POST /`, `PUT/DELETE /:id`), all behind `protect`. Confirmed working.

### ✅ Done — `server.js`
(unchanged)

### ✅ Done — First End-to-End Test (Postman) — link CRUD layer
Full flow tested: register → login → grab token → create/get/update/delete links, all via Postman. All four link routes confirmed working end-to-end. No known open bugs.

### 🔲 Immediate Next Steps (session resumes here)
- **Postman-test `/api/auth/verify`** — hit it with a valid token (expect 200 + name/username/subscription), then with no token and a garbage/expired token (expect 401 from `protect`, confirming `verifyAuth` is never reached).
- **Start frontend** — React Router setup, `AuthContext`, Login/Register pages, Home page.
  - Flow agreed: on app load, check `localStorage` for a token, then call `/api/auth/verify` to confirm it's actually still valid (rather than just trusting its presence) — this is exactly what the new route is for.
  - Still open/undiscussed: exact shape of `AuthContext` (what state/functions it exposes), and where the user lands post-login (dashboard vs. public profile) — flagged as still to decide.

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (React + Tailwind) — dashboard, public profile page, link management UI, AuthContext, Login/Register pages
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
- **Middleware trust boundary (new this session):** once a request passes through `protect`, downstream controllers can trust `req.user` is a valid, existing user — no need to re-check "is logged in" logic inside the controller itself. Re-checking it is dead code and can even produce a misleading status code if it were ever wrong.
- **Schema-level field exclusion (new this session):** `select: false` on a schema field (used on `password`) means it's excluded from all queries by default, including ones inside middleware like `protect` — no manual `delete user.password` or destructuring-to-omit needed downstream. To get it back when actually needed (e.g. comparing during login), you must explicitly `.select('+password')` on that specific query.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question. Keep doing this, don't shortcut to giving code.
- Recurring pattern to watch: over-engineering a condition on first pass (this session: added a redundant `if/else` re-checking auth status that `protect` already guarantees). When this happens, ask him to consider whether the earlier layer (middleware) already handles it before adding new logic.
- He debugs and reasons well independently when given a pointed question rather than the fix — this session he correctly reasoned through the trust boundary after `protect`, and correctly recalled the `select: false` schema detail from memory without being told.
- **Full link CRUD layer is runtime-verified end-to-end via Postman. Treat as solid, tested ground going forward.**
- **Auth verify route (`/api/auth/verify`) is built and wired but NOT YET Postman-tested — this is the very first thing to do next session, before moving into frontend.**
- **Next session starts at:** Postman-testing `/api/auth/verify` (valid token, no token, bad token), then moving into frontend scaffolding (React Router setup, `AuthContext`, Login/Register pages, Home page) with the on-load token verification flow wired in.