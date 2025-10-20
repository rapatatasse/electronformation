class DragDropManager {
    constructor() {
        this.draggedElement = null;
        this.originalParent = null;
        this.originalPosition = { x: 0, y: 0 };
        this.images = [];
        this.backgroundArea = document.getElementById('backgroundArea');
        this.resetBtn = document.getElementById('resetBtn');
        this.backgroundScale = 1; // Ratio d'échelle de l'image de fond
        
        // Système de connecteurs entre images
        this.connectorMode = false;
        this.disconnectorMode = false;
        this.firstSelectedImage = null;
        this.connectors = [];
        
        // Gestion des fonds d'écran
        this.currentBackgroundIndex = 1;
        this.maxBackgroundIndex = 1;
        this.backgroundImage = document.querySelector('.background-image');
        this.prevBgBtn = document.getElementById('prevBgBtn');
        this.nextBgBtn = document.getElementById('nextBgBtn');
        
        this.init();
    }
    

    async init() {
        await this.detectAvailableBackgrounds();
        this.calculateBackgroundScale();
        this.loadImages();
        this.setupEventListeners();
    }
    
    async detectAvailableBackgrounds() {
        // Détecter combien de fonds d'écran sont disponibles
        let index = 1;
        let foundMax = false;
        
        while (!foundMax && index <= 20) { // Limite à 20 pour éviter une boucle infinie
            const exists = await this.imageExists(`ImageFond/fond${index}.png`);
            if (exists) {
                this.maxBackgroundIndex = index;
                index++;
            } else {
                foundMax = true;
            }
        }
        
        console.log(`📁 ${this.maxBackgroundIndex} fond(s) d'écran détecté(s)`);
    }

    calculateBackgroundScale() {
        // Attendre que l'image de fond soit chargée pour calculer son ratio
        const backgroundImg = document.querySelector('.background-image');
        
        if (backgroundImg.complete) {
            this.computeScale(backgroundImg);
        } else {
            backgroundImg.addEventListener('load', () => {
                this.computeScale(backgroundImg);
            });
        }
    }

    computeScale(img) {
        // Dimensions naturelles de l'image
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        // Dimensions affichées de l'image
        const displayedHeight = img.offsetHeight;
        const displayedWidth = img.offsetWidth;
        
        // Calculer le ratio d'échelle (l'image de fond utilise height: 100%)
        this.backgroundScale = displayedHeight / naturalHeight;
        
        console.log(`📐 Ratio d'échelle de l'image de fond: ${this.backgroundScale.toFixed(4)}`);
        console.log(`   Dimensions naturelles: ${naturalWidth}x${naturalHeight}px`);
        console.log(`   Dimensions affichées: ${displayedWidth}x${displayedHeight}px`);
    }

    async loadImages() {
        // Charger les images depuis les dossiers ImagesZ1, Z2 (pas Z3)
        const zones = ['ImagesZ1', 'ImagesZ2'];
        
        for (let i = 0; i < zones.length; i++) {
            const zoneContainer = document.querySelector(`[data-zone="${i + 1}"]`);
            
            try {
                // Pour cette démo, nous allons créer des images d'exemple
                // En production, vous pourriez utiliser une API pour lister les fichiers
                await this.loadImagesFromFolder(zones[i], i + 1, zoneContainer);
            } catch (error) {
                console.log(`Pas d'images trouvées dans ${zones[i]}`);
            }
        }
        
        // Charger les actions dans la Zone 3
        this.loadActionsZone();
    }

    loadActionsZone() {
        const zone3Container = document.querySelector('[data-zone="3"]');
        
        // Zone 3 vide maintenant - plus de boutons connecter/déconnecter
        console.log('Zone 3 initialisée (vide)');
    }

    async loadImagesFromFolder(folderName, zoneNumber, container) {
        const foundImages = [];
        
        // Essayer de détecter automatiquement les images avec des noms courants
        const commonPatterns = [
            // Noms standards
            'image1', 'image2', 'image3', 'image4', 'image5',
            'img1', 'img2', 'img3', 'img4', 'img5',
            // Noms avec parenthèses (comme "image (1).png")
            'image (1)', 'image (2)', 'image (3)', 'image (4)', 'image (5)',
            'image (6)', 'image (7)', 'image (8)', 'image (9)', 'image (10)',
            'img (1)', 'img (2)', 'img (3)', 'img (4)', 'img (5)',
            // Noms personnalisés courants  
            'photo1', 'photo2', 'photo3', 'photo4', 'photo5',
            'element1', 'element2', 'element3', 'element4', 'element5',
            'piece1', 'piece2', 'piece3', 'piece4', 'piece5',
            'composant1', 'composant2', 'composant3',
            'schema1', 'schema2', 'schema3',
            // Noms sans numéro
            'image', 'img', 'photo', 'element', 'piece', 'composant', 'schema'
        ];
        
        const extensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        
        // Tester toutes les combinaisons
        for (const pattern of commonPatterns) {
            for (const ext of extensions) {
                const imagePath = `${folderName}/${pattern}.${ext}`;
                if (await this.imageExists(imagePath)) {
                    foundImages.push(imagePath);
                }
            }
        }

        // Si aucune image trouvée, créer des images d'exemple
        if (foundImages.length === 0) {
            this.createExampleImages(folderName, zoneNumber, container);
            console.log(`Aucune image trouvée dans ${folderName}. Images d'exemple créées.`);
            console.log(`💡 Pour utiliser vos propres images, nommez-les par exemple :`);
            console.log(`   - image1.jpg, image2.png, image3.gif`);
            console.log(`   - photo1.jpg, photo2.png`);
            console.log(`   - element1.jpg, piece1.png`);
            console.log(`   - ou tout autre nom avec les extensions : jpg, png, gif, webp, bmp, jpeg`);
        } else {
            foundImages.forEach(imagePath => {
                this.createDraggableImage(imagePath, container, zoneNumber);
            });
            console.log(`✅ ${foundImages.length} image(s) chargée(s) depuis ${folderName}:`, foundImages);
        }
    }

    imageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    createExampleImages(folderName, zoneNumber, container) {
        // Créer des images d'exemple colorées pour la démonstration
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        
        for (let i = 1; i <= 3; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 100;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            // Dessiner un carré coloré avec du texte
            ctx.fillStyle = colors[(zoneNumber - 1) * 2 + (i - 1)] || colors[0];
            ctx.fillRect(0, 0, 100, 100);
            
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Z${zoneNumber}-${i}`, 50, 55);
            
            // Convertir le canvas en image
            const dataURL = canvas.toDataURL();
            this.createDraggableImage(dataURL, container, zoneNumber, `Zone${zoneNumber}_Image${i}`);
        }
    }

    createDraggableImage(src, container, zoneNumber, altText = '') {
        const img = document.createElement('img');
        img.src = src;
        img.alt = altText || `Image Zone ${zoneNumber}`;
        img.className = 'draggable-image';
        img.draggable = true;
        
        // Stocker les informations de la zone d'origine
        img.dataset.originalZone = zoneNumber;
        img.dataset.imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Attendre le chargement de l'image pour stocker ses dimensions naturelles
        img.addEventListener('load', () => {
            img.dataset.naturalWidth = img.naturalWidth;
            img.dataset.naturalHeight = img.naturalHeight;
        });
        
        container.appendChild(img);
        this.images.push(img);
        
        this.setupImageEventListeners(img);
    }

    setupImageEventListeners(img) {
        // Événements de drag
        img.addEventListener('dragstart', (e) => this.handleDragStart(e));
        img.addEventListener('dragend', (e) => this.handleDragEnd(e));
        
        // Événements de souris pour le drag personnalisé
        img.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        
        // Plus besoin d'événement de clic
    }

    setupEventListeners() {
        // Événements pour la zone de fond
        this.backgroundArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.backgroundArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Événements pour toutes les zones en bas
        document.querySelectorAll('.zone').forEach((zone, index) => {
            zone.addEventListener('dragover', (e) => this.handleZoneDragOver(e));
            zone.addEventListener('drop', (e) => this.handleZoneDrop(e));
            zone.addEventListener('dragleave', (e) => this.handleZoneDragLeave(e));
        });
        
        // Événements pour les zone-images également
        document.querySelectorAll('.zone-images').forEach((zoneImages) => {
            zoneImages.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
            });
            zoneImages.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.draggedElement) {
                    this.moveImageToZone(this.draggedElement, zoneImages);
                }
            });
        });
        
        // Bouton reset
        this.resetBtn.addEventListener('click', () => this.resetAllImages());
        
        // Boutons de navigation des fonds
        this.prevBgBtn.addEventListener('click', () => this.previousBackground());
        this.nextBgBtn.addEventListener('click', () => this.nextBackground());
        
        // Événements globaux pour le drag à la souris
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Plus besoin de touche Échap pour les modes
        
        // Recalculer le ratio lors du redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.calculateBackgroundScale();
            this.updateAllImagesScale();
        });
    }

    updateAllImagesScale() {
        // Mettre à jour la taille de toutes les images déjà placées sur le fond
        const imagesOnBackground = this.backgroundArea.querySelectorAll('.draggable-image');
        imagesOnBackground.forEach(img => {
            const naturalWidth = parseFloat(img.dataset.naturalWidth) || img.naturalWidth;
            const naturalHeight = parseFloat(img.dataset.naturalHeight) || img.naturalHeight;
            
            const scaledWidth = naturalWidth * this.backgroundScale;
            const scaledHeight = naturalHeight * this.backgroundScale;
            
            img.style.width = scaledWidth + 'px';
            img.style.height = scaledHeight + 'px';
        });
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        this.originalParent = e.target.parentNode;
        
        if (e.target.parentNode.classList.contains('zone-images')) {
            // L'image vient d'une zone, stocker sa position relative
            this.originalPosition = { x: 0, y: 0 };
        } else {
            // L'image est dans la zone de fond, stocker sa position absolue
            this.originalPosition = {
                x: parseInt(e.target.style.left) || 0,
                y: parseInt(e.target.style.top) || 0
            };
        }
        
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
        this.originalParent = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e) {
        e.preventDefault();
        
        if (!this.draggedElement) return;
        
        // Calculer les dimensions mises à l'échelle de l'image
        const naturalWidth = parseFloat(this.draggedElement.dataset.naturalWidth) || this.draggedElement.naturalWidth;
        const naturalHeight = parseFloat(this.draggedElement.dataset.naturalHeight) || this.draggedElement.naturalHeight;
        const scaledWidth = naturalWidth * this.backgroundScale;
        const scaledHeight = naturalHeight * this.backgroundScale;
        
        // Calculer la position relative à la zone de fond
        const rect = this.backgroundArea.getBoundingClientRect();
        const x = e.clientX - rect.left - (scaledWidth / 2); // Centrer l'image
        const y = e.clientY - rect.top - (scaledHeight / 2);
        
        // S'assurer que l'image reste dans les limites
        const maxX = rect.width - scaledWidth;
        const maxY = rect.height - scaledHeight;
        
        const finalX = Math.max(0, Math.min(x, maxX));
        const finalY = Math.max(0, Math.min(y, maxY));
        
        // Vérifier si l'image vient de la Zone 2 (VAT)
        const isFromZone2 = this.draggedElement.dataset.originalZone === '2';
        const isNewPlacement = this.draggedElement.parentNode.classList.contains('zone-images');
        
        // Déplacer l'image vers la zone de fond
        this.moveImageToBackground(this.draggedElement, finalX, finalY);
        
        // Si c'est une image de Zone 2 et c'est un nouveau placement, créer la paire connectée
        if (isFromZone2 && isNewPlacement) {
            this.createConnectedPair(this.draggedElement, finalX, finalY);
        }
    }

    handleZoneDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'move';
    }

    handleZoneDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleZoneDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        
        if (!this.draggedElement) return;
        
        const zoneImages = e.currentTarget.querySelector('.zone-images');
        this.moveImageToZone(this.draggedElement, zoneImages);
    }

    // Gestion du drag à la souris (pour déplacer dans le fond uniquement)
    handleMouseDown(e) {
        if (e.button !== 0) return; // Seulement le clic gauche
        
        // Seulement si l'image est déjà sur le fond
        if (!e.target.parentNode.classList.contains('background-area')) return;
        
        this.draggedElement = e.target;
        this.originalParent = e.target.parentNode;
        this.originalPosition = {
            x: parseInt(e.target.style.left) || 0,
            y: parseInt(e.target.style.top) || 0
        };
        
        this.isDragging = true;
        this.dragOffset = {
            x: e.clientX - parseInt(e.target.style.left || 0),
            y: e.clientY - parseInt(e.target.style.top || 0)
        };
        
        e.target.classList.add('dragging');
        // Désactiver pointer-events pour permettre la détection de la zone en dessous
        e.target.style.pointerEvents = 'none';
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedElement) return;
        
        const rect = this.backgroundArea.getBoundingClientRect();
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Obtenir les dimensions actuelles de l'image
        const imgWidth = this.draggedElement.offsetWidth;
        const imgHeight = this.draggedElement.offsetHeight;
        
        // Limiter aux bordures de la zone de fond
        const maxX = rect.width - imgWidth;
        const maxY = rect.height - imgHeight;
        
        const finalX = Math.max(0, Math.min(x, maxX));
        const finalY = Math.max(0, Math.min(y, maxY));
        
        this.draggedElement.style.left = finalX + 'px';
        this.draggedElement.style.top = finalY + 'px';
        
        // Mettre à jour les connecteurs liés à cette image
        this.updateAllConnectors();
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            // Réactiver pointer-events
            this.draggedElement.style.pointerEvents = '';
            
            // Vérifier si la souris est au-dessus d'une zone
            const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
            const zone = elementAtPoint?.closest('.zone');
            
            if (zone) {
                // Trouver le conteneur zone-images de cette zone
                const zoneImages = zone.querySelector('.zone-images');
                if (zoneImages) {
                    // Déposer l'image dans la zone
                    this.moveImageToZone(this.draggedElement, zoneImages);
                }
            }
        }
        this.draggedElement = null;
    }

    moveImageToBackground(img, x, y) {
        // Retirer l'image de son parent actuel
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
        
        // Calculer la taille de l'image en fonction du ratio de l'image de fond
        const naturalWidth = parseFloat(img.dataset.naturalWidth) || img.naturalWidth;
        const naturalHeight = parseFloat(img.dataset.naturalHeight) || img.naturalHeight;
        
        const scaledWidth = naturalWidth * this.backgroundScale;
        const scaledHeight = naturalHeight * this.backgroundScale;
        
        // Ajouter à la zone de fond avec position absolue et taille mise à l'échelle
        img.style.position = 'absolute';
        img.style.left = x + 'px';
        img.style.top = y + 'px';
        img.style.width = scaledWidth + 'px';
        img.style.height = scaledHeight + 'px';
        img.style.zIndex = '10';
        
        console.log(`🖼️ Image placée avec ratio ${this.backgroundScale.toFixed(4)}: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}px`);
        
        this.backgroundArea.appendChild(img);
    }
    
    createConnectedPair(img1, x, y) {
        // Calculer 20vh en pixels
        const viewportHeight = window.innerHeight;
        const offsetY = viewportHeight * 0.20; // 20vh
        
        // Créer une copie de l'image
        const img2 = document.createElement('img');
        img2.src = img1.src;
        img2.alt = img1.alt;
        img2.className = 'draggable-image';
        img2.draggable = true;
        
        // Copier les données
        img2.dataset.originalZone = img1.dataset.originalZone;
        img2.dataset.imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        img2.dataset.naturalWidth = img1.dataset.naturalWidth;
        img2.dataset.naturalHeight = img1.dataset.naturalHeight;
        
        // Calculer la position de la deuxième image (en dessous)
        const img1Height = parseFloat(img1.style.height) || img1.offsetHeight;
        const y2 = y + img1Height + offsetY;
        
        // Placer la deuxième image
        this.moveImageToBackground(img2, x, y2);
        
        // Ajouter l'image à la liste
        this.images.push(img2);
        this.setupImageEventListeners(img2);
        
        // Créer le connecteur entre les deux images
        this.createConnectorBetweenImages(img1, img2);
        
        console.log(`✅ Paire connectée créée avec offset de ${offsetY.toFixed(0)}px (20vh)`);
    }

    moveImageToZone(img, zoneContainer) {
        // Retirer l'image de son parent actuel
        if (img.parentNode) {
            img.parentNode.removeChild(img);
        }
        
        // Supprimer tous les connecteurs liés à cette image
        const connectorsToDelete = this.connectors.filter(connector => 
            connector.img1 === img || connector.img2 === img
        );
        connectorsToDelete.forEach(connector => {
            this.deleteConnector(connector);
        });
        
        // Réinitialiser tous les styles
        img.style.position = '';
        img.style.left = '';
        img.style.top = '';
        img.style.width = '';
        img.style.height = '';
        img.style.zIndex = '';
        img.style.transform = '';
        img.style.pointerEvents = '';
        
        // Retirer toutes les classes spéciales
        img.classList.remove('disconnectable');
        img.classList.remove('dragging');
        img.classList.remove('selected');
        
        zoneContainer.appendChild(img);
        
        console.log('📦 Image replacée dans la zone');
    }

    // ========== GESTION DES CONNECTEURS ENTRE IMAGES ==========
    
    createConnectorBetweenImages(img1, img2) {
        // Vérifier que les deux images existent
        if (!img1 || !img2) {
            console.error('❌ Erreur: Images invalides pour créer un connecteur');
            return;
        }
        
        try {
            // Créer un SVG pour le connecteur
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'connector-line');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.pointerEvents = 'none';
            svg.style.zIndex = '5';
            
            // Utiliser un path au lieu d'une line pour créer une courbe
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke', '#27ae60');
            path.setAttribute('stroke-width', '3');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-linecap', 'round');
            
            svg.appendChild(path);
            
            const connectorData = {
                element: svg,
                path: path,
                img1: img1,
                img2: img2,
                id: `connector_${Date.now()}`
            };
            
            this.connectors.push(connectorData);
            this.backgroundArea.appendChild(svg);
            
            // Mettre à jour la position du connecteur
            this.updateConnectorPosition(connectorData);
            
            console.log('✅ Connecteur créé entre deux images (avec effet de gravité)');
        } catch (error) {
            console.error('❌ Erreur lors de la création du connecteur:', error);
        }
    }
    
    updateConnectorPosition(connectorData) {
        const img1 = connectorData.img1;
        const img2 = connectorData.img2;
        
        // Calculer le centre de chaque image
        const rect1 = img1.getBoundingClientRect();
        const rect2 = img2.getBoundingClientRect();
        const bgRect = this.backgroundArea.getBoundingClientRect();
        
        const x1 = rect1.left + rect1.width / 2 - bgRect.left;
        const y1 = rect1.top + rect1.height / 2 - bgRect.top;
        const x2 = rect2.left + rect2.width / 2 - bgRect.left;
        const y2 = rect2.top + rect2.height / 2 - bgRect.top;
        
        // Calculer le point de contrôle pour la courbe (effet de gravité)
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Calculer la distance entre les deux points
        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        
        // Ajouter 20% de longueur vers le bas (effet de gravité)
        const sag = distance * 0.60;
        
        // Point de contrôle pour la courbe quadratique
        const controlX = midX;
        const controlY = midY + sag;
        
        // Créer un path au lieu d'une line pour avoir une courbe
        const pathData = `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
        connectorData.path.setAttribute('d', pathData);
    }
    
    updateAllConnectors() {
        // Mettre à jour tous les connecteurs après déplacement d'images
        this.connectors.forEach(connector => {
            if (connector.img1 && connector.img2) {
                this.updateConnectorPosition(connector);
            }
        });
    }
    
    deleteConnector(connectorData) {
        // Retirer l'élément du DOM
        connectorData.element.remove();
        
        // Retirer du tableau
        const index = this.connectors.indexOf(connectorData);
        if (index > -1) {
            this.connectors.splice(index, 1);
        }
        
        console.log('🗑️ Connecteur supprimé');
    }

    resetAllImages() {
        // Créer une copie de la liste pour éviter les problèmes de modification pendant l'itération
        const imagesToProcess = [...this.images];
        const imagesToKeep = [];
        
        imagesToProcess.forEach(img => {
            const originalZone = img.dataset.originalZone;
            const zoneContainer = document.querySelector(`[data-zone="${originalZone}"]`);
            
            // Si l'image est sur le fond
            if (img.parentNode === this.backgroundArea) {
                // Vérifier si c'est une image dupliquée (créée automatiquement)
                // Les images dupliquées n'ont pas de correspondance dans les zones
                const isOriginalImage = zoneContainer && 
                    Array.from(zoneContainer.querySelectorAll('.draggable-image')).length === 0;
                
                if (zoneContainer) {
                    // Remettre l'image dans sa zone
                    this.moveImageToZone(img, zoneContainer);
                    imagesToKeep.push(img);
                } else {
                    // Image dupliquée - la supprimer
                    img.remove();
                }
            } else {
                // L'image est déjà dans une zone
                imagesToKeep.push(img);
            }
        });
        
        // Mettre à jour la liste des images
        this.images = imagesToKeep;
        
        // Supprimer tous les connecteurs
        this.connectors.forEach(connector => {
            connector.element.remove();
        });
        this.connectors = [];
        
        console.log('Toutes les images ont été remises dans leurs zones d\'origine');
        console.log('Tous les connecteurs ont été supprimés');
    }
    
    previousBackground() {
        if (this.maxBackgroundIndex <= 1) return; // Pas de navigation si un seul fond
        
        this.currentBackgroundIndex--;
        if (this.currentBackgroundIndex < 1) {
            this.currentBackgroundIndex = this.maxBackgroundIndex; // Boucler vers le dernier
        }
        
        this.changeBackground();
    }
    
    nextBackground() {
        if (this.maxBackgroundIndex <= 1) return; // Pas de navigation si un seul fond
        
        this.currentBackgroundIndex++;
        if (this.currentBackgroundIndex > this.maxBackgroundIndex) {
            this.currentBackgroundIndex = 1; // Boucler vers le premier
        }
        
        this.changeBackground();
    }
    
    changeBackground() {
        const newSrc = `ImageFond/fond${this.currentBackgroundIndex}.png`;
        this.backgroundImage.src = newSrc;
        
        // Recalculer le ratio après le changement d'image
        this.backgroundImage.addEventListener('load', () => {
            this.calculateBackgroundScale();
            this.updateAllImagesScale();
        }, { once: true });
        
        console.log(`🖼️ Fond d'écran changé: fond${this.currentBackgroundIndex}.png`);
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new DragDropManager();
});
