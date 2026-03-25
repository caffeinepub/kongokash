# KongoKash — Vesting Équipe On-Chain

## Current State

Le backend Motoko (main.mo, ~1967 lignes) gère le token OKP avec staking, rewards, burn, halvening, KYC, mobile money, multi-sig admin. L'allocation Équipe (20% = 200M OKP) est présente dans `getInitialAllocations()` avec le badge `locked = true` mais sans logique de vesting réelle sur la blockchain.

## Requested Changes (Diff)

### Add
- Variables d'état pour le vesting Équipe : `vestingStartTime`, `vestingTotalAmount`, `vestingClaimedAmount`
- Constantes : VESTING_TOTAL = 200_000_000, CLIFF_MONTHS = 12, VESTING_MONTHS = 48
- Fonction `initTeamVesting(beneficiary: Principal)` — appelable une seule fois par l'admin pour démarrer l'horloge du vesting
- Fonction `getTeamVestingStatus()` — query publique retournant : montant total, montant réclamé, montant disponible, montant encore verrouillé, temps restant au cliff, prochaine libération mensuelle
- Fonction `claimTeamVesting()` — callable uniquement par le bénéficiaire désigné, libère uniquement la portion disponible (post-cliff, mensuelle progressive)
- Type `TeamVestingStatus` dans backend.d.ts

### Modify
- `getInitialAllocations()` : mettre à jour la description de l'allocation Équipe pour refléter "Vesting 4 ans, cliff 12 mois"
- `getOkpStats()` : inclure le montant Équipe toujours verrouillé dans le calcul des tokens bloqués

### Remove
- Rien à supprimer

## Implementation Plan

1. Ajouter les variables d'état vesting dans l'acteur (vestingStartTime, vestingBeneficiary, vestingClaimedAmount, vestingInitialized)
2. Implémenter la logique de calcul : tokens disponibles = max(0, (moisDepuisCliff * montantMensuel) - déjà réclamé)
3. Ajouter les 3 fonctions publiques : initTeamVesting, getTeamVestingStatus, claimTeamVesting
4. Mettre à jour les stats OKP pour refléter les tokens toujours verrouillés
5. Régénérer backend.d.ts avec les nouveaux types
6. Ajouter un onglet/section "Vesting Équipe" dans la page Okapi du frontend avec l'état en temps réel
