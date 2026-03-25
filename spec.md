# KongoKash — Notifications Transactions & Récompenses

## Current State
- App KongoKash avec historique des transactions dans `TransactionHistory.tsx`
- Navbar sans système de notifications
- Backend expose `getTransactions()` (liste des transactions de l'utilisateur connecté)
- Toast (sonner) déjà présent dans App.tsx via `<Toaster richColors position="top-right" />`
- Pas de système de notifications in-app

## Requested Changes (Diff)

### Add
- `NotificationCenter` component : icône cloche dans la Navbar (desktop + mobile) avec badge rouge indiquant le nombre de notifications non lues
- Dropdown de notifications affichant les 10 dernières transactions/récompenses avec : icône, type (Achat BTC, Récompense OKP, Dépôt CDF...), montant, date, statut
- Hook `useNotifications` : poll `getTransactions()` toutes les 30s quand l'utilisateur est connecté, détecte les nouvelles transactions par rapport à un timestamp stocké en localStorage (`kongokash_last_seen_ts`), déclenche des toasts automatiques pour chaque nouvelle transaction ou récompense
- Toast automatique pour : nouvelle transaction confirmée ("Achat BTC confirmé"), nouvelle récompense OKP reçue ("Récompense : +25 OKP"), unstaking disponible
- Bouton "Tout marquer comme lu" dans le dropdown pour mettre à jour `kongokash_last_seen_ts`

### Modify
- `Navbar.tsx` : ajouter le composant `NotificationCenter` à droite des liens de navigation (desktop) et dans le menu mobile, uniquement si l'utilisateur est connecté

### Remove
- Rien

## Implementation Plan
1. Créer `src/frontend/src/hooks/useNotifications.ts` : poll getTransactions, comparer timestamps, retourner `unreadCount`, `notifications[]`, `markAllRead()`
2. Créer `src/frontend/src/components/NotificationCenter.tsx` : cloche avec badge, Popover/dropdown avec liste des notifications récentes, bouton marquer comme lu
3. Modifier `Navbar.tsx` pour intégrer `NotificationCenter` quand `identity` est défini
4. Toasts automatiques déclenchés depuis le hook via `toast()` de sonner pour les nouvelles entrées
