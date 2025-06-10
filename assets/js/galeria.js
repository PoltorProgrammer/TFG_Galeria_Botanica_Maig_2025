/**
 * GALERIA.JS - Galeria Botànica UAB Local
 * Adaptat de galeria-botanica.js per funcionar sense WordPress
 */

class GaleriaBotanica {
    constructor() {
        this.modalObert = false;
        this.filtresActius = {
            tipus: 'tots',
            imatge: 'tots',
            color: 'tots',
            habitat: 'tots',
            floracio: 'tots',
            fullatge: 'tots',
            usos: 'tots'
        };
        
        this.init();
    }

    init() {
        console.log("Inicialitzant galeria botànica...");
        
        try {
            this.renderGallery();
            this.setupEventListeners();
            this.setupModal();
            this.setupSearch();
            
            console.log("Galeria inicialitzada correctament");
        } catch (error) {
            console.error("Error inicialitzant galeria:", error);
        }
    }

    /**
     * Renderitzar la galeria principal
     */
    renderGallery() {
        const container = document.getElementById('galeria-botanica-container');
        if (!container) {
            console.error("Container de galeria no trobat");
            return;
        }

        const plantes = window.gb_vars?.dades_plantes || [];
        if (plantes.length === 0) {
            container.innerHTML = '<div class="galeria-botanica-error">No s\'han trobat plantes a mostrar.</div>';
            return;
        }

        const html = this.buildGalleryHTML(plantes);
        container.innerHTML = html;
    }

    /**
     * Construir HTML de la galeria
     */
    buildGalleryHTML(plantes) {
        const filtersHTML = this.buildFiltersHTML(plantes);
        const gridHTML = this.buildGridHTML(plantes);
        
        return `
            <div class="galeria-botanica">
                ${filtersHTML}
                ${gridHTML}
            </div>
        `;
    }

    /**
     * Construir HTML dels filtres
     */
    buildFiltersHTML(plantes) {
        const tipus = this.extractUniqueValues(plantes, 'tipus');
        const colors = this.extractColors(plantes);
        const habitats = this.extractHabitats(plantes);
        const floracions = this.extractFloracions(plantes);
        const fullatges = this.extractFullatges(plantes);
        const usos = this.extractUsos(plantes);
        const tipusImatges = this.extractImageTypes(plantes);

        return `
            <div class="filtres-contenidor">
                <div class="filtres-barra">
                    ${this.buildFilterGroup('tipus', 'Tipus', tipus, 'tipus-planta-filtre')}
                    ${this.buildFilterGroup('imatge', 'Imatges', tipusImatges, 'tipus-imatge-filtre')}
                    ${this.buildFilterGroup('color', 'Colors', colors, 'colors-filtre')}
                    ${this.buildFilterGroup('habitat', 'Hàbitat', habitats, 'habitat-filtre')}
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
                    <input type="text" id="cerca-plantes" placeholder="Cercar per paraules clau..." class="cerca-input" />
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
                        ${group === 'imatge' ? 'Totes' : group === 'fullatge' ? 'Tots' : 'Tots'}
                    </button>
                    ${buttons}
                </div>
            </div>
        `;
    }

    /**
     * Construir HTML de la graella de plantes
     */
    buildGridHTML(plantes) {
        const plantesHTML = plantes.map(planta => this.buildPlantHTML(planta)).join('');
        
        return `<div class="plantes-grid">${plantesHTML}</div>`;
    }

    /**
     * Construir HTML d'una planta individual
     */
    buildPlantHTML(planta) {
        const imatges = window.galeriaBotanicaApp.obtenirImatgesPlanta(planta.nom_cientific);
        const plantaId = window.galeriaBotanicaApp.sanitizeTitle(planta.nom_cientific);
        const tipusImatgePrincipal = imatges.principal_tipus || 'general';
        
        // Preparar atributs de dades per filtres
        const dataAttrs = this.buildDataAttributes(planta, imatges);
        
        return `
            <div class="planta-item" ${dataAttrs} id="planta-${plantaId}">
                <div class="planta-imatge">
                    <a href="#" class="planta-obrir-detall" data-planta="${plantaId}">
                        ${this.buildImageHTML(imatges.principal, planta.nom_comu, tipusImatgePrincipal)}
                    </a>
                </div>
                
                <div class="planta-info">
                    <h3>${this.escapeHtml(planta.nom_comu)}</h3>
                    <p class="nom-cientific">${this.escapeHtml(planta.nom_cientific)}</p>
                    <p class="familia">Família: ${this.escapeHtml(planta.familia)}</p>
                </div>
                
                <div class="planta-boto-detalls">
                    <a href="#" class="planta-obrir-detall" data-planta="${plantaId}">Veure detalls</a>
                </div>
            </div>
        `;
    }

    /**
     * Construir HTML d'imatge
     */
    buildImageHTML(imatgePrincipal, nomComu, tipusImatge) {
        if (imatgePrincipal && imatgePrincipal !== null) {
            const imgSrc = `dades/imatges/${imatgePrincipal}`;
            
            // Assegurar-nos que només mostrem el tipus, no el nom del fitxer
            let tipusEtiqueta = '';
            if (tipusImatge && tipusImatge !== 'general') {
                // Netejar qualsevol text estrany i mostrar només el tipus
                const tipusNet = tipusImatge.toLowerCase()
                    .replace(/^.*_\d+_/, '') // Eliminar prefix com "reptans_00_"
                    .replace(/\.(jpg|jpeg|png|webp)$/i, '') // Eliminar extensió
                    .replace(/_/g, ' '); // Substituir guions baixos per espais
                
                if (tipusNet && tipusNet !== 'general') {
                    tipusEtiqueta = `<span class="planta-tipus-imatge">${this.capitalizeFirst(tipusNet)}</span>`;
                }
            }
            
            return `
                <img class="planta-imatge-principal" src="${imgSrc}" alt="${this.escapeHtml(nomComu)}" 
                     data-imatge-principal="${this.escapeHtml(imatgePrincipal)}"
                     onerror="this.parentElement.innerHTML='<div class=\\'planta-sense-imatge\\'>Imatge no disponible</div>'">
                ${tipusEtiqueta}
            `;
        } else {
            return '<div class="planta-sense-imatge">Imatge no disponible</div>';
        }
    }

    /**
     * Construir atributs de dades per filtres
     */
    buildDataAttributes(planta, imatges) {
        const attrs = [];
        
        // Tipus de planta
        attrs.push(`data-tipus="${planta.tipus}"`);
        
        // Tipus d'imatge
        attrs.push(`data-tipus-imatge="${imatges.principal_tipus || 'general'}"`);
        
        // Colors
        if (planta.colors) {
            const colors = this.normalizeForFilter(planta.colors);
            attrs.push(`data-colors="${colors}"`);
        }
        
        // Hàbitats
        if (planta.habitat) {
            const habitats = this.normalizeForFilter(planta.habitat);
            attrs.push(`data-habitats="${habitats}"`);
        }
        
        // Floració
        if (planta.caracteristiques?.floracio) {
            const floracio = this.normalizeForFilter(planta.caracteristiques.floracio);
            attrs.push(`data-floracio="${floracio}"`);
        }
        
        // Fullatge
        if (planta.caracteristiques?.fullatge) {
            attrs.push(`data-fullatge="${planta.caracteristiques.fullatge}"`);
        }
        
        // Usos
        if (planta.usos) {
            const usos = this.normalizeForFilter(planta.usos);
            attrs.push(`data-usos="${usos}"`);
        }
        
        // Informació completa per cerca
        const infoCompleta = window.galeriaBotanicaApp.buildSearchText(planta);
        attrs.push(`data-info-completa="${this.escapeHtml(infoCompleta)}"`);
        
        // Imatges JSON
        const imatgesJson = this.buildImagesJSON(imatges);
        attrs.push(`data-imatges='${this.escapeHtml(JSON.stringify(imatgesJson))}'`);
        
        return attrs.join(' ');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Filtres
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filtre-boto')) {
                this.handleFilterClick(e.target);
            }
            
            if (e.target.matches('.eliminar-filtre')) {
                this.handleRemoveFilter(e.target);
            }
            
            if (e.target.matches('.netejar-filtres')) {
                this.handleClearAllFilters();
            }
            
            if (e.target.matches('.planta-obrir-detall')) {
                e.preventDefault();
                this.handleOpenDetails(e.target);
            }
        });
        
        // Cerca
        const cercaInput = document.getElementById('cerca-plantes');
        if (cercaInput) {
            cercaInput.addEventListener('input', () => {
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
        
        if (group === 'imatge' || group === 'fullatge') {
            // Comportament excloent
            document.querySelectorAll(`.filtre-boto[data-group="${group}"]`)
                .forEach(btn => btn.classList.remove('actiu'));
            button.classList.add('actiu');
            this.filtresActius[group] = value;
            
            if (group === 'imatge') {
                this.aplicarCanviImatges(value);
            }
            
            this.updateActiveFilters();
            this.aplicarFiltres();
            this.mostrarFiltresActius();
        } else {
            // Comportament multi-selecció
            this.handleMultiSelectFilter(button, group, value);
            
            // Actualitzar filtres actius
            this.updateActiveFilters();
            
            // Verificar si s'ha fet auto-reinici
            const autoReiniciExecutat = this.verificarTotesOpcionsSeleccionades(group);
            
            // Només aplicar filtres si NO s'ha fet auto-reinici
            // (perquè l'auto-reinici ja aplica els filtres)
            if (!autoReiniciExecutat) {
                this.aplicarFiltres();
                this.mostrarFiltresActius();
            }
        }
    }

    /**
     * Gestionar filtres multi-selecció
     */
    handleMultiSelectFilter(button, group, value) {
        if (button.classList.contains('actiu') && value !== 'tots') {
            button.classList.remove('actiu');
            
            // Si no queda cap actiu, activar "tots"
            const activeButtons = document.querySelectorAll(`.filtre-boto[data-group="${group}"].actiu`);
            if (activeButtons.length === 0) {
                document.querySelector(`.filtre-boto[data-group="${group}"][data-filtre="tots"]`)
                    .classList.add('actiu');
            }
        } else {
            if (value === 'tots') {
                // Desactivar tots i activar només "tots"
                document.querySelectorAll(`.filtre-boto[data-group="${group}"]`)
                    .forEach(btn => btn.classList.remove('actiu'));
                button.classList.add('actiu');
            } else {
                // Desactivar "tots" i activar aquest
                document.querySelector(`.filtre-boto[data-group="${group}"][data-filtre="tots"]`)
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
        const plantItems = document.querySelectorAll('.planta-item');
        const textCerca = this.safeString(document.getElementById('cerca-plantes')?.value || '').toLowerCase().trim();
        
        let plantesVisibles = 0;
        
        plantItems.forEach(planta => {
            let passaFiltres = true;
            
            // Aplicar cada filtre
            Object.entries(this.filtresActius).forEach(([grup, valors]) => {
                if (valors !== 'tots' && passaFiltres) {
                    passaFiltres = this.checkFilter(planta, grup, valors);
                }
            });
            
            // Filtre de cerca
            if (passaFiltres && textCerca) {
                const infoCompleta = planta.dataset.infoCompleta || '';
                passaFiltres = infoCompleta.toLowerCase().includes(textCerca);
            }
            
            // Mostrar/amagar planta
            if (passaFiltres) {
                planta.style.display = 'block';
                plantesVisibles++;
            } else {
                planta.style.display = 'none';
            }
        });
        
        console.log(`Filtres aplicats: ${plantesVisibles} plantes visibles`);
    }

    /**
     * Obrir detalls de planta
     */
    async handleOpenDetails(element) {
        const plantaId = element.dataset.planta;
        
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
            
        } catch (error) {
            console.error('Error carregant detalls:', error);
            this.showErrorInModal('Error carregant els detalls de la planta');
        }
    }

    /**
     * Construir HTML dels detalls
     */
    buildDetailsHTML(planta, imatges) {
        const galeriaHTML = this.buildDetailsGallery(imatges, planta);
        const infoHTML = this.buildDetailsInfo(planta);
        
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
            if (e.key === 'Escape' && this.modalObert) {
                this.hideModal();
            }
        });
    }

    /**
     * Mostrar modal
     */
    showModal() {
        const modal = document.querySelector('.planta-modal');
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('actiu'), 10);
            this.modalObert = true;
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
            this.modalObert = false;
        }
    }

    /**
     * Funcions d'utilitat
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

    extractHabitats(plantes) {
        const habitats = new Map();
        plantes.forEach(planta => {
            if (planta.habitat) {
                const plantaHabitats = Array.isArray(planta.habitat) ? planta.habitat : [planta.habitat];
                plantaHabitats.forEach(habitat => {
                    const cleanHabitat = habitat.replace(/\s*\(.*?\)\s*/g, '').trim();
                    const key = cleanHabitat.toLowerCase().replace(/\s+/g, '_');
                    if (!habitats.has(key)) {
                        habitats.set(key, cleanHabitat);
                    }
                });
            }
        });
        
        return Array.from(habitats.entries())
            .sort(([,a], [,b]) => a.localeCompare(b))
            .map(([key, display]) => ({
                key: key,
                display: this.capitalizeWords(display.replace(/_/g, ' '))
            }));
    }

    extractFloracions(plantes) {
        const floracions = new Set();
        plantes.forEach(planta => {
            if (planta.caracteristiques?.floracio) {
                const plantaFloracions = Array.isArray(planta.caracteristiques.floracio) ? 
                    planta.caracteristiques.floracio : [planta.caracteristiques.floracio];
                plantaFloracions.forEach(floracio => {
                    const cleanFloracio = floracio.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                    if (cleanFloracio) floracions.add(cleanFloracio);
                });
            }
        });
        
        return Array.from(floracions).sort().map(floracio => ({
            key: floracio,
            display: this.capitalizeFirst(floracio)
        }));
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

    extractUsos(plantes) {
        const usos = new Map();
        plantes.forEach(planta => {
            if (planta.usos) {
                const plantaUsos = Array.isArray(planta.usos) ? planta.usos : [planta.usos];
                plantaUsos.forEach(us => {
                    const cleanUs = us.replace(/\s*\(.*?\)\s*/g, '').trim();
                    const key = cleanUs.toLowerCase().replace(/\s+/g, '_');
                    if (!usos.has(key)) {
                        usos.set(key, cleanUs);
                    }
                });
            }
        });
        
        return Array.from(usos.entries())
            .sort(([,a], [,b]) => a.localeCompare(b))
            .map(([key, display]) => ({
                key: key,
                display: this.capitalizeFirst(display)
            }));
    }

    extractImageTypes(plantes) {
        const tipus = new Set();
        plantes.forEach(planta => {
            const imatges = window.galeriaBotanicaApp?.obtenirImatgesPlanta(planta.nom_cientific);
            if (imatges) {
                if (imatges.principal_tipus && 
                    imatges.principal_tipus !== 'general' && 
                    imatges.principal_tipus !== 'altre') {
                    tipus.add(imatges.principal_tipus);
                }
                if (imatges.detalls_tipus) {
                    imatges.detalls_tipus.forEach(tipusImatge => {
                        if (tipusImatge !== 'general' && tipusImatge !== 'altre') {
                            tipus.add(tipusImatge);
                        }
                    });
                }
            }
        });
        
        return Array.from(tipus).sort().map(tipus => ({
            key: tipus,
            display: this.capitalizeFirst(tipus)
        }));
    }

    // ... (continuar amb la resta de mètodes d'utilitat)

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

    /**
     * Capitalitzar paraules evitant errors específics
     */
    capitalizeWords(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Formatear text de característiques amb correccions específiques
     */
    formatCharacteristicText(text) {
        // Correccions específiques per evitar errors de capitalització
        const corrections = {
            'alçada': 'Alçada',
            'altres_característiques_rellevants': 'Altres característiques rellevants',
            'altres característiques rellevants': 'Altres característiques rellevants',
            'floracio': 'Floració',
            'fullatge': 'Fullatge'
        };
        
        const lowerText = text.toLowerCase().replace(/_/g, ' ');
        
        // Verificar si tenim una correcció específica
        if (corrections[lowerText]) {
            return corrections[lowerText];
        }
        
        // Si no, aplicar capitalització normal
        return this.capitalizeWords(lowerText);
    }

    normalizeForFilter(data) {
        const array = Array.isArray(data) ? data : [data];
        return array.map(item => 
            item.replace(/\s*\(.*?\)\s*/g, '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '_')
        ).join(' ');
    }

    /**
     * Actualitzar objecte de filtres actius
     */
    updateActiveFilters() {
        ['tipus', 'imatge', 'color', 'habitat', 'floracio', 'fullatge', 'usos'].forEach(grup => {
            if (grup === 'imatge' || grup === 'fullatge') {
                // Comportament excloent
                const activeButton = document.querySelector(`.filtre-boto[data-group="${grup}"].actiu`);
                this.filtresActius[grup] = activeButton?.dataset.filtre || 'tots';
            } else {
                // Comportament multi-selecció
                if (document.querySelector(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`).classList.contains('actiu')) {
                    this.filtresActius[grup] = 'tots';
                } else {
                    const activeButtons = document.querySelectorAll(`.filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
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

    /**
     * Verificar si totes les opcions estan seleccionades i auto-reiniciar
     */
    verificarTotesOpcionsSeleccionades(grupFiltre) {
        if (grupFiltre === 'imatge' || grupFiltre === 'fullatge') {
            return false;
        }
        
        const allButtons = document.querySelectorAll(`.filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
        const activeButtons = document.querySelectorAll(`.filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
        
        // Si tots els botons estan actius (excepte "tots")
        if (allButtons.length > 0 && allButtons.length === activeButtons.length) {
            console.log(`Totes les opcions del grup ${grupFiltre} estan seleccionades - reiniciant automàticament`);
            
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

    /**
     * Activar botó "Tots"
     */
    activarBotoTots(grupFiltre) {
        document.querySelectorAll(`.filtre-boto[data-group="${grupFiltre}"]`)
            .forEach(btn => btn.classList.remove('actiu'));
        document.querySelector(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`)
            .classList.add('actiu');
        this.filtresActius[grupFiltre] = 'tots';
    }

    /**
     * Mostrar filtres actius
     */
    mostrarFiltresActius() {
        const container = document.querySelector('.filtres-actius');
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
        
        // Mostrar/amagar botó de neteja
        const clearButton = document.querySelector('.netejar-filtres');
        if (clearButton) {
            clearButton.style.display = hiHaFiltresActius ? 'block' : 'none';
        }
    }

    /**
     * Gestionar eliminació de filtre individual
     */
    handleRemoveFilter(element) {
        const etiqueta = element.parentElement;
        const grup = etiqueta.dataset.group;
        const valor = etiqueta.dataset.filtre;
        
        // Desactivar el botó corresponent
        const button = document.querySelector(`.filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`);
        if (button) {
            button.classList.remove('actiu');
        }
        
        // Si no queden filtres actius, activar "tots"
        const activeButtons = document.querySelectorAll(`.filtre-boto[data-group="${grup}"].actiu`);
        if (activeButtons.length === 0) {
            document.querySelector(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`)
                .classList.add('actiu');
        }
        
        this.updateActiveFilters();
        this.aplicarFiltres();
        this.mostrarFiltresActius();
    }

    /**
     * Netejar tots els filtres
     */
    handleClearAllFilters() {
        // Restablir tots els botons
        document.querySelectorAll('.filtre-boto').forEach(btn => btn.classList.remove('actiu'));
        document.querySelectorAll('.filtre-boto[data-filtre="tots"]').forEach(btn => btn.classList.add('actiu'));
        
        // Restablir objecte de filtres
        Object.keys(this.filtresActius).forEach(key => {
            this.filtresActius[key] = 'tots';
        });
        
        // Netejar cerca
        const searchInput = document.getElementById('cerca-plantes');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Restaurar imatges originals
        this.aplicarCanviImatges('tots');
        
        // Aplicar filtres i actualitzar vista
        this.aplicarFiltres();
        this.mostrarFiltresActius();
    }

    /**
     * Aplicar canvi d'imatges segons filtre
     */
    aplicarCanviImatges(tipusImatge) {
        document.querySelectorAll('.planta-item').forEach(planta => {
            const imatgesData = planta.dataset.imatges;
            if (!imatgesData) return;
            
            try {
                const imatges = JSON.parse(imatgesData);
                const img = planta.querySelector('.planta-imatge-principal');
                const indicator = planta.querySelector('.planta-tipus-imatge');
                
                let novaImatge = '';
                
                if (tipusImatge === 'tots') {
                    novaImatge = imatges.principal;
                } else {
                    novaImatge = imatges[tipusImatge] || imatges.principal || '';
                }
                
                // Actualitzar imatge
                if (novaImatge && img) {
                    img.src = `dades/imatges/${novaImatge}`;
                }
                
                // Actualitzar indicador
                if (indicator) {
                    indicator.remove();
                }
                
                if (tipusImatge !== 'tots' && tipusImatge !== 'general') {
                    const newIndicator = document.createElement('span');
                    newIndicator.className = 'planta-tipus-imatge';
                    newIndicator.textContent = this.capitalizeFirst(tipusImatge);
                    planta.querySelector('.planta-imatge a').appendChild(newIndicator);
                }
            } catch (error) {
                console.error('Error aplicant canvi d\'imatges:', error);
            }
        });
    }

    /**
     * Comprovar filtre individual
     */
    checkFilter(planta, grup, valors) {
        const valorsArray = Array.isArray(valors) ? valors : [valors];
        
        switch (grup) {
            case 'tipus':
                return valorsArray.includes(planta.dataset.tipus);
                
            case 'color':
                const colors = (planta.dataset.colors || '').split(' ');
                return valorsArray.every(color => colors.includes(color));
                
            case 'habitat':
                const habitats = (planta.dataset.habitats || '').split(' ');
                return valorsArray.some(habitat => habitats.includes(habitat));
                
            case 'floracio':
                const floracions = (planta.dataset.floracio || '').split(' ');
                return valorsArray.some(floracio => floracions.includes(floracio));
                
            case 'fullatge':
                return valorsArray.includes(planta.dataset.fullatge);
                
            case 'usos':
                const usos = (planta.dataset.usos || '').split(' ');
                return valorsArray.some(us => usos.includes(us));
                
            default:
                return true;
        }
    }

    /**
     * Construir galeria de detalls
     */
    buildDetailsGallery(imatges, planta) {
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
    }

    /**
     * Construir informació de detalls
     */
    buildDetailsInfo(planta) {
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
                const clauFormatada = this.formatCharacteristicText(clau);
                const valorFormatat = Array.isArray(valor) ? valor.join(', ') : valor;
                infoHTML += `<li><strong>${clauFormatada}:</strong> ${this.escapeHtml(valorFormatat)}</li>`;
            });
            
            infoHTML += '</ul></div>';
        }
        
        // Colors
        if (planta.colors && planta.colors.length > 0) {
            infoHTML += this.addDetailSection('Colors', planta.colors);
        }
        
        // Usos
        if (planta.usos && planta.usos.length > 0) {
            infoHTML += this.addDetailSection('Usos', planta.usos);
        }
        
        // Hàbitat al campus
        if (planta.habitat && planta.habitat.length > 0) {
            infoHTML += this.addDetailSection('Hàbitat al campus', planta.habitat, true);
        }
        
        // Coordenades / Localització al campus
        if (planta.coordenades && planta.coordenades.length > 0) {
            infoHTML += '<div class="planta-seccio">';
            infoHTML += '<h4>Localització al campus</h4>';
            infoHTML += '<ul>';
            
            planta.coordenades.forEach((coord) => {
                // Format simplificat segons especificacions
                infoHTML += `<li>${coord.lat}, ${coord.lng}`;
                
                // Afegir enllaç a Google Maps
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
                    // Si és una URL, fer-la clicable
                    infoHTML += `<li><a href="${this.escapeHtml(font)}" target="_blank" rel="noopener">${this.escapeHtml(font)}</a></li>`;
                } else {
                    // Si no és URL, mostrar com a text
                    infoHTML += `<li>${this.escapeHtml(font)}</li>`;
                }
            });
            
            infoHTML += '</ul></div>';
        }
        
        infoHTML += '</div>';
        return infoHTML;
    }

    /**
     * Afegir secció de detalls (retorna HTML)
     */
    addDetailSection(title, data, isList = false) {
        if (!data || (Array.isArray(data) && data.length === 0)) return '';
        
        const values = Array.isArray(data) ? data : [data];
        let html = '';
        
        if (isList) {
            html += `<div class="planta-seccio"><h4>${title}</h4><ul>`;
            values.forEach(value => {
                // Assegurar que value és un string
                const valorComplet = String(value || '');
                // Substituir guions baixos per espais en hàbitats
                const valorFormatat = valorComplet.replace(/_/g, ' ');
                html += `<li>${this.escapeHtml(valorFormatat)}</li>`;
            });
            html += '</ul></div>';
        } else {
            // Eliminar parèntesis només per a la visualització en paràgraf
            const formattedValues = values.map(value => {
                // Assegurar que value és un string abans de fer replace
                const valueStr = String(value || '');
                const valorNet = valueStr.replace(/\s*\(.*?\)\s*/g, '').trim();
                return this.capitalizeFirst(valorNet);
            }).filter(v => v); // Filtrar valors buits
            
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
    }

    /**
     * Activar lightbox per imatges
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
     * Mostrar error al modal
     */
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

    /**
     * Setup cerca
     */
    setupSearch() {
        const searchInput = document.getElementById('cerca-plantes');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.aplicarFiltres();
            });
        }
    }

    /**
     * Construir JSON d'imatges
     */
    buildImagesJSON(imatges) {
        const result = {};
        
        if (imatges.principal && imatges.principal !== null) {
            result.principal = imatges.principal;
            result[imatges.principal_tipus] = imatges.principal;
        }
        
        if (imatges.detalls && imatges.detalls_tipus) {
            imatges.detalls.forEach((imatge, i) => {
                if (imatge && imatge !== null) {
                    const tipus = imatges.detalls_tipus[i];
                    if (tipus && !result[tipus]) {
                        result[tipus] = imatge;
                    }
                }
            });
        }
        
        return result;
    }

    /**
     * Obtenir etiqueta de grup
     */
    getGroupLabel(grup) {
        const labels = {
            tipus: 'Tipus',
            imatge: 'Imatge',
            color: 'Color',
            habitat: 'Hàbitat',
            floracio: 'Floració',
            fullatge: 'Fullatge',
            usos: 'Usos'
        };
        
        return labels[grup] || grup.charAt(0).toUpperCase() + grup.slice(1);
    }
}