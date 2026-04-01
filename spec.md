# KongoKash

## Current State
Version 71. App has 5-tab navigation (Accueil, Wallet, P2P, Transactions, Profil). DashboardHome shows portfolio balance (from `usePortfolioValue`), quick action buttons that all navigate to `wallet` tab, recent transactions (from `useTransactions`), and market rates (from `useExchangeRates`). WalletPage has its own balance display using `useWallet`. There is a `useWallet` hook providing per-asset balances and a `usePortfolioValue` hook providing total CDF/USD. DashboardHome uses MOCK_ACTIVITY as fallback when real transactions are empty.

## Requested Changes (Diff)

### Add
- `useWalletStore` context/hook that serves as the **single source of truth** for wallet balances — shared between Dashboard, Wallet, and Transactions pages
- Smart quick action handlers: each action opens a specific sub-view rather than just navigating to a tab
  - "Déposer" → Wallet tab, deposit sub-tab pre-opened
  - "Envoyer" → Wallet tab, external transfer sub-tab pre-opened
  - "Recevoir" → inline modal/sheet showing wallet address + QR code immediately
  - "Acheter" → P2P tab with best offers pre-filtered, or Wallet exchange sub-tab
- Pre-filled "Recevoir" modal: shows non-custodial wallet address (from `useNonCustodialWallet`) with QR code SVG
- Pre-filled "Envoyer" action: navigates to wallet with send form pre-ready
- Real-time data refresh: after any mutation (buy, sell, deposit, withdraw), invalidate wallet + transactions + portfolio queries via QueryClient
- Remove MOCK_ACTIVITY: always use real transactions from `useTransactions`, show empty state if no transactions

### Modify
- DashboardHome: connect total balance exclusively from `useWallet` data (summing per-asset CDF equivalents using exchange rates) as single source — removing the separate `usePortfolioValue` dependency or aligning both
- Quick action buttons in DashboardHome: each button now passes a `subTab` or `action` parameter via `onNavigate` callback, so parent App.tsx can open the correct sub-view
- WalletPage: accept an optional `defaultSubTab` prop to auto-open a specific sub-tab when navigated from dashboard
- App.tsx: extend `onNavigate` to handle `tab:subtab` navigation format (e.g. `wallet:deposit`, `wallet:send`, `p2p:buy`)
- TransactionsPage: use same `useTransactions` data, no separate mock data

### Remove
- MOCK_ACTIVITY array from DashboardHome (replace with real data + empty state)

## Implementation Plan
1. Create `src/hooks/useWalletContext.tsx` — a React context that wraps `useWallet`, `usePortfolioValue`, `useTransactions`, `useExchangeRates` and exposes computed totalCDF, totalUSD, per-asset balances, and a `refresh()` function that invalidates all related queries
2. Wrap App with `WalletContextProvider`
3. Update DashboardHome to use wallet context for balance, real transactions for activity
4. Add "Recevoir" modal in DashboardHome using `useNonCustodialWallet` for address + inline QR SVG
5. Update quick action `onNavigate` to pass sub-tab info (e.g. `wallet:deposit`)
6. Update App.tsx to parse `tab:subtab` and pass `defaultSubTab` to WalletPage
7. Update WalletPage to accept and honor `defaultSubTab` prop
8. Ensure all mutations in WalletPage and P2PPage call `refresh()` or invalidate queries properly
