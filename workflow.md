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
│   │   └── linkController.js    🟡 in progress (createLink ✅, getLinks ✅, updateLink 🔲, deleteLink 🔲)
│   ├── routes/
│   │   ├── authRoutes.js        ✅ done
│   │   └── linkRoutes.js        🟡 in progress (createLink wired ✅, getLinks route 🔲)
│   ├── middleware/
│   │   ├── protect.js           ✅ done
│   │   └── clickTracker.js      🔲 not started (click-tracking middleware)
│   └── server.js                ✅ done (auth + links routes mounted, Mongo connects before listen)
└── client/
    └── (not started)
```

## Progress Log

### ✅ Done — Full Auth Layer (completed in one session, post-break re-entry)
- **User model** (`User.js`) — final version:
  - Fields: `name`, `username` (unique), `email` (unique), `password` (`select: false`), `subscription` (Mongoose `enum: ["Free", "Premium"]`, default `"Free"`), `timestamps: true`
  - Deliberately dropped `isAdmin` (not needed — no admin dashboard planned for LinkVault)
  - `razorpaySubscriptionId` / `subscriptionExpiry` — intentionally deferred until Razorpay Subscriptions is learned

- **`authController.js` — `register`**:
  - Checks email AND username separately for duplicates (two `findOne` calls, not one combined query)
  - Hashes password via `bcrypt.hash()` at route-level (deliberate choice — `pre('save')` hook to be studied and added later as an explicit upgrade)
  - Strips password from response using `user.toObject()` + destructuring (`const { password: _, ...userWithoutPassword }`)

- **`authController.js` — `login`**:
  - Fetches user with `.select('+password')` to bypass schema default
  - Uses `await bcrypt.compare()` (caught and fixed a missing-await bug that would've silently broken wrong-password detection)
  - Signs JWT with `{ user_id: user.id }`, 7-day expiry
  - Returns `{ user: userWithoutPassword, token }`
  - Correct status codes: 401 for user-not-found and wrong-password (fixed from an initial `300` typo)

- **`protect.js` middleware**:
  - Extracts token from `Authorization` header, verifies via `jwt.verify()`
  - **Fetches full user from DB** (`User.findById(decoded.user_id)`) rather than just trusting the decoded JWT payload — deliberate choice because LinkVault gates features by `subscription` tier across many routes, so `req.user.subscription` needs to be available downstream everywhere
  - `req.user` = the full user document itself (no extra `.user` nesting — important, this tripped up early Link controller work)
  - Handles edge case: valid/unexpired token but user was deleted afterward → explicit `401` check on `!req.user`, not left to crash downstream

- **Conceptual understanding confirmed via quiz** (6/6 topics covered): `select: false` mechanics, why `.toObject()` is needed before destructuring, rest-operator behavior, why `await` matters on `bcrypt.compare()`, JWT-payload-vs-full-user tradeoff, and the deleted-user-valid-token edge case. Also walked through full request lifecycle: frontend form → POST body → backend verifies → JWT returned → stored via Context → attached as `Authorization: Bearer <token>` header via Axios interceptor on future requests → `protect` middleware validates → route handler runs.

- **`authRoutes.js`** — wired up (POST `/register`, POST `/login`).

### ✅ Done — Link Model (`Link.js`)
- Fields: `name` (String, required), `link` (String, required), `user` (ObjectId ref `'User'`, required), `clickCount` (Number, default 0), `order` (Number, required), `timestamps: true`
- Self-corrected mid-build:
  - Initially added `unique: true` on `user` — caught that this would wrongly limit each user to one link total, removed it
  - Initially left `order` with no default and had to reason through where the value comes from — decided `order` will be computed programmatically at insert time (e.g. via count-based logic in the controller), so `required: true` (no default) is correct since the controller always supplies it
  - Typo'd `type: number` (lowercase) on `clickCount` — caught and fixed to `Number`
- Exported via `export default Link`

### ✅ Done — `createLink` (`linkController.js`)
- Destructures `name`, `link` from `req.body`; gets `user` from `req.user._id` (correctly, after initially over-nesting as `req.user.user._id` — resolved by re-deriving from how `protect.js` actually assigns `req.user`)
- Computes `order` via `Link.countDocuments({ user })` — self-corrected from an initial `Link.find()` + `.length` approach once introduced to `countDocuments` as the more efficient method
- **Free-tier gating logic (his own idea, unprompted)**: before creating, checks `if (req.user.subscription === "Free" && order >= 5)` → returns `403` with a limit-reached message. Reasoned through the off-by-one himself (`order === 5` → `order >= 5` for safety against bad data) and picked `403` over `400`/`429` by working through the semantics.
- Reuses the same `order` value for both the gating check and the `Link.create()` call — no redundant queries
- Returns `201` (self-upgraded from an initial `200`) with `{ link: createdLink, message }`
- Full try/catch with `400` on error

### ✅ Done — `getLinks` (`linkController.js`)
- `Link.find({ user: req.user._id }).sort({ order: 1 })` — correct filter object and ascending sort by `order` (self-corrected from an initial raw-id filter and a `.sort(1)` call missing the field name)
- Caught his own bug: initial empty-list check used `!linkList`, which is always falsy for Mongoose's empty-array return — fixed to `linkList.length === 0`
- Caught his own bug #2: initial empty-list response was missing `return`, which would've fallen through to also send a `200` — fixed
- **Open question, flagged for revisit (not blocking):** is `400` the right status for "no links found"? Arguably not an error — could be `200` with an empty array, or `404`. Worth deciding once frontend empty-state UX is clearer.

### ✅ Done — `linkRoutes.js`
- POST `/createLink` wired with `protect` → `createLink`
- Caught a missing `.js` extension bug on relative imports (ES modules require it, unlike CommonJS) — fixed on both the controller and middleware imports
- **`getLinks` route not yet added** — next session should wire `router.get('/', protect, getLinks)` or similar

### ✅ Done — `server.js`
- Express + `cors` + `express.json()` middleware
- Mounts `/api/auth` → `authRoutes`, `/api/links` → `linkRoutes`
- Mongo connects before `app.listen()` — mirrors Wanderly pattern, avoids accepting requests before DB is ready

### 🔲 Immediate Next Steps (session resumes here)
- **`updateLink`** — reasoning through which fields are editable, and re-auth/ownership check (make sure a user can't update someone else's link)
- **`deleteLink`** — same ownership check consideration
- Wire `updateLink` and `deleteLink` into `linkRoutes.js`
- Add the missing `getLinks` route to `linkRoutes.js`
- Revisit: should "no links found" in `getLinks` really be a `400`?
- First end-to-end test via Thunder Client/Postman hasn't happened yet — register/login for a token, then hit `/api/links/createLink` — worth doing once CRUD is fully wired, to catch anything silent before building the frontend

### 🔲 Not Started
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (React + Tailwind) — dashboard, public profile page, link management UI
- Custom themes feature
- Revisit: refactor bcrypt hashing from route-level → `pre('save')` Mongoose hook (deliberately deferred, not forgotten)

## Learning Notes / Decisions Made
- **bcrypt hashing approach:** Starting with route-level `bcrypt.hash()` (same as Wanderly) to keep building on known patterns. Plan: revisit and refactor to `pre('save')` Mongoose hook once studied — this is a deliberate "build it the way I know, then upgrade" approach, not a gap.
- Wanderly is being used as the reference/revision codebase throughout — comparing old patterns to LinkVault's needs rather than starting cold.
- **`order` field strategy:** computed at insert time in the controller via `Link.countDocuments({ user })`, not user-supplied and not defaulted in the schema.
- **Subscription gating:** backend is the source of truth for the 5-link free limit — frontend UI (disabling the create button) is a nice-to-have UX layer, not the actual enforcement. His own reasoning, unprompted: "we don't trust the frontend."

## Reminders for Claude

- Zizzy re-entered after a 2-month break (personal + mental pressure reasons). First session back went well — full auth layer built correctly with minimal hand-holding. Rust fear was real but unfounded; don't over-reassure, just keep momentum.
- Socratic teaching style: ask him to recall/attempt first, confirm or correct after — don't just hand over code. This is working well, keep doing it.
- He catches most of his own bugs when prompted with the right question (missing `await` on bcrypt.compare, `toObject` mechanics, `unique` misuse on Link.user, lowercase `number` typo, empty-array truthiness, missing `return` after a response, missing `.js` extensions on ES module imports) — keep using guided questions over direct fixes.
- He's ahead of where he thinks he is — he's added correct things unprompted multiple times (`username` field, `select: false`, separate email/username duplicate checks, deciding `order` should be controller-computed rather than defaulted, the entire free-tier gating idea before being asked, self-upgrading `200` → `201` on creation). Keep noting this when it happens.
- Watch for the "over-nesting" instinct — he twice reached for a nested structure that didn't exist (`req.user.user._id`, and initially reasoning toward wrapping `decoded.user._id` in `protect.js` when no change was needed there). When this comes up, redirect him to re-derive from the actual code he already wrote rather than guessing.
- **Next session starts at:** `updateLink` in `linkController.js` — ownership/auth check plus which fields are editable, then `deleteLink`, then wiring both (plus the still-missing `getLinks` route) into `linkRoutes.js`.