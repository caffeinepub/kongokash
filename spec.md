# KongoKash

## Current State
L'app est entièrement fonctionnelle avec : authentification Internet Identity, token OKP, paiements mobiles (Airtel/M-Pesa) avec approbation manuelle par un admin unique, Dashboard Admin (5 onglets), KYC avancé, historique transactions, notifications, et système de parrainage.

Le système d'administration repose sur un seul admin — point de contrôle centralisé.
Les dépôts/retraits mobile money sont approuvés manuellement par cet admin.

## Requested Changes (Diff)

### Add
- **Multi-sig admin** : système de propositions et votes où les actions critiques (approuver/rejeter KYC, approuver/rejeter mobile money, modifier taux OKP, modifier récompenses) nécessitent l'approbation d'un seuil configurable d'admins (ex : 2/3). Chaque admin peut voter Pour/Contre. Quand le seuil est atteint, l'action s'exécute automatiquement.
- **Gestion des admins multi-sig** : liste des admins enregistrés, possibilité d'ajouter de nouveaux admins (requiert vote des admins existants), seuil de votes configurable (min 1, max = nombre d'admins).
- **HTTP outcalls pour vérification de paiements** : le canister backend peut appeler un endpoint externe configuré par l'admin pour vérifier automatiquement un paiement mobile money (Airtel/M-Pesa). Si l'API renvoie confirmation, le dépôt est approuvé automatiquement sans intervention humaine.
- **Nouvelles fonctions backend** :
  - `proposeAdminAction(actionType, targetPrincipal?, amount?, reason?)` → crée une proposition
  - `voteOnProposal(proposalId, vote: bool)` → vote d'un admin
  - `getProposals()` → liste des propositions en cours et passées
  - `addAdmin(principal)` → propose d'ajouter un admin (via vote)
  - `removeAdmin(principal)` → propose de retirer un admin (via vote)
  - `setMultiSigThreshold(n)` → modifier le seuil requis
  - `getAdminList()` → liste des admins actuels
  - `setPaymentVerificationUrl(url)` → configurer l'URL de vérification externe
  - `verifyAndAutoApproveMobilePayment(requestId)` → déclenche HTTP outcall de vérification

### Modify
- Les actions critiques dans `AdminDashboard.tsx` (approuver KYC, approuver mobile money, modifier taux OKP) passent maintenant par le système de propositions/votes quand plusieurs admins sont enregistrés. Quand il n'y a qu'un seul admin, les actions restent directes pour ne pas bloquer le fondateur.
- Nouvel onglet "Gouvernance" dans le Dashboard Admin avec : liste des admins, propositions en cours (avec boutons voter Pour/Contre), historique des propositions passées, formulaire pour ajouter un admin, champ pour configurer l'URL de vérification de paiement.

### Remove
- Rien à supprimer.

## Implementation Plan
1. Ajouter les types `Proposal`, `AdminVote`, `ProposalStatus` dans le backend Motoko
2. Implémenter `proposeAdminAction`, `voteOnProposal`, `getProposals`, `addAdmin`, `removeAdmin`, `setMultiSigThreshold`, `getAdminList`
3. Implémenter `setPaymentVerificationUrl` et `verifyAndAutoApproveMobilePayment` avec HTTP outcalls
4. Adapter `approveMobileMoneyRequest` et `approveKyc` pour passer par propositions quand multi-sig actif (>1 admin)
5. Frontend : ajouter onglet "Gouvernance" dans AdminDashboard avec UI de vote, liste admins, configuration HTTP outcall URL
6. Quand un seul admin existe, le comportement reste identique à avant (approbation directe)
