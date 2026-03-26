# KongoKash — Passerelles de Retrait Partenaires

## Current State
Les partenaires (hôtels, parcs, musées, compagnies aériennes) reçoivent des paiements via l'escrow smart contract. Ils ont un espace partenaire dans le Dashboard avec un bouton "Retirer les fonds". Cependant, il n'existe pas de passerelles de conversion structurées (crypto → Mobile Money, crypto → CDF/USD).

## Requested Changes (Diff)

### Add
- Page/onglet "Passerelle de Retrait" dans l'Espace Partenaire
- 3 méthodes de retrait :
  1. Crypto → Airtel Money (avec numéro de téléphone)
  2. Crypto → M-Pesa (avec numéro de téléphone)
  3. Crypto → CDF ou USD (virement bancaire)
- Formulaire de retrait avec : sélection de l'actif (OKP, USDT, CDF, etc.), montant, méthode, numéro ou RIB
- Affichage en temps réel du taux de conversion + frais (max 0.5%)
- Statut de traitement : En attente → En cours → Complété / Échoué
- Historique des retraits partenaire
- Bannière "Option future : Intégration bancaire & carte" (teaser)
- Dashboard Admin : onglet "Retraits Partenaires" pour valider/rejeter les demandes

### Modify
- Bouton "Retirer les fonds" dans l'espace partenaire → redirige vers la nouvelle passerelle

### Remove
- Rien

## Implementation Plan
1. Ajouter un composant `WithdrawalGateway` dans l'espace partenaire
2. Formulaire : asset selector, montant, méthode (Airtel / M-Pesa / Bancaire), coordonnées
3. Calcul temps réel : montant converti en CDF/USD selon les taux actuels, frais 0.5% affichés
4. Soumission → statut "En attente" visible dans historique
5. Admin Dashboard → onglet "Retraits 💸" : liste des demandes avec boutons Approuver/Rejeter
6. Notification automatique au partenaire à chaque changement de statut
