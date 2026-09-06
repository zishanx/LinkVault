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
│   │   ├── authController.js    ✅ done (register + login) — verify/me route NOT yet added
│   │   └── linkController.js    ✅ done + runtime-tested (createLink, getLinks, updateLink, deleteLink)
│   ├── routes/
│   │   ├── authRoutes.js        ✅ done — needs new verify/me route added next
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
(unchanged — User model, register/login controllers, protect middleware, authRoutes, server.js.)

### ✅ Done — Link Model (`Link.js`)
(unchanged — name, link, user ref, clickCount default 0, order required, timestamps.)

### ✅ Done — Full Link CRUD Layer (`linkController.js`)
All four routes now **runtime-tested end-to-end via Postman** this session (see below).

**`createLink`** — Free-tier gating (`subscription === "Free" && order >= 5` → 403), `order` computed via `countDocuments`, returns `201`. Confirmed working — created 2 real links during testing.

**`getLinks`** — `Link.find({ user: req.user._id }).sort({ order: 1 })`, returns `200`. Response shape iterated on this session: started as `{ linkList: [...] }` → briefly a raw array → **settled on `{ links: [...] }`** as the final convention, reasoning through why list endpoints should return a named key inside an object rather than a bare array (room to add metadata like `totalCount`/`hasMore` later without breaking existing frontend consumers).

**`updateLink`** — Bug found and fixed this session: the controller was unconditionally doing `fetchedLink.link = link` (and originally `fetchedLink.name = name`) even when that field wasn't sent in the request body, causing Mongoose validation to fail with "Path `link` is required" on partial updates (e.g. updating only `name`). Fixed by wrapping each field in its own `if (field)` guard, with the `clickCount` reset comparison living **inside** the `if (link)` block (compares incoming `link` to `fetchedLink.link` before overwrite). Briefly discussed `||` fallback syntax (`fetchedLink.name = name || fetchedLink.name`) as an alternative one-liner — noted as equally valid for simple cases, but `if` blocks preferred here since the `link` field also needs the clickCount side-effect attached to the same condition. Final logic confirmed working via two Postman test cases: (1) name-only update leaves `link`/`clickCount` untouched, (2) link-only update resets `clickCount` to 0.

**`deleteLink`** — confirmed working via Postman (verified link actually gone via follow-up `getLinks` call).

### ✅ Done — `linkRoutes.js`
Clean REST convention (`GET/POST /`, `PUT/DELETE /:id`), all behind `protect`. Confirmed working.

### ✅ Done — `server.js`
(unchanged)

### ✅ Done — First End-to-End Test (Postman)
Full flow tested this session: register → login → grab token → create/get/update/delete links, all via Postman (not Thunder Client as originally planned — switched tools, same concept).

Bugs hit and resolved along the way (good debugging reps, not code issues):
- Header value pasted with stray quotes (`'Bearer ...'`) — caused "invalid token"; fixed by removing quotes, since Postman headers are raw strings, not JSON.
- URL param mistake — literally kept the `:` from the `/:id` route placeholder in the actual request URL (`/links/:abc123` instead of `/links/abc123`) — caused a Mongoose ObjectId cast error.
- Response body vs. Postman's "Test Results" tab confusion (briefly thought `getLinks` was returning nothing when it wasn't) — resolved, just a UI mixup.
- The `updateLink` partial-update bug described above.

**Outcome: all four link routes are confirmed working end-to-end. No known open bugs in the link CRUD layer.**

### 🔲 Immediate Next Steps (session resumes here)
- **Build a dedicated auth verification route** — new discussion started this session, not yet built. Decision made: this should live in `authController`/`authRoutes`, NOT be piggybacked onto `linkController` (reasoning: separation of concerns — link routes shouldn't be responsible for identity checks). Proposed shape: something like `GET /api/auth/me` or `/api/auth/verify`, behind `protect`, returning info about the currently authenticated user (exact response payload — TBD, was mid-discussion when session ended, guided toward thinking about what `protect` already attaches to `req` by the time the controller runs).
- **Start frontend** — plan set this session: React Router, `AuthContext`, Login/Register pages, Home page.
  - Flow agreed: on app load, check `localStorage` for a token. Talked through *why* merely having a token isn't enough (could be expired/invalid) — landed on the idea of verifying the token against the backend on mount (an "auth check on load" pattern), rather than just trusting its presence. This is the direct motivation for the new auth verify route above.
  - Still open/undiscussed: exact shape of `AuthContext` (what state/functions it exposes), and where the user lands post-login (dashboard vs. public profile) — flagged as still to decide, not yet answered.

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
- **Status code philosophy:** internalized via cheat sheet in a prior session — 2xx/4xx/5xx breakdown, applied consistently across all four link routes this session with no confusion.
- **Ownership-check pattern:** filter by `{ _id: id, user: req.user._id }` directly in the query, return `404` (not `403`) on mismatch to avoid leaking existence of a resource to an attacker.
- **List endpoint response shape (new this session):** always wrap arrays in a named key, e.g. `{ links: [...] }`, not a bare array — leaves room to add metadata (counts, pagination) later without breaking existing frontend code that reads `response.data.links`.
- **Partial update pattern (new this session):** when a PATCH/PUT-style controller accepts optional fields, guard each field assignment with `if (field) {...}` (or `field || existingValue`) rather than unconditionally overwriting — otherwise omitted fields get set to `undefined` and can fail schema validation on required fields.
- **Auth verification on app load (new this session, not yet built):** a token's mere presence in localStorage doesn't prove it's valid (could be expired). Correct pattern is to send the stored token to a protected backend route on app mount and use the success/failure of that response to decide auth state — motivated building a dedicated `/api/auth/verify`-style route rather than reusing `linkController`.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question. Keep doing this, don't shortcut to giving code.
- Recurring pattern to watch: over-engineering a condition on first pass, or reaching for a heavier tool than needed (e.g. suggested `switch case` for what was really just a two-way `if`/`||` choice this session). When this happens, ask him to consider whether a simpler existing tool fits before introducing a new construct.
- He debugs well independently when given the actual error message and a pointed question rather than the fix — this session he correctly diagnosed a stray-colon URL bug, a quoted-header-value bug, and the partial-update `undefined`-overwrite bug all from being walked toward the right question.
- **Full link CRUD layer (create/get/update/delete) is now runtime-verified end-to-end via Postman. Treat this as solid, tested ground going forward — no need to re-verify unless something changes in that code.**
- **Next session starts at:** deciding the payload/response shape for the new auth verification route (`/api/auth/verify` or `/api/auth/me`), building it in `authController`/`authRoutes`, then moving into frontend scaffolding (React Router setup, `AuthContext`, Login/Register pages, Home page) with the on-load token verification flow wired in.