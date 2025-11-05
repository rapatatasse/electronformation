# Comment ajouter des images positionnées pour un nouveau fond

## Guide rapide

### Étape 1 : Préparer vos fichiers

1. Créez votre image de fond (numéro >= 30) :
   ```
   ImageFond/fond31.png
   ```

2. Créez vos images à positionner :
   ```
   ImagesPourFond/31_Element1.png
   ImagesPourFond/31_Element2.png
   ```

### Étape 2 : Calculer les positions en pourcentage

Pour chaque image, déterminez où elle doit être placée :

1. Ouvrez votre fond dans un éditeur d'images (GIMP, Photoshop, Paint.NET, etc.)
2. Notez les dimensions totales (ex: 2000px × 1500px)
3. Trouvez la position souhaitée en pixels (ex: 600px, 450px)
4. Calculez les pourcentages :
   - **X%** = (position_x ÷ largeur_totale) × 100
   - **Y%** = (position_y ÷ hauteur_totale) × 100

**Exemple :**
- Position souhaitée : (600px, 450px)
- Dimensions du fond : 2000px × 1500px
- Calcul X : (600 ÷ 2000) × 100 = **30%**
- Calcul Y : (450 ÷ 1500) × 100 = **30%**

### Étape 3 : Éditer businessLogic.js

Ouvrez le fichier `businessLogic.js` et trouvez la constante `IMAGES_CONFIG` au début du fichier.

Ajoutez votre configuration :

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
    // AJOUTEZ VOTRE NOUVEAU FOND ICI
    "Image31.png": [
        {
            "name": "31_Element1.png",
            "x": 30,
            "y": 30,
            "rotation": 0  // Optionnel: rotation en degrés
        },
        {
            "name": "31_Element2.png",
            "x": 70,
            "y": 60,
            "rotation": -10  // Optionnel: penché à gauche
        }
    ]
};
```

### Étape 4 : Tester

1. Ouvrez `index.html` dans votre navigateur
2. Cliquez sur la carte du fond 31 (ou ajoutez-la si elle n'existe pas)
3. Vérifiez que les images sont bien positionnées

## Positions courantes

Pour vous faciliter la tâche, voici des positions prédéfinies :

| Position | X | Y | Description |
|----------|---|---|-------------|
| Coin supérieur gauche | 0 | 0 | Tout en haut à gauche |
| Haut centre | 50 | 0 | Centré en haut |
| Coin supérieur droit | 100 | 0 | Tout en haut à droite |
| Centre gauche | 0 | 50 | Centré à gauche |
| Centre | 50 | 50 | Au milieu de l'image |
| Centre droit | 100 | 50 | Centré à droite |
| Coin inférieur gauche | 0 | 100 | Tout en bas à gauche |
| Bas centre | 50 | 100 | Centré en bas |
| Coin inférieur droit | 100 | 100 | Tout en bas à droite |

## Exemple complet

Imaginons que vous voulez créer le fond 32 avec 3 éléments :

**Fichiers à créer :**
```
ImageFond/fond32.png
ImagesPourFond/32_Disjoncteur.png
ImagesPourFond/32_Cable.png
ImagesPourFond/32_Prise.png
```

**Configuration dans businessLogic.js :**
```javascript
const IMAGES_CONFIG = {
    // ... autres configurations ...
    
    "Image32.png": [
        {
            "name": "32_Disjoncteur.png",
            "x": 20,    // 20% de la largeur
            "y": 15     // 15% de la hauteur
        },
        {
            "name": "32_Cable.png",
            "x": 50,    // Centre horizontal
            "y": 30
        },
        {
            "name": "32_Prise.png",
            "x": 80,
            "y": 70
        }
    ]
};
```

## Rotation des images

Vous pouvez faire pivoter les images en ajoutant le paramètre `rotation` :

```javascript
{
    "name": "31_Element1.png",
    "x": 30,
    "y": 30,
    "rotation": -15  // Rotation en degrés
}
```

**Valeurs de rotation :**
- **0** : Pas de rotation (par défaut)
- **Positif** (ex: `15`, `45`, `90`) : Rotation dans le sens horaire →
- **Négatif** (ex: `-15`, `-45`, `-90`) : Rotation dans le sens anti-horaire ←

**Exemples courants :**
- `-15` : Légèrement penché à gauche
- `15` : Légèrement penché à droite
- `45` : Penché à 45° droite
- `90` : Tourné à 90° (vertical → horizontal)
- `180` : Retourné complètement

## Astuces

1. **Utilisez des noms de fichiers descriptifs** : `30_Iso_Droite.png` est plus clair que `img1.png`

2. **Testez progressivement** : Ajoutez une image à la fois pour vérifier le positionnement

3. **Utilisez la console** : Ouvrez les outils de développement (F12) pour voir les logs de positionnement

4. **Ajustez finement** : N'hésitez pas à ajuster les pourcentages par petits incréments (±1 ou 2%)

5. **Rotation subtile** : Pour un effet naturel, utilisez des rotations entre -20° et +20°

6. **Sauvegardez votre travail** : Faites des copies de businessLogic.js avant de faire des modifications importantes

## Dépannage

**Les images ne s'affichent pas :**
- Vérifiez que les noms de fichiers correspondent exactement (majuscules/minuscules)
- Vérifiez que les images sont bien dans `ImagesPourFond/`
- Ouvrez la console (F12) pour voir les messages d'erreur

**Les images sont mal positionnées :**
- Vérifiez vos calculs de pourcentage
- Assurez-vous d'utiliser les dimensions de l'image de fond originale, pas redimensionnée

**Erreur de syntaxe JavaScript :**
- Vérifiez les virgules entre les objets
- Vérifiez que tous les guillemets sont bien fermés
- Utilisez un validateur JavaScript en ligne si nécessaire
