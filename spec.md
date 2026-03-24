# KongoKash

## Current State
New project — no existing application.

## Requested Changes (Diff)

### Add
- Landing page with hero section promoting CDF/USD-to-crypto exchange
- Market overview strip with live-style crypto rates (BTC, ETH, USDT) vs CDF and USD
- Dashboard with 4 cards: Exchange Rates, Quick Converter, Wallet, Transaction History
- Buy/Sell form with asset selection, amount input, payment method selection (M-Pesa, Airtel Money, Bank Transfer)
- User authentication (register/login)
- Backend: user accounts, wallet balances per currency (BTC, ETH, USDT, CDF, USD), transaction records
- Backend: exchange rate storage (manually updatable by admin), buy/sell transaction creation
- Navigation with Home, Exchange, Wallet, Portfolio, Support sections
- Footer with company links

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: define data types for User, Wallet, Transaction, ExchangeRate
2. Backend: CRUD for user registration/login, wallet balance management
3. Backend: exchange rates storage with admin update capability
4. Backend: buy/sell transaction creation that adjusts wallet balances
5. Backend: transaction history query per user
6. Frontend: landing page with hero, market overview, dashboard cards, buy/sell form
7. Frontend: auth flow (register/login modal)
8. Frontend: wire all backend calls for rates, balances, transactions
