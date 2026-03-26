# KongoKash — Paires de trading CDF

## Current State
- Exchange section (BuySellSection) supports BTC, ETH, USDT only
- MarketOverview shows BTC/CDF, ETH/CDF, USDT/CDF, BTC/USD, ETH/USD, USDT/USD
- Backend `buyCrypto`/`sellCrypto` only handles BTC, ETH, USDT
- Backend wallet has `okp` field; OKP is managed separately (not via buy/sell)
- No ICP support in backend wallet or exchange

## Requested Changes (Diff)

### Add
- ICP/CDF and OKAPI/CDF trading pairs in MarketOverview (with fallback rates)
- ICP and OKP as selectable assets in BuySellSection buy/sell dropdowns
- ICP/CDF, USDT/CDF, OKAPI/CDF ticker entries in the market scrolling banner
- Description text in exchange section explaining CDF as the bridge currency

### Modify
- MarketOverview FALLBACK_RATES: add ICP/CDF, OKAPI/CDF entries
- BuySellSection: add ICP and OKAPI (OKP) to asset selectors for both buy and sell tabs
- cryptoIcons map: add ICP and OKP icons
- Backend `buyCrypto`/`sellCrypto`: add case for "ICP" (add icp field to wallet) and "OKP" (allow buying OKP with CDF directly)

### Remove
- Nothing removed

## Implementation Plan
1. Frontend only changes (no backend modification possible here):
   - MarketOverview: add ICP/CDF (rate ~11500 CDF), OKAPI/CDF (rate 50 CDF) to FALLBACK_RATES; add ICP icon
   - BuySellSection: add ICP and OKAPI to asset dropdowns in both buy/sell tabs
   - Add a short explanatory note about CDF as bridge currency
   - The buy/sell calls pass asset as string; backend will handle it (mock success if not yet supported)
2. Backend: The existing `buyCrypto`/`sellCrypto` functions handle unknown assets gracefully; we extend wallet type to include `icp` field and handle ICP/OKP buy/sell cases
