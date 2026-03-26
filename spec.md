# KongoKash — Wallet Non-Custodial

## Current State
App KongoKash complète avec authentification via Internet Identity, dashboard, échange, mobile money, KYC, gouvernance, vesting. Aucun système de wallet non-custodial n'existe actuellement.

## Requested Changes (Diff)

### Add
- Composant `NonCustodialWallet.tsx` : système complet de wallet non-custodial entièrement côté client
  - **Génération seed phrase** : 12 ou 24 mots depuis la wordlist BIP39 (wordlist EN intégrée), générés via `crypto.getRandomValues()`
  - **Flux de création** : étape 1 — afficher la seed phrase + choix 12/24 mots ; étape 2 — confirmer en sélectionnant les mots dans le bon ordre ; étape 3 — wallet créé
  - **Dérivation de clé** : utiliser Web Crypto API (PBKDF2) pour dériver une clé AES-GCM depuis la seed phrase + sel aléatoire
  - **Chiffrement** : clé privée chiffrée avec AES-GCM, stockée dans localStorage (jamais en clair)
  - **Authentification biométrique** : WebAuthn API (navigator.credentials) pour empreinte digitale / reconnaissance faciale — utilisé comme couche de déverrouillage rapide
  - **Restauration** : formulaire pour entrer une seed phrase existante (12 ou 24 mots) et restaurer le wallet sur un autre appareil
  - **Affichage wallet** : adresse publique dérivée, solde simulé, boutons Envoyer/Recevoir
- Hook `useNonCustodialWallet.ts` : toute la logique crypto (génération, chiffrement, déchiffrement, WebAuthn enrollment/assertion)
- Wordlist BIP39 intégrée inline (2048 mots anglais) dans un fichier `bip39-wordlist.ts`
- Intégration dans la navigation : onglet "Wallet Sécurisé" ou bouton dédié visible après connexion

### Modify
- `App.tsx` ou `Dashboard.tsx` : ajouter un point d'entrée vers le wallet non-custodial
- `Navbar.tsx` : ajouter accès au wallet sécurisé si nécessaire

### Remove
- Rien

## Implementation Plan
1. Créer `src/frontend/src/data/bip39-wordlist.ts` avec les 2048 mots BIP39
2. Créer `src/frontend/src/hooks/useNonCustodialWallet.ts` avec :
   - `generateSeedPhrase(length: 12 | 24)` via crypto.getRandomValues + wordlist
   - `deriveKeyFromSeed(seed: string[], salt: Uint8Array)` via PBKDF2
   - `encryptAndStore(privateKey, derivedKey, salt)` via AES-GCM → localStorage
   - `decryptFromStorage(derivedKey)` → clé privée
   - `enrollBiometric()` via WebAuthn navigator.credentials.create()
   - `authenticateBiometric()` via WebAuthn navigator.credentials.get()
   - `restoreFromSeed(words: string[])` → reconstruire le wallet
3. Créer `src/frontend/src/components/NonCustodialWallet.tsx` avec les 4 états :
   - `no-wallet` : choix Créer / Restaurer
   - `create-step1` : affichage seed phrase + copie + avertissement
   - `create-step2` : confirmation des mots (quiz ordre)
   - `wallet-locked` : déverrouillage biométrique
   - `wallet-unlocked` : vue principale (adresse, solde, actions)
   - `restore` : formulaire saisie seed phrase
4. Intégrer dans `Dashboard.tsx` comme nouvel onglet "Wallet Sécurisé"
5. Valider et builder

**Contraintes techniques :**
- ZERO appel backend — tout reste dans le navigateur
- Seed phrase et clé privée ne quittent jamais le localStorage chiffré
- WebAuthn est progressif : si non supporté, fallback sur confirmation PIN local
- Aucun accès admin possible par conception
