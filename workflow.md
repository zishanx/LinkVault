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
│   │   ├── authController.js    ✅ done (register + login)
│   │   └── linkController.js    ✅ done (createLink, getLinks, updateLink, deleteLink)
│   ├── routes/
│   │   ├── authRoutes.js        ✅ done
│   │   └── linkRoutes.js        ✅ done — full REST CRUD wired
│   ├── middleware/
│   │   ├── protect.js           ✅ done
│   │   └── clickTracker.js      🔲 not started (click-tracking middleware)
│   └── server.js                ✅ done (auth + links routes mounted, Mongo connects before listen)
└── client/
    └── (not started)
```

## Progress Log

### ✅ Done — Full Auth Layer
(unchanged from previous session — User model, register/login controllers, protect middleware, authRoutes, server.js. See prior log for full detail.)

### ✅ Done — Link Model (`Link.js`)
(unchanged — name, link, user ref, clickCount default 0, order required, timestamps.)

### ✅ Done — Full Link CRUD Layer (`linkController.js`)

**`createLink`** — Free-tier gating (`subscription === "Free" && order >= 5` → 403), `order` computed via `countDocuments`, returns `201`.

**`getLinks`** — `Link.find({ user: req.user._id }).sort({ order: 1 })`. **Resolved the open empty-state question this session**: always returns `200`, whether the array has links or is empty — reasoned through that an empty list isn't an error state (nothing wrong with the request), and that a consistent response shape (`{ links: [...] }` every time) avoids special-case handling on the frontend. Rejected `400` (not a bad request) and `204` (would mean no body, breaking the consistent-shape frontend contract) before landing on `200`.

**`updateLink`** — new this session:
- Fetches via ownership-safe `Link.findOne({ _id: id, user })`, `404` if not found (deliberately not `403`, to avoid leaking whether the link exists at all — same reasoning as below)
- **ClickCount reset logic, reasoned through carefully**: initially proposed resetting on either name OR link changing, self-corrected after being asked what `clickCount` actually measures — realized the `name` is just a display label nobody clicks, so only the `link` (destination URL) changing should reset click history. Final logic: compare incoming `link` to `fetchedLink.link` **before** overwriting it, reset `clickCount` to 0 only if the URL actually changed.
- Mutates fields directly on the fetched Mongoose document, single `.save()` call (avoided a separate/redundant update query)
- Self-corrected status code from `201` → `200` after being walked through the full HTTP status code cheat sheet (200/201/204, 400/401/403/404/409/429, 500) and reasoning that `201` is for resource *creation* only, not modification

**`deleteLink`** — new this session:
- Used `Link.findOneAndDelete({ _id: id, user })` — collapses the ownership check and deletion into one query, after being nudged to find a single-query alternative to a separate `findOne` + `findByIdAndDelete`
- Caught two of his own bugs unprompted-after-hint: (1) an `if (fetchedLink)` with no `else` branch that would leave a request hanging with no response sent on the not-found case; (2) a filter-wrapping bug — passed `{ filter }` (shorthand for `{ filter: filter }`) instead of spreading/passing the filter object directly, which would've made Mongoose search for a literal `filter` field instead of applying `_id`/`user`
- Returns `200` with a success message (reasoned through `200` vs `204` — same logic as above, keep it simple/consistent)

### ✅ Done — `linkRoutes.js` — refactored to clean REST convention this session
- Was initially verb-in-URL style (`/getLink`, `/createLink`, `/updateLink/:id`, `/delete/:id` — inconsistent naming too)
- Refactored, after discussion of REST convention (HTTP method already conveys the verb, so it's redundant to repeat it in the path), to:
  ```
  GET    /           → getLinks
  POST   /           → createLink
  PUT    /:id        → updateLink
  DELETE /:id        → deleteLink
  ```
- All four routes behind `protect` middleware

### ✅ Done — `server.js`
(unchanged — Express + cors + json middleware, mounts `/api/auth` and `/api/links`, Mongo connects before listen.)

### 🔲 Immediate Next Steps (session resumes here)
- **First end-to-end test via Thunder Client/Postman** — register → login → grab token → hit all four link routes with it (create, get, update, delete) to catch anything silent before building the frontend. This was the plan going into this session but didn't happen yet — do this first next time.
- After that: start planning the Click model + click-tracking middleware, or start frontend — decide based on how e2e testing goes.

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (React + Tailwind) — dashboard, public profile page, link management UI
- Custom themes feature
- Reorder/drag-and-drop for link `order` — explicitly flagged this session as its own future endpoint (e.g. `reorderLinks`), NOT part of `updateLink`. Reasoning surfaced: a simple two-link swap is easy, but dragging item #5 to position #1 shifts several links, not just two — needs its own design pass later.
- Refactor bcrypt hashing from route-level → `pre('save')` Mongoose hook (deliberately deferred, not forgotten)

## Learning Notes / Decisions Made
- **bcrypt hashing approach:** route-level for now, deliberate "build it the way I know, then upgrade" — refactor to `pre('save')` hook later.
- Wanderly is the reference/revision codebase throughout.
- **`order` field strategy:** computed at insert time via `Link.countDocuments({ user })`, not user-supplied, not defaulted in schema. Reordering is a separate future concern (see above).
- **Subscription gating:** backend is the source of truth for the 5-link free limit — "we don't trust the frontend" (his own words).
- **Status code philosophy, now internalized via the cheat sheet covered this session:** 2xx = it worked (200 generic success, 201 only for actual creation, 204 no body), 4xx = client's fault or not allowed (400 bad/malformed request, 401 not authenticated, 403 authenticated but forbidden, 404 not found — or deliberately used to mask ownership failures, 409 conflict e.g. duplicate on register), 5xx = server's fault. Applied this rigorously this session to settle `getLinks` empty-state (`200`, not `400`/`204`) and `updateLink`'s success code (`200`, not `201`).
- **Ownership-check pattern, now solidified across `updateLink` and `deleteLink`:** always filter by `{ _id: id, user: req.user._id }` in the query itself (not a separate `findById` + manual comparison), and return `404` (not `403`) when it doesn't match — deliberately avoids leaking to an attacker whether a given link ID exists at all.

## Reminders for Claude

- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question rather than told the answer directly. Keep doing this, don't shortcut to giving code.
- Recurring pattern to watch: he sometimes over-engineers a condition on first pass (e.g. proposed resetting `clickCount` on name-OR-link change before narrowing to link-only) — when this happens, ask him to trace back to what the field/data *actually represents* rather than pattern-matching a plausible-sounding rule.
- He continues to catch his own bugs well when prompted (missing `else`/response branch, `{ filter }` object-shorthand mistake, `.toString()` questions on already-string fields) — keep using guided questions over direct fixes.
- He now has a working grasp of the core HTTP status code set (200/201/204, 400/401/403/404/409/429, 500) after this session's cheat-sheet walkthrough — can build on this rather than re-explaining from scratch next time a status code question comes up.
- **Next session starts at:** first end-to-end test of the full link CRUD flow via Thunder Client/Postman (register → login → token → create/get/update/delete link). Nothing has been runtime-tested yet — this is the first real chance to catch anything silent before frontend work begins.