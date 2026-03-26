# KongoKash — Escrow Payment System

## Current State
Reservations module exists with hotels, parks, airlines. Payments go directly to the platform on booking. No escrow, no dispute mechanism.

## Requested Changes (Diff)

### Add
- Escrow smart contract logic in Motoko: lock funds on booking, release on check-in confirmation or auto-release X hours before service
- Dispute system: user or partner can open a dispute, admin arbitrates
- Refund logic: full refund if cancelled before auto-release window; partial/full refund on dispute resolution
- Frontend escrow status UI: shows fund state (Bloqué / Libéré / Remboursé / Litige)
- Check-in confirmation button for partners
- Dispute form for users
- Admin dispute management panel

### Modify
- Reservation flow: payment now creates an escrow entry instead of direct transfer
- Dashboard → Réservations: add escrow status badge and dispute/refund actions
- Admin Dashboard: add Litiges tab

### Remove
- Nothing removed

## Implementation Plan
1. Add escrow types and state to Motoko backend: EscrowEntry { reservationId, amount, currency, status, releaseTime, userId, partnerId }
2. Add backend functions: createEscrow, confirmCheckin, autoRelease, openDispute, resolveDispute (admin), refundEscrow
3. Frontend: EscrowStatusBadge component
4. Frontend: update reservation booking flow to show escrow explanation
5. Frontend: Dashboard → Réservations → escrow status + Ouvrir un litige button
6. Frontend: Admin → Litiges tab with resolve/refund actions
