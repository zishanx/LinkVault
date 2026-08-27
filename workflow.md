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

## Folder Structure (planned — fill in as built)
```
linkvault/
├── server/
│   ├── models/
│   │   └── User.js         ✅ done
│   ├── controllers/
│   │   └── authController.js   🔲 in progress
│   ├── routes/
│   ├── middleware/
│   │   ├── auth.js         🔲 not started (protect middleware)
│   │   └── clickTracker.js 🔲 not started (click-tracking middleware)
│   └── server.js
└── client/
    └── (not started)
```

## Progress Log

### ✅ Done
- **User model** — built, revised twice:
  - v1: basic fields (name, email, password, subscription as plain string, isAdmin)
  - v2 (current/final): added `username` (unique, needed for public profile URLs), `subscription` restricted via Mongoose `enum: ["Free", "Premium"]`, `password` set to `select: false`, added `timestamps: true`, dropped `isAdmin` (not needed for LinkVault — no admin dashboard planned)
  - Confirmed understanding of `select: false` + `.select('+password')` pattern for fetching password when needed

### 🔲 In Progress
- **authController.js** — about to write `register` function (pattern: same as Wanderly's auth controller, using bcrypt at route-level for now — NOT `pre('save')` hook yet)

### 🔲 Not Started
- `login` function
- JWT generation + auth middleware (`protect`)
- Link model
- Click model
- Click-tracking middleware
- Razorpay Subscriptions integration (webhooks, subscription status sync)
- Frontend (React + Tailwind) — dashboard, public profile page, link management UI
- Custom themes feature

## Learning Notes / Decisions Made
- **bcrypt hashing approach:** Starting with route-level `bcrypt.hash()` (same as Wanderly) to keep building on known patterns. Plan: revisit and refactor to `pre('save')` Mongoose hook once studied — this is a deliberate "build it the way I know, then upgrade" approach, not a gap.
- Wanderly is being used as the reference/revision codebase throughout — comparing old patterns to LinkVault's needs rather than starting cold.

## Reminders for Cosmo (Claude)
- Zizzy is re-entering after a 2-month break (personal + mental pressure reasons) — stuff feels "forgotten" but comes back fast once he starts reading/writing code again. Don't over-reassure, just keep momentum.
- Socratic teaching style: ask him to recall/attempt first, confirm or correct after — don't just hand over code.
- He's ahead of where he thinks he is — catch and note when he adds something correct without being prompted (he did this twice already: `username` field, `select: false`).