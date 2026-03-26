# KongoKash

## Current State
- Backend `getInitialAllocations()` retourne 6 vieilles allocations (Communauté 40%, Équipe 20%, etc.) ne correspondant pas à la tokenomics finale
- Les 3 clarifications anti-Ponzi manquent dans l'interface

## Requested Changes (Diff)

### Add
- Section "Comment ça marche vraiment" dans le Livre Blanc (Whitepaper), expliquant la source des revenus
- Affichage de la source des récompenses OKP ("financé par l'allocation Communauté — 250M OKP") dans les sections récompenses et parrainage
- Reformuler les récompenses de parrainage pour souligner que c'est un bonus de bienvenue, pas un système pyramidal

### Modify
- Backend `getInitialAllocations()` : remplacer les 6 vieilles entrées par les 6 finales :
  - Communauté congolaise & récompenses : 25%, 250M
  - Fonds pour l'Innovation Numérique en RDC : 10%, 100M, locked, vesting 5 ans
  - Équipe & fondateurs : 15%, 150M, locked, vesting 4 ans
  - Investisseurs & partenariats : 20%, 200M, locked
  - Liquidité & marché : 20%, 200M
  - Réserve & développement : 10%, 100M

### Remove
- Rien à supprimer

## Implementation Plan
1. Corriger `getInitialAllocations()` dans `src/backend/main.mo`
2. Dans OkapiSection.tsx : ajouter section "Comment ça marche vraiment" dans le Livre Blanc
3. Dans OkapiSection.tsx : ajouter une note sur la source des récompenses dans les sections parrainage et récompenses
4. Dans ReferralSection.tsx : reformuler pour éviter toute connotation pyramidale
