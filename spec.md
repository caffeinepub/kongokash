# KongoKash

## Current State
The GovernanceSection has a MultiSigTab that displays 3 mock signers (with hardcoded names: Banque Centrale du Congo, Ernst & Young, KongoKash Core Team). There is no mechanism to replace a signer, and signers are tied to individual names rather than institutional roles.

## Requested Changes (Diff)

### Add
- Role-based signer architecture: each slot has a ROLE (Entité Publique, Auditeur Indépendant, Équipe Projet) that persists regardless of who currently fills it
- "Titulaire actuel" field per role (replaceable), separate from the role label
- Signer replacement proposal system: any signer can initiate a request to replace the current holder of a role with a new entity
- Replacement approval flow: the other 2 signers must validate the replacement before it takes effect
- Visual state for pending replacement proposals (showing approvals count, who approved)
- Transition log: show history of past replacements in the Transparency tab

### Modify
- MultiSigTab: restructure signer cards to clearly show ROLE vs current holder, add "Proposer un remplacement" button per signer slot
- Governance rules: add a rule about role-based continuity and replacement process
- Mock signers data: separate role identity from current titulaire

### Remove
- Nothing removed, only enhanced

## Implementation Plan
1. Restructure mock signer data to have: role, roleIcon, roleLabel, currentHolder (name + principal), and replacement requests
2. Add local state for replacement proposals (id, targetRole, proposedHolder, proposedPrincipal, approvals, status)
3. In MultiSigTab: redesign signer cards to emphasize role continuity with a "Proposer un remplacement" dialog per slot
4. Add a ReplacementProposals section within MultiSigTab showing pending proposals with approve buttons
5. Add replacement history entries to the Transparency timeline
6. Update governance rules to mention role-based continuity
