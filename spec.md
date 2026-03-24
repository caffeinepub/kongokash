# KongoKash — Intégration Token Okapi (OKP)

## Current State
KongoKash est une dApp d'échange crypto (BTC, ETH, USDT) en CDF/USD. Le backend Motoko gère :
- Profils utilisateurs et KYC léger
- Wallets avec soldes CDF, USD, BTC, ETH, USDT
- Transactions d'achat/vente crypto
- Taux d'échange
- Autorisation par rôles (admin, user, guest)

Le frontend React affiche : HeroSection, MarketOverview, Dashboard (portefeuille, taux, historique, convertisseur), BuySellSection, BanquesSection.

## Requested Changes (Diff)

### Add
- **Token OKP** : solde OKP dans WalletBalance (champ `okp`)
- **Staking OKP** : verrou d'OKP avec durée, accumulation de récompenses de staking
- **Système de rewards** : attribution automatique d'OKP à chaque dépôt, achat, vente, envoi OKP
  - Dépôt fiat : 10 OKP
  - Achat crypto : 25 OKP
  - Vente crypto : 10 OKP
  - Envoi OKP P2P : 5 OKP
- **Transfert OKP P2P** : envoyer OKP d'un utilisateur vers un autre Principal
- **Paiement marchand OKP** : payer un marchand en OKP avec conversion auto en CDF côté marchand
- **Réduction de frais** : si l'utilisateur paie les frais de transaction en OKP (flag `useOkpFees`), frais réduits à 0.5% vs 1%
- **Taux OKP/CDF** : taux de conversion OKP → CDF configurable par admin (défaut : 1 OKP = 500 CDF)
- **OKP initial** : 100 OKP offerts lors de la première création de wallet
- Nouvelles fonctions backend :
  - `getOkpBalance()` : solde OKP
  - `stakeOkp(amount, durationDays)` : verrouiller OKP
  - `unstakeOkp(stakeId)` : débloquer OKP + récompenses
  - `getStakes()` : liste des stakes actifs
  - `transferOkp(to, amount)` : envoi P2P
  - `payMerchantOkp(merchant, okpAmount, convertToCdf)` : paiement marchand
  - `setOkpToCdfRate(rate)` : admin seulement
  - `getOkpToCdfRate()` : taux public
  - `claimDailyReward()` : réclamer récompense journalière (50 OKP/jour)

### Modify
- `WalletBalance` : ajouter champ `okp : Float`
- `buyCrypto` : si `useOkpFees = true`, déduire frais en OKP au lieu de fiat; ajouter reward OKP
- `sellCrypto` : ajouter reward OKP
- `depositFiat` : ajouter reward OKP
- `saveCallerUserProfile` / `updateProfile` : initialiser OKP à 100 lors de la création du wallet
- `getPortfolioValue` : inclure la valeur OKP en CDF/USD

### Remove
- Rien à supprimer

## Implementation Plan
1. Ajouter type `StakeRecord` (id, userId, amount, startTime, durationDays, claimed)
2. Ajouter `okpToCdfRate` var (défaut 500.0)
3. Ajouter champ `okp` à WalletBalance
4. Modifier initialisation wallet (100 OKP offerts)
5. Ajouter Map stakes + var stakeId counter
6. Implémenter fonctions OKP : getOkpBalance, stakeOkp, unstakeOkp, getStakes, transferOkp, payMerchantOkp, setOkpToCdfRate, getOkpToCdfRate, claimDailyReward
7. Helper interne `awardOkp(user, amount)` appelé après chaque action récompensée
8. Modifier buyCrypto/sellCrypto/depositFiat pour appeler awardOkp
9. Modifier getPortfolioValue pour inclure OKP
10. Frontend : ajouter section OKP dans Dashboard (solde, staking, transfert, récompenses)
11. Frontend : badge OKP dans Wallet card avec solde
12. Frontend : onglets dans Dashboard pour gérer OKP
