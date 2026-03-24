# KongoKash — Livre Blanc Okapi

## Current State
L'application KongoKash dispose d'une section Okapi (`OkapiSection.tsx`) avec 5 onglets :
- Vue d'ensemble (solde, récompenses quotidiennes)
- Staking
- Transfert P2P
- Paiement marchand
- Admin (statistiques et tokenomics)

Les allocations tokenomics, le burn, le halvening et les stats temps réel sont déjà intégrés.

## Requested Changes (Diff)

### Add
- Nouvel onglet "Livre Blanc" dans `OkapiSection.tsx` (6e onglet)
- Sections dans le livre blanc :
  1. Résumé exécutif — présentation de KongoKash et Okapi
  2. Vision — problème, solution, marché cible (Congo/RDC)
  3. Tokenomics — supply totale, allocations avec graphique en barres proportionnelles
  4. Mécanismes clés — burn (1.5%), halvening (tous les 50M OKP), staking (10/15/20%), rewards, prix dynamique
  5. Calendrier de vesting Équipe — tableau visuel sur 24 mois, déblocage progressif
  6. Flux utilisateur — étapes visuelles d'onboarding à la transaction
  7. Roadmap — phases : pré-lancement, lancement, expansion (Q1–Q4 2025+)
  8. FAQ — 6 à 8 questions courantes sur OKP, KYC, frais, sécurité
- Graphiques inline (sans librairie externe) :
  - Distribution des tokens : barres colorées (reprend OKAPI_ALLOCATIONS existant)
  - Vesting Équipe : tableau de progression sur 24 mois
  - Flux utilisateur : étapes avec icônes et flèches
- Bouton "Télécharger PDF" (déclenche window.print() sur la section, ou ouvre une version formatée)

### Modify
- `TabsList` dans `OkapiSection.tsx` : ajouter un 6e onglet `value="whitepaper"`
- Aucune modification backend nécessaire

### Remove
- Rien

## Implementation Plan
1. Ajouter `TabsTrigger value="whitepaper"` dans le `TabsList` existant
2. Créer `TabsContent value="whitepaper"` avec toutes les sections du livre blanc
3. Réutiliser `OKAPI_ALLOCATIONS` pour le graphique de distribution
4. Créer un tableau vesting 24 mois (déblocage 0% mois 0–11, puis linéaire 8.33%/mois de mois 12 à 24)
5. Ajouter le flux utilisateur avec étapes visuelles
6. Ajouter roadmap et FAQ en accordéon ou sections dépliables
7. Ajouter un bouton print/PDF
8. Valider et déployer
