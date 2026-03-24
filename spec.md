# KongoKash — Tokenomics Complète OKP

## Current State
- `OKP_TOTAL_SUPPLY = 21_000_000` dans le backend
- Aucune distribution/allocation initiale définie
- Onglet Statistiques affiche : supply totale, émis, circulation, stakés, brûlés, taux, multiplicateur
- Mécanismes existants : burn 1.5%, halvening tous les 500k OKP, récompenses avec multiplicateur

## Requested Changes (Diff)

### Add
- Constantes d'allocation dans le backend : COMMUNITY (40%), TEAM (20%), LIQUIDITY (15%), INVESTORS (10%), MARKETING (10%), RESERVE (5%)
- Type `OkpTokenomics` retournant toutes les allocations avec montants absolus
- Fonction query `getOkpTokenomics` publique
- Ajout de `tokenomics` dans `OkpAdminStats` ou nouveau champ `allocations`
- Onglet Statistiques : section visuelle des 6 catégories d'allocation avec barres de progression

### Modify
- `OKP_TOTAL_SUPPLY` : 21_000_000 → 1_000_000_000
- `OKP_HALVING_INTERVAL` : 500_000 → 50_000_000 (proportionnel à la nouvelle supply)
- `OkpAdminStats` : ajouter champ `allocations` avec les 6 catégories
- Onglet Statistiques frontend : afficher distribution initiale avec barres colorées

### Remove
- Rien

## Implementation Plan
1. Mettre à jour `OKP_TOTAL_SUPPLY` et `OKP_HALVING_INTERVAL` dans main.mo
2. Ajouter type `OkpAllocation` et constantes dans main.mo
3. Enrichir `OkpAdminStats` avec champ `allocations : [OkpAllocation]`
4. Mettre à jour `getOkpAdminStats` pour inclure les allocations
5. Mettre à jour `backend.d.ts` pour refléter le nouveau type
6. Mettre à jour OkapiSection.tsx : onglet Statistiques avec section distribution visuelle
