# KongoKash

## Current State
- Transactions stored with fields: id, userId, txType, asset, cryptoAmount, fiatAmount, fiatCurrency, paymentMethod, status, timestamp
- Status values used: "completed", "pending"
- No external transfer network concept (TRC20, BEP20, ERC20)
- Admin dashboard transactions tab shows basic status (completed/en attente) — no network, no address
- No per-network fee configuration in admin settings
- TransactionHistory component handles completed/pending/failed display

## Requested Changes (Diff)

### Add
- Backend: `ExternalTransfer` type with fields: id, userId, asset, amount, toAddress, network (TRC20|BEP20|ERC20), networkFee, status (pending|confirmed|failed), timestamp
- Backend: stable var `externalTransfers` map and `externalTransferId` counter
- Backend: `networkFees` stable var — configurable fee per network (TRC20, BEP20, ERC20)
- Backend: `submitExternalTransfer(asset, amount, toAddress, network)` — user function
- Backend: `updateExternalTransferStatus(id, status)` — admin only
- Backend: `getMyExternalTransfers()` — user query
- Backend: `getAllExternalTransfers()` — admin query
- Backend: `setNetworkFee(network, fee)` — admin only
- Backend: `getNetworkFees()` — public query
- Frontend: `ExternalTransferModal` component — network selector (TRC20 recommended), address input, warning banner, fee display
- Frontend: `ExternalTransferHistory` component — list with status badges (pending/confirmé/échoué)
- Frontend: Admin dashboard Transactions tab — add columns: Réseau, Adresse for external transfers
- Frontend: Admin dashboard Settings tab — network fee configuration card (TRC20, BEP20, ERC20 fees)
- Frontend: Admin dashboard — external transfers table with status update action

### Modify
- Admin transactions tab: add external transfers section with network, address, status columns
- Admin settings tab: add network fees configuration card
- PortfolioSection or Dashboard: expose the external transfer action button ("Transfert Externe")

### Remove
- Nothing removed

## Implementation Plan
1. Add `ExternalTransfer` type, `networkFees` var, and all backend functions to main.mo
2. Update backend.d.ts bindings
3. Create ExternalTransferModal component (network select, address input, warning, fee)
4. Add external transfers history to Dashboard/TransactionHistory
5. Update AdminDashboard: add external transfers table + network fee settings card
