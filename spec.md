# KongoKash

## Current State
La page d'accueil (non-connecté) affiche :
- HeroSection : headline P2P africain, 3 étapes, CTA "Commencer maintenant" + "Comment ça marche"
- TrustSection : 3 cartes (non-custodial, escrow coffre-fort, ICP), barre de garantie
- EscrowExplainer : 4 étapes compactes (Payer → Bloqués → Confirmé → Libérés) avec callout litige
- VisionSection : 3 piliers de philosophie KongoKash

## Requested Changes (Diff)

### Add
- Nouveau composant `P2PFlowDiagram` : schéma visuel animé du flux P2P complet (vendeur dépose → escrow verrouille → acheteur paie → preuve → libération ou arbitrage) - l'effet "wow"
- Dans TrustSection : bloc visuel proéminent "Vos fonds sont 100% sous votre contrôle" + "KongoKash ne peut pas accéder à votre argent" + mention claire arbitrage en cas de litige
- Dans EscrowExplainer : icônes plus grandes et distinctes par étape (dépôt → blocage → paiement → libération), titre renforcé "Comment vos transactions sont protégées"
- Dans HeroSection : bouton primaire "Créer mon wallet" + bouton secondaire "Commencer gratuitement"
- Tooltips/badges d'explication simplifiée (ex : "crypto = intermédiaire de sécurité neutre")

### Modify
- HeroSection CTA : remplacer "Commencer maintenant" par "Créer mon wallet" et "Comment ça marche" par "Commencer gratuitement"
- TrustSection : rendre les messages de confiance plus forts et plus visibles (plus grande police, couleur proéminente)
- EscrowExplainer : nouveau titre "Comment vos transactions sont protégées", icônes plus grandes, étapes plus larges
- Ajouter petites explications pour débutants dans les sections clés

### Remove
- Rien supprimé

## Implementation Plan
1. Modifier HeroSection.tsx : CTA "Créer mon wallet" (primaire) + "Commencer gratuitement" (secondaire), ajouter une ligne explicative simplifiée
2. Modifier TrustSection.tsx : ajouter un bloc hero en haut avec les messages forts (100% contrôle, KongoKash ne peut pas accéder, arbitrage), renforcer visuellement
3. Modifier EscrowExplainer.tsx : nouveau titre, icônes plus grandes, étapes redessinées avec meilleur impact visuel
4. Créer P2PFlowDiagram.tsx : diagramme animé SVG/CSS du flux P2P complet (effet wow)
5. Intégrer P2PFlowDiagram dans App.tsx après EscrowExplainer
6. Ajouter des explications simplifiées pour débutants dans TrustSection et EscrowExplainer
