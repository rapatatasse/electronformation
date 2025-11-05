# Logique Métier - Positionnement Automatique des Images

## Vue d'ensemble

À partir du **fond 30**, une logique métier spéciale est activée pour permettre le positionnement automatique des images sur le fond d'écran.

## Fonctionnement

### 1. Activation automatique
- La logique métier s'active automatiquement pour tous les fonds >= 30
- Pour les fonds < 30, le comportement standard est conservé

### 2. Configuration dans businessLogic.js

Les images et leurs coordonnées sont définies directement dans le fichier `businessLogic.js` dans la constante `IMAGES_CONFIG`.

**Structure de la configuration :**

```javascript
const IMAGES_CONFIG = {
    "Image30.png": [
        {
            "name": "30_Iso_Droite.png",
            "x": 29,
            "y": 40
        },
        {
            "name": "30_Iso_Gauche.png",
            "x": 55,
            "y": 40
        }
    ],
    "Image31.png": [
        {
            "name": "31_Element1.png",
            "x": 50,
            "y": 50
        }
    ]
};
```

**Format :**
- Clé : nom du fichier de fond (ex: `"Image30.png"`)
- Valeur : tableau d'objets avec :
  - `name` : nom du fichier image à positionner
  - `x` : pourcentage de la largeur (0-100)
  - `y` : pourcentage de la hauteur (0-100)

**Note :** La configuration est embarquée dans le JavaScript pour éviter les problèmes CORS lors de l'ouverture en local avec `file://`

### 3. Système de coordonnées en pourcentage

- **X** : Pourcentage de la largeur de l'image de fond (0-100)
- **Y** : Pourcentage de la hauteur de l'image de fond (0-100)
- Les coordonnées sont des **pourcentages** et non des pixels
- Le système calcule automatiquement la position en pixels selon la taille affichée

**Exemples :**
- `(0;0)` = coin supérieur gauche
- `(50;50)` = centre de l'image
- `(100;100)` = coin inférieur droit
- `(30;20)` = 30% de la largeur, 20% de la hauteur

### 4. Mise à l'échelle automatique

Le système :
1. Lit les pourcentages depuis le nom de fichier
2. Calcule la position en pixels selon les dimensions affichées de l'image de fond
3. Redimensionne les images positionnées proportionnellement au fond

**Exemple :**
- Image de fond affichée : 1000x750px
- Coordonnées : (30;20) = 30% largeur, 20% hauteur
- Position calculée : (300px; 150px)
- Si le fond est redimensionné à 500x375px
- Nouvelle position : (150px; 75px)

## Structure des fichiers

```
📁 Projet
├── 📄 drapdrop.html          # Page principale
├── 📄 script.js              # Logique drag & drop standard
├── 📄 businessLogic.js       # Logique métier pour fonds >= 30
├── 📁 ImageFond/
│   ├── fond1.png
│   ├── fond2.png
│   ├── ...
│   └── fond30.png            # Premier fond avec logique métier
└── 📁 ImagesPourFond/
    ├── coordonnees.json      # Configuration des positions
    ├── 30_Iso_Droite.png     # Images pour fond 30
    ├── 30_Iso_Gauche.png
    ├── 31_Element1.png       # Images pour fond 31
    └── ...
```

## Utilisation

### Ajouter un nouveau fond avec positionnement automatique

1. **Créer l'image de fond** (numéro >= 30)
   ```
   ImageFond/fond30.png
   ```

2. **Créer les images à positionner**
   ```
   ImagesPourFond/30_Iso_Droite.png
   ImagesPourFond/30_Iso_Gauche.png
   ```

3. **Configurer les positions dans businessLogic.js**
   
   Ouvrez `businessLogic.js` et ajoutez votre configuration dans `IMAGES_CONFIG` :
   
   ```javascript
   const IMAGES_CONFIG = {
       "Image30.png": [
           {
               "name": "30_Iso_Droite.png",
               "x": 29,
               "y": 40,
               "type": "image",
               "rotation": -15  // Optionnel: rotation en degrés
           },
           {
               "name": "30_Iso_Gauche.png",
               "x": 55,
               "y": 40,
               "type": "image",
               "rotation": 15   // Optionnel: rotation en degrés
           },
           {
               "name": "connecteur1",
               "x1": 0,
               "y1": 40,
               "x2": 20,
               "y2": 40,
               "pending": 5,
               "type": "connecteur"
           }
       ]
   };
   ```

4. **Ouvrir la page**
   ```
   drapdrop.html?fond=30
   ```

5. Les images seront automatiquement positionnées selon la configuration JSON

### Déterminer les coordonnées

Pour trouver les bonnes coordonnées (X;Y) en pourcentage :

**Méthode 1 - Calcul manuel :**
1. Ouvrez l'image de fond dans un éditeur d'images
2. Trouvez la position souhaitée en pixels (ex: 600px, 300px)
3. Notez les dimensions totales de l'image (ex: 2000px × 1500px)
4. Calculez les pourcentages :
   - X% = (position_x / largeur_totale) × 100 = (600 / 2000) × 100 = 30
   - Y% = (position_y / hauteur_totale) × 100 = (300 / 1500) × 100 = 20
5. Ajoutez dans `IMAGES_CONFIG` de businessLogic.js : `"x": 30, "y": 20`

**Méthode 2 - Positions courantes :**
- Coin supérieur gauche : `(0;0)`
- Haut centre : `(50;0)`
- Coin supérieur droit : `(100;0)`
- Centre gauche : `(0;50)`
- Centre : `(50;50)`
- Centre droit : `(100;50)`
- Coin inférieur gauche : `(0;100)`
- Bas centre : `(50;100)`
- Coin inférieur droit : `(100;100)`

## Extensions supportées

- PNG (recommandé pour la transparence)
- JPG / JPEG
- GIF
- BMP
- WEBP

## Comportements spéciaux

### Redimensionnement de fenêtre
- Les positions sont automatiquement recalculées lors du redimensionnement
- Les images restent positionnées correctement par rapport au fond

### Changement de fond
- Si vous changez de fond (< 30 → >= 30), la logique métier s'active
- Si vous changez de fond (>= 30 → < 30), la logique métier se désactive
- Les images positionnées sont nettoyées lors du changement

### Images non déplaçables
- Les images positionnées automatiquement ne peuvent pas être déplacées
- Elles sont affichées avec `pointer-events: none`
- Elles ont un z-index de 5 (au-dessus du fond, en dessous des images draggables)

## Console de débogage

Le système affiche des informations détaillées dans la console :

```
📋 Logique métier activée pour fond 30
🔍 Recherche de configuration pour: Image30.png
📋 2 image(s) configurée(s) pour ce fond
✅ Image trouvée: 30_Iso_Droite.png (x:29%, y:40%)
✅ Image trouvée: 30_Iso_Gauche.png (x:55%, y:40%)
📊 Total: 2 image(s) chargée(s)
📍 Image positionnée: ImagesPourFond/30_Iso_Droite.png
   Pourcentages: (29%, 40%)
   Dimensions fond affichées: 1000.00x750.00px
   Offset calculé: (290.00, 300.00)
   Position absolue: (390.00, 350.00)
   Échelle image: 0.5167
```

## Connecteurs (câbles)

Vous pouvez dessiner des connecteurs (câbles) entre deux points avec une courbe caténaire :

```javascript
{
    "name": "connecteur1",
    "x1": 0,      // Point de départ X (%)
    "y1": 40,     // Point de départ Y (%)
    "x2": 20,     // Point d'arrivée X (%)
    "y2": 40,     // Point d'arrivée Y (%)
    "pending": 5, // Pente du câble (% de la distance horizontale)
    "type": "connecteur"
}
```

**Paramètres :**
- **x1, y1** : Position de départ en pourcentage
- **x2, y2** : Position d'arrivée en pourcentage
- **pending** : Pente du câble (0 = droit, 5 = légère courbe, 25 = forte courbe)
- **type** : Doit être `"connecteur"`

**Caractéristiques :**
- Couleur verte (#4CAF50) comme les câbles électriques
- Boules aux extrémités (rayon 8px)
- Courbe quadratique pour simuler la caténaire
- Z-index: 3 (entre le fond et les images)

## Rotation des images

Vous pouvez appliquer une rotation aux images positionnées en ajoutant le paramètre `rotation` :

```javascript
{
    "name": "30_Iso_Droite.png",
    "x": 29,
    "y": 40,
    "rotation": -15  // Rotation en degrés (sens horaire positif)
}
```

- **Valeurs positives** : rotation dans le sens horaire (→)
- **Valeurs négatives** : rotation dans le sens anti-horaire (←)
- **Exemples** : `-15` (penché à gauche), `0` (pas de rotation), `45` (penché à 45° droite)

## Notes techniques

- La configuration est embarquée dans `businessLogic.js` (constante `IMAGES_CONFIG`)
- Cette approche évite les problèmes CORS lors de l'ouverture en local avec `file://`
- Les images sont chargées de manière asynchrone
- Un délai de 500ms est appliqué avant l'initialisation pour garantir que tout est chargé
- Pour ajouter un nouveau fond, éditez simplement `IMAGES_CONFIG` dans businessLogic.js
- La rotation utilise `transform: rotate()` avec `transform-origin: center center`
