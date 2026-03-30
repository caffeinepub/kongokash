# KongoKash

## Current State
Le module P2P existe avec escrow, machine d'état stricte, preuve de paiement, vérification hybride, système de litige, anti-fraude, journalisation complète et Mobile Money. Il n'y a aucun moyen pour l'acheteur et le vendeur de communiquer directement dans une transaction.

## Requested Changes (Diff)

### Add
- Composant `P2PChat` : interface de chat intégrée dans chaque transaction P2P active
- Messages horodatés avec identité de l'expéditeur (Acheteur / Vendeur / Système)
- Chaque message est loggué dans le journal d'audit P2P existant (`p2pAuditLog.ts`) avec action `MESSAGE_ENVOYÉ`
- Stockage des messages en mémoire par trade ID (Map locale)
- Indicateur de nouveaux messages (badge) sur chaque trade actif
- Messages système automatiques aux étapes clés (trade accepté, paiement déclaré, litige ouvert)
- Côté admin : messages visibles dans le détail d'un trade litigieux

### Modify
- Section P2P : ajouter un bouton/onglet "💬 Chat" sur chaque trade actif (états : PAIEMENT_EN_ATTENTE, PAIEMENT_DÉCLARÉ, EN_VÉRIFICATION, LITIGE)
- Journal d'audit : afficher les messages du chat dans la timeline
- Admin P2P litiges : afficher la conversation complète lors de l'arbitrage

### Remove
- Rien

## Implementation Plan
1. Créer un module `p2pChat.ts` : structure de données des messages, stockage par trade, fonctions send/get/clear
2. Intégrer les messages système automatiques aux transitions d'état P2P existantes
3. Créer le composant `P2PChat.tsx` : bulles de chat, champ de saisie, scroll automatique, distinction visuel acheteur/vendeur/système
4. Injecter `P2PChat` dans la vue de chaque trade actif dans le composant P2P principal
5. Logger chaque message envoyé dans `p2pAuditLog.ts`
6. Afficher les messages dans l'onglet Admin Litiges pour faciliter l'arbitrage
