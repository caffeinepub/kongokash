# KongoKash — KYC Avancé

## Current State

Le KYC simple (nom + téléphone) est actif. La section "Vérification avancée" dans BanquesSection.tsx existe mais est désactivée avec badge "Bientôt disponible" et champs non-fonctionnels. Le backend `KycRecord` contient seulement `fullName`, `phone`, `status`, `submittedAt`, `reviewedAt`, `userId`.

## Requested Changes (Diff)

### Add
- Champs `idDocumentBase64 : Text` et `selfieBase64 : Text` dans le type `KycRecord` (Motoko)
- Paramètres optionnels `idDocument` et `selfie` dans `submitKyc`
- Upload de pièce d'identité (photo de carte nationale, passeport) — input file dans le frontend
- Capture selfie via caméra ou upload photo — input file dans le frontend
- Affichage des photos ID et selfie dans le Dashboard Admin (onglet Utilisateurs) pour review
- Indicateur visuel KYC "avancé" approuvé vs KYC simple dans le profil utilisateur

### Modify
- `submitKyc(fullName, phone)` → `submitKyc(fullName, phone, idDocumentBase64, selfieBase64)` avec champs optionnels (Text vide si non fourni)
- Section "Vérification avancée" dans BanquesSection.tsx : activer les champs (retirer opacity-50, cursor-not-allowed, badge "Bientôt disponible")
- `KycRecord` type dans backend.d.ts et declarations
- Formulaire KYC devient 2 niveaux : basique (nom + tel) suffit pour accès, avancé (ID + selfie) pour statut "vérifié avancé"

### Remove
- Badge "Bientôt disponible" sur la section KYC avancée
- `opacity-50 cursor-not-allowed` sur les champs ID et selfie

## Implementation Plan

1. Mettre à jour `KycRecord` dans main.mo pour inclure `idDocumentBase64` et `selfieBase64`
2. Mettre à jour `submitKyc` pour accepter 4 paramètres (2 existants + 2 nouveaux)
3. Régénérer/mettre à jour backend.d.ts avec les nouveaux types
4. Mettre à jour BanquesSection.tsx : activer les champs file upload pour ID et selfie, les rendre fonctionnels (FileReader → base64)
5. Mettre à jour AdminDashboard.tsx : afficher thumbnails des documents soumis dans la vue utilisateur KYC
