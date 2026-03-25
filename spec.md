# KongoKash — Système de Parrainage

## Current State

KongoKash has a fully functional backend with user profiles, OKP token rewards, transactions, staking, mobile money, and an admin dashboard. There is no referral system: no referral codes, no tracking of who referred whom, and no referral-specific OKP rewards.

## Requested Changes (Diff)

### Add
- **Referral code per user**: Each user gets a unique alphanumeric code generated on first login. Stored in backend.
- **Referral registration**: When a new user signs up, they can optionally enter a referral code. The system records the referrer → referee relationship.
- **Referral rewards (OKP)**:
  - Referrer receives +100 OKP when a referred user completes their first crypto transaction.
  - New user receives +50 OKP bonus at signup when using a valid referral code.
- **Referral dashboard (user-facing)**: A new "Parrainage" tab in the user Dashboard showing:
  - User's own referral code (copyable)
  - Shareable referral link (e.g. `https://app.kongokash.cd?ref=XXXXX`)
  - List of referred users (display name or anonymous ID, join date, status: actif/en attente)
  - Total OKP earned via referrals
- **Admin visibility**: Admin dashboard "Utilisateurs" tab shows referral counts per user.

### Modify
- `UserProfile` type: add optional `referralCode` and `referredBy` fields.
- OKP reward logic: when a referred user makes their first crypto purchase, trigger a +100 OKP reward for the referrer.
- New user signup flow: accept optional referral code, validate it, apply bonus.

### Remove
- Nothing removed.

## Implementation Plan

1. **Backend**:
   - Add `referralCode : ?Text` and `referredBy : ?Principal` to user data.
   - `generateReferralCode(caller)` — generates and stores a unique 6-char code for the user.
   - `getReferralCode(caller)` — returns caller's referral code (generates if missing).
   - `applyReferralCode(code: Text)` — called by new user at signup; validates code, records referrer, grants +50 OKP.
   - `getReferralStats(caller)` — returns list of referred users with join date and first-tx status, plus total OKP earned from referrals.
   - On first `buyCrypto` or `sellCrypto`, check if user was referred and hasn't triggered the referral reward yet → grant +100 OKP to referrer.

2. **Frontend**:
   - New `ReferralSection.tsx` component with referral code display/copy, shareable link, referred users list, and OKP earned.
   - Add "Parrainage" tab to the user Dashboard.
   - Add optional referral code input field in the KYC/profile setup flow (or as a standalone modal at first login).
   - Admin dashboard: show referral count in user list.
