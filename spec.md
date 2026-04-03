# KongoKash — Système Hybride P2P + KongoKash Direct

## Current State

L'app dispose d'un module P2P (P2PPage.tsx / P2PSection.tsx) et d'un module BuySell (BuySellSection.tsx) distincts, mais la différence entre "achat instantané" et "marché entre utilisateurs" n'est pas clairement présentée comme deux systèmes séparés avec des avantages/inconvénients visibles. Il n'y a pas de logique UX qui recommande l'un ou l'autre selon le contexte, ni de comparaison de prix en temps réel entre les deux canaux.

## Requested Changes (Diff)

### Add
- Nouveau composant `KongoKashDirect.tsx` : interface dédiée à l'achat/retrait instantané avec prix fixe (spread 1.5%), disponibilité immédiate (24/7), sans besoin d'un vendeur tiers
- Moteur de prix simulé `priceEngine.ts` : prix P2P dynamiques (offres utilisateurs ±2-5% du marché), prix KongoKash Direct fixes (spot + spread configurable)
- Page d'entrée hybride `EchangeHub.tsx` : sélecteur intelligent qui compare les deux options et recommande la meilleure selon le contexte (montant, heure, disponibilité)
- Bannière de comparaison contextuelle : affiche Prix P2P vs Prix Direct avec l'économie possible ou la rapidité gagnée
- Badge de disponibilité : "Disponible maintenant" pour Direct, "X offres actives" pour P2P

### Modify
- `P2PPage.tsx` : devient un onglet dans l'EchangeHub plutôt qu'une page isolée
- `App.tsx` : l'onglet "p2p" de navigation pointe vers le nouvel EchangeHub (qui contient les deux systèmes)
- `DashboardHome.tsx` : les actions rapides "Acheter" et "Vendre" ouvrent l'EchangeHub avec la recommandation contextuelle pré-selectionnée

### Remove
- Rien supprimé — BuySellSection reste disponible dans le WalletPage pour l'échange interne

## Implementation Plan

1. Créer `src/frontend/src/utils/priceEngine.ts` — prix simulés pour P2P (dynamiques, variables) et KongoKash Direct (fixes + spread)
2. Créer `src/frontend/src/components/KongoKashDirect.tsx` — formulaire d'achat/retrait instantané avec :
   - Affichage du prix fixe (stable, garanti)
   - Disponibilité 24/7
   - Traitement immédiat
   - Comparaison avec le meilleur prix P2P disponible
3. Créer `src/frontend/src/components/EchangeHub.tsx` — hub central avec :
   - Sélecteur de mode : P2P vs KongoKash Direct
   - Comparateur de prix en temps réel
   - Recommandation contextuelle intelligente ("Meilleur prix" vs "Disponible maintenant")
   - Transition fluide entre les deux modes
4. Modifier `App.tsx` — l'onglet `p2p` rend `EchangeHub` au lieu de `P2PPage`
5. Modifier `DashboardHome.tsx` — actions rapides "Acheter" et "Vendre" pointent vers l'EchangeHub
