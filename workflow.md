Here you go — paste this over your local `LinkVault — Progress Tracker.md`:

```markdown
# LinkVault — Progress Tracker

> Paste this file's content at the start of a new chat to get Claude ("Cosmo") back up to speed instantly.

## Stack
- **Frontend (for now):** React (Vite), JavaScript, Tailwind CSS v4 — will be ported to TypeScript in a single pass once TS revision is complete
- **Backend:** Node.js, Express (JS — no TS migration planned for backend at any stage)
- **DB:** MongoDB (Mongoose)
- **Auth:** JWT
- **Payments:** Razorpay Subscriptions API (not yet learned/integrated)
- **Animation:** GSAP (installed, in use on Login.jsx)
- **Geolocation:** MaxMind GeoLite2 Country (`.mmdb`, local file) via the `maxmind` npm package

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
- **Setup gotcha learned:** in Tailwind v4, the Google Fonts `@import` must come **before** `@import "tailwindcss"` in `index.css`, or the build throws an "@import must precede all other statements" error.

## Core Models
1. **User** — name, username, email, password, subscription tier
2. **Link** — belongs to User, `name`, `link` (URL), `clickCount` (default 0), `order`
3. **Click** ✅ finalized — one document per individual click event:
   ```js
   const clickSchema = new mongoose.Schema({
     link: { type: mongoose.Schema.Types.ObjectId, ref: "Link", required: true },
     country: { type: String }, // optional — click must count even if geolocation fails
   }, { timestamps: true })
   ```
   No `ip` field stored (privacy choice — only country needed for analytics). Bot/crawler filtering explicitly out of scope for now.

## Folder Structure (as built so far)
```
linkvault/
├── server/
│   ├── data/
│   │   └── GeoLite2-Country.mmdb   ✅ downloaded, gitignored
│   ├── models/
│   │   ├── User.js              ✅ done
│   │   ├── Link.js              ✅ done
│   │   └── Click.js             ✅ done — schema finalized (see above)
│   ├── controllers/
│   │   ├── authController.js    ✅ done (register + login + verifyAuth)
│   │   ├── linkController.js    ✅ done + runtime-tested (createLink, getLinks, updateLink, deleteLink)
│   │   └── redirectController.js ✅ written + reviewed — click tracking + redirect logic (see below), NOT yet end-to-end tested
│   ├── routes/
│   │   ├── authRoutes.js        ✅ done — register, login, GET /verify (behind protect) all wired + tested
│   │   ├── linkRoutes.js        ✅ done — full REST CRUD wired + verified end-to-end
│   │   └── redirectroute.js     ✅ done — GET /:id → redirectController.redirect, mounted at /r in server.js
│   ├── middleware/
│   │   └── protect.js           ✅ done, confirmed working via Postman
│   ├── utils/
│   │   └── geoip.js             ✅ done — loadGeoDB() opens the .mmdb once at startup, getCountry(ip) does lookups
│   └── server.js                ✅ done — auth + links + redirect routes mounted, loadGeoDB() chained after mongoose.connect() and before app.listen()
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
    │   │   └── Register.jsx     ✅ logic + styling done, browser-tested — 🟡 GSAP animation (to match Login.jsx v2) still deferred
    │   └── App.jsx               ✅ done — Router with /, /login, /register, /dashboard (dashboard wrapped in ProtectedRoutes)
```

## Progress Log

### ✅ Done — Full Auth Layer (backend, JS — permanent, no TS migration planned)
User model, register/login controllers, protect middleware, authRoutes, server.js. All Postman-tested, no known open bugs.

### ✅ Done — Full Link CRUD Layer (`linkController.js`, `linkRoutes.js`)
All four routes runtime-tested end-to-end via Postman. No known open bugs. Treat as solid, tested ground.

### ✅ Done — `AuthContext.jsx`, Router, ProtectedRoute, AuthProvider wiring
Three-state auth pattern (`token`, `user`, `isLoading`), mount-time `verify()` via axios, `login()`/`logout()`, `useAuth` hook. Fully browser-tested end-to-end.

### ✅ Done — `Login.jsx`: logic + animated redesign (v2, current)
Fully tested and confirmed working. **Treat as solid, tested ground — do not suggest revisiting unless he brings it up.**

### ✅ Done — `Register.jsx`: logic, testing, and styling
Fully tested end-to-end in browser and styled. **🟡 Remaining:** GSAP animation to match Login.jsx's v2 design — deferred, not urgent.

### ✅ Done — Click model, GeoLite2 setup, and `/r/:id` redirect + click-tracking pipeline
- **Click schema** finalized (see Core Models above).
- **Geolocation:** MaxMind GeoLite2 Country `.mmdb` downloaded (requires free MaxMind account/login — no anonymous download), placed at `server/data/GeoLite2-Country.mmdb`, gitignored. Read locally via the `maxmind` npm package rather than a third-party API — avoids per-request network latency/rate limits/third-party data sharing in the click-tracking hot path. `server/utils/geoip.js` exports `loadGeoDB()` (opens the DB once) and `getCountry(ip)` (does the lookup, returns `undefined`/no match for local/private IPs during dev).
- **MaxMind EULA notes:** attribution required — add "This product includes GeoLite2 Data created by MaxMind, available from https://www.maxmind.com." to the site footer before launch (not yet added). Database must be refreshed periodically (old versions destroyed within 30 days of a new release per the EULA) — not urgent during development, but needs a plan (manual redownload or `geoipupdate` + license key) before real users are on it.
- **server.js wiring:** `loadGeoDB()` is async and returns a promise, so it's chained with `.then()` directly after `mongoose.connect().then()` and before `app.listen()`, ensuring the DB is loaded in memory before the server accepts requests. (Bug caught + fixed along the way: an arrow function with a `{ }` block body doesn't auto-return the promise, which broke the chain — fixed by switching to implicit return `.then(() => loadGeoDB())`.)
- **Redirect route:** `GET /r/:id`, deliberately kept separate from `/api/*` since it's hit directly by a visitor's browser (not axios/JSON) — `server/routes/redirectroute.js` mounted at `/r` in `server.js`.
- **`redirectController.js` logic (written, reviewed, NOT yet tested end-to-end):**
  ```js
  export const redirect = async (req, res) => {
    const id = req.params.id
    try {
      const link = await Link.findById(id)
      if (link) {
        res.redirect(link.link) // visitor redirected immediately, doesn't wait on anything below
        const country = getCountry(req.ip)
        link.clickCount++
        link.save().catch(err => console.log(err))               // fire-and-forget
        Click.create({ link: id, country }).catch(err => console.log(err)) // fire-and-forget
      } else {
        res.status(404).json({ message: "Invalid Link!" })
      }
    } catch (error) {
      console.log(error)
    }
  }
  ```
- **Key concept covered:** why `link.save()` / `Click.create()` must NOT be awaited (visitor shouldn't wait on analytics writes to get redirected), why each needs `.catch()` chained directly onto it rather than relying on the outer `try/catch` (a synchronous `try/catch` only catches errors thrown while it's still running — it has already exited by the time an un-awaited promise rejects later, so it can't catch that rejection; `.catch()` attached to the promise itself fires whenever that promise eventually settles, regardless of timing), and why an unhandled rejection is dangerous (can crash the whole Node process via `unhandledRejection`, taking down unrelated working requests too).
- **🔲 Not yet done:** end-to-end test (create a link, hit `/r/<id>` in browser, confirm redirect fires + `Click` doc created + `clickCount` incremented in MongoDB).
- **⚠️ Known open item:** unconfirmed whether `Link.link` values are always stored with a full protocol (`https://`) — if a link was saved as just `google.com`, `res.redirect()` would treat it as a relative path on the server rather than redirecting externally. Needs checking/validation later (not urgent, noted for later).

### 🔲 Not Started
- End-to-end test of the redirect/click-tracking pipeline (see above — next session starts here)
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Dashboard / link management UI (CRUD UI against the already-verified backend link routes)
- Public profile page (`/:username`)
- Custom themes feature
- Reorder/drag-and-drop for link `order`
- Refactor bcrypt hashing from route-level → `pre('save')` Mongoose hook
- Full frontend port to `.tsx`/`.ts` (deferred to end-of-build)
- MaxMind attribution line in footer (not yet added)
- Still open/undiscussed: exact landing destination post-login (dashboard vs. public profile)

## Learning Notes / Decisions Made
(see prior tracker version for the full backend/auth-era list: bcrypt approach, `order` field strategy, subscription gating, ownership-check pattern, response shape conventions, partial update pattern, auth verification on load, middleware trust boundary, schema-level field exclusion, three-state auth pattern, async `res.json()`, Bearer header format, axios error shape, controlled inputs, computed property names, label/htmlFor linking, `sr-only` vs `hidden`, `setInterval` vs `setTimeout`, Tailwind v4 theming, CSS inheritance)

**New this session:**
- MaxMind requires a free account login to download GeoLite2 databases (no anonymous download) — GeoLite2 Country (not City/ASN) is the right choice for country-only analytics, download the `.mmdb` binary format, not CSV.
- Local `.mmdb` lookups vs. a third-party geolocation API: local is faster (no network round-trip in the click hot path), no rate limits, no sharing visitor IPs with a third party.
- Promises as an "IOU" metaphor — a promise is returned immediately as a placeholder, the actual async result arrives later; code doesn't block waiting for it unless `await`ed.
- Implicit vs. block-body arrow functions in a `.then()` chain: a `{ }` block body requires an explicit `return` to pass a promise up the chain, while `() => someAsyncCall()` returns it implicitly — a missed `return` silently breaks promise chaining.
- Why `try/catch` can't catch errors from unawaited promises (the `try` block has already finished executing by the time the promise settles), and why `.catch()` chained directly on the promise is the correct pattern for fire-and-forget calls.

## Reminders for Claude
- Socratic teaching style continues to work very well — self-corrects quickly when pointed at the right question.
- Watches for typos/wrong property names well once pointed at them, benefits from being told *why* a bug is silent rather than just that it's wrong.
- Responds very well to "write it yourself first, then I'll review," and to building logic before touching styling.
- Wants to build things solo as self-tests periodically.
- **`Login.jsx` (both logic and animated v2 design) is fully done, tested, and confirmed working. Treat as solid, tested ground — do not suggest revisiting unless he brings it up.**
- **`Register.jsx` is fully done (logic, testing, styling)** — only its GSAP animation is deferred.
- **Full link CRUD layer and the entire backend auth layer are Postman-tested and confirmed working. Treat as solid, tested ground.**
- **Click model, GeoLite2 geolocation setup, and the `/r/:id` redirect controller/route are all written and reviewed but NOT yet end-to-end tested — that's the very next step.**
- **Workflow: full JS build → separate TS revision → single port pass at the end.** Do not suggest per-piece TS porting.
```