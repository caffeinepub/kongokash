# KongoKash — Retraits Externes Automatisés

## Current State
Tous les retraits Mobile Money (Airtel/M-Pesa) sont soumis manuellement par les utilisateurs et nécessitent une validation admin avant traitement. Le composant `http-outcalls` est déjà sélectionné. La fonction `submitMobileMoneyWithdrawal` crée un enregistrement avec statut `pending`, puis l'admin approuve via `approveMobileMoneyRequest`.

## Requested Changes (Diff)

### Add
- Seuil d'automatisation configurable par l'admin (défaut : 50 000 CDF)
- Fonction backend `processAutoWithdrawal` qui simule un HTTP outcall vers l'API Airtel/M-Pesa
- Logique : si montant < seuil → traitement automatique immédiat (statut `auto_approved`), sinon → statut `pending_manual` pour validation admin
- Indicateur visuel côté utilisateur : badge "Traitement automatique" ou "Validation requise"
- Section admin pour configurer le seuil et voir les statistiques auto vs manuel

### Modify
- `submitMobileMoneyWithdrawal` : appliquer la logique auto/manuel selon le seuil
- `WithdrawalGateway.tsx` : afficher la distinction auto/manuel selon le montant saisi
- `AdminDashboard.tsx` : ajouter configuration du seuil + colonne statut enrichie

### Remove
- Rien

## Implementation Plan
1. Ajouter `autoWithdrawalThreshold` dans le state du backend (variable configurable)
2. Ajouter `setAutoWithdrawalThreshold` (admin only)
3. Ajouter `getAutoWithdrawalThreshold` (public query)
4. Modifier `submitMobileMoneyWithdrawal` pour détecter le seuil et appliquer auto-traitement
5. Ajouter `processAutoWithdrawal` avec HTTP outcall simulé vers API Mobile Money
6. Mettre à jour `WithdrawalGateway.tsx` : afficher badge auto/manuel en temps réel
7. Mettre à jour `AdminDashboard.tsx` : section seuil configurable + stats
