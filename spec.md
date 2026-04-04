# KongoKash

## Current State
L'app dispose déjà d'un OnboardingFlow basique (3 étapes texte), une navigation 5 onglets, un DashboardHome avec actions rapides, et un WalletPage avec sous-onglets. L'interface est fonctionnelle mais reste technique (vocabulaire crypto, peu d'icônes visuelles, onboarding succinct).

## Requested Changes (Diff)

### Add
- Composant `OnboardingSimplified.tsx` : onboarding débutant en 3 étapes visuelles avec grandes icônes illustrées, texte simplifié, barre de progression animée, et un CTA clair par étape
- Étape 1 : "Créer mon porte-monnaie" (icône coffre-fort, explication simple non-custodial)
- Étape 2 : "Acheter ma première crypto" (icône pièce d'or, explication achat via Mobile Money)
- Étape 3 : "Échanger avec quelqu'un" (icône flèches échange, explication P2P en langage simple)
- Vocabulaire débutant : remplacer "wallet" → "porte-monnaie", "seed phrase" → "phrase secrète de récupération", "P2P" → "Échange entre personnes", "escrow" → "paiement sécurisé"
- Badges étapes avec numéro + icône + titre court en français simple

### Modify
- `OnboardingFlow.tsx` : refonte complète avec étapes visuelles grandes, icônes colorées, descriptions simplifiées, indicateurs de progression visuels
- `DashboardHome.tsx` : améliorer l'onboarding intégré avec numéros d'étape, icônes illustratives plus grandes, et barre de progression visuelle
- `WalletPage.tsx` : libellés des actions en langage simple ("Recevoir de l'argent", "Envoyer de l'argent", "Déposer", "Retirer")

### Remove
- Jargon technique superflu dans les descriptions d'onboarding

## Implementation Plan
1. Refondre `OnboardingFlow.tsx` : grandes cartes visuelles, icônes SVG/Lucide colorées, texte débutant, progression animée
2. Améliorer `DashboardHome.tsx` : onboarding en pleine carte avec numéros d'étapes en cercles colorés, descriptions simplifiées
3. Simplifier les libellés dans `WalletPage.tsx` actions
4. S'assurer que le vocabulaire est cohérent partout (porte-monnaie, phrase secrète, échange sécurisé)
