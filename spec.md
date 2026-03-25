# KongoKash

## Current State
L'application dispose d'une section Okapi avec des allocations de tokens (7 catégories dont certaines ont des valeurs incorrectes : Communauté 30%/300M, Équipe 20%/200M vesting 2 ans, Liquidité 15%/150M, Investisseurs 10%/100M, Marketing 10%/100M, Réserve 5%/50M, Fonds RDC 10%/100M). Le livre blanc a 8 sections mais manque les sections sur la nature du token, l'inclusion des étrangers/touristes, et la philosophie "Bitcoin pour le Congo".

## Requested Changes (Diff)

### Add
- Section dans le livre blanc : Nature du token (libre, fluctuant, non stablecoin, non collatéralisé, 1 milliard OKP, décentralisation via DAO)
- Section dans le livre blanc : Inclusion des étrangers/touristes (achat OKAPI sans francs congolais, échange OKAPI → CDF ou paiement direct)
- Section dans le livre blanc : Philosophie "Bitcoin pour le Congo" (rareté + décentralisation, inclusion, transparence DAO)

### Modify
- OKAPI_ALLOCATIONS : 6 catégories finales :
  1. Communauté congolaise & récompenses : 25% / 250 000 000 OKP
  2. Fonds public – RDC (Innovation Numérique) : 10% / 100 000 000 OKP
  3. Équipe & fondateurs : 15% / 150 000 000 OKP (vesting 4 ans, cliff 12 mois)
  4. Investisseurs & partenariats : 20% / 200 000 000 OKP (vesting 2–3 ans)
  5. Liquidité & marché : 20% / 200 000 000 OKP (DEX/CEX, market making)
  6. Réserve & développement : 10% / 100 000 000 OKP
- Badge vesting Équipe : "Bloqué 4 ans" au lieu de "Bloqué 2 ans"
- Description vesting Équipe dans le livre blanc : "150 000 000 OKP (15% de la supply)... 4 ans, cliff 12 mois, libération mensuelle"
- Descriptions des catégories dans les légendes
- Mettre à jour la section Investisseurs : "vesting 2–3 ans, libération progressive"

### Remove
- Catégorie "Marketing" (10%/100M) — fusionnée dans Communauté
- Catégorie "Réserve" ancienne (5%/50M) — remplacée par Réserve & développement 10%/100M

## Implementation Plan
1. Mettre à jour OKAPI_ALLOCATIONS avec les 6 nouvelles catégories et montants corrects
2. Mettre à jour le badge "Bloqué" pour l'équipe (4 ans au lieu de 2 ans)
3. Mettre à jour la section vesting Équipe dans le livre blanc (150M, 4 ans)
4. Ajouter 3 nouvelles sections dans le livre blanc : Nature du token, Inclusion étrangers, Philosophie Bitcoin pour le Congo
5. Valider build
