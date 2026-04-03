# KongoKash — Module Conversion Monnaies Africaines

## Current State

KongoKash dispose d'un système d'échange hybride (EchangeHub) avec deux canaux :
- **KongoKash Direct** : achat/vente instantané de crypto (BTC, ETH, USDT, ICP, OKP) contre CDF
- **P2P Marché** : échange entre utilisateurs avec escrow sécurisé

Le priceEngine.ts gère les paires CDF/crypto. L'application n'a pas de module de conversion entre monnaies africaines fiat (CDF, FCFA, NGN, KES, GHS, XAF, XOF, ZAR).

La navigation principale a 5 onglets : Accueil, Wallet, P2P, Transactions, Profil. L'onglet P2P affiche EchangeHub.

## Requested Changes (Diff)

### Add
- Nouveau composant `ConversionModule.tsx` — interface complète de conversion entre monnaies africaines
- Nouveau utilitaire `africaCurrencies.ts` — taux de change simulés, logique de conversion via pivot USDT, liste des devises, agents
- Onglet "Conversion" dans EchangeHub (3e mode aux côtés de Direct et P2P)
- Deux modes dans ConversionModule :
  - **Mode P2P** : liste d'offres d'agents disponibles pour échanger CDF ↔ FCFA/NGN/etc.
  - **Mode KongoKash Direct** : conversion instantanée via liquidité interne (CDF → USDT → devise cible)
- Interface utilisateur : sélection devise source + cible, saisie montant, affichage taux + montant converti, bouton convertir
- Système d'agents : liste d'agents enregistrés avec devise, disponibilité, taux, volume
- Logique de compensation interne : routing CDF → USDT → FCFA/XOF/XAF/NGN/KES/GHS/ZAR
- Bannière explicative sur le principe (sans banques internationales)

### Modify
- `EchangeHub.tsx` : ajouter un 3e mode "conversion" avec carte de sélection dédiée
- `App.tsx` : le TabId "p2p" englobe déjà EchangeHub, pas de changement de navigation nécessaire
- `africaCurrencies.ts` (nouveau) : intégrer dans priceEngine ou créer séparément

### Remove
- Rien à supprimer

## Implementation Plan

1. Créer `africaCurrencies.ts` avec :
   - Devises africaines supportées : CDF, FCFA (XAF/XOF), NGN, KES, GHS, ZAR
   - Taux CDF→USDT→devise cible (pivot USDT)
   - Liste d'agents simulés avec nom, devise, disponibilité, taux, volume
   - Fonctions : convertAmount(), getAgentOffers(), getBestRate()

2. Créer `ConversionModule.tsx` avec :
   - Sélecteur devise source (CDF par défaut) et devise cible (FCFA par défaut)
   - Champ montant avec affichage en temps réel du résultat converti
   - Taux affiché + décomposition (CDF → USDT → cible)
   - Deux onglets internes : "Instantané" (KongoKash Direct) et "Via Agents" (P2P)
   - Mode Instantané : bouton convertir direct, frais 0.8%, délai ~2 min
   - Mode Agents : liste d'offres d'agents avec taux, méthode de paiement, bouton Contacter
   - Bannière : "Échanges africains sans banques internationales"

3. Modifier `EchangeHub.tsx` :
   - Ajouter carte "Conversion 🌍" comme 3e option dans le sélecteur de mode
   - Rendre la grille 3 colonnes sur desktop, 1 sur mobile
   - Charger ConversionModule quand mode === 'conversion'
