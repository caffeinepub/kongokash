# KongoKash

## Current State
Partenaires (hôtels, parcs, musées) ont chacun un wallet non-custodial avec une seule personne responsable. Si cette personne décède, les fonds sont inaccessibles car personne d'autre ne possède la seed phrase.

## Requested Changes (Diff)

### Add
- Système multi-signatures institutionnel (M/N signataires)
- Assistant de configuration des signataires lors de l'activation du wallet
- Panneau de succession avec processus en 5 étapes
- Approbation de transactions par plusieurs signataires
- Onglet "Urgences 🆘" dans le dashboard admin

### Modify
- Flux d'activation du wallet partenaire : ajout étape "Signataires Institutionnels"

### Remove
- Rien

## Implementation Plan
- MultiSigSetupWizard : choix M/N + enregistrement signataires
- SuccessionPanel : statuts, vote de confirmation, nomination remplaçant, validation admin
- TransactionApprovalPanel : barre de progression des approbations
- UrgencesInstitutionnellesTab dans AdminDashboard
