# KongoKash — Positionnement produit & confiance

## Current State
L'app est techniquement complète (P2P escrow, wallets non-custodials, réservations, Mobile Money, etc.) mais souffre d'un problème de perception :
- Le Hero est dense, mélange trop d'infos
- Le positionnement est flou : wallet ? exchange ? app ?
- La page About existe mais le message de sécurité/escrow n'est pas assez fort et immédiat
- Un visiteur ne comprend pas en 10 secondes ce que fait KongoKash

## Requested Changes (Diff)

### Add
- Nouvelle section dans le Hero : bloc "Ce que KongoKash est" avec 1 phrase simple + 3 piliers (P2P, Escrow, Mobile Money)
- Encart "En 10 secondes" dans le Hero (3 étapes ultra-simples : Crée → Envoie → Reçois)
- Page About améliorée : section "Sécurité expliquée simplement" avec analogie escrow (coffre-fort neutre), explication wallet non-custodial en langage non-technique
- Section "Ce que KongoKash N'EST PAS" pour lever les confusions (pas une banque, pas un exchange centralisé, pas un wallet custodial)
- Banner de positionnement sticky sur la homepage ("Réseau de paiement P2P pour l'Afrique")

### Modify
- HeroSection : H1 raccourci et plus direct, sous-titre repositionné sur le P2P africain, stats réorganisées
- AboutPage : hiérarchiser les infos, mettre l'explication escrow + wallet non-custodial en premier (avant la comparaison et les valeurs)
- Navbar (non-connecté) : mettre "À propos" plus en évidence

### Remove
- Rien de fonctionnel supprimé

## Implementation Plan
1. Réécrire HeroSection : H1 fort et court, section "En 3 étapes" visible au-dessus du fold, reformuler les stats
2. Améliorer AboutPage : section top "Ce que c'est / Ce que ce n'est pas", explication escrow avec métaphore simple (coffre neutre), wallet non-custodial en termes accessibles
3. Ajouter dans la section "Comment ça marche" une version ultra-simplifiée pour les non-techniques
4. Navbar non-connectée : rendre le lien "À propos" plus visible (bouton vs lien texte)
