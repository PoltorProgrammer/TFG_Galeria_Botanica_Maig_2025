/**
 * MAIN.JS - Galeria Botànica UAB Local
 * Controlador principal de l'aplicació
 * Gestiona: càrrega de dades, pestanyes, inicialització global
 */

class GaleriaBotanicaApp {
    constructor() {
        this.dades = {
            plantes: null,
            diccionariImatges: null,
            geojsonHabitats: {}
        };
        
        this.components = {
            galeria: null,
            mapa: null
        };
        
        this.init();
    }

    async init() {
        console.log('Inicialitzant Galeria Botànica UAB...');
        
        try {
            // Mostrar loading
            this.showLoading(true);
            
            // Configurar pestanyes
            this.setupTabs();
            
            // Carregar dades essencials
            await this.loadEssentialData();
            
            // Inicialitzar components
            await this.initializeComponents();
            
            // Amagar loading
            this.showLoading(false);
            
            console.log('Aplicació inicialitzada correctament');
            
        } catch (error) {
            console.error('Error inicialitzant l\'aplicació:', error);
            this.showError('Error carregant l\'aplicació. Comprova que tots els fitxers estiguin disponibles.');
        }
    }

    /**
     * Configuració del sistema de pestanyes
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Actualitzar botons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Actualitzar panells
                tabPanels.forEach(panel => panel.classList.remove('active'));
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Trigger resize en cas que el mapa necessiti reajustar-se
                if (targetTab === 'mapa' && this.components.mapa) {
                    setTimeout(() => {
                        if (this.components.mapa.invalidateSize) {
                            this.components.mapa.invalidateSize();
                        }
                    }, 100);
                }
            });
        });
    }

    /**
     * Càrrega de dades essencials
     */
    async loadEssentialData() {
        const promises = [
            this.loadJSON('dades/plantes.json'),
            this.loadJSON('dades/diccionari-imatges.json')
        ];
        
        const [plantesData, diccionariData] = await Promise.all(promises);
        
        this.dades.plantes = plantesData.plantes || plantesData;
        this.dades.diccionariImatges = diccionariData;
        
        console.log(`Carregades ${this.dades.plantes.length} plantes`);
        console.log(`Diccionari d'imatges amb ${Object.keys(this.dades.diccionariImatges).length} entrades`);
        
        // Carregar GeoJSON files (opcional)
        await this.loadGeoJSONFiles();
    }

    /**
     * Càrrega de fitxers GeoJSON
     */
    async loadGeoJSONFiles() {
        const geojsonFiles = [
            'cami_ho_chi_minh.geojson',
            'torrent_can_domenech.geojson',
            'camins.geojson',
            'eix_central.geojson',
            'purament_assolellades.geojson',
            'vegetacio_ribera.geojson',
            'zones_ombrivoles.geojson'
        ];
        
        console.log(`Intent de càrrega de ${geojsonFiles.length} fitxers GeoJSON...`);
        let fitxersCarregats = 0;
        
        for (const file of geojsonFiles) {
            try {
                const data = await this.loadJSON(`dades/geojson/${file}`);
                const key = file.replace('.geojson', '');
                this.dades.geojsonHabitats[key] = data;
                fitxersCarregats++;
                console.log(`✅ GeoJSON carregat: ${file}`);
            } catch (error) {
                console.log(`⚠️  GeoJSON no disponible: ${file} (això és normal si no tens fitxers d'hàbitat)`);
            }
        }
        
        console.log(`📊 GeoJSON carregats: ${fitxersCarregats}/${geojsonFiles.length}`);
    }

    /**
     * Inicialització dels components principals
     */
    async initializeComponents() {
        // Crear variables globals que esperen els components
        window.gb_vars = {
            ajaxurl: null, // No necessari en versió local
            dades_plantes: this.dades.plantes,
            diccionari_imatges: this.dades.diccionariImatges,
            geojson_habitats: this.dades.geojsonHabitats
        };
        
        window.mb_vars = {
            plugin_url: '.',
            dades_plantes: this.prepareMapData(),
            geojson_habitats: this.dades.geojsonHabitats
        };
        
        // Inicialitzar galeria
        if (typeof GaleriaBotanica !== 'undefined') {
            this.components.galeria = new GaleriaBotanica();
        }
        
        // Inicialitzar mapa (es farà quan es cliqui la pestanya)
        this.setupMapInitialization();
    }

    /**
     * Configurar inicialització lazy del mapa
     */
    setupMapInitialization() {
        let mapaInitialitzat = false;
        
        const initMapa = () => {
            if (!mapaInitialitzat && typeof MapaBotanica !== 'undefined') {
                console.log('Inicialitzant mapa...');
                this.components.mapa = new MapaBotanica();
                mapaInitialitzat = true;
            }
        };
        
        // Inicialitzar quan es faci clic a la pestanya del mapa
        document.querySelector('[data-tab="mapa"]').addEventListener('click', () => {
            setTimeout(initMapa, 100);
        });
        
        // Si ja estem a la pestanya del mapa, inicialitzar immediatament
        if (document.getElementById('mapa-tab').classList.contains('active')) {
            setTimeout(initMapa, 100);
        }
    }

    /**
     * Preparar dades per al mapa
     */
    prepareMapData() {
        return this.dades.plantes.map(planta => {
            const imatges = this.obtenirImatgesPlanta(planta.nom_cientific);
            const img_url = imatges.principal ? `dades/imatges/${imatges.principal}` : '';
            
            return {
                ...planta,
                imatge: img_url,
                habitat_norm: this.normalizeArray(planta.habitat),
                floracio_norm: this.normalizeArray(planta.caracteristiques?.floracio),
                usos_norm: this.normalizeArray(planta.usos),
                info_completa: this.buildSearchText(planta)
            };
        });
    }

    /**
     * Obtenir imatges d'una planta (similar a la funció PHP)
     */
    obtenirImatgesPlanta(nomCientific) {
        const nomBase = nomCientific.toLowerCase().replace(/\s+/g, '_');
        const entrada = this.dades.diccionariImatges[nomBase];
        
        if (entrada) {
            return {
                principal: entrada.principal,
                principal_tipus: this.extractImageType(entrada.principal),
                detalls: entrada.detalls?.map(d => d.nom) || [],
                detalls_tipus: entrada.detalls?.map(d => d.tipus) || []
            };
        }
        
        // Fallback: buscar per coincidència parcial si no es troba exacta
        const claus = Object.keys(this.dades.diccionariImatges);
        const coincidencia = claus.find(clau => 
            clau.includes(nomBase) || nomBase.includes(clau)
        );
        
        if (coincidencia) {
            const entradaCoincidencia = this.dades.diccionariImatges[coincidencia];
            return {
                principal: entradaCoincidencia.principal,
                principal_tipus: this.extractImageType(entradaCoincidencia.principal),
                detalls: entradaCoincidencia.detalls?.map(d => d.nom) || [],
                detalls_tipus: entradaCoincidencia.detalls?.map(d => d.tipus) || []
            };
        }
        
        // Si no es troba cap imatge, retornar buit en lloc d'una imatge que no existeix
        return {
            principal: null,
            principal_tipus: 'general',
            detalls: [],
            detalls_tipus: []
        };
    }

    /**
     * Extreure tipus d'imatge del nom del fitxer
     */
    extractImageType(filename) {
        if (!filename) return 'general';
        
        // Regex més robust per capturar el tipus d'imatge
        // Format esperat: genere_especie_XX_tipus.jpg
        const match = filename.match(/_\d+_([a-zA-Z]+)\.(jpg|jpeg|png|webp)$/i);
        if (match && match[1]) {
            const tipus = match[1].toLowerCase();
            
            // Mapeig de tipus per normalitzar
            const tipusMapping = {
                'flor': 'flor',
                'flower': 'flor',
                'fulla': 'fulla',
                'leaf': 'fulla',
                'fruit': 'fruit',
                'tija': 'escorça',
                'stem': 'escorça',
                'bark': 'escorça',
                'habit': 'hàbit',
                'habitus': 'hàbit',
                'escorca': 'escorça',
                'escorça': 'escorça',
                'arrel': 'arrel',
                'root': 'arrel',
                'llavor': 'llavor',
                'seed': 'llavor',
                'altra': 'altre',
                'other': 'altre'
            };
            
            return tipusMapping[tipus] || tipus;
        }
        
        return 'general';
    }

    /**
     * Normalitzar arrays per als filtres
     */
    normalizeArray(data) {
        if (!data) return [];
        
        const array = Array.isArray(data) ? data : [data];
        return array.map(item => 
            item.toString()
                .toLowerCase()
                .replace(/\s*\(.*?\)\s*/g, '') // eliminar parèntesis
                .replace(/\s+/g, '_')          // espais a guions baixos
        );
    }

    /**
     * Construir text per a cerca
     */
    buildSearchText(planta) {
        let text = [
            planta.nom_comu,
            planta.nom_cientific,
            planta.familia,
            planta.descripcio,
            planta.tipus
        ].join(' ');
        
        // Afegir característiques
        if (planta.caracteristiques) {
            Object.values(planta.caracteristiques).forEach(valor => {
                if (Array.isArray(valor)) {
                    text += ' ' + valor.join(' ');
                } else {
                    text += ' ' + valor;
                }
            });
        }
        
        // Afegir altres camps
        ['usos', 'colors', 'habitat'].forEach(camp => {
            if (planta[camp]) {
                const values = Array.isArray(planta[camp]) ? planta[camp] : [planta[camp]];
                text += ' ' + values.map(v => 
                    v.replace(/\s*\(.*?\)\s*/g, '')
                ).join(' ');
            }
        });
        
        return text.toLowerCase();
    }

    /**
     * Carregar fitxer JSON
     */
    async loadJSON(url) {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error carregant ${url}: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * Mostrar/ocultar loading
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.showLoading(false);
        
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.querySelector('p').textContent = message;
            errorEl.style.display = 'block';
        }
    }

    /**
     * Funcions d'utilitat per als components
     */
    static obtenirDetallsPlanta(plantaId) {
        const app = window.galeriaBotanicaApp;
        if (!app) return null;
        
        // Buscar planta per ID o nom científic
        const planta = app.dades.plantes.find(p => 
            p.id === plantaId || 
            app.sanitizeTitle(p.nom_cientific) === plantaId
        );
        
        if (!planta) return null;
        
        const imatges = app.obtenirImatgesPlanta(planta.nom_cientific);
        
        return {
            planta: planta,
            imatges: imatges
        };
    }

    /**
     * Sanititzar títol (equivalent a sanitize_title de WordPress)
     */
    sanitizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '');
    }
}

/**
 * Inicialització quan el DOM estigui carregat
 */
document.addEventListener('DOMContentLoaded', () => {
    window.galeriaBotanicaApp = new GaleriaBotanicaApp();
});

/**
 * Gestió d'errors globals
 */
window.addEventListener('error', (e) => {
    console.error('Error global captat:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rebutjada:', e.reason);
});