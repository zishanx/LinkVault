# LinkVault — Progress Tracker

> Paste this file's content at the start of a new chat to get Claude ("Cosmo") back up to speed instantly.

## Stack
- **Frontend (for now):** React (Vite), JavaScript, Tailwind CSS v4 — will be ported to TypeScript in a single pass once TS revision is complete
- **Backend:** Node.js, Express (JS — no TS migration planned for backend at any stage)
- **DB:** MongoDB (Mongoose)
- **Auth:** JWT
- **Payments:** Razorpay Subscriptions API (not yet learned/integrated)
- **Animation:** GSAP (installed, in use on Login.jsx)

## Workflow (current, locked)
**Full JS build → TS revision (independent, self-paced) → single port pass at the end.**
- Build the entire LinkVault frontend in JS, no interruptions, stay in flow. No per-piece porting.
- TS revision runs separately, on his own pace, outside of LinkVault build time.
- Port the whole frontend to TS once, at the end.
- `AuthContext.jsx` stays in JS for now — will be ported along with everything else in the final port pass.
- No more per-piece TS porting until the full JS frontend is built and TS revision is complete.

## What LinkVault Is
A subscription-gated link-in-bio + analytics tool (like Linktree, but with paid tiers).
- **Free tier:** up to 5 links
- **Paid tier (via Razorpay Subscriptions):** unlimited links, click analytics, custom themes
- Public profile page at `linkvault.com/:username`
- Purpose: revision vehicle for MERN concepts (post-2-month break) + learning Razorpay Subscriptions API + webhooks + TypeScript (via separate revision track, ported into this project at the end)

## Theme (locked)
- **Vibe:** soft pastel/calm, muted teal/mint as brand accent
- **Fonts:** `font-heading` = Space Grotesk (bold, geometric), `font-body` = Nunito (rounded, friendly)
- **Colors (Tailwind v4 `@theme` in `index.css`):**
  - `--color-primary: #4FB8A6` (muted teal)
  - `--color-primary-hover: #3D9E8E`
  - `--color-background: #F7F9F9`
  - `--color-textmain: #2D3436`
  - `--color-muted: #9CA6A5`
- **Setup gotcha learned:** in Tailwind v4, the Google Fonts `@import` must come **before** `@import "tailwindcss"` in `index.css`, or the build throws an "@import must precede all other statements" error — even though normal CSS import-order rules would suggest otherwise. This is a quirk of how the `@tailwindcss/vite` plugin expands its own import.

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
    │   ├── index.css            ✅ done — Tailwind v4 + custom @theme (fonts + colors)
    │   ├── api/
    │   │   └── axios.js         ✅ done — baseURL, Bearer interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx  ✅ done in JS — logic fully correct, reviewed, wired to axios, browser-tested
    │   ├── components/
    │   │   └── ProtectedRoute.jsx ✅ done — three-branch logic, browser-tested
    │   ├── pages/
    │   │   ├── Login.jsx        ✅ done — full auth logic + animated GSAP split-screen design, tested end-to-end
    │   │   └── Register.jsx     🟡 in progress — logic mostly built solo + debugged together, not yet fully tested or styled
    │   └── App.jsx               ✅ done — Router with /, /login, /register, /dashboard (dashboard wrapped in ProtectedRoutes)
```

## Progress Log

### ✅ Done — Full Auth Layer (backend, JS — permanent, no TS migration planned)
User model, register/login controllers, protect middleware, authRoutes, server.js. All Postman-tested, no known open bugs.

### ✅ Done — Full Link CRUD Layer (`linkController.js`, `linkRoutes.js`)
All four routes runtime-tested end-to-end via Postman. No known open bugs. Treat as solid, tested ground.

### ✅ Done — `AuthContext.jsx`
Three-state auth pattern (`token`, `user`, `isLoading`), mount-time `verify()` via axios, `login()`/`logout()`, `useAuth` hook. Fully wired to axios and browser-tested — logging in via Postman, setting token in localStorage, and refreshing correctly populates `user` via the verify call.

### ✅ Done — Router, ProtectedRoute, AuthProvider wiring
`AuthProvider` wraps `<App />` in `main.jsx`. `ProtectedRoute` three-branch logic (loading / authed / unauthed) browser-tested — hitting `/dashboard` while logged out correctly redirects to `/login`, confirming the full chain (Router → ProtectedRoutes → useAuth → AuthContext → axios → backend) works end-to-end.

### ✅ Done — `Login.jsx`: logic
Controlled `form` state object (`email`, `password`) with a single computed-key `handleChange`, `isLoading`, `error` states. `handleSubmit`: `e.preventDefault()`, resets error, calls `POST /auth/login`, on success calls `login(token, user)` from context then `navigate('/')`, on failure reads `err.response.data.message` (not `err.message`, since axios throws on non-2xx and the real backend message lives on `err.response`, not on a top-level `res` which doesn't exist in the catch scope). Tested end-to-end in browser: wrong password shows the correct error, correct password persists auth + redirects, survives a refresh.

### ✅ Done — `Login.jsx`: design (v1, static)
Two-panel centered card layout (white form panel + teal brand panel), rounded corners, shadow, `overflow-hidden`. Pill-shaped inputs, `sr-only` labels for accessibility (screen-reader-visible, visually hidden — distinct from `hidden`, which removes elements from the accessibility tree too). Full theme applied (fonts, colors). Matches a Dribbble reference layout.

### ✅ Done — `Login.jsx`: animated redesign (v2, current)
Built solo. Single boolean state controls two visual states:
- **Teaser state:** left panel 40% width, teal bg, heading + "Sign In" button; right panel 60% width, plays a background video
- **Form state** (after clicking Sign In): left panel animates to 70% width, white bg, shows the real login form; right panel animates to 30% width, teal bg, shows a subheading + a recolored (teal) Storyset/unDraw-style illustration
- Transition is a GSAP-driven wipe: the teal block slides in from the left, growing to cover the video, which is swapped out once covered
- Confirmed working and styled well by his own review — illustration matches the theme, layout feels polished

### 🟡 In Progress — `Register.jsx`: logic
Built solo first (fields: `name`, `username`, `email`, `password`), then debugged together. Fixed issues along the way:
- `isLoading(false)` in `finally` was calling the state *value* as if it were the setter — should be `setIsLoading(false)`
- Missing `e.preventDefault()` — form was doing a full page reload on submit
- `setInterval` around `setMessage` — ran forever every 200ms and was never cleared (no `clearInterval`), even after navigating away; replaced with a single `setMessage(res.data.message)` call plus a `setTimeout`-delayed `navigate('/')`, so the user sees the success message for ~2 seconds before redirect
- `name` input was missing its `value={form.name}` prop, making it an uncontrolled input while its siblings were controlled
- Added a **`showSucces`** state, separate from `isLoading`, to solve a real timing bug: `isLoading` flips back to `false` in `finally` immediately after the request resolves — before the `setTimeout` redirect delay finishes — so relying on `isLoading` alone to keep the button "locked"/showing success text during that wait window doesn't work, since by then it's already `false`
- Landed on three real button states: idle (`isLoading: false, showSucces: false`) → "Sign Up"; sending (`isLoading: true`) → "Signing Up..."; succeeded/waiting to redirect (`showSucces: true`) → success text. Button `disabled` should be `isLoading || showSucces` (OR, not AND — both flags individually justify disabling, they don't need to be true simultaneously, and in fact never are given the execution order)
- **Not yet finished:** the nested ternary for the three-state button text was mid-edit at end of session; not yet tested end-to-end in the browser; not yet styled (currently placeholder Tailwind classes reused from Login's old v1 style)

### 🔲 Not Started
- Finish + test `Register.jsx`, then style it (likely matching Login.jsx's v2 animated design, or at least the theme)
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Dashboard / link management UI (CRUD UI against the already-verified backend link routes)
- Public profile page (`/:username`)
- Custom themes feature
- Reorder/drag-and-drop for link `order` (own future endpoint, e.g. `reorderLinks` — not part of `updateLink`)
- Refactor bcrypt hashing from route-level → `pre('save')` Mongoose hook (deliberately deferred)
- Full frontend port to `.tsx`/`.ts` (deferred to end-of-build, after TS revision track is complete)
- Still open/undiscussed: exact landing destination post-login (dashboard vs. public profile)

## Learning Notes / Decisions Made
- **bcrypt hashing approach:** route-level for now, deliberate "build it the way I know, then upgrade" — refactor to `pre('save')` hook later.
- Wanderly is the reference/revision codebase throughout.
- **`order` field strategy:** computed at insert time via `Link.countDocuments({ user })`, not user-supplied, not defaulted in schema.
- **Subscription gating:** backend is the source of truth for the 5-link free limit.
- **Ownership-check pattern:** filter by `{ _id: id, user: req.user._id }` directly in the query, return `404` (not `403`) on mismatch to avoid leaking existence of a resource to an attacker.
- **List endpoint response shape:** always wrap arrays in a named key, e.g. `{ links: [...] }`, not a bare array.
- **Partial update pattern:** guard each optional field assignment with `if (field) {...}` rather than unconditionally overwriting.
- **Auth verification on app load:** a token's mere presence in `localStorage` doesn't prove it's valid — send it to a protected backend route on app mount and use that response's success/failure to decide auth state.
- **Middleware trust boundary:** once a request passes through `protect`, downstream controllers can trust `req.user` is a valid, existing user.
- **Schema-level field exclusion:** `select: false` on a schema field (used on `password`) excludes it from all queries by default, including inside middleware like `protect`. Must explicitly `.select('+password')` to get it back.
- **Three-state auth pattern:** `user` + `token` + `isLoading` as separate state variables — `isLoading` exists specifically to disambiguate "confirmed not logged in" from "haven't checked yet."
- **`res.json()` is async:** returns a Promise, must be `await`-ed.
- **Bearer token header format:** must send `Authorization: Bearer <token>`, matching `protect`'s server-side `split(' ')[1]` parsing.
- **Axios error shape:** on a non-2xx response, axios throws — the failed response body lives on `err.response.data`, not on a `res` variable (which never gets assigned in the catch scope) and not on `err.message` (which is just a generic axios string).
- **Controlled inputs need a non-null initial value** (`""`, not `null`) or React warns about switching between uncontrolled/controlled.
- **Computed property names** (`{ [e.target.name]: e.target.value }`) let one generic `handleChange` function work for any number of form fields, as long as each input's `name` attribute matches a key in the state object — square brackets tell JS to evaluate the expression inside and use the result as the object key, instead of treating it as a literal key name.
- **`label` + `htmlFor`/`id` linking:** `htmlFor` must match the input's `id` (not its `name`) for the label-input association to work — enables click-to-focus and correct screen reader announcements.
- **`sr-only` vs `hidden`:** `hidden` sets `display: none`, removing an element from the accessibility tree entirely (screen readers won't announce it). `sr-only` keeps it in the accessibility tree while hiding it visually — the correct choice when you want a label to exist for accessibility but not be visible (e.g. relying on placeholder text instead).
- **`setInterval` vs `setTimeout`:** `setInterval` repeats indefinitely until explicitly cleared with `clearInterval` — using it to "delay one action" is a bug, since it never stops firing on its own, including after navigating away from the component that started it. `setTimeout` runs once, after a delay — the correct tool for "wait, then do this one thing."
- **Tailwind v4 theming:** customization happens via an `@theme` block in CSS (not a `tailwind.config.js` file like v3), using CSS custom properties. Naming convention matters — `--color-*` generates `bg-*`/`text-*`/`border-*` utilities, `--font-*` generates `font-*` utilities. Avoid naming a color `text` (collides with Tailwind's existing `text-*` sizing/color utility category) — used `textmain` instead.
- **CSS inheritance:** properties like `font-family` and `color` cascade down from parent to child unless a descendant explicitly overrides them with its own class — so a single `font-body` class on an outer wrapper covers all its children, while a child like `<h1>` with its own explicit `font-heading` class correctly overrides the inherited value.

## Reminders for Claude
- Socratic teaching style continues to work very well — he self-corrects almost everything when pointed at the right question, and increasingly catches his own bugs before being told (e.g. correctly reasoning through why `showSuccess && isLoading` would never both be true, and why `isLoading` alone couldn't control the post-success button state).
- Recurring pattern to watch: reusing one boolean/state variable for two conceptually different jobs (e.g. trying to make `isLoading` also represent "waiting to redirect after success") — good instinct to introduce a second state when this comes up, but flag it early.
- Watches for typos/wrong property names well once pointed at them (`err.res` vs `err.response`, `htmlFor` mismatches) but benefits from being told *why* the bug is invisible/silent (no crash, just silently falls through) rather than just *that* it's wrong.
- Responds very well to "write it yourself first, then I'll review," and to building logic completely before touching any styling.
- Wants to build things solo as self-tests periodically (did this successfully with `Register.jsx`'s first draft) — good for confirming retention.
- **`Login.jsx` (both logic and animated v2 design) is fully done, tested, and confirmed working. Treat as solid, tested ground — do not suggest revisiting unless he brings it up.**
- **`Register.jsx` is mid-build:** logic mostly correct after this session's debugging pass, but the three-state button text ternary was not finished, and it has not been tested end-to-end in the browser or styled yet. **Next session should resume here.**
- **Full link CRUD layer and the entire backend auth layer are Postman-tested and confirmed working. Treat as solid, tested ground.**
- **Workflow: full JS build → separate TS revision → single port pass at the end.** Do not suggest per-piece TS porting.