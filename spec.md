# KongoKash — Historique des Transactions

## Current State
The backend already exposes `getTransactions(): Promise<Array<Transaction>>` which returns the last 50 transactions for the authenticated user (filtered by userId == caller). The Transaction type includes: id, userId, type (Buy/Sell/Deposit/Withdrawal/Transfer/Staking/Reward), cryptoAsset, cryptoAmount, fiatAmount, fiatCurrency, paymentMethod, status, timestamp, description, feeOkp.

The Dashboard component (src/frontend/src/components/Dashboard.tsx) contains the portfolio view. There is no transaction history UI anywhere in the app.

## Requested Changes (Diff)

### Add
- A new `TransactionHistory` component (`src/frontend/src/components/TransactionHistory.tsx`) that:
  - Calls `getTransactions()` on load (requires user to be authenticated)
  - Displays a table/list of up to 50 recent transactions
  - Shows columns: Date, Type (with icon/badge), Actif, Montant crypto, Montant fiat, Statut (badge coloré), Description
  - Supports filtering by type (Tous, Achat, Vente, Dépôt, Retrait, Transfert, Staking, Récompense)
  - Loading skeleton state
  - Empty state message ("Aucune transaction pour le moment")
- Integrate the TransactionHistory component into the Dashboard under a new tab "Historique"

### Modify
- `src/frontend/src/components/Dashboard.tsx`: Add an "Historique" tab that renders the new TransactionHistory component

### Remove
- Nothing removed

## Implementation Plan
1. Create `TransactionHistory.tsx` with filtered list, badges per type/status, and date formatting in French
2. Add "Historique" tab to Dashboard tabs
3. Wire to `getTransactions()` from backend via useActor hook
4. Validate (typecheck, lint, build)
