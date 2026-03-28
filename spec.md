# KongoKash — Anti-Fraude Actif

## Current State
KongoKash has basic anti-fraud measures: proof of receipt hashing, P2P state machine, proof of payment with SHA-256, multi-level verification (auto/AI/manual). No active fraud detection for multi-accounts, suspicious patterns, or IP tracking.

## Requested Changes (Diff)

### Add
- **Device Fingerprint** module: generates a persistent fingerprint per device (screen, timezone, userAgent, canvas, webGL, fonts) and stores it in IndexedDB
- **Multi-account detection**: when a new user connects, compare their fingerprint against all known fingerprints — flag if same device has multiple accounts
- **Suspicious pattern detection**: track repetitive behaviors (multiple failed P2P trades, repeated dispute openings, rapid successive reservations with cancellations)
- **IP tracking simulation**: record and flag suspicious IP activity (multiple accounts from same IP)
- **Sanctions system**: 3 levels — Blocage immédiat (immediate block), Gel temporaire (temporary freeze, configurable duration), Blacklist globale (global blacklist)
- **Admin Anti-Fraude dashboard tab**: view flagged accounts, apply/lift sanctions, view fraud logs
- **User-facing block**: blocked users see a clear message explaining their status and appeal process
- **Fraud score**: each user gets a live fraud score (0–100), updated automatically based on behavior

### Modify
- Admin Dashboard: add "Anti-Fraude 🛡️" tab with fraud alerts, user sanctions, and audit log
- User authentication flow: check fraud status on login, block access if sanctioned

### Remove
- Nothing removed

## Implementation Plan
1. Create `fraudDetection.ts` utility: device fingerprint generation, pattern analysis, fraud score calculation
2. Add fraud state to backend mock (user fraud scores, sanctions, blacklist)
3. Add Anti-Fraude tab in AdminDashboard with flagged users, sanction controls, and audit log
4. Integrate fraud check on user actions (P2P, reservations, login)
5. Add blocked user UI state with appeal message
