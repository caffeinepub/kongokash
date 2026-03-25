# KongoKash

## Current State

KongoKash est un dApp ICP avec un token natif Okapi (OKP) — supply fixe de 1 milliard. Tokenomics actuels : 40% Community, 20% Team (bloqué 2 ans), 15% Liquidity, 10% Investors, 10% Marketing, 5% Reserve. Le smart contract Motoko gère staking, burn, halvening, récompenses, multi-sig admin (3 admins requis pour actions critiques). Le Dashboard Admin a 5 onglets.

## Requested Changes (Diff)

### Add
- Nouvelle allocation tokenomics : **"Gouvernement / Fonds Public Congo"** = 10% du supply total (100,000,000 OKP)
- Smart contract de vesting gouvernemental :
  - 100M OKP verrouillés dans un contrat dédié (pas de wallet classique)
  - Déblocage progressif mensuel sur 60 mois (5 ans) = ~1,666,667 OKP/mois
  - Multi-signature 3-of-3 : (1) entité publique [Banque Centrale / Ministère], (2) auditeur indépendant, (3) équipe projet
  - Chaque retrait mensuel nécessite 3 signatures
  - Toutes les transactions publiques et traçables on-chain
- Module de gouvernance DAO :
  - Les détenteurs OKP peuvent soumettre des propositions d'utilisation des fonds
  - Vote communautaire (pondéré par les tokens détenus)
  - Seuil d'approbation : 51% des votants avec quorum minimum de 10% du supply en circulation
  - Propositions approuvées soumises ensuite aux 3 signataires pour exécution
- Nouveau tab "Gouvernance" dans la section Okapi de l'app :
  - Vue de l'allocation gouvernementale (montant total, libéré, restant, prochaine tranche)
  - Liste des propositions DAO actives et passées
  - Interface de vote pour les détenteurs OKP
  - Interface de soumission de proposition
  - Interface multi-sig pour les 3 signataires (approuver/rejeter un retrait)
- Mise à jour du whitepaper Okapi : ajouter section "Allocation Publique Congolaise"
- Mise à jour de la vue statistiques tokenomics pour inclure la nouvelle allocation

### Modify
- Tokenomics totaux : redistribuer 10% depuis "Community" (40% → 30%) pour créer l'allocation Gouvernement, ou réduire proportionnellement d'autres catégories selon choix du fondateur. **Choix : réduire Community de 40% à 30%, ajouter Gouvernement 10%.**
- Backend Motoko : ajouter les fonctions `getGovVestingStatus`, `submitGovProposal`, `voteOnProposal`, `signGovWithdrawal`, `executeGovWithdrawal`
- AdminDashboard : ajouter visibilité sur les signataires enregistrés et leur statut
- OkapiSection : ajouter onglet "Gouvernance"

### Remove
- Rien à supprimer

## Implementation Plan

1. **Backend Motoko** :
   - Ajouter type `GovSignerRole` : `#PublicEntity | #IndependentAuditor | #ProjectTeam`
   - Ajouter type `GovWithdrawalRequest` avec champs : id, month, amount, signers (liste), status
   - Ajouter type `GovProposal` avec champs : id, proposer, title, description, votesFor, votesAgainst, voters, status, createdAt
   - State : `govSigners : [(Principal, GovSignerRole)]`, `govVestingStart : Int`, `govTotalReleased : Nat`, `govWithdrawalRequests`, `govProposals`
   - Fonctions : `registerGovSigner`, `getGovVestingStatus`, `createGovWithdrawalRequest`, `signGovWithdrawal`, `executeGovWithdrawal`, `submitGovProposal`, `voteOnProposal`, `getGovProposals`
   - Vesting : libération mensuelle calculée depuis `govVestingStart`, max 60 mois

2. **Frontend** :
   - Nouveau composant `GovernanceSection.tsx` avec 4 sous-onglets :
     - "Vesting" : progress bar, tranche mensuelle, historique des retraits
     - "Propositions" : liste des propositions DAO, bouton voter
     - "Voter" : formulaire de vote avec poids OKP
     - "Multi-sig" : visible uniquement pour les signataires enregistrés
   - Mettre à jour `OkapiSection.tsx` pour ajouter l'onglet Gouvernance
   - Mettre à jour les stats tokenomics (7 allocations au lieu de 6)
