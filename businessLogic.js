

const IMAGES_CONFIG = {
    "Image30.png": [
        {
            "name": "30_Iso_Droite.png",
            "x": 24,
            "y": 13,
            "type": "image",
            "rotation": -15,
            
        },
        {
            "name": "30_Iso_Gauche.png",
            "x": 55,
            "y": 13,
            "type": "image",
            "rotation": 15
        },
        {
            "name": "connecteur1",
            "x1": 0,
            "x2": 25,
            "y1": 21,
            "y2": 21,
            "fixed": true,
            "pending": 5,
            "type": "connecteur",
            "color": "#FF0000"
        },
        {
            "name": "connecteur2",
            "x1": 27,
            "x2": 75,
            "y1": 21,
            "y2": 21,
            "fixed": false,
            "pending": 25,
            "type": "connecteur",
            "color": "#f16a10ff"
        },
        {
            "name": "connecteur3",
            "x1": 77,
            "y1": 21,
            "x2": 100,
            "y2": 21,
            "fixed": true,
            "pending": 5,
            "type": "connecteur",
            "color": "#FF0000"
        }
    ]
    // Ajoutez ici d'autres configurations pour Image31.png, Image32.png, etc.
};

/**
 * Logique métier pour les fonds d'écran >= 30
 * Gère le positionnement automatique des images avec coordonnées
 */

class BusinessLogicManager {
    constructor(dragDropManager) {
        this.dragDropManager = dragDropManager;
        this.currentBackgroundIndex = dragDropManager.currentBackgroundIndex;
        this.backgroundArea = dragDropManager.backgroundArea;
        this.backgroundImage = dragDropManager.backgroundImage;
        this.backgroundScale = dragDropManager.backgroundScale;
        this.positionedImages = [];
        
        // Variables pour les connecteurs décrochés
        this.droppedConnectors = new Map(); // Stocke l'état des connecteurs décrochés (nom -> 'start' ou 'end')

        // Initialisation du gestionnaire de décrochage connecteur
        this.connecteurDecrochageManager = new ConnecteurDecrochageManager(this.backgroundArea);

       
    }
    /**
     * Vérifie si le fond actuel nécessite la logique métier spéciale
     */
    requiresBusinessLogic() {
        return this.currentBackgroundIndex >= 30;
    }

    /**
     * Initialise la logique métier pour le fond actuel
     */
    async init() {
        if (!this.requiresBusinessLogic()) {
            console.log('📋 Logique métier standard (fond < 30)');
            return;
        }

        console.log(`📋 Logique métier activée pour fond ${this.currentBackgroundIndex}`);
        await this.loadPositionedImages();
    }

    /**
     * Charge les images depuis ImagesPourFond avec positionnement automatique
     * Lit les coordonnées depuis la configuration IMAGES_CONFIG
     */
    async loadPositionedImages() {
        const folderName = 'ImagesPourFond';
        const backgroundFileName = `Image${this.currentBackgroundIndex}.png`;
        
        console.log(`🔍 Recherche de configuration pour: ${backgroundFileName}`);

        // Vérifier si ce fond a une configuration
        if (!IMAGES_CONFIG[backgroundFileName]) {
            console.log(`ℹ️ Pas de configuration pour ${backgroundFileName}`);
            return;
        }

        const imageConfigs = IMAGES_CONFIG[backgroundFileName];
        console.log(`📋 ${imageConfigs.length} image(s) configurée(s) pour ce fond`);

        const foundImages = [];

        // Charger chaque élément défini dans la configuration
        for (const config of imageConfigs) {
            if (config.type === 'connecteur') {
                // C'est un connecteur
                foundImages.push({
                    type: 'connecteur',
                    name: config.name,
                    x1: config.x1,
                    y1: config.y1,
                    x2: config.x2,
                    y2: config.y2,
                    pending: config.pending || 0,
                    color: config.color, // transmet la couleur
                    fixed: config.fixed // transmet la propriété fixed
                });
                console.log(`✅ Connecteur: ${config.name} (${config.x1}%,${config.y1}%) → (${config.x2}%,${config.y2}%), pente:${config.pending}%`);
            } else {
                // C'est une image
                const imagePath = `${folderName}/${config.name}`;
                
                // Vérifier que l'image existe
                if (await this.imageExists(imagePath)) {
                    foundImages.push({
                        type: 'image',
                        path: imagePath,
                        x: config.x,
                        y: config.y,
                        rotation: config.rotation
                    });
                    const rotationInfo = config.rotation !== undefined ? `, rotation:${config.rotation}°` : '';
                    console.log(`✅ Image trouvée: ${config.name} (x:${config.x}%, y:${config.y}%${rotationInfo})`);
                } else {
                    console.log(`⚠️ Image non trouvée: ${config.name}`);
                }
            }
        }

        console.log(`📊 Total: ${foundImages.length} image(s) chargée(s)`);

        // Attendre que l'image de fond soit chargée et que l'échelle soit calculée
        await this.waitForBackgroundLoad();

        // Placer les éléments sur le fond
        for (const elementData of foundImages) {
            if (elementData.type === 'connecteur') {
                this.drawConnecteur(elementData);
            } else {
                this.placeImageOnBackground(elementData);
            }
        }
    }

    /**
     * Vérifie si une image existe
     */
    async imageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    /**
     * Attend que l'image de fond soit chargée et que l'échelle soit calculée
     */
    async waitForBackgroundLoad() {
        return new Promise((resolve) => {
            if (this.backgroundImage.complete && this.dragDropManager.backgroundScale !== 1) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (this.backgroundImage.complete && this.dragDropManager.backgroundScale !== 1) {
                        clearInterval(checkInterval);
                        // Mettre à jour l'échelle locale
                        this.backgroundScale = this.dragDropManager.backgroundScale;
                        resolve();
                    }
                }, 100);
            }
        });
    }

    /**
     * Place une image sur le fond avec les coordonnées spécifiées en pourcentage
     * Les coordonnées (x, y) sont des pourcentages de la largeur et hauteur de l'image de fond
     */
    placeImageOnBackground(imageData) {
        const img = document.createElement('img');
        img.src = imageData.path;
        img.classList.add('positioned-image');
        
        // Attendre que l'image soit chargée pour la positionner
        img.onload = () => {
            // Récupérer l'échelle actuelle
            const scale = this.dragDropManager.backgroundScale;
            
            // Récupérer les dimensions de l'image de fond
            const bgRect = this.backgroundImage.getBoundingClientRect();
            const areaRect = this.backgroundArea.getBoundingClientRect();
            
            // Calculer la position en pourcentage de la taille de l'image de fond affichée
            const percentX = imageData.x / 100; // Convertir en décimal (30 -> 0.30)
            const percentY = imageData.y / 100; // Convertir en décimal (20 -> 0.20)
            
            // Calculer la position en pixels basée sur les dimensions affichées de l'image de fond
            const offsetX = bgRect.width * percentX;
            const offsetY = bgRect.height * percentY;
            
            // Calculer la position absolue dans la zone de fond
            const absoluteX = (bgRect.left - areaRect.left) + offsetX;
            const absoluteY = (bgRect.top - areaRect.top) + offsetY;
            
            // Mettre à l'échelle l'image elle-même proportionnellement au fond
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const scaledWidth = naturalWidth * scale;
            const scaledHeight = naturalHeight * scale;
            
            // Positionner l'image
            img.style.position = 'absolute';
            img.style.left = `${absoluteX}px`;
            img.style.top = `${absoluteY}px`;
            img.style.width = `${scaledWidth}px`;
            img.style.height = `${scaledHeight}px`;
            img.style.zIndex = '5';
            img.style.pointerEvents = 'none'; // L'image ne peut pas être déplacée
            
            // Appliquer la rotation si spécifiée (APRÈS les dimensions)
            if (imageData.rotation !== undefined) {
                img.style.transform = `rotate(${imageData.rotation}deg)`;
                img.style.transformOrigin = 'center center';
            }
            console.log(`📍 Image positionnée: ${imageData.path}`);
            console.log(`   Pourcentages: (${imageData.x}%, ${imageData.y}%)`);
            console.log(`   Dimensions fond affichées: ${bgRect.width.toFixed(2)}x${bgRect.height.toFixed(2)}px`);
            console.log(`   Offset calculé: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)})`);
            console.log(`   Position absolue: (${absoluteX.toFixed(2)}, ${absoluteY.toFixed(2)})`);
            console.log(`   Échelle image: ${scale.toFixed(4)}`);
            console.log(`   🔄 Rotation: ${imageData.rotation}°`);
            
            
            // Ajouter l'image à la zone de fond
            this.backgroundArea.appendChild(img);
            this.positionedImages.push(img);
        };
    }

    /**
     * Dessine un connecteur (câble) avec une courbe caténaire
     */
    drawConnecteur(connecteurData) {
        const bgRect = this.backgroundImage.getBoundingClientRect();
        const areaRect = this.backgroundArea.getBoundingClientRect();
        
        // Convertir les pourcentages en pixels
        const x1Percent = connecteurData.x1 / 100;
        const y1Percent = connecteurData.y1 / 100;
        const x2Percent = connecteurData.x2 / 100;
        const y2Percent = connecteurData.y2 / 100;
        
        let x1 = (bgRect.left - areaRect.left) + (bgRect.width * x1Percent);
        let y1 = (bgRect.top - areaRect.top) + (bgRect.height * y1Percent);
        let x2 = (bgRect.left - areaRect.left) + (bgRect.width * x2Percent);
        let y2 = (bgRect.top - areaRect.top) + (bgRect.height * y2Percent);
        // Stocker les coordonnées pixels pour l'animation de décrochage
        connecteurData.x1Pixel = x1;
        connecteurData.y1Pixel = y1;
        connecteurData.x2Pixel = x2;
        connecteurData.y2Pixel = y2;
        console.log(`[DEBUG] Coordonnées connecteur ${connecteurData.name} : x1=${x1}, y1=${y1}, x2=${x2}, y2=${y2}`);
        
        // Sauvegarder les positions originales pour l'animation
        const x1Original = x1;
        const y1Original = y1;
        const x2Original = x2;
        const y2Original = y2;
        
        // Calculer la longueur originale du câble
        const originalLength = Math.sqrt(Math.pow(x2Original - x1Original, 2) + Math.pow(y2Original - y1Original, 2));
        
        // Vérifier si ce connecteur est décroché et quelle extrémité
        const droppedEnd = this.droppedConnectors.get(connecteurData.name);
        if (droppedEnd && !connecteurData.fixed) {
            if (droppedEnd === 'start') {
                // La boule de départ est tombée, elle pend depuis la fin
                x1 = x2Original; // Même position X que la fin
                y1 = y2Original + originalLength; // Tombe depuis la fin
            } else if (droppedEnd === 'end') {
                // La boule de fin est tombée, elle pend depuis le départ
                x2 = x1Original; // Même position X que le départ
                y2 = y1Original + originalLength; // Tombe depuis le départ
            }
        }
        
        // Créer un SVG pour dessiner le connecteur
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '6'; // Au-dessus des images positionnées (5)
        
        // Calculer la pente (sag) du câble en pixels
        let distance = Math.abs(x2 - x1);
        let pendingPercent = connecteurData.pending / 100;
        let sag = distance * pendingPercent;
        
        // Si le câble est décroché, utiliser une pente minimale pour qu'il pende droit
        if (droppedEnd && !connecteurData.fixed) {
            distance = Math.abs(y2 - y1);
            pendingPercent = 0.05; // Très légère courbe pour simuler le poids
            sag = distance * pendingPercent;
        }
        
        // Point de contrôle pour la courbe quadratique (milieu + pente)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2 + sag;
        
        // Créer le chemin du câble (courbe quadratique)
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
        path.setAttribute('d', d);
         // Utiliser la couleur personnalisée ou la couleur par défaut
        const cableColor = connecteurData.color || '#4CAF50';
        path.setAttribute('stroke', cableColor);
        path.setAttribute('stroke-width', '3');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        
        // Créer les boules aux extrémités
        const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle1.setAttribute('cx', x1);
        circle1.setAttribute('cy', y1);
        circle1.setAttribute('r', '8'); // Grosse boule au début
        circle1.setAttribute('fill', cableColor);
        
        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', x2);
        circle2.setAttribute('cy', y2);
        circle2.setAttribute('r', '8'); // Grosse boule à la fin
        circle2.setAttribute('fill', cableColor);
        
        // Toujours rendre le curseur pointer, mais la logique de clic vérifie fixed
        circle1.style.cursor = 'pointer';
        circle1.style.pointerEvents = 'auto';
        circle1.setAttribute('class', 'connector-handle');
        circle1.setAttribute('data-fixed', connecteurData.fixed ? 'true' : 'false');
        circle1.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFixed = e.currentTarget.getAttribute('data-fixed') === 'true';
            console.log('data-fixed (départ):', isFixed);
            if (isFixed || this.droppedConnectors.has(connecteurData.name)) return;
            this.droppedConnectors.set(connecteurData.name, 'start');
            // Récupérer la liste des VATs sur le fond (zone 2)
            const vats = Array.from(document.querySelectorAll('.draggable-image[data-original-zone="2"]')).map(img => {
                const rect = img.getBoundingClientRect();
                const bgRect = this.backgroundArea.getBoundingClientRect();
                return {
                    img,
                    x: rect.left + rect.width / 2 - bgRect.left,
                    y: rect.top + rect.height / 2 - bgRect.top
                };
            });
            this.connecteurDecrochageManager.decrocherAvecVat(connecteurData, path, circle1, 'start', vats);
            console.log(`🔓 Connecteur décroché (départ): ${connecteurData.name}`);
        });

        circle2.style.cursor = 'pointer';
        circle2.style.pointerEvents = 'auto';
        circle2.setAttribute('class', 'connector-handle');
        circle2.setAttribute('data-fixed', connecteurData.fixed ? 'true' : 'false');
        circle2.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isFixed = e.currentTarget.getAttribute('data-fixed') === 'true';
            console.log('data-fixed (fin):', isFixed);
            if (isFixed || this.droppedConnectors.has(connecteurData.name)) return;
            this.droppedConnectors.set(connecteurData.name, 'end');
            // Récupérer la liste des VATs sur le fond (zone 2)
            const vats = Array.from(document.querySelectorAll('.draggable-image[data-original-zone="2"]')).map(img => {
                const rect = img.getBoundingClientRect();
                const bgRect = this.backgroundArea.getBoundingClientRect();
                return {
                    img,
                    x: rect.left + rect.width / 2 - bgRect.left,
                    y: rect.top + rect.height / 2 - bgRect.top
                };
            });
            this.connecteurDecrochageManager.decrocherAvecVat(connecteurData, path, circle2, 'end', vats);
            console.log(`🔓 Connecteur décroché (fin): ${connecteurData.name}`);
        });
        
        // Ajouter les éléments au SVG
        svg.appendChild(path);
        svg.appendChild(circle1);
        svg.appendChild(circle2);
        
        // Ajouter le SVG à la zone de fond
        this.backgroundArea.appendChild(svg);
        this.positionedImages.push(svg);
        
        console.log(`🔌 Connecteur dessiné: ${connecteurData.name}`);
        console.log(`   De (${connecteurData.x1}%, ${connecteurData.y1}%) à (${connecteurData.x2}%, ${connecteurData.y2}%)`);
        console.log(`   Pente: ${connecteurData.pending}%`);
    }

    /**
     * Anime la chute d'un connecteur
     */
    animateConnectorDrop(connecteurData, path, fallingCircle, anchorX, anchorY, fallingXStart, fallingYStart, cableLength, whichEnd) {
        const duration = 1500; // 1.5 secondes
        const startTime = performance.now();
        
        // Position finale : la boule pend verticalement depuis l'ancre
        const fallingXEnd = anchorX;
        const fallingYEnd = anchorY + cableLength;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Fonction d'easing pour un mouvement naturel (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            // Interpoler la position de la boule qui tombe
            const currentFallingX = fallingXStart + (fallingXEnd - fallingXStart) * easeOut;
            const currentFallingY = fallingYStart + (fallingYEnd - fallingYStart) * easeOut;
            
            // Calculer la courbe avec une légère pente
            const distance = Math.abs(currentFallingY - anchorY);
            const sag = distance * 0.05; // Légère courbe
            const midX = (anchorX + currentFallingX) / 2;
            const midY = (anchorY + currentFallingY) / 2 + sag;
            
            // Mettre à jour le chemin selon quelle extrémité tombe
            let d;
            if (whichEnd === 'start') {
                // La boule de départ tombe, elle devient la fin du chemin
                d = `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${currentFallingX} ${currentFallingY}`;
            } else {
                // La boule de fin tombe, elle reste la fin du chemin
                d = `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${currentFallingX} ${currentFallingY}`;
            }
            path.setAttribute('d', d);
            
            // Mettre à jour la position de la boule qui tombe
            fallingCircle.setAttribute('cx', currentFallingX);
            fallingCircle.setAttribute('cy', currentFallingY);
            
            // Continuer l'animation si pas terminée
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * Recalcule les positions des images lors d'un redimensionnement
     */
    recalculatePositions() {
        if (!this.requiresBusinessLogic()) {
            return;
        }

        // Supprimer les anciennes images
        this.positionedImages.forEach(img => img.remove());
        this.positionedImages = [];

        // Recharger les images avec les nouvelles positions
        this.loadPositionedImages();
    }

    /**
     * Nettoie les images positionnées
     */
    cleanup() {
        this.positionedImages.forEach(img => img.remove());
        this.positionedImages = [];
    }
}

// Initialisation globale
let businessLogicManager = null;

// Fonction d'initialisation appelée après le chargement du DragDropManager
function initBusinessLogic(dragDropManager) {
    businessLogicManager = new BusinessLogicManager(dragDropManager);
    businessLogicManager.init();
    
    // Écouter les redimensionnements de fenêtre
    window.addEventListener('resize', () => {
        if (businessLogicManager) {
            setTimeout(() => {
                businessLogicManager.recalculatePositions();
            }, 300);
        }
    });
}



// ############################## Connecteur chute logique##############################


// connecteurs.js
// Toute la logique de décrochage et détection d'accroche VAT pour les connecteurs

 const VAT_DETECTION_DISTANCE = 20; // px, modifiable facilement

class ConnecteurDecrochageManager {
    constructor(backgroundArea) {
        this.backgroundArea = backgroundArea;
        // On pourra ajouter d'autres propriétés (VATs, etc)
    }

    // Animation de décrochage (ancienne animateConnectorDrop)
    animateDecrochage(connecteurData, path, fallingCircle, anchorX, anchorY, fallingXStart, fallingYStart, cableLength, whichEnd) {
        const duration = 1500; // 1.5 secondes
        const startTime = performance.now();
        const fallingXEnd = anchorX;
        const fallingYEnd = anchorY + cableLength;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentFallingX = fallingXStart + (fallingXEnd - fallingXStart) * easeOut;
            const currentFallingY = fallingYStart + (fallingYEnd - fallingYStart) * easeOut;
            const distance = Math.abs(currentFallingY - anchorY);
            const sag = distance * 0.05;
            const midX = (anchorX + currentFallingX) / 2;
            const midY = (anchorY + currentFallingY) / 2 + sag;
            let d;
            if (whichEnd === 'start') {
                d = `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${currentFallingX} ${currentFallingY}`;
            } else {
                d = `M ${anchorX} ${anchorY} Q ${midX} ${midY} ${currentFallingX} ${currentFallingY}`;
            }
            path.setAttribute('d', d);
            fallingCircle.setAttribute('cx', currentFallingX);
            fallingCircle.setAttribute('cy', currentFallingY);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    // Détection VAT accrochée sur un câble
    // vats : tableau d'objets {img, x, y} (coordonnées centre VAT sur le fond)
    detectVatAccroche(connecteurData, vats) {
        if (!vats || vats.length === 0) return null;
        // Points du câble
        const {x1, y1, x2, y2} = connecteurData;
        // Quadratique : on approxime la courbe par 20 segments pour la projection
        const points = [];
        for (let t = 0; t <= 1; t += 0.05) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2 + Math.abs(x2 - x1) * (connecteurData.pending / 100);
            const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * midX + t * t * x2;
            const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * midY + t * t * y2;
            points.push({x, y, t});
        }
        let minDist = Infinity;
        let accroche = null;
        for (const vat of vats) {
            for (const pt of points) {
                const dx = pt.x - vat.x;
                const dy = pt.y - vat.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < VAT_DETECTION_DISTANCE && dist < minDist) {
                    minDist = dist;
                    accroche = {vat, t: pt.t, x: pt.x, y: pt.y, dist};
                }
            }
        }
        return accroche; // null si rien trouvé, sinon {vat, t, x, y, dist}
    }

    // Décrochage avec prise en compte de la VAT
    // direction: 'start' ou 'end'
    // circle: le cercle qui tombe
    decrocherAvecVat(connecteurData, path, circle, direction, vats) {
        // On utilise les coordonnées calculées en pixels (x1Original, y1Original, x2Original, y2Original)
        // Ces propriétés doivent être ajoutées à connecteurData lors de drawConnecteur
        const accroche = this.detectVatAccroche(connecteurData, vats);
        let anchorX, anchorY, fallingXStart, fallingYStart, cableLength;
        if (accroche) {
            console.log('[DEBUG VAT ACCROCHE]', {
                vatImage: accroche.vat.img,
                vatCoords: { x: accroche.vat.x, y: accroche.vat.y },
                accrocheX: accroche.x,
                accrocheY: accroche.y,
                dist: accroche.dist,
                t: accroche.t
            });
            anchorX = accroche.x;
            anchorY = accroche.y;
            if (direction === 'start') {
                fallingXStart = connecteurData.x1Pixel;
                fallingYStart = connecteurData.y1Pixel;
            } else {
                fallingXStart = connecteurData.x2Pixel;
                fallingYStart = connecteurData.y2Pixel;
            }
            cableLength = Math.sqrt(Math.pow(fallingXStart - anchorX, 2) + Math.pow(fallingYStart - anchorY, 2));
        } else {
            if (direction === 'start') {
                anchorX = connecteurData.x2Pixel;
                anchorY = connecteurData.y2Pixel;
                fallingXStart = connecteurData.x1Pixel;
                fallingYStart = connecteurData.y1Pixel;
            } else {
                anchorX = connecteurData.x1Pixel;
                anchorY = connecteurData.y1Pixel;
                fallingXStart = connecteurData.x2Pixel;
                fallingYStart = connecteurData.y2Pixel;
            }
            cableLength = Math.sqrt(Math.pow(fallingXStart - anchorX, 2) + Math.pow(fallingYStart - anchorY, 2));
        }
        console.log(`[DEBUG decrocherAvecVat] anchorX=${anchorX}, anchorY=${anchorY}, fallingXStart=${fallingXStart}, fallingYStart=${fallingYStart}`);
        this.animateDecrochage(connecteurData, path, circle, anchorX, anchorY, fallingXStart, fallingYStart, cableLength, direction);
    }
}

