# KongoKash

## Current State
L'app a une navigation en 5 onglets (Accueil, Wallet, P2P, Transactions, Profil) avec une structure modulaire. L'onboarding existe mais manque de progression visuelle. Les pages sont fonctionnelles mais passives — peu de CTA visibles, l'Accueil ne montre pas le solde, le Wallet n'a pas de boutons d'action proéminents, le P2P n'affiche pas de liste d'offres réelle.

## Requested Changes (Diff)

### Add
- Dashboard Accueil : carte de solde total, 4 boutons d'action rapide (Déposer / Envoyer / Recevoir / Échanger), liste d'activité récente (5 dernières transactions)
- Wallet : rangée de boutons d'action (Envoyer, Recevoir, Déposer, Retirer) bien visibles en haut de chaque asset
- P2P : liste d'offres enrichie (prix, utilisateur, note, montant min/max, méthode de paiement, boutons Acheter/Vendre actifs)
- Transactions : filtres actifs par type (dépôt/retrait/échange/P2P) et statut (confirmé/en attente/échoué)
- Onboarding : barre de progression visuelle (étape 1/3, 2/3, 3/3), checkmarks verts sur les étapes complétées, CTA "Commencer" clair

### Modify
- DashboardHome.tsx : transformer en vrai dashboard avec solde + actions rapides + activité récente
- WalletPage.tsx : ajouter une rangée de boutons CTA en haut de section
- P2PPage.tsx : remplacer la liste statique par des offres simulées réalistes avec avatar utilisateur, prix, limites, méthode
- TransactionsPage.tsx : ajouter barre de filtres sticky (type + statut)
- OnboardingFlow.tsx : ajouter progression visuelle step-by-step

### Remove
- Rien à supprimer — amélioration uniquement

## Implementation Plan
1. Refaire DashboardHome avec carte solde total (multi-actifs agrégé), 4 boutons action rapide, feed activité récente
2. Ajouter dans WalletPage une rangée de 4 boutons (Envoyer/Recevoir/Déposer/Retirer) avec icônes, bien visibles avant la liste des actifs
3. Dans P2PPage, créer une liste d'offres simulées réalistes : avatar, pseudo, note, crypto, prix/CDF, limites, méthode paiement (Airtel/M-Pesa), bouton CTA Acheter ou Vendre coloré
4. Dans TransactionsPage, ajouter filtres pills (Tous / Dépôts / Retraits / Échanges / P2P) et (Tous / Confirmé / En attente / Échoué) avec filtre actif souligné en teal
5. Dans OnboardingFlow, ajouter une barre de progression numérotée (1→2→3) avec checkmarks verts et labels d'étape
