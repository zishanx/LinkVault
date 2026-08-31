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
│   │   └── User.js              ✅ done
│   ├── controllers/
│   │   └── authController.js    ✅ done (register + login)
│   ├── routes/
│   │   └── authRoutes.js        🔲 not started (wire up register/login endpoints)
│   ├── middleware/
│   │   ├── protect.js           ✅ done
│   │   └── clickTracker.js      🔲 not started (click-tracking middleware)
│   └── server.js                🔲 not started
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
  - Handles edge case: valid/unexpired token but user was deleted afterward → explicit `401` check on `!req.user`, not left to crash downstream

- **Conceptual understanding confirmed via quiz** (6/6 topics covered): `select: false` mechanics, why `.toObject()` is needed before destructuring, rest-operator behavior, why `await` matters on `bcrypt.compare()`, JWT-payload-vs-full-user tradeoff, and the deleted-user-valid-token edge case. Also walked through full request lifecycle: frontend form → POST body → backend verifies → JWT returned → stored via Context → attached as `Authorization: Bearer <token>` header via Axios interceptor on future requests → `protect` middleware validates → route handler runs.

### 🔲 Immediate Next Steps
- Wire up `authRoutes.js` (POST `/register`, POST `/login`) and `server.js` entry point
- **Link model** — next planned step (fields likely: `user` ref, `url`, `title`, `clickCount`, `order`)
- Frontend `AuthContext` + Axios instance (same pattern as Wanderly) — store token, attach via interceptor

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

## Reminders for Cosmo (Claude)
- Zizzy calls Claude "Cosmo" in this project.
- Zizzy re-entered after a 2-month break (personal + mental pressure reasons). First session back went well — full auth layer built correctly with minimal hand-holding. Rust fear was real but unfounded; don't over-reassure, just keep momentum.
- Socratic teaching style: ask him to recall/attempt first, confirm or correct after — don't just hand over code. This is working well, keep doing it.
- He catches his own bugs when prompted with the right question rather than told the answer outright (missing `await` on bcrypt.compare, `toObject` mechanics, etc.) — keep using guided questions over direct fixes.
- He's ahead of where he thinks he is — he's added correct things unprompted multiple times (`username` field, `select: false`, separate email/username duplicate checks). Keep noting this when it happens.