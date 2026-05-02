# ZapAcademy — gamified LMS for Zaptick Showdown cohorts

Standalone Next.js app for the **8-week ZapAcademy** experience: video lessons, quizzes,
XP, badges, streaks, leaderboards and a co-presented certificate.

- Same MongoDB, same JWT secret as the main Zaptick app
- Plan gate: only `growth` and `growth_plus` users can sign in
- Brand-aligned with the marketing site (dark emerald theme + amber XP/cash accents)

## Getting started

```bash
cd zapacademy-app
cp .env.example .env.local
# edit .env.local — paste the same MONGODB_URI and JWT_SECRET as the main Zaptick app
npm install
npm run dev
# → http://localhost:3001
```

## Deploy as a subdomain

Point `academy.zaptick.io` at this app. Set `COOKIE_DOMAIN=.zaptick.io` so the auth cookie
issued by the main app is shared, and users land already authenticated.

## Phase 1 ships
- Login (validates against same User collection in the same DB)
- Plan gate middleware (blocks non-Growth users)
- Dashboard, curriculum view, lesson player, leaderboard, badges, admin
- XP / streak / badge engine with REST endpoints
- Quiz engine v1 (MCQ + short answer) — passing awards XP
- Comment thread per lesson

## Phase 2 (planned)
- Interactive challenges (render Zaptick's actual workflow builder inside lessons,
  validate the user's workflow, award XP)
- Certificate generation + social sharing
- Live cohort feed, weekly founder calls embed
- Push/email reminders for streak protection
