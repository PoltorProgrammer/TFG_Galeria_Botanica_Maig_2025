/**
 * MAPA.JS - Mapa Botànica UAB Local
 * Sistema de filtres uniformitzat amb la galeria
 * CORREGIT: Comportament multi-selecció i feedback visual
 */

class MapaBotanica {
    constructor() {
        this.map = null;
        this.markers = null;
        this.totsElsMarcadors = [];
        this.habitatsLayers = {};
        this.habitatsVisible = true; // NOU: Controlar visibilitat dels hàbitats
        
        // FILTRES CORREGITS: Multi-selecció per tots excepte fullatge
        this.filtresActius = {
            tipus: 'tots',
            color: 'tots',
            floracio: 'tots',
            fullatge: 'tots',  // EXCLOENT
            usos: 'tots'
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
            this.addHabitatToggleControl(); // NOU: Afegir control d'hàbitats
            this.setupEventListeners();
            this.setupModal();
            this.initSearchFunctionality(); // NOU: Inicialitzar cerca millorada
            
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
        const colors = this.extractColors(plantes);
        const floracions = this.extractFloracions(plantes);
        const usos = this.extractUsos(plantes);
        const fullatges = this.extractFullatges(plantes);

        return `
            <div class="mapa-filtres">
                <div class="filtres-barra">
                    ${this.buildFilterGroup('tipus', 'Tipus', tipus, 'tipus-planta-filtre')}
                    ${this.buildFilterGroup('color', 'Colors', colors, 'colors-filtre')}
                    ${this.buildFilterGroup('floracio', 'Floració', floracions, 'floracio-filtre')}
                    ${this.buildFilterGroup('fullatge', 'Fullatge', fullatges, 'fullatge-filtre')}
                    ${this.buildFilterGroup('usos', 'Usos', usos, 'usos-filtre')}
                </div>
                
                <div class="filtres-actius-contenidor">
                    <span class="etiqueta-filtres-actius">Filtres actius:</span>
                    <div class="filtres-actius"></div>
                    <button class="netejar-filtres" style="display: none;">Netejar tots els filtres</button>
                </div>
                
                <div class="cerca-contenidor">
                    <div class="cerca-input-wrapper">
                        <input type="text" id="mapa-cerca" placeholder="Cercar per paraules clau..." class="cerca-input" />
                        <span class="cerca-clear" style="display: none;">&times;</span>
                    </div>
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
                        Tots
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
                    ${this.buildPopupField('Floració', planta.caracteristiques?.floracio)}
                    ${this.buildPopupField('Fullatge', planta.caracteristiques?.fullatge)}
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
     * AFEGIR CONTROL TOGGLE PER HÀBITATS - NOVA FUNCIONALITAT
     */
    addHabitatToggleControl() {
        // Afegir estils CSS per al control
        this.addHabitatControlStyles();
        
        // Crear control personalitzat per als hàbitats
        const HabitatControl = L.Control.extend({
            options: {
                position: 'topright'
            },
            
            onAdd: function(map) {
                const container = L.DomUtil.create('div', 'leaflet-control-habitat leaflet-bar');
                
                const button = L.DomUtil.create('a', 'leaflet-control-habitat-toggle', container);
                button.innerHTML = '🏞️'; // Icona de paisatge
                button.href = '#';
                button.title = 'Mostrar/Amagar zones d\'hàbitat';
                button.setAttribute('role', 'button');
                button.setAttribute('aria-label', 'Toggle habitat zones visibility');
                
                // Event per commutació
                L.DomEvent.on(button, 'click', function(e) {
                    L.DomEvent.stopPropagation(e);
                    L.DomEvent.preventDefault(e);
                    
                    // Accés a la instància del mapa a través del context
                    const mapaInstance = window.mapaBotanicaInstance;
                    if (mapaInstance) {
                        mapaInstance.toggleHabitats();
                        
                        // Actualitzar aparença del botó
                        if (mapaInstance.habitatsVisible) {
                            button.classList.remove('habitat-hidden');
                            button.title = 'Amagar zones d\'hàbitat';
                        } else {
                            button.classList.add('habitat-hidden');
                            button.title = 'Mostrar zones d\'hàbitat';
                        }
                    }
                });
                
                return container;
            }
        });
        
        // Afegir control al mapa i guardar referència a la instància
        new HabitatControl().addTo(this.map);
        window.mapaBotanicaInstance = this;
        
        console.log('✅ Control d\'hàbitats afegit');
    }

    /**
     * AFEGIR ESTILS CSS PER AL CONTROL D'HÀBITATS
     */
    addHabitatControlStyles() {
        const styles = `
            /* Control d'hàbitats */
            .leaflet-control-habitat {
                background: rgba(255, 255, 255, 0.95);
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 5px;
            }
            
            .leaflet-control-habitat-toggle {
                background: #fff;
                color: #333;
                display: block;
                width: 30px;
                height: 30px;
                line-height: 30px;
                text-align: center;
                text-decoration: none;
                font-size: 16px;
                border-radius: 4px;
                transition: all 0.2s ease;
                cursor: pointer;
                border: 1px solid rgba(0,0,0,0.1);
            }
            
            .leaflet-control-habitat-toggle:hover {
                background: #f0f0f0;
                transform: scale(1.05);
            }
            
            .leaflet-control-habitat-toggle.habitat-hidden {
                background: #666;
                color: #fff;
                opacity: 0.7;
            }
            
            .leaflet-control-habitat-toggle.habitat-hidden:hover {
                background: #555;
                opacity: 1;
            }
        `;
        
        // Afegir estils al document si no existeixen
        const styleId = 'habitat-control-styles';
        if (!document.getElementById(styleId)) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.id = styleId;
            styleSheet.innerHTML = styles;
            document.head.appendChild(styleSheet);
        }
    }

    /**
     * TOGGLE VISIBILITAT HÀBITATS - NOVA FUNCIONALITAT
     */
    toggleHabitats() {
        this.habitatsVisible = !this.habitatsVisible;
        
        console.log(`🏞️ ${this.habitatsVisible ? 'Mostrant' : 'Amagant'} hàbitats`);
        
        Object.values(this.habitatsLayers).forEach(layer => {
            if (this.habitatsVisible) {
                // Mostrar hàbitat
                if (!this.map.hasLayer(layer)) {
                    this.map.addLayer(layer);
                }
            } else {
                // Amagar hàbitat
                if (this.map.hasLayer(layer)) {
                    this.map.removeLayer(layer);
                }
            }
        });
        
        console.log(`📊 Hàbitats ara ${this.habitatsVisible ? 'visibles' : 'amagats'}`);
    }

    /**
     * INICIALITZAR FUNCIONALITAT DE CERCA MILLORADA - NOVA FUNCIONALITAT
     */
    initSearchFunctionality() {
        const searchInput = document.getElementById('mapa-cerca');
        const clearButton = document.querySelector('.mapa-filtres .cerca-clear');
        
        if (!searchInput || !clearButton) {
            console.warn('Elements de cerca no trobats per inicialització millorada');
            return;
        }
        
        // Event de input per actualitzar creueta
        searchInput.addEventListener('input', () => {
            this.updateSearchClearButton();
            this.aplicarFiltres();
        });
        
        // Event per netejar amb Enter
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearchInput();
            }
        });
        
        // Inicialitzar estat de la creueta
        this.updateSearchClearButton();
        
        console.log('🔍 Funcionalitat de cerca millorada inicialitzada');
    }
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
     * Setup event listeners CORREGIT AMB PREVENCIÓ D'INTERFERÈNCIES
     */
    setupEventListeners() {
        const container = document.getElementById('mapa-botanica-container');
        if (!container) {
            console.error('Container del mapa no trobat per als event listeners');
            return;
        }

        // Event delegation dins del contenidor
        container.addEventListener('click', (e) => {
            // Prevenir propagació múltiple
            e.stopPropagation();
            
            // Filtres de botons
            if (e.target.matches('.filtre-boto')) {
                console.log(`🎯 Event clic detectat en filtre: ${e.target.dataset.group}=${e.target.dataset.filtre}`);
                this.handleFilterClick(e.target);
                return;
            }
            
            // Eliminar filtre individual
            if (e.target.matches('.eliminar-filtre')) {
                console.log(`🗑️ Eliminant filtre individual`);
                this.handleRemoveFilter(e.target);
                return;
            }
            
            // Netejar tots els filtres
            if (e.target.matches('.netejar-filtres')) {
                console.log(`🧹 Netejant tots els filtres`);
                this.handleClearAllFilters();
                return;
            }
            
            // Netejar cerca - MILLORAT per selector específic
            if (e.target.matches('.mapa-filtres .cerca-clear')) {
                console.log(`🧹 Netejant cerca via creueta`);
                this.clearSearchInput();
                return;
            }
            
            // Veure detalls (des dels popups)
            if (e.target.matches('.boto-veure-detalls')) {
                e.preventDefault();
                this.handleOpenDetails(e.target);
                return;
            }
        });
        
        // Cerca - Event específic
        const searchInput = document.getElementById('mapa-cerca');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.updateSearchClearButton();
                this.aplicarFiltres();
            });
        }

        console.log('Event listeners del mapa configurats correctament');
    }

    /**
     * GESTIONAR CLIC EN FILTRE - SIMPLIFCAT I ROBUST
     */
    handleFilterClick(button) {
        const group = button.dataset.group;
        const value = button.dataset.filtre;
        
        console.log(`\n🔘 CLIC EN FILTRE: ${group} = ${value}`);
        
        // Debug estat abans
        this.debugGroupState(group);
        
        // PROCESAR EL CLIC SEGONS EL COMPORTAMENT DEL GRUP
        if (group === 'fullatge') {
            // FULLATGE: Comportament excloent
            this.handleExclusiveFilterSimple(button, group, value);
        } else {
            // ALTRES: Comportament multi-selecció
            this.handleMultiSelectFilterSimple(button, group, value);
        }
        
        // Debug estat després
        console.log(`⬇️ ESTAT DESPRÉS DE PROCESSAR:`);
        this.debugGroupState(group);
        
        // Actualitzar estat NOMÉS del grup modificat
        this.updateSingleGroupFilter(group);
        
        // Aplicar filtres i actualitzar interfície
        this.aplicarFiltres();
        this.mostrarFiltresActius();
        
        console.log(`📊 Estat final:`, JSON.stringify(this.filtresActius));
    }

    /**
     * GESTIÓ EXCLOENT SIMPLIFICADA (només fullatge)
     */
    handleExclusiveFilterSimple(button, group, value) {
        if (button.classList.contains('actiu') && value !== 'tots') {
            // Si ja està actiu i no és "tots", restablir a "tots"
            this.resetGroupToAll(group);
        } else {
            // Activar només aquest botó
            this.setOnlyActiveButton(group, value);
        }
    }

    /**
     * GESTIÓ MULTI-SELECCIÓ SIMPLIFICADA I ROBUSTA
     */
    handleMultiSelectFilterSimple(button, group, value) {
        if (value === 'tots') {
            // CLIC A "TOTS": Reset complet del grup
            console.log(`   🔄 Reset a "tots" per ${group}`);
            this.resetGroupToAll(group);
        } else {
            // CLIC A OPCIÓ ESPECÍFICA
            const wasActive = button.classList.contains('actiu');
            
            if (wasActive) {
                // DESACTIVAR aquesta opció
                console.log(`   ➖ Desactivant ${value}`);
                button.classList.remove('actiu');
                
                // Si no queden opcions, activar "tots"
                const remainingActive = document.querySelectorAll(
                    `.mapa-filtres .filtre-boto[data-group="${group}"].actiu:not([data-filtre="tots"])`
                );
                if (remainingActive.length === 0) {
                    console.log(`   🔄 No queden opcions a ${group}, activant "tots"`);
                    this.activateTotsButton(group);
                }
            } else {
                // ACTIVAR aquesta opció (sense tocar les altres)
                console.log(`   ➕ Activant ${value}`);
                
                // 1. Desactivar "tots" si estava actiu
                const totsButton = document.querySelector(
                    `.mapa-filtres .filtre-boto[data-group="${group}"][data-filtre="tots"]`
                );
                if (totsButton && totsButton.classList.contains('actiu')) {
                    console.log(`   🔄 Desactivant "tots" a ${group}`);
                    totsButton.classList.remove('actiu');
                }
                
                // 2. Activar aquest botó (SENSE tocar els altres)
                button.classList.add('actiu');
                
                // 3. Verificar auto-reinici
                const allButtons = document.querySelectorAll(
                    `.mapa-filtres .filtre-boto[data-group="${group}"]:not([data-filtre="tots"])`
                );
                const activeButtons = document.querySelectorAll(
                    `.mapa-filtres .filtre-boto[data-group="${group}"].actiu:not([data-filtre="tots"])`
                );
                
                if (allButtons.length === activeButtons.length) {
                    console.log(`   ⚡ Auto-reinici: totes les opcions de ${group} estan actives`);
                    this.resetGroupToAll(group);
                }
            }
        }
    }

    /**
     * GESTIONAR FILTRE EXCLOENT (només fullatge) - CORREGIT
     */
    handleExclusiveFilter(button, group, value) {
        if (button.classList.contains('actiu') && value !== 'tots') {
            // Si ja està actiu i no és "tots", restablir a "tots"
            this.resetGroupToAll(group);
        } else {
            // Activar només aquest botó
            this.setOnlyActiveButton(group, value);
        }
    }

    /**
     * GESTIONAR FILTRES MULTI-SELECCIÓ - CORREGIT PER PERMETRE MÚLTIPLES OPCIONS DEL MATEIX GRUP
     */
    handleMultiSelectFilter(button, group, value) {
        console.log(`📋 Multi-selecció dins de ${group}: ${value}`);
        
        if (value === 'tots') {
            // Si fem clic a "tots", desactivar tots els altres i activar només "tots"
            console.log(`   → Reset a "tots" per ${group}`);
            this.resetGroupToAll(group);
        } else {
            // Si fem clic en una opció específica
            if (button.classList.contains('actiu')) {
                // Si ja està actiu, desactivar NOMÉS aquest botó
                console.log(`   → Desactivant ${value} (ja estava actiu)`);
                button.classList.remove('actiu');
                
                // Si no queda cap opció activa, activar "tots"
                const activeSpecific = document.querySelectorAll(
                    `.mapa-filtres .filtre-boto[data-group="${group}"].actiu:not([data-filtre="tots"])`
                );
                if (activeSpecific.length === 0) {
                    console.log(`   → No queden opcions actives a ${group}, activant "tots"`);
                    this.activateTotsButton(group);
                }
            } else {
                // Si no està actiu, activar-lo SENSE tocar les altres opcions del grup
                console.log(`   → Activant ${value} (nou)`);
                button.classList.add('actiu');
                
                // Desactivar "tots" NOMÉS si estava actiu
                const totsButton = document.querySelector(
                    `.mapa-filtres .filtre-boto[data-group="${group}"][data-filtre="tots"]`
                );
                if (totsButton && totsButton.classList.contains('actiu')) {
                    console.log(`   → Desactivant "tots" a ${group}`);
                    totsButton.classList.remove('actiu');
                }
                
                // Verificar auto-reinici NOMÉS si cal
                const shouldAutoReset = this.checkAllOptionsSelected(group);
                if (shouldAutoReset) {
                    console.log(`   → Auto-reinici executat per ${group}`);
                    return; // Sortir aquí perquè l'auto-reinici ja ha gestionat tot
                }
            }
        }
        
        // Debug: mostrar estat actual dels botons del grup
        this.debugGroupState(group);
    }

    /**
     * DEBUG: Mostrar estat actual dels botons d'un grup
     */
    debugGroupState(group) {
        console.log(`🔍 Estat botons de ${group}:`);
        const allButtons = document.querySelectorAll(`.mapa-filtres .filtre-boto[data-group="${group}"]`);
        allButtons.forEach(btn => {
            const value = btn.dataset.filtre;
            const isActive = btn.classList.contains('actiu');
            console.log(`     ${value}: ${isActive ? '✅ ACTIU' : '❌ inactiu'}`);
        });
    }

    /**
     * VERIFICAR SI TOTES LES OPCIONS ESTAN SELECCIONADES - CORREGIT AMB MÉS CONTROL
     */
    /**
     * VERIFICAR SI TOTES LES OPCIONS ESTAN SELECCIONADES - CORREGIT AMB MÉS CONTROL
     */
    checkAllOptionsSelected(group) {
        const allButtons = document.querySelectorAll(
            `.mapa-filtres .filtre-boto[data-group="${group}"]:not([data-filtre="tots"])`
        );
        const activeButtons = document.querySelectorAll(
            `.mapa-filtres .filtre-boto[data-group="${group}"].actiu:not([data-filtre="tots"])`
        );
        
        console.log(`🔄 Check auto-reinici ${group}: ${activeButtons.length}/${allButtons.length} opcions actives`);
        
        // Només auto-reiniciar si TOTES les opcions específiques estan actives
        if (allButtons.length > 0 && allButtons.length === activeButtons.length) {
            console.log(`⚡ Auto-reinici: Totes les opcions de ${group} seleccionades - reiniciant a "tots"`);
            this.resetGroupToAll(group);
            return true;
        }
        
        console.log(`✋ No cal auto-reinici per ${group}`);
        return false;
    }

    /**
     * RESTABLIR GRUP A "TOTS" - NOVA FUNCIÓ
     */
    resetGroupToAll(group) {
        // Desactivar tots els botons del grup
        document.querySelectorAll(`.mapa-filtres .filtre-boto[data-group="${group}"]`)
            .forEach(btn => btn.classList.remove('actiu'));
        
        // Activar només "tots"
        this.activateTotsButton(group);
    }

    /**
     * ACTIVAR NOMÉS UN BOTÓ ESPECÍFIC - NOVA FUNCIÓ
     */
    setOnlyActiveButton(group, value) {
        // Desactivar tots els botons del grup
        document.querySelectorAll(`.mapa-filtres .filtre-boto[data-group="${group}"]`)
            .forEach(btn => btn.classList.remove('actiu'));
        
        // Activar només el botó especificat
        const targetButton = document.querySelector(
            `.mapa-filtres .filtre-boto[data-group="${group}"][data-filtre="${value}"]`
        );
        if (targetButton) {
            targetButton.classList.add('actiu');
        }
    }

    /**
     * ACTIVAR BOTÓ "TOTS" - NOVA FUNCIÓ
     */
    activateTotsButton(group) {
        const totsButton = document.querySelector(
            `.mapa-filtres .filtre-boto[data-group="${group}"][data-filtre="tots"]`
        );
        if (totsButton) {
            totsButton.classList.add('actiu');
        }
    }

    /**
     * ACTUALITZAR NOMÉS UN GRUP ESPECÍFIC - NOVA FUNCIÓ PER EVITAR INTERFERÈNCIES
     */
    updateSingleGroupFilter(grup) {
        if (grup === 'fullatge') {
            // Comportament excloent - només llegir l'estat actual
            const activeButton = document.querySelector(
                `.mapa-filtres .filtre-boto[data-group="${grup}"].actiu`
            );
            this.filtresActius[grup] = activeButton?.dataset.filtre || 'tots';
        } else {
            // Comportament multi-selecció - només llegir l'estat actual
            const totsButton = document.querySelector(
                `.mapa-filtres .filtre-boto[data-group="${grup}"][data-filtre="tots"]`
            );
            
            if (totsButton && totsButton.classList.contains('actiu')) {
                // Si "tots" està actiu
                this.filtresActius[grup] = 'tots';
            } else {
                // Recollir totes les opcions específiques actives
                const activeButtons = document.querySelectorAll(
                    `.mapa-filtres .filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`
                );
                
                if (activeButtons.length === 0) {
                    // Si no hi ha cap opció activa, establir a "tots" NOMÉS EN MEMÒRIA
                    this.filtresActius[grup] = 'tots';
                } else {
                    // Crear array amb totes les opcions actives
                    const values = Array.from(activeButtons).map(btn => btn.dataset.filtre);
                    this.filtresActius[grup] = values;
                }
            }
        }
    }

    /**
     * ACTUALITZAR FILTRES ACTIUS - NOMÉS LECTURA DE L'ESTAT ACTUAL
     */
    updateActiveFilters() {
        ['tipus', 'color', 'floracio', 'fullatge', 'usos'].forEach(grup => {
            if (grup === 'fullatge') {
                // Comportament excloent - només llegir l'estat actual
                const activeButton = document.querySelector(
                    `.mapa-filtres .filtre-boto[data-group="${grup}"].actiu`
                );
                this.filtresActius[grup] = activeButton?.dataset.filtre || 'tots';
            } else {
                // Comportament multi-selecció - només llegir l'estat actual
                const totsButton = document.querySelector(
                    `.mapa-filtres .filtre-boto[data-group="${grup}"][data-filtre="tots"]`
                );
                
                if (totsButton && totsButton.classList.contains('actiu')) {
                    // Si "tots" està actiu
                    this.filtresActius[grup] = 'tots';
                } else {
                    // Recollir totes les opcions específiques actives
                    const activeButtons = document.querySelectorAll(
                        `.mapa-filtres .filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`
                    );
                    
                    if (activeButtons.length === 0) {
                        // Si no hi ha cap opció activa, establir a "tots" NOMÉS EN MEMÒRIA
                        // NO modificar l'estat visual aquí
                        this.filtresActius[grup] = 'tots';
                    } else {
                        // Crear array amb totes les opcions actives
                        const values = Array.from(activeButtons).map(btn => btn.dataset.filtre);
                        this.filtresActius[grup] = values;
                    }
                }
            }
        });
    }

    /**
     * Aplicar filtres - SENSE CANVIS MAJORS
     */
    aplicarFiltres() {
        this.markers.clearLayers();
        
        const textCerca = this.safeString(document.getElementById('mapa-cerca')?.value || '').toLowerCase().trim();
        let comptadorVisible = 0;
        
        this.totsElsMarcadors.forEach(marker => {
            if (!marker.plantaData) return;
            
            const planta = marker.plantaData;
            let passaFiltres = true;
            
            // Aplicar cada filtre
            Object.entries(this.filtresActius).forEach(([grup, valors]) => {
                if (valors !== 'tots' && passaFiltres) {
                    passaFiltres = this.checkFilter(planta, grup, valors);
                }
            });
            
            // Filtre de cerca
            if (passaFiltres && textCerca) {
                const infoCompleta = (planta.info_completa || '').toLowerCase();
                passaFiltres = infoCompleta.includes(textCerca);
            }
            
            if (passaFiltres) {
                this.markers.addLayer(marker);
                comptadorVisible++;
            }
        });
        
        console.log(`Filtres aplicats: ${comptadorVisible} marcadors visibles`);
    }

    /**
     * Comprovar filtre individual - CORREGIT per arrays
     */
    checkFilter(planta, grup, valors) {
        const valorsArray = Array.isArray(valors) ? valors : [valors];
        
        switch (grup) {
            case 'tipus':
                // Per tipus: la planta ha de coincidir amb QUALSEVOL dels valors seleccionats
                return valorsArray.includes(planta.tipus);
                
            case 'color':
                // Per colors: la planta ha de tenir ALGUN dels colors seleccionats
                return valorsArray.some(color => 
                    (planta.colors_norm || []).includes(color)
                );
                
            case 'floracio':
                // Per floració: la planta ha de tenir ALGUNA de les floracions seleccionades
                return valorsArray.some(floracio => 
                    (planta.floracio_norm || []).includes(floracio)
                );
                
            case 'usos':
                // Per usos: la planta ha de tenir ALGUN dels usos seleccionats
                return valorsArray.some(us => 
                    (planta.usos_norm || []).includes(us)
                );
                
            case 'fullatge':
                // Per fullatge: comportament excloent (valor únic)
                return valorsArray.includes(planta.caracteristiques?.fullatge);
                
            default:
                return true;
        }
    }

    /**
     * Mostrar filtres actius - CORREGIT
     */
    mostrarFiltresActius() {
        const container = document.querySelector('.mapa-filtres .filtres-actius');
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
        
        const clearButton = document.querySelector('.mapa-filtres .netejar-filtres');
        if (clearButton) {
            clearButton.style.display = hiHaFiltresActius ? 'block' : 'none';
        }
    }

    /**
     * Gestionar eliminació de filtre individual - CORREGIT
     */
    handleRemoveFilter(element) {
        const etiqueta = element.parentElement;
        const grup = etiqueta.dataset.group;
        const valor = etiqueta.dataset.filtre;
        
        const button = document.querySelector(
            `.mapa-filtres .filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`
        );
        if (button) {
            button.classList.remove('actiu');
        }
        
        // Si no queden opcions actives del grup, activar "tots"
        const activeButtons = document.querySelectorAll(
            `.mapa-filtres .filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`
        );
        if (activeButtons.length === 0) {
            this.activateTotsButton(grup);
        }
        
        this.updateActiveFilters();
        this.aplicarFiltres();
        this.mostrarFiltresActius();
    }

    /**
     * Netejar tots els filtres - CORREGIT
     */
    handleClearAllFilters() {
        // Restablir tots els botons
        document.querySelectorAll('.mapa-filtres .filtre-boto').forEach(btn => btn.classList.remove('actiu'));
        document.querySelectorAll('.mapa-filtres .filtre-boto[data-filtre="tots"]').forEach(btn => btn.classList.add('actiu'));
        
        // Restablir objecte de filtres
        Object.keys(this.filtresActius).forEach(key => {
            this.filtresActius[key] = 'tots';
        });
        
        // Netejar cerca
        const searchInput = document.getElementById('mapa-cerca');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Actualitzar estat de cerca
        this.updateSearchClearButton();
        
        this.aplicarFiltres();
        this.mostrarFiltresActius();
        
        // Restablir estils d'hàbitats
        Object.values(this.habitatsLayers).forEach(layer => {
            layer.setStyle({ weight: 2, opacity: 0.7 });
        });
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
            formatCharacteristicText: (text) => {
                const corrections = {
                    'alçada': 'Alçada',
                    'altres_característiques_rellevants': 'Altres característiques rellevants',
                    'altres característiques rellevants': 'Altres característiques rellevants',
                    'floracio': 'Floració',
                    'fullatge': 'Fullatge'
                };
                
                const lowerText = text.toLowerCase().replace(/_/g, ' ');
                
                if (corrections[lowerText]) {
                    return corrections[lowerText];
                }
                
                return this.capitalizeWords(lowerText);
            },
            addDetailSection: (title, data, isList = false) => {
                if (!data || (Array.isArray(data) && data.length === 0)) return '';
                
                const values = Array.isArray(data) ? data : [data];
                let html = '';
                
                if (isList) {
                    html += `<div class="planta-seccio"><h4>${title}</h4><ul>`;
                    values.forEach(value => {
                        const valorComplet = String(value || '');
                        const valorFormatat = valorComplet.replace(/_/g, ' ');
                        html += `<li>${this.escapeHtml(valorFormatat)}</li>`;
                    });
                    html += '</ul></div>';
                } else {
                    const formattedValues = values.map(value => {
                        const valueStr = String(value || '');
                        const valorNet = valueStr.replace(/\s*\(.*?\)\s*/g, '').trim();
                        return this.capitalizeFirst(valorNet);
                    }).filter(v => v);
                    
                    if (formattedValues.length > 0) {
                        html += `
                            <div class="planta-seccio">
                                <h4>${title}</h4>
                                <p>${this.escapeHtml(formattedValues.join(', '))}</p>
                            </div>
                        `;
                    }
                }
                
                return html;
            },
            buildDetailsGallery: (imatges, planta) => {
                let galeriaHTML = '<div class="planta-galeria-completa">';
                
                // Imatge principal
                if (imatges.principal && imatges.principal !== null) {
                    const imgSrc = `dades/imatges/${imatges.principal}`;
                    const tipusLabel = imatges.principal_tipus !== 'general' ? 
                        `<span class="planta-tipus-imatge-detall">${this.capitalizeFirst(imatges.principal_tipus)}</span>` : '';
                    
                    galeriaHTML += `
                        <div class="planta-imatge-principal">
                            <img src="${imgSrc}" alt="${this.escapeHtml(planta.nom_comu)}" data-tipus="${imatges.principal_tipus}"
                                 onerror="this.parentElement.innerHTML='<div class=\\'planta-sense-imatge\\' style=\\'height:400px;\\'>Imatge no disponible</div>'">
                            ${tipusLabel}
                        </div>
                    `;
                } else {
                    galeriaHTML += `
                        <div class="planta-imatge-principal">
                            <div class="planta-sense-imatge" style="height:400px;">Imatge no disponible</div>
                        </div>
                    `;
                }
                
                // Imatges de detall
                if (imatges.detalls && imatges.detalls.length > 0) {
                    galeriaHTML += '<div class="planta-imatges-detall-galeria">';
                    
                    imatges.detalls.forEach((imatge, i) => {
                        if (imatge && imatge !== null) {
                            const imgSrc = `dades/imatges/${imatge}`;
                            const tipus = imatges.detalls_tipus[i] || 'general';
                            const tipusLabel = tipus !== 'general' ? 
                                `<span class="planta-tipus-imatge-detall">${this.capitalizeFirst(tipus)}</span>` : '';
                            
                            galeriaHTML += `
                                <div class="planta-imatge-detall" data-tipus="${tipus}">
                                    <img src="${imgSrc}" alt="Detall de ${this.escapeHtml(planta.nom_comu)}" data-tipus="${tipus}"
                                         onerror="this.parentElement.innerHTML='<div class=\\'planta-sense-imatge\\'>Imatge no disponible</div>'">
                                    ${tipusLabel}
                                </div>
                            `;
                        }
                    });
                    
                    galeriaHTML += '</div>';
                }
                
                galeriaHTML += '</div>';
                return galeriaHTML;
            },
            buildDetailsInfo: (planta) => {
                let infoHTML = '<div class="planta-info-completa">';
                
                // Descripció
                infoHTML += `
                    <div class="planta-seccio">
                        <h4>Descripció</h4>
                        <p>${this.escapeHtml(planta.descripcio)}</p>
                    </div>
                `;
                
                // Classificació
                infoHTML += `
                    <div class="planta-seccio">
                        <h4>Classificació</h4>
                        <p><strong>Família:</strong> ${this.escapeHtml(planta.familia)}</p>
                        <p><strong>Tipus:</strong> ${this.escapeHtml(this.capitalizeFirst(planta.tipus))}</p>
                    </div>
                `;
                
                // Característiques
                if (planta.caracteristiques) {
                    infoHTML += '<div class="planta-seccio"><h4>Característiques</h4><ul>';
                    
                    Object.entries(planta.caracteristiques).forEach(([clau, valor]) => {
                        const clauFormatada = tempGaleria.formatCharacteristicText(clau);
                        const valorFormatat = Array.isArray(valor) ? valor.join(', ') : valor;
                        infoHTML += `<li><strong>${clauFormatada}:</strong> ${this.escapeHtml(valorFormatat)}</li>`;
                    });
                    
                    infoHTML += '</ul></div>';
                }
                
                // Colors
                if (planta.colors && planta.colors.length > 0) {
                    infoHTML += tempGaleria.addDetailSection('Colors', planta.colors);
                }
                
                // Usos
                if (planta.usos && planta.usos.length > 0) {
                    infoHTML += tempGaleria.addDetailSection('Usos', planta.usos);
                }
                
                // Coordenades / Localització al campus
                if (planta.coordenades && planta.coordenades.length > 0) {
                    infoHTML += '<div class="planta-seccio">';
                    infoHTML += '<h4>Localització al campus</h4>';
                    infoHTML += '<ul>';
                    
                    planta.coordenades.forEach((coord) => {
                        infoHTML += `<li>${coord.lat}, ${coord.lng}`;
                        
                        const googleMapsUrl = `https://www.google.com/maps?q=${coord.lat},${coord.lng}`;
                        infoHTML += ` <a href="${googleMapsUrl}" target="_blank" class="coordenades-link">[Veure al mapa]</a>`;
                        infoHTML += `</li>`;
                    });
                    
                    infoHTML += '</ul></div>';
                }
                
                // Fonts / Referències
                if (planta.fonts && planta.fonts.length > 0) {
                    infoHTML += '<div class="planta-seccio">';
                    infoHTML += '<h4>Referències i fonts</h4>';
                    infoHTML += '<ul>';
                    
                    planta.fonts.forEach(font => {
                        if (font.startsWith('http')) {
                            infoHTML += `<li><a href="${this.escapeHtml(font)}" target="_blank" rel="noopener">${this.escapeHtml(font)}</a></li>`;
                        } else {
                            infoHTML += `<li>${this.escapeHtml(font)}</li>`;
                        }
                    });
                    
                    infoHTML += '</ul></div>';
                }
                
                infoHTML += '</div>';
                return infoHTML;
            }
        };
        
        const galeriaHTML = tempGaleria.buildDetailsGallery(imatges, planta);
        const infoHTML = tempGaleria.buildDetailsInfo(planta);
        
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
     * FUNCIONS D'UTILITAT
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

    extractColors(plantes) {
        const colors = new Set();
        plantes.forEach(planta => {
            if (planta.colors) {
                const plantaColors = Array.isArray(planta.colors) ? planta.colors : [planta.colors];
                plantaColors.forEach(color => {
                    const cleanColor = color.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                    if (cleanColor) colors.add(cleanColor);
                });
            }
        });
        
        return Array.from(colors).sort().map(color => ({
            key: color,
            display: this.capitalizeFirst(color)
        }));
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
            if (planta.caracteristiques?.fullatge) {
                fullatges.add(planta.caracteristiques.fullatge);
            }
        });
        
        return Array.from(fullatges).sort().map(fullatge => ({
            key: fullatge,
            display: this.capitalizeFirst(fullatge)
        }));
    }

    /**
     * NETEJAR CAMP DE CERCA - MILLORAT
     */
    clearSearchInput() {
        const searchInput = document.getElementById('mapa-cerca');
        if (searchInput) {
            console.log('🧹 Netejant camp de cerca');
            searchInput.value = '';
            searchInput.focus(); // Mantenir focus per UX millorada
            this.updateSearchClearButton();
            this.aplicarFiltres();
        }
    }

    /**
     * ACTUALITZAR VISIBILITAT CREUETA DE CERCA - MILLORAT
     */
    updateSearchClearButton() {
        const searchInput = document.getElementById('mapa-cerca');
        const clearButton = document.querySelector('.mapa-filtres .cerca-clear');
        
        if (searchInput && clearButton) {
            const hasText = searchInput.value.trim() !== '';
            
            clearButton.style.display = hasText ? 'block' : 'none';
            
            // Millorar accessibilitat
            if (hasText) {
                clearButton.setAttribute('aria-label', `Netejar cerca: "${searchInput.value}"`);
            } else {
                clearButton.removeAttribute('aria-label');
            }
            
            // Debug visual opcional
            // console.log(`🔍 Creueta de cerca: ${hasText ? 'visible' : 'amagada'}`);
        }
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
            color: 'Color',
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
