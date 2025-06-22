# Forestar Installer

Application frontend Next.js pour les installateurs de robots Forestar. Cette application permet de gérer la signature des bons de fin d'installation, de lister les éléments installés ou manquants, et d'envoyer automatiquement une copie au client.

## ✨ Fonctionnalités

- **Sélection des commandes** : Interface pour choisir la commande à installer
- **Formulaire d'installation** : Checklist complète des équipements
- **Signature électronique** : Capture de signature optimisée pour iPad
- **Génération PDF** : Création automatique du bon d'installation
- **Envoi email** : Transmission automatique au client (mocké)
- **Interface responsive** : Optimisée pour l'utilisation sur tablette iPad

## 🛠️ Stack Technique

- **Framework** : Next.js 15+ avec App Router et TypeScript
- **Styling** : Tailwind CSS v4
- **Formulaires** : React Hook Form avec validation Zod
- **Authentication** : NextAuth.js (préparé)
- **Base de données** : Prisma ORM (préparé)
- **PDF** : react-pdf / pdf-lib (mocké)
- **Signature** : signature_pad avec canvas

## 🚀 Installation et Développement

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## 📁 Structure du Projet

```
src/
├── app/                    # Pages App Router
│   ├── install/[id]/      # Page d'installation dynamique
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── forms/            # Composants de formulaires
│   └── signature/        # Composant de signature
├── lib/                  # Utilitaires et configurations
├── types/                # Définitions TypeScript
└── mocks/                # Données de test
```

## 🎯 Utilisation

### 1. Sélection d'une commande

- Visualisation des commandes en attente d'installation
- Informations client et équipement détaillées
- Sélection par clic/tap

### 2. Processus d'installation

- Checklist interactive des équipements
- Zones de notes et commentaires
- Capture de signature client
- Validation finale

### 3. Finalisation

- Génération automatique du PDF
- Envoi par email au client
- Message de confirmation d'installation

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec :

```env
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="your-database-url"
```

### Base de données

Le projet est configuré pour Prisma. Pour initialiser :

```bash
npx prisma generate
npx prisma db push
```

## 📱 Optimisation iPad

L'interface est spécialement optimisée pour l'utilisation terrain sur iPad :

- Boutons et zones tactiles agrandis
- Signature électronique fluide
- Navigation tactile intuitive
- Interface claire et professionnelle

## 🎨 Design System

- **Couleurs principales** : Bleu Forestar, verts et orange pour les statuts
- **Typographie** : System fonts pour la lisibilité
- **Espacement** : Généreux pour le tactile
- **Responsive** : Mobile-first avec focus iPad

## 🧪 Données de Test

Le projet inclut des données mockées dans `/src/mocks/data.ts` :

- 3 commandes d'exemple
- Inventaire de robots et accessoires
- Informations clients complètes

## 🚧 Fonctionnalités à Implémenter

- [ ] Authentification NextAuth.js
- [ ] Base de données Prisma
- [ ] Génération PDF réelle
- [ ] Envoi email SMTP
- [ ] Upload de photos
- [ ] Mode hors ligne
- [ ] Synchronisation automatique

## 📄 Licence

Propriété de Forestar - Usage interne uniquement
