# KongoKash — Super-App Phase 2

## Current State
- ReservationsSection.tsx: hotels, parcs, vols avec paiement OKP/CDF, codes uniques, tickets numériques
- Dashboard.tsx: onglet 'Réservations 🎫' existant (liste et annulation)
- NotificationCenter.tsx: système de notifications existant (basique)
- AdminDashboard.tsx: onglets Partenaires et Billets pour gestion admin
- Pas de système de validation anti-fraude des réservations
- Pas de support client intégré
- Notifications pas liées aux événements de réservation

## Requested Changes (Diff)

### Add
- **Validation anti-fraude** : statuts de réservation (En attente → Confirmée → Annulée/Remboursée), QR code de vérification, token de validation unique par réservation, délai de paiement (30 min), limite de réservations par utilisateur/jour
- **Historique complet dans Dashboard** : filtres par statut/type/date, détail de chaque réservation avec badge statut coloré, montant, date, établissement
- **Notifications liées aux réservations** : notification automatique à la création (confirmation en attente), à la confirmation admin (réservation confirmée), au paiement (reçu de paiement), à l'annulation (remboursement en cours). Toasts temps réel + centre de notifications
- **Support client minimum** : bouton "Contacter le support" dans Dashboard, formulaire de demande (sujet + message), liste des demandes avec statut (Ouvert/En cours/Résolu), admin peut répondre et fermer les tickets dans AdminDashboard

### Modify
- ReservationsSection.tsx : ajouter logique de validation (état pending, confirmation requise, limites anti-fraude)
- Dashboard.tsx : enrichir l'onglet Réservations avec historique filtrable et statuts
- NotificationCenter.tsx : brancher les événements de réservation sur les notifications
- AdminDashboard.tsx : ajouter onglet Support pour gérer les tickets clients

### Remove
- Rien à supprimer

## Implementation Plan
1. Enrichir le state des réservations avec statuts, tokens de validation, timestamps
2. Ajouter logique anti-fraude : délai paiement 30 min, limite 5 réservations/jour/utilisateur, validation unique par code
3. Créer composant SupportSection.tsx (formulaire ticket + liste tickets utilisateur)
4. Mettre à jour Dashboard.tsx : historique réservations filtrable + onglet Support
5. Mettre à jour NotificationCenter.tsx : notifications auto pour événements réservation
6. Mettre à jour AdminDashboard.tsx : onglet Support pour répondre aux tickets
7. Valider build
