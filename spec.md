# KongoKash — Amélioration économique du token Okapi (OKP)

## Current State
- Le token OKP existe avec un taux fixe OKP/CDF configurable par admin (défaut 500 CDF)
- Les récompenses sont fixes : 25 OKP (achat), 10 OKP (vente/dépôt), 5 OKP (transfert), 50 OKP (daily)
- Aucun mécanisme de burn
- Aucun suivi global de la supply ou des tokens brûlés
- Pas de dashboard admin pour les statistiques OKP

## Requested Changes (Diff)

### Add
- Variable `totalOkpIssued` : total OKP mintés depuis la création
- Variable `totalOkpBurned` : total OKP détruits par burn
- Variable `okpTxVolume` : volume cumulé d'OKP transactés (pour ajustement de prix)
- Variable `okpPriceAdjustment` : ajustement dynamique du prix basé sur l'usage
- Mécanisme de burn 1.5% sur chaque transfert/paiement OKP — les OKP brûlés sont soustraits du solde de l'expéditeur en plus du montant transféré
- Récompenses déclinantes par système de halvening : divisées par 2 tous les 500 000 OKP mintés (plancher à 0.0625x)
- Ajustement dynamique du prix : chaque OKP transacté augmente légèrement le taux (okpTxVolume * 0.00001 CDF ajouté au taux de base)
- Fonction `getEffectiveOkpRate()` interne retournant le taux réel (base + ajustement)
- Endpoint public `getOkpAdminStats()` retournant : totalSupply (cap 21M), totalIssued, circulatingSupply, totalStaked, totalBurned, currentRate, rewardMultiplier
- Endpoint admin `resetPriceAdjustment()` pour remettre l'ajustement dynamique à zéro si nécessaire

### Modify
- `awardOkp` : appliquer le multiplicateur de récompense déclinant + incrémenter `totalOkpIssued`
- `transferOkp` : déduire 1.5% de burn + incrémenter `totalOkpBurned` et `okpTxVolume`, mettre à jour l'ajustement prix
- `payMerchantOkp` : même traitement burn + volume
- `getOkpToCdfRate` : retourner le taux effectif (base + ajustement)
- `getPortfolioValue` : utiliser `getEffectiveOkpRate()` au lieu de `okpToCdfRate` directement
- Dashboard frontend OkapiSection : ajouter un onglet "Stats Admin" visible uniquement pour les admins

### Remove
- Rien de retiré — rétrocompatibilité totale

## Implementation Plan
1. Ajouter les nouvelles variables d'état dans main.mo
2. Implémenter `getEffectiveOkpRate()` et `getRewardMultiplier()` comme fonctions internes
3. Mettre à jour `awardOkp` avec multiplicateur et compteur `totalOkpIssued`
4. Mettre à jour `transferOkp` et `payMerchantOkp` avec burn + volume tracking
5. Ajouter endpoint `getOkpAdminStats()` (query publique pour transparence)
6. Ajouter endpoint `resetPriceAdjustment()` (admin seulement)
7. Mettre à jour `backend.d.ts` avec les nouveaux types/endpoints
8. Mettre à jour `OkapiSection.tsx` pour ajouter un onglet admin avec les 4 métriques clés
