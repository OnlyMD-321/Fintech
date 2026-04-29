# MyLegal Fintech Platform

**MyLegal Fintech** est une plateforme bancaire B2B moderne conçue pour les entreprises opérant au Maroc (CFC). Elle permet la gestion multi-cartes, les virements instantanés, la facturation automatisée et la gestion de la mutuelle santé des collaborateurs, le tout avec une génération de documents officiels en temps réel.

## Fonctionnalités Clés

* **Tableau de Bord Dynamique** : Visualisation du solde global synchronisé avec les soldes des cartes en temps réel.
* **Gestion de Cartes** : Création de cartes virtuelles (Visa/Mastercard/Amex) avec allocation de fonds depuis le solde principal.
* **Virements Rapides** : Système de transfert immédiat via numpad avec gestion des bénéficiaires favoris.
* **Gestion de Facturation** : 
    * Dashboard de suivi (À encaisser / À payer).
    * Création de factures avec calcul automatique de TVA.
    * Génération de fichiers HTML/PDF dynamiques avec données réelles.
* **Assurances Santé (Mutuelle)** : Dashboard RH complet permettant d'affilier des employés et de gérer les suspensions/activations de couverture.
* **Centre de Documents** : Génération instantanée de RIB, Attestations de titularité et Relevés avec logo officiel et mentions légales conformes (Tour CFC).

---

## Architecture du Projet

```text

│   .gitignore
│   next-env.d.ts
│   next.config.mjs
│   package.json
│   tailwind.config.ts
│   tsconfig.json
├── app/
│   ├── globals.css         # Styles globaux et variables CSS
│   ├── layout.tsx          # Layout racine Next.js
│   ├── page.tsx            # Point d'entrée de l'application
│   └── assets/logos/       # Identité visuelle (logo-light.png / logo-dark.png)
├── components/
│   ├── Layout.tsx          # Wrapper principal (Sidebar Desktop / Navigation Mobile)
│   ├── screens/            # Modules de pages (écrans)
│   │   ├── dashboard-screen.tsx    # Accueil & Cartes
│   │   ├── documents-screen.tsx    # Gestion documentaire
│   │   ├── insurance-screen.tsx    # Dashboard Assurances
│   │   ├── invoice-screen.tsx      # Dashboard & Création Factures
│   │   ├── login-screen.tsx        # Authentification
│   │   ├── profile-screen.tsx      # Gestion du compte
│   │   └── transfer-screen.tsx     # Virements classiques
│   └── ui/                 # Composants d'interface (Shadcn/Custom)
│       ├── network-logos.tsx       # Logos SVG (Visa, MC, Amex)
│       ├── toast-stack.tsx         # Système de notifications
│       └── ...                     # Inputs, Buttons, Cards, DatePickers
├── lib/
│   ├── utils.ts            # Utilitaires CSS (cn merge)
│   └── use-local-storage-state.ts
├── services/
│   ├── mock-api.ts         # Simulation d'appels API (Promise based)
│   └── mock-data.ts        # Base de données fictive et types TypeScript
└── store/
    └── app-store.ts        # État global Zustand avec persistance LocalStorage
```
## Stack Technique

* **Framework** : [Next.js 14](https://nextjs.org/) (App Router)
* **Langage** : [TypeScript](https://www.typescriptlang.org/)
* **Style** : [Tailwind CSS](https://tailwindcss.com/)
* **Animations** : [Framer Motion](https://www.framer.com/motion/)
* **Gestion d'état** : [Zustand](https://docs.pmnd.rs/zustand/) (Store persistant)
* **Icônes** : [Lucide React](https://lucide.dev/)

## Installation et Développement

1.  **Installation des dépendances** : Utilisez votre gestionnaire de paquets pour installer les modules nécessaires.

```Bash
    npm install
```

2.  **Lancer le serveur de développement** : Démarrez l'environnement local.

```Bash
    npm run dev
```

3.  **Accès** : Ouvrez http://localhost:3000 dans votre navigateur.

## Logique Métier & Déploiement PRO

### 1. Source de Vérité Bancaire
Le système utilise une logique de calcul ascendante. Le `availableBalance` n'est pas une valeur stockée statiquement, mais une somme calculée dynamiquement à partir de tous les soldes des cartes individuelles. Toute transaction débitrice sur une carte met à jour instantanément le solde global pour garantir l'intégrité des données.

### 2. Génération de Documents (PDF/HTML)
Le projet utilise des **Blobs HTML** pour générer les documents. En production, cette logique est conçue pour être remplacée par un service de génération PDF côté serveur (ex: Puppeteer) ou une librairie client spécialisée comme `jspdf` pour une compatibilité accrue.

### 3. Build & Production
L'application est optimisée pour un déploiement sur **Vercel** ou tout serveur Node.js moderne après compilation des ressources statiques et optimisation du bundle.

```Bash
    npm run build
```

## Mentions Légales (Officielles)

Les documents générés par la plateforme (RIB, Attestations, Factures) intègrent automatiquement les coordonnées officielles de la structure :

* **Dénomination** : MYLEGAL SARLAU
* **Siège Social** : Oasis Offices Latitudes, Route de l’Oasis, Bureau 304, Maarif, Casablanca, Maroc.
* **Capital Social** : 100.000 MAD.
* **R.C.** : 627571 (Casablanca).
* **ICE** : 003521475000060.

---
*Ce projet est la propriété exclusive de MYLEGAL SARLAU.*