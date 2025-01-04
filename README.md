# **FlightX**

FlightX est un projet éducatif conçu pour explorer et comprendre le développement de **smart contracts** en Solidity, les concepts de **Web3**, et l'interaction entre blockchain et applications décentralisées. Ce projet est axé sur la gamification avec un thème d'aviation.

---

## **Objectifs du projet**
- Apprendre les bases de **Solidity** et les concepts avancés comme les mappings, les structures, et les interactions entre contrats intelligents.
- Comprendre les mécanismes de **Web3** pour connecter une application décentralisée (DApp) avec des smart contracts.
- Illustrer l'interconnexion entre un jeton ERC-20 (DLPH) et un contrat de jeu (FlightControl).

---

## **Structure du projet**
FlightX repose sur deux parties principales :

### **1. Jeton ERC-20 : DLPH**
Le token **DLPH** est un jeton ERC-20 standard avec les extensions suivantes :
- **Burnable** : Les utilisateurs peuvent brûler des tokens.
- **Ownable** : Certaines fonctions sont restreintes au propriétaire du contrat.
- **Transfert de fonds** : Les tokens sont utilisés comme monnaie principale dans le contrat de jeu.

### **2. Contrat de jeu : FlightControl**
Le contrat **FlightControl** permet aux utilisateurs de simuler des vols, générer des turbulences, et interagir avec les autres participants :
- **Création de vols :**
  - Les utilisateurs paient des frais en tokens **DLPH** pour créer un vol avec une destination, une durée, et un dépôt de sécurité.
- **Turbulences :**
  - Les autres utilisateurs peuvent générer des turbulences en payant des tokens **DLPH**.
- **Crashs :**
  - Si la somme des turbulences dépasse le dépôt de sécurité, l’avion est déclaré "crashé", et les fonds sont redistribués aux contributeurs.
- **Atterrissage réussi :**
  - Si la durée du vol est atteinte sans crash, le propriétaire peut "atterrir" l’avion et recevoir une récompense.

---

## **DApp Web3**
L’application web est en cours de construction. Elle permettra aux utilisateurs de :
- **Connecter leur portefeuille Web3** (ex. MetaMask).
- **Créer des vols** avec des destinations et des dépôts.
- **Suivre les vols actifs et leur état (en vol, crashé, atterri).**
- **Participer en générant des turbulences.**

### **Technologies utilisées**
- **Frontend :** Développé avec **Next.js** et **React**.
- **Blockchain :** Basé sur Ethereum ou tout autre réseau compatible EVM (BSC, Polygon).
- **Smart Contracts :** Déployés avec **Hardhat**.

---

## **Installation**
### **Prérequis**
- **Node.js** : Installe [Node.js](https://nodejs.org/).
- **Hardhat** : Installe Hardhat avec :
  ```bash
  npm install --save-dev hardhat
  ```
- **MetaMask** : Un portefeuille Web3 pour interagir avec l’application.

### **Cloner le dépôt**
```bash
git clone https://github.com/<ton-utilisateur>/FlightX.git
cd FlightX
```

### **Installation des dépendances**
```bash
npm install
```

### **Déploiement des smart contracts**
Configure le réseau dans `hardhat.config.js`, puis déploie les contrats :
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network <network-name>
```

---

## **Avancement**
- ✅ Développement des smart contracts : **Terminé.**
- 🚧 Application Web3 : **En cours de construction.**
- ✨ Tests complets et intégration : **Prochainement.**

---

## **Contributeurs**
Ce projet est principalement destiné à un usage éducatif. Toute contribution ou suggestion est la bienvenue !

---

## **Licence**
Ce projet est sous licence **MIT**. Libre à vous de l’utiliser pour vos propres apprentissages ou projets.

---

## **Remarque**
FlightX est un projet d'apprentissage et ne doit pas être utilisé pour des cas en production sans audit complet des contrats intelligents.
```

