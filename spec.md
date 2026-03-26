# KongoKash — UX Simple pour Partenaires

## Current State
Dashboard utilisateur avec onglets : Wallet Sécurisé, Réservations, Tickets, Support, Notifications.
NotificationCenter existe avec notifications localStorage.
Escrow system en place avec statuts de réservations.
Aucune vue dédiée pour partenaires (hôtels, parcs) : vue simple paiements reçus + réservations + retrait.

## Requested Changes (Diff)

### Add
- PartnerDashboard.tsx : interface simple non-custodial pour partenaires
  - Onglet "Réservations" : liste des réservations reçues (client, dates, montant, statut)
  - Onglet "Paiements" : historique des paiements reçus depuis l'escrow (libération de fonds)
  - Bouton "Retirer" proéminent : déclenche un retrait vers adresse externe du wallet partenaire
  - Onglet "Notifications" : Paiement reçu, Réservation confirmée, Libération des fonds — avec badges
- Intégrer PartnerDashboard dans App.tsx ou Dashboard.tsx pour les utilisateurs avec rôle partenaire
- Améliorer NotificationCenter : ajouter types spécifiques (paiement_recu, reservation_confirmee, liberation_fonds)

### Modify
- Dashboard.tsx : détecter le rôle partenaire et afficher PartnerDashboard à la place de la vue standard, ou ajouter un onglet "Espace Partenaire"
- NotificationCenter/useReservationNotifications : ajouter les 3 types de notifications partenaires

### Remove
- Rien

## Implementation Plan
1. Créer PartnerDashboard.tsx avec 3 onglets simples : Réservations, Paiements, Notifications
2. Données simulées réalistes (réservations reçues, paiements libérés par escrow)
3. Bouton "Retirer" avec modal simple (adresse de destination, montant)
4. Notifications avec badges colorés pour chaque type d'événement
5. Intégrer dans Dashboard.tsx comme nouvel onglet "Espace Partenaire 🏢"
