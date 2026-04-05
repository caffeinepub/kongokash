# KongoKash

## Current State
- HeroSection.tsx: main landing hero with tagline and stats
- P2PSection.tsx: P2P exchange section with offers listing
- VisionSection.tsx: vision/mission section
- EchangeHub.tsx: hub for P2P / KongoKash Direct / Conversion modes
- ConversionModule.tsx: African currency conversion module
- P2PPage.tsx: full P2P page with trades, escrow, dispute logic

## Requested Changes (Diff)

### Add
1. **Homepage headline**: "Envoyez et échangez de l'argent entre pays africains sans banque" in the HeroSection
2. **Concrete P2P Africa use cases** on homepage: RDC → Côte d'Ivoire, RDC → Cameroun with live currency examples (CDF, FCFA, XAF)
3. **African currencies highlight**: visual callout on homepage showcasing CDF, FCFA, XAF, Naira, etc.
4. **"Comment ça marche" section**: new P2PHowItWorks component explaining the full escrow flow in 5 clear steps (vendeur dépose crypto → fonds bloqués → paiement fiat → libération automatique → terminé)
5. **Dispute management, arbitrage & score de confiance** visible in the "Comment ça marche" section (tabs or sub-section)

### Modify
- HeroSection: update main tagline to P2P Africa value proposition, add use case cards (RDC→CIV, RDC→CMR)
- P2PSection or EchangeHub: add "Comment ça marche" section before the offer listing

### Remove
- Nothing removed

## Implementation Plan
1. Update HeroSection tagline + add African P2P use case cards with flags and currency pairs
2. Create P2PHowItWorks component with 5-step escrow flow + dispute/arbitrage + trust score sub-section
3. Integrate P2PHowItWorks in P2PSection or EchangeHub
4. Ensure African currencies (CDF, FCFA, XAF, NGN) are visually highlighted on homepage
