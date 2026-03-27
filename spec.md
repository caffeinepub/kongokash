# KongoKash — Smart Escrow P2P Contract

## Current State
P2P module exists in P2PSection.tsx with full lifecycle: createOffer, acceptOffer, confirmPaymentSent, confirmPaymentReceived, openDispute, resolveDispute. Backend has all corresponding Motoko functions. The escrow locking mechanic exists but UX doesn't clearly visualize the locking event when seller creates an offer or when buyer accepts.

Missing:
- No auto-release timer (seller funds locked indefinitely if buyer never pays)
- Payment instructions (phone/account) not shown to buyer after locking
- Seller's own offers visible in the market list (confusing)
- No countdown timer on locked trades
- No buyer escape hatch if seller goes silent

## Requested Changes (Diff)

### Add
- Escrow lock animation/visual when seller creates offer (funds locked badge with lock icon)
- Countdown timer (30 min) displayed on locked trades for buyer to confirm payment
- Payment instructions panel shown to buyer inside the trade card (seller's payment method contact info)
- Auto-cancel logic on frontend: show "Délai dépassé" badge when 30min window expired
- "Annuler le trade" button for buyer/seller when payment window expires (calls cancelP2POffer)
- Filter own offers from OffresDisponiblesTab so sellers don't see their own offers
- Escrow status diagram in AcceptOfferDialog showing the 3-step flow: Offre créée → Fonds verrouillés → Paiement confirmé → Libération

### Modify
- CreateOfferDialog: add confirmation message showing "Vos fonds seront verrouillés immédiatement dans le smart contract" before submit
- AcceptOfferDialog: show escrow flow diagram before confirm button
- TradeCard: enhance escrow timeline with lock icon, timer, and payment instructions section
- OffresDisponiblesTab: filter out caller's own offers

### Remove
- Nothing

## Implementation Plan
1. Add escrow flow diagram component (3 steps with icons)
2. Add countdown timer hook using trade `createdAt` + 30min window
3. Show payment instructions (paymentMethod + simulated contact) in locked trade card
4. Add lock confirmation in CreateOfferDialog
5. Filter own offers in OffresDisponiblesTab
6. Add expired timer badge and cancel button
