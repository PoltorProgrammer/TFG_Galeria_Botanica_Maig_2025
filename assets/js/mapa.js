/**
 * MAPA.JS - Mapa Botànica UAB Local
 * Adaptat de mapa-botanica.js per funcionar sense WordPress
 */

class MapaBotanica {
    constructor() {
        this.map = null;
        this.markers = null;
        this.totsElsMarcadors = [];
        this.habitatsLayers = {};
        this.filtresActius = {
            tipus: 'tots',
            habitat: 'tots',
            floracio: 'tots',
            usos: 'tots',
            fullatge: 'tots'
        };
        
        this.init();
    }

    async init() {
        console.log("Inicialitzant mapa botànica...");
        
        try {
            this.renderMapContainer();
            this.initializeMap();
            await this.loadMarkers();
            await this.loadHabitats();
            this.setupEventListeners();
            this.setupModal();
            
            console.log("Mapa inicialitzat correctament");
        } catch (error) {
            console.error("Error inicialitzant mapa:", error);
        }
    }

    /**
     * Renderitzar contenidor del mapa
     */
    renderMapContainer() {
        const container = document.getElementById('mapa-botanica-container');
        if (!container) {
            console.error("Container de mapa no trobat");
            return;
        }

        const html = this.buildMapHTML();
        container.innerHTML = html;
    }

    /**
     * Construir HTML del mapa
     */
    buildMapHTML() {
        const plantes = window.mb_vars?.dades_plantes || [];
        const filtersHTML = this.buildFiltersHTML(plantes);
        
        return `
            <div class="mapa-botanica-contenidor">
                ${filtersHTML}
                <div id="mapa-botanica" style="height: 600px;"></div>
            </div>
        `;
    }

    /**
     * Construir HTML dels filtres
     */
    buildFiltersHTML(plantes) {
        const tipus = this.extractUniqueValues(plantes, 'tipus');
        const habitats = this.extractHabitats(plantes);
        const floracions = this.extractFloracions(plantes);
        const usos = this.extractUsos(plantes);
        const fullatges = this.extractFullatges(plantes);

        return `
            <div class="mapa-filtres">
                <div class="filtres-grup">
                    ${this.buildFilterGroup('tipus', 'Tipus', tipus, 'tipus-planta-filtre')}
                    ${this.buildFilterGroup('habitat', 'Hàbitat', habitats, 'habitat-filtre')}
                    ${this.buildFilterGroup('floracio', 'Floració', floracions, 'floracio-filtre')}
                    ${this.buildFilterGroup('usos', 'Usos', usos, 'usos-filtre')}
                    ${this.buildFilterGroup('fullatge', 'Fullatge', fullatges, 'fullatge-filtre')}
                    
                    <div class="cerca-contenidor">
                        <input type="text" id="mapa-cerca" placeholder="Cercar per paraules clau..." class="cerca-input" />
                    </div>
                </div>
                
                <div class="filtres-actius-contenidor">
                    <span class="etiqueta-filtres-actius">Filtres actius:</span>
                    <div class="filtres-actius"></div>
                    <button class="netejar-filtres" style="display:none;">Netejar tots els filtres</button>
                </div>
            </div>
        `;
    }

    /**
     * Construir grup de filtres
     */
    buildFilterGroup(group, label, values, className) {
        const buttons = values.map(value => 
            `<button class="filtre-boto" data-group="${group}" data-filtre="${value.key}">${value.display}</button>`
        ).join('');

        return `
            <div class="grup-filtre ${className}">
                <span class="etiqueta-filtre">${label}:</span>
                <div class="botons-filtre">
                    <button class="filtre-boto actiu" data-group="${group}" data-filtre="tots">
                        ${group === 'fullatge' ? 'Tots' : 'Tots'}
                    </button>
                    ${buttons}
                </div>
            </div>
        `;
    }

    /**
     * Inicialitzar mapa Leaflet
     */
    initializeMap() {
        this.map = L.map('mapa-botanica').setView([41.50085, 2.09342], 16);

        // Capes base
        const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap | Flora UAB',
            maxZoom: 19,
        }).addTo(this.map);

        const baseSat = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            {
                attribution: 'Tiles © Esri',
                maxZoom: 19,
            }
        );

        L.control.layers({ 
            'Mapa': baseOSM, 
            'Satèl·lit': baseSat 
        }).addTo(this.map);

        // Cluster de marcadors
        this.markers = L.markerClusterGroup({
            maxClusterRadius: 50,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
        });

        this.map.addLayer(this.markers);
    }

    /**
     * Carregar marcadors
     */
    async loadMarkers() {
        const plantes = window.mb_vars?.dades_plantes || [];
        
        plantes.forEach((planta) => {
            if (!planta.coordenades || planta.coordenades.length === 0) return;
            
            planta.coordenades.forEach((coord) => {
                const marker = L.marker([coord.lat, coord.lng], { 
                    icon: this.crearIcona(planta.tipus) 
                });
                
                marker.bindPopup(this.crearPopup(planta));
                marker.plantaData = planta;
                
                this.markers.addLayer(marker);
                this.totsElsMarcadors.push(marker);
            });
        });

        console.log(`Carregats ${this.totsElsMarcadors.length} marcadors`);
    }

    /**
     * Crear icona personalitzada
     */
    crearIcona(tipus) {
        let emoji = '🌱', color = '#28a745';
        
        switch (tipus) {
            case 'arbre':
                emoji = '🌳';
                color = '#228b22';
                break;
            case 'arbust':
                emoji = '🌲';
                color = '#32cd32';
                break;
            case 'herba':
                emoji = '🌾';
                color = '#90ee90';
                break;
            case 'liana':
                emoji = '🌿';
                color = '#32cd32';
                break;
        }
        
        return L.divIcon({
            html: `<div class="marcador-planta" style="border-color:${color}">${emoji}</div>`,
            iconSize: [35, 35],
            iconAnchor: [17, 17],
            popupAnchor: [0, -20],
            className: '',
        });
    }

    /**
     * Crear popup
     */
    crearPopup(planta) {
        const plantaId = planta.id || this.sanitizeTitle(planta.nom_cientific);
        
        return `
            <div class="planta-popup">
                ${planta.imatge ? `<img src="${planta.imatge}" alt="${this.escapeHtml(planta.nom_comu)}" class="planta-popup-imatge">` : ''}
                <h3>${this.escapeHtml(planta.nom_comu)}</h3>
                <p class="nom-cientific">${this.escapeHtml(planta.nom_cientific)}</p>
                <div class="planta-popup-info">
                    <p><strong>Família:</strong> ${this.escapeHtml(planta.familia)}</p>
                    ${this.buildPopupField('Hàbitat', planta.habitat)}
                    ${this.buildPopupField('Floració', planta.floracio)}
                    ${this.buildPopupField('Fullatge', planta.fullatge)}
                </div>
                <a href="#" class="boto-veure-detalls" data-planta-id="${plantaId}" data-planta-nom="${this.escapeHtml(planta.nom_cientific)}">Veure detalls</a>
            </div>
        `;
    }

    /**
     * Construir camp del popup
     */
    buildPopupField(label, data) {
        if (!data || (Array.isArray(data) && data.length === 0)) return '';
        
        const value = Array.isArray(data) ? 
            data.map(item => this.formatVisual(item)).join(', ') :
            this.formatVisual(data);
        
        return `<p><strong>${label}:</strong> ${this.escapeHtml(value)}</p>`;
    }

    /**
     * Carregar hàbitats GeoJSON
     */
    async loadHabitats() {
        const geojsonData = window.mb_vars?.geojson_habitats || {};
        
        Object.entries(geojsonData).forEach(([id, data]) => {
            try {
                const layer = L.geoJSON(data, {
                    style: this.getHabitatStyle(id)
                });
                
                layer.eachLayer((feature) => {
                    feature.bindPopup(this.createHabitatPopup(id));
                });
                
                this.habitatsLayers[id] = layer;
                layer.addTo(this.map);
                
                console.log(`GeoJSON carregat: ${id}`);
            } catch (error) {
                console.error(`Error carregant GeoJSON ${id}:`, error);
            }
        });
    }

    /**
     * Obtenir estil d'hàbitat
     */
    getHabitatStyle(id) {
        const styles = {
            'cami_ho_chi_minh': { color: '#8BC34A', fillOpacity: 0.30 },
            'torrent_can_domenech': { color: '#03A9F4', fillOpacity: 0.3 },
            'camins': { color: '#795548', fillOpacity: 0.3 },
            'eix_central': { color: '#607D8B', fillOpacity: 0.3 },
            'purament_assolellades': { color: '#FFC107', fillOpacity: 0.3 },
            'vegetacio_ribera': { color: '#4CAF50', fillOpacity: 0.3 },
            'zones_ombrivoles': { color: '#673AB7', fillOpacity: 0.3 }
        };
        
        return {
            ...styles[id],
            weight: 2,
            opacity: 0.7,
            fillColor: styles[id]?.color || '#888888'
        };
    }

    /**
     * Crear popup d'hàbitat
     */
    createHabitatPopup(id) {
        const names = {
            'cami_ho_chi_minh': 'Camí de Ho Chi Minh',
            'torrent_can_domenech': 'Torrent de Can Domènech',
            'camins': 'Camins del campus',
            'eix_central': 'Eix central',
            'purament_assolellades': 'Zones assolellades',
            'vegetacio_ribera': 'Vegetació de ribera',
            'zones_ombrivoles': 'Zones ombrívoles'
        };
        
        const descriptions = {
            'cami_ho_chi_minh': 'Pas central del campus amb vegetació natural als seus marges.',
            'torrent_can_domenech': 'Zona de vegetació de ribera amb espècies adaptades a ambients humits.',
            'camins': 'Xarxa principal de camins que travessen el campus universitari.',
            'eix_central': 'Via principal que vertebra el campus.',
            'purament_assolellades': 'Àrees amb exposició directa al sol.',
            'vegetacio_ribera': 'Vegetació pròpia de les vores d\'aigua.',
            'zones_ombrivoles': 'Àrees amb ombra permanent.'
        };
        
        return `
            <div class="habitat-popup">
                <h3>${names[id] || id}</h3>
                <p>${descriptions[id] || 'Zona d\'hàbitat del campus.'}</p>
            </div>
        `;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filtres
        document.addEventListener('click', (e) => {
            if (e.target.matches('.mapa-botanica-contenidor .filtre-boto')) {
                this.handleFilterClick(e.target);
            }
            
            if (e.target.matches('.mapa-botanica-contenidor .eliminar-filtre')) {
                this.handleRemoveFilter(e.target);
            }
            
            if (e.target.matches('.mapa-botanica-contenidor .netejar-filtres')) {
                this.handleClearAllFilters();
            }
            
            if (e.target.matches('.boto-veure-detalls')) {
                e.preventDefault();
                this.handleOpenDetails(e.target);
            }
        });
        
        // Cerca
        const searchInput = document.getElementById('mapa-cerca');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.aplicarFiltres();
            });
        }
    }

    /**
     * Gestionar clic en filtre
     */
    handleFilterClick(button) {
        const group = button.dataset.group;
        const value = button.dataset.filtre;
        
        if (group === 'fullatge') {
            // Comportament excloent
            document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${group}"]`)
                .forEach(btn => btn.classList.remove('actiu'));
            button.classList.add('actiu');
            this.filtresActius[group] = value;
            
            this.updateActiveFilters();
            this.aplicarFiltres();
            this.mostrarFiltresActius();
            this.highlightHabitat(group, value);
        } else {
            // Comportament multi-selecció
            this.handleMultiSelectFilter(button, group, value);
            
            // Actualitzar filtres actius
            this.updateActiveFilters();
            
            // Verificar si s'ha fet auto-reinici
            const autoReiniciExecutat = this.verificarTotesOpcionsSeleccionades(group);
            
            // Només aplicar filtres si NO s'ha fet auto-reinici
            if (!autoReiniciExecutat) {
                this.aplicarFiltres();
                this.mostrarFiltresActius();
            }
            
            this.highlightHabitat(group, value);
        }
    }

    /**
     * Gestionar filtres multi-selecció
     */
    handleMultiSelectFilter(button, group, value) {
        if (button.classList.contains('actiu') && value !== 'tots') {
            button.classList.remove('actiu');
            
            const activeButtons = document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${group}"].actiu`);
            if (activeButtons.length === 0) {
                document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${group}"][data-filtre="tots"]`)
                    .classList.add('actiu');
            }
        } else {
            if (value === 'tots') {
                document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${group}"]`)
                    .forEach(btn => btn.classList.remove('actiu'));
                button.classList.add('actiu');
            } else {
                document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${group}"][data-filtre="tots"]`)
                    ?.classList.remove('actiu');
                button.classList.add('actiu');
                
                // NO verificar auto-reinici aquí - es farà des de handleFilterClick
                // per evitar problemes de timing
            }
        }
    }

    /**
     * Aplicar filtres
     */
    aplicarFiltres() {
        this.markers.clearLayers();
        
        const textCerca = this.safeString(document.getElementById('mapa-cerca')?.value || '').toLowerCase().trim();
        let comptadorVisible = 0;
        
        this.totsElsMarcadors.forEach(marker => {
            if (!marker.plantaData) return;
            
            const planta = marker.plantaData;
            let passaFiltres = true;
            
            // Aplicar filtres
            Object.entries(this.filtresActius).forEach(([grup, valors]) => {
                if (valors !== 'tots' && passaFiltres) {
                    passaFiltres = this.checkFilter(planta, grup, valors);
                }
            });
            
            // Filtre de cerca
            if (passaFiltres && textCerca) {
                const textPlanta = (planta.info_completa || '').toLowerCase();
                passaFiltres = textPlanta.includes(textCerca);
            }
            
            if (passaFiltres) {
                this.markers.addLayer(marker);
                comptadorVisible++;
            }
        });
        
        console.log(`Filtres aplicats: ${comptadorVisible} marcadors visibles`);
    }

    /**
     * Comprovar filtre individual
     */
    checkFilter(planta, grup, valors) {
        const valorsArray = Array.isArray(valors) ? valors : [valors];
        
        switch (grup) {
            case 'tipus':
                return valorsArray.includes(planta.tipus);
                
            case 'habitat':
                return valorsArray.some(habitat => 
                    (planta.habitat_norm || []).includes(habitat)
                );
                
            case 'floracio':
                return valorsArray.some(floracio => 
                    (planta.floracio_norm || []).includes(floracio)
                );
                
            case 'usos':
                return valorsArray.some(us => 
                    (planta.usos_norm || []).includes(us)
                );
                
            case 'fullatge':
                return valorsArray.includes(planta.fullatge);
                
            default:
                return true;
        }
    }

    /**
     * Destacar hàbitat
     */
    highlightHabitat(group, value) {
        // Restablir estils
        Object.values(this.habitatsLayers).forEach(layer => {
            layer.setStyle({ weight: 2, opacity: 0.7 });
        });
        
        // Destacar si és filtre d'hàbitat
        if (group === 'habitat' && value !== 'tots' && this.habitatsLayers[value]) {
            this.habitatsLayers[value].setStyle({ weight: 4, opacity: 1 });
        }
    }

    /**
     * Setup modal
     */
    setupModal() {
        const modal = document.querySelector('.planta-modal');
        const closeBtn = document.querySelector('.planta-modal-tancar');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.querySelector('.planta-modal.actiu')) {
                this.hideModal();
            }
        });
    }

    /**
     * Gestionar obertura de detalls
     */
    async handleOpenDetails(element) {
        const plantaId = element.dataset.plantaId;
        const plantaNom = element.dataset.plantaNom;
        
        try {
            const detalls = GaleriaBotanicaApp.obtenirDetallsPlanta(plantaId);
            
            if (!detalls) {
                throw new Error('Planta no trobada');
            }
            
            const modalContent = this.buildDetailsHTML(detalls.planta, detalls.imatges);
            
            const modalBody = document.querySelector('.planta-modal-cos');
            if (modalBody) {
                modalBody.innerHTML = modalContent;
            }
            
            this.showModal();
            this.activarLightbox();
            
            // Tancar popup del mapa
            this.map.closePopup();
            
        } catch (error) {
            console.error('Error carregant detalls:', error);
            this.showErrorInModal('Error carregant els detalls de la planta');
        }
    }

    /**
     * Construir HTML dels detalls (reutilitza la lògica de la galeria)
     */
    buildDetailsHTML(planta, imatges) {
        // Crear instància temporal de galeria per reutilitzar mètodes
        const tempGaleria = { 
            escapeHtml: this.escapeHtml.bind(this),
            capitalizeFirst: this.capitalizeFirst.bind(this),
            capitalizeWords: this.capitalizeWords.bind(this),
            addDetailSection: GaleriaBotanica.prototype.addDetailSection,
            buildDetailsGallery: GaleriaBotanica.prototype.buildDetailsGallery,
            buildDetailsInfo: GaleriaBotanica.prototype.buildDetailsInfo
        };
        
        const galeriaHTML = tempGaleria.buildDetailsGallery.call(tempGaleria, imatges, planta);
        const infoHTML = tempGaleria.buildDetailsInfo.call(tempGaleria, planta);
        
        return `
            <div class="planta-detall-individual">
                <h2>${this.escapeHtml(planta.nom_comu)}</h2>
                <h3 class="nom-cientific">${this.escapeHtml(planta.nom_cientific)}</h3>
                
                ${galeriaHTML}
                ${infoHTML}
            </div>
        `;
    }

    /**
     * Mostrar modal
     */
    showModal() {
        const modal = document.querySelector('.planta-modal');
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('actiu'), 10);
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Amagar modal
     */
    hideModal() {
        const modal = document.querySelector('.planta-modal');
        if (modal) {
            modal.classList.remove('actiu');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    /**
     * Activar lightbox (reutilitza la lògica de la galeria)
     */
    activarLightbox() {
        document.querySelectorAll('.planta-imatge-detall img, .planta-imatge-principal img').forEach(img => {
            img.addEventListener('click', () => {
                this.openLightbox(img.src, img.dataset.tipus || 'general');
            });
        });
    }

    /**
     * Obrir lightbox
     */
    openLightbox(imgSrc, tipus) {
        const lightbox = document.createElement('div');
        lightbox.className = 'planta-lightbox';
        lightbox.innerHTML = `
            <img src="${imgSrc}" alt="Imatge ampliada">
            <span class="planta-lightbox-tancar">&times;</span>
            ${tipus !== 'general' ? `<div class="planta-lightbox-tipus">${tipus}</div>` : ''}
        `;
        
        document.body.appendChild(lightbox);
        
        setTimeout(() => lightbox.classList.add('actiu'), 10);
        
        // Events de tancament
        lightbox.querySelector('.planta-lightbox-tancar').addEventListener('click', () => {
            this.closeLightbox(lightbox);
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox(lightbox);
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeLightbox(lightbox);
            }
        });
    }

    /**
     * Tancar lightbox
     */
    closeLightbox(lightbox) {
        lightbox.classList.remove('actiu');
        setTimeout(() => {
            if (lightbox.parentNode) {
                lightbox.parentNode.removeChild(lightbox);
            }
        }, 300);
    }

    /**
     * Funcions d'utilitat (similars a la galeria)
     */
    
    extractUniqueValues(plantes, field) {
        const values = new Set();
        plantes.forEach(planta => {
            if (planta[field]) {
                values.add(planta[field]);
            }
        });
        
        return Array.from(values).sort().map(value => ({
            key: value,
            display: this.capitalizeFirst(value)
        }));
    }

    extractHabitats(plantes) {
        const habitats = new Map();
        plantes.forEach(planta => {
            if (planta.habitat_norm) {
                planta.habitat_norm.forEach(habitat => {
                    if (!habitats.has(habitat)) {
                        habitats.set(habitat, this.capitalizeWords(habitat.replace(/_/g, ' ')));
                    }
                });
            }
        });
        
        return Array.from(habitats.entries())
            .sort(([,a], [,b]) => a.localeCompare(b))
            .map(([key, display]) => ({ key, display }));
    }

    extractFloracions(plantes) {
        const floracions = new Set();
        plantes.forEach(planta => {
            if (planta.floracio_norm) {
                planta.floracio_norm.forEach(floracio => {
                    floracions.add(floracio);
                });
            }
        });
        
        return Array.from(floracions).sort().map(floracio => ({
            key: floracio,
            display: this.capitalizeFirst(floracio)
        }));
    }

    extractUsos(plantes) {
        const usos = new Map();
        plantes.forEach(planta => {
            if (planta.usos_norm) {
                planta.usos_norm.forEach(us => {
                    if (!usos.has(us)) {
                        usos.set(us, this.capitalizeWords(us.replace(/_/g, ' ')));
                    }
                });
            }
        });
        
        return Array.from(usos.entries())
            .sort(([,a], [,b]) => a.localeCompare(b))
            .map(([key, display]) => ({ key, display }));
    }

    extractFullatges(plantes) {
        const fullatges = new Set();
        plantes.forEach(planta => {
            if (planta.fullatge) {
                fullatges.add(planta.fullatge);
            }
        });
        
        return Array.from(fullatges).sort().map(fullatge => ({
            key: fullatge,
            display: this.capitalizeFirst(fullatge)
        }));
    }

    updateActiveFilters() {
        ['tipus', 'habitat', 'floracio', 'usos', 'fullatge'].forEach(grup => {
            if (grup === 'fullatge') {
                const activeButton = document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu`);
                this.filtresActius[grup] = activeButton?.dataset.filtre || 'tots';
            } else {
                if (document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`).classList.contains('actiu')) {
                    this.filtresActius[grup] = 'tots';
                } else {
                    const activeButtons = document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                    if (activeButtons.length === 0) {
                        this.filtresActius[grup] = 'tots';
                    } else {
                        const values = Array.from(activeButtons).map(btn => btn.dataset.filtre);
                        this.filtresActius[grup] = values;
                    }
                }
            }
        });
    }

    verificarTotesOpcionsSeleccionades(grupFiltre) {
        if (grupFiltre === 'fullatge') return false;
        
        const allButtons = document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
        const activeButtons = document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
        
        // Si tots els botons estan actius (excepte "tots")
        if (allButtons.length > 0 && allButtons.length === activeButtons.length) {
            console.log(`Mapa: Totes les opcions del grup ${grupFiltre} estan seleccionades - reiniciant automàticament`);
            
            // Activar automàticament el botó "Tots"
            this.activarBotoTots(grupFiltre);
            
            // IMPORTANT: Forçar actualització immediata dels filtres actius
            this.updateActiveFilters();
            
            // Aplicar filtres immediatament per reflectir el canvi
            setTimeout(() => {
                this.aplicarFiltres();
            }, 5);
            
            // Actualitzar vista de filtres actius
            this.mostrarFiltresActius();
            
            return true;
        }
        
        return false;
    }

    activarBotoTots(grupFiltre) {
        document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${grupFiltre}"]`)
            .forEach(btn => btn.classList.remove('actiu'));
        document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`)
            .classList.add('actiu');
        this.filtresActius[grupFiltre] = 'tots';
    }

    mostrarFiltresActius() {
        const container = document.querySelector('.mapa-botanica-contenidor .filtres-actius');
        if (!container) return;
        
        container.innerHTML = '';
        let hiHaFiltresActius = false;
        
        Object.entries(this.filtresActius).forEach(([grup, valors]) => {
            if (valors !== 'tots') {
                hiHaFiltresActius = true;
                
                const grupText = this.getGroupLabel(grup);
                const valorsArray = Array.isArray(valors) ? valors : [valors];
                
                valorsArray.forEach(valor => {
                    if (valor) {
                        const valorText = this.capitalizeWords(valor.replace(/_/g, ' '));
                        const etiqueta = document.createElement('span');
                        etiqueta.className = 'filtre-actiu';
                        etiqueta.dataset.group = grup;
                        etiqueta.dataset.filtre = valor;
                        etiqueta.innerHTML = `${grupText}: ${valorText} <span class="eliminar-filtre">×</span>`;
                        container.appendChild(etiqueta);
                    }
                });
            }
        });
        
        const clearButton = document.querySelector('.mapa-botanica-contenidor .netejar-filtres');
        if (clearButton) {
            clearButton.style.display = hiHaFiltresActius ? 'block' : 'none';
        }
    }

    handleRemoveFilter(element) {
        const etiqueta = element.parentElement;
        const grup = etiqueta.dataset.group;
        const valor = etiqueta.dataset.filtre;
        
        const button = document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`);
        if (button) {
            button.classList.remove('actiu');
        }
        
        const activeButtons = document.querySelectorAll(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu`);
        if (activeButtons.length === 0) {
            document.querySelector(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`)
                .classList.add('actiu');
        }
        
        this.updateActiveFilters();
        this.aplicarFiltres();
        this.mostrarFiltresActius();
    }

    handleClearAllFilters() {
        document.querySelectorAll('.mapa-botanica-contenidor .filtre-boto').forEach(btn => btn.classList.remove('actiu'));
        document.querySelectorAll('.mapa-botanica-contenidor .filtre-boto[data-filtre="tots"]').forEach(btn => btn.classList.add('actiu'));
        
        Object.keys(this.filtresActius).forEach(key => {
            this.filtresActius[key] = 'tots';
        });
        
        const searchInput = document.getElementById('mapa-cerca');
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.aplicarFiltres();
        this.mostrarFiltresActius();
        
        // Restablir estils d'hàbitats
        Object.values(this.habitatsLayers).forEach(layer => {
            layer.setStyle({ weight: 2, opacity: 0.7 });
        });
    }

    showErrorInModal(message) {
        const modalBody = document.querySelector('.planta-modal-cos');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="planta-error">
                    <h3>Error</h3>
                    <p>${this.escapeHtml(message)}</p>
                </div>
            `;
        }
        this.showModal();
    }

    getGroupLabel(grup) {
        const labels = {
            tipus: 'Tipus',
            habitat: 'Hàbitat',
            floracio: 'Floració',
            usos: 'Usos',
            fullatge: 'Fullatge'
        };
        
        return labels[grup] || grup.charAt(0).toUpperCase() + grup.slice(1);
    }

    safeString(str) {
        if (str === undefined || str === null) return '';
        return String(str);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    formatVisual(text) {
        if (!text) return '';
        return String(text).replace(/_/g, ' ');
    }

    sanitizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '');
    }
}