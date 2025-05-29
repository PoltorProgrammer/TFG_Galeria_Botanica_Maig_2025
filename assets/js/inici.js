/**
 * JavaScript per a la pàgina d'inici de la Galeria Botànica UAB
 * Gestió de navegació, inicialització i estadístiques
 */

// ========================================================================
// VARIABLES GLOBALS
// ========================================================================

// Variables globals necessàries per compatibilitat amb WordPress
var gb_vars = {
    ajaxurl: 'api/ajax.php' // Simulem l'AJAX de WordPress
};

var mb_vars = {
    ajaxurl: 'api/ajax.php',
    plugin_url: '.',
    dades_plantes: [] // Es carregarà dinàmicament
};

// Variable global per a les dades de plantes (per la galeria)
var gb_plantes_data = [];

// ========================================================================
// FUNCIONS DE NAVEGACIÓ
// ========================================================================

/**
 * Mostrar la pàgina d'inici
 */
function mostrarInici() {
    // Amagar totes les seccions
    document.getElementById('inici-section').style.display = 'block';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'none';
    
    // Actualitzar botons de navegació
    document.getElementById('btn-inici').classList.add('active');
    document.getElementById('btn-galeria').classList.remove('active');
    document.getElementById('btn-mapa').classList.remove('active');
    
    console.log('📄 Mostrant pàgina d\'inici');
}

/**
 * Mostrar la galeria botànica
 */
function mostrarGaleria() {
    // Canviar seccions
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'block';
    document.getElementById('mapa-section').style.display = 'none';
    
    // Actualitzar botons de navegació
    document.getElementById('btn-inici').classList.remove('active');
    document.getElementById('btn-galeria').classList.add('active');
    document.getElementById('btn-mapa').classList.remove('active');
    
    console.log('🌿 Mostrant galeria');
}

/**
 * Mostrar el mapa botànic
 */
function mostrarMapa() {
    // Canviar seccions
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'block';
    
    // Actualitzar botons de navegació
    document.getElementById('btn-inici').classList.remove('active');
    document.getElementById('btn-galeria').classList.remove('active');
    document.getElementById('btn-mapa').classList.add('active');
    
    // Redimensionar el mapa si ja existeix
    if (window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
        }, 100);
    }
    
    console.log('🗺️ Mostrant mapa');
}

// ========================================================================
// PROCESSAMENT DE DADES
// ========================================================================

/**
 * Processar dades per al mapa (format compatible)
 */
function processarDadesPerMapa(plantes) {
    return plantes.map(planta => ({
        ...planta,
        imatge: planta.imatges?.principal ? `assets/imatges/${planta.imatges.principal}` : '',
        habitat_norm: planta.habitat ? planta.habitat.map(h => h.toLowerCase().replace(/\s+/g, '_').replace(/\s*\(.*?\)\s*/g, '')) : [],
        floracio_norm: planta.caracteristiques?.floracio ? 
            (Array.isArray(planta.caracteristiques.floracio) ? 
                planta.caracteristiques.floracio.map(f => f.toLowerCase().replace(/\s*\(.*?\)\s*/g, '')) : 
                [planta.caracteristiques.floracio.toLowerCase().replace(/\s*\(.*?\)\s*/g, '')]) : [],
        usos_norm: planta.usos ? planta.usos.map(u => u.toLowerCase().replace(/\s+/g, '_').replace(/\s*\(.*?\)\s*/g, '')) : [],
        floracio: planta.caracteristiques?.floracio ? 
            (Array.isArray(planta.caracteristiques.floracio) ? planta.caracteristiques.floracio : [planta.caracteristiques.floracio]) : [],
        fullatge: planta.caracteristiques?.fullatge || '',
        info_completa: construirInfoCompleta(planta)
    }));
}

/**
 * Construir informació completa per la cerca
 */
function construirInfoCompleta(planta) {
    let info = [
        planta.nom_comu, 
        planta.nom_cientific, 
        planta.familia, 
        planta.descripcio, 
        planta.tipus
    ];
    
    if (planta.caracteristiques) {
        Object.values(planta.caracteristiques).forEach(valor => {
            if (Array.isArray(valor)) {
                info.push(...valor);
            } else if (valor) {
                info.push(valor);
            }
        });
    }
    
    if (planta.usos) {
        const usosNetejats = planta.usos.map(us => us.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...usosNetejats);
    }
    
    if (planta.colors) {
        const colorsNetejats = planta.colors.map(c => c.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...colorsNetejats);
    }
    
    if (planta.habitat) {
        const habitatsNetejats = planta.habitat.map(h => h.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...habitatsNetejats);
    }
    
    return info.filter(i => i).join(' ');
}

// ========================================================================
// GESTIÓ D'ESTADÍSTIQUES
// ========================================================================

/**
 * Mostrar estadístiques d'imatges a la pàgina d'inici
 */
function mostrarEstadistiquesImatges(stats) {
    try {
        const estadistiquesDiv = document.getElementById('estadistiques-imatges');
        const statsGrid = document.getElementById('stats-grid');
        
        if (!estadistiquesDiv || !statsGrid) {
            console.warn('⚠️ Elements d\'estadístiques no trobats');
            return;
        }
        
        // Actualitzar estadístiques del header
        const statEspecies = document.getElementById('stat-especies');
        const statFotografies = document.getElementById('stat-fotografies');
        
        if (statEspecies) {
            statEspecies.textContent = stats.totalPlantes;
        }
        
        if (statFotografies) {
            statFotografies.textContent = stats.totalImatges;
        }
        
        // Calcular percentatge de cobertura
        const percentatgeCobertura = ((stats.plantesAmbImatges / stats.totalPlantes) * 100).toFixed(1);
        
        // Generar grid d'estadístiques detallades
        statsGrid.innerHTML = `
            <div class="stat-box">
                <div class="number">${stats.plantesAmbImatges}</div>
                <div class="label">Amb imatges</div>
            </div>
            <div class="stat-box">
                <div class="number">${stats.plantesSenesImatges}</div>
                <div class="label">Sense imatges</div>
            </div>
            <div class="stat-box">
                <div class="number">${(stats.totalImatges / stats.plantesAmbImatges || 0).toFixed(1)}</div>
                <div class="label">Mitjana per planta</div>
            </div>
            <div class="stat-box">
                <div class="number">${percentatgeCobertura}%</div>
                <div class="label">Cobertura</div>
            </div>
            <div class="stat-box">
                <div class="number">${Object.keys(stats.tipusImatges).length}</div>
                <div class="label">Tipus d'imatges</div>
            </div>
            <div class="stat-box">
                <div class="number">${stats.tipusImatges.flor || 0}</div>
                <div class="label">Imatges de flors</div>
            </div>
        `;
        
        // Mostrar el contenidor amb animació
        estadistiquesDiv.style.display = 'block';
        estadistiquesDiv.classList.add('fade-in');
        
        console.log('📊 Estadístiques mostrades correctament');
        
    } catch (error) {
        console.error('❌ Error mostrant estadístiques:', error);
    }
}

/**
 * Generar estadístiques adicionals per tipus d'imatge
 */
function generarEstadistiquesDetallades(stats) {
    const detalls = {
        tipusMesFrequent: '',
        plantaAmbMesImatges: '',
        distribucio: {}
    };
    
    // Trobar tipus més frequent
    let maxCount = 0;
    Object.entries(stats.tipusImatges).forEach(([tipus, count]) => {
        if (count > maxCount) {
            maxCount = count;
            detalls.tipusMesFrequent = tipus;
        }
    });
    
    // Distribució d'imatges per planta
    Object.entries(stats.imatgesPerPlanta).forEach(([numImatges, numPlantes]) => {
        detalls.distribucio[numImatges] = numPlantes;
    });
    
    return detalls;
}

// ========================================================================
// INICIALITZACIÓ DE L'APLICACIÓ
// ========================================================================

/**
 * Carregar dades i inicialitzar l'aplicació
 */
async function inicialitzarAplicacio() {
    try {
        console.log('🚀 Iniciant càrrega de la Galeria Botànica UAB...');
        
        // Mostrar loading
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }
        
        // Carregar dades de plantes
        console.log('🌱 Carregant dades de plantes...');
        const response = await fetch('dades/plantes.json');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        const plantesOriginals = data.plantes || data;
        
        console.log(`📋 Carregades ${plantesOriginals.length} plantes del JSON`);
        
        // Processar imatges amb el sistema integrat de la galeria
        // Aquest codi s'executarà quan la galeria estigui carregada
        const plantesAmbImatges = await processarImatgesDePlantes(plantesOriginals);
        
        // Assignar a variables globals
        gb_plantes_data = plantesAmbImatges;
        mb_vars.dades_plantes = processarDadesPerMapa(plantesAmbImatges);
        
        console.log(`✅ Processament completat: ${plantesAmbImatges.length} plantes processades`);
        
        // Inicialitzar components
        await inicialitzarComponents();
        
        // Amagar loading
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
        
        console.log('🎉 Aplicació inicialitzada correctament!');
        
    } catch (error) {
        console.error('❌ Error inicialitzant l\'aplicació:', error);
        mostrarErrorInicialitzacio(error);
    }
}

/**
 * Inicialitzar components de galeria i mapa
 */
async function inicialitzarComponents() {
    return new Promise((resolve) => {
        let intents = 0;
        const esperarFuncions = () => {
            // Verificar que les funcions de galeria i mapa estiguin disponibles
            if (typeof window.generarGaleriaHTML === 'function' && 
                typeof window.generarMapaHTML === 'function') {
                
                // Generar contingut de la galeria
                window.generarGaleriaHTML(gb_plantes_data).then(() => {
                    // Generar contingut del mapa
                    return window.generarMapaHTML();
                }).then(() => {
                    resolve();
                }).catch(error => {
                    console.error('❌ Error generant components:', error);
                    resolve(); // Continuar encara que hi hagi errors
                });
                
            } else {
                intents++;
                if (intents < 50) { // Màxim 5 segons d'espera
                    setTimeout(esperarFuncions, 100);
                } else {
                    console.error('❌ Timeout esperant funcions de galeria/mapa');
                    mostrarErrorTimeout();
                    resolve();
                }
            }
        };
        
        esperarFuncions();
    });
}

/**
 * Processar imatges de plantes (delegació al sistema integrat)
 * Aquesta funció ara delega al sistema integrat dins de la galeria
 */
async function processarImatgesDePlantes(plantes) {
    // Aquesta funció és cridada pel sistema integrat de la galeria
    // El processament real es fa dins de generarGaleriaHTML()
    console.log('🔗 Delegant processament d\'imatges al sistema integrat de la galeria...');
    return plantes; // La galeria se n'encarregarà
}

// ========================================================================
// GESTIÓ D'ERRORS
// ========================================================================

/**
 * Mostrar error d'inicialització
 */
function mostrarErrorInicialitzacio(error) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div style="color: #d32f2f; text-align: center; padding: 2rem;">
                <h3>❌ Error carregant l'aplicació</h3>
                <p><strong>Detalls:</strong> ${error.message}</p>
                <p>Si us plau, recarrega la pàgina o comprova la connexió a internet.</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Recarregar pàgina
                </button>
            </div>
        `;
    }
}

/**
 * Mostrar error de timeout
 */
function mostrarErrorTimeout() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div style="color: #ff9800; text-align: center; padding: 2rem;">
                <h3>⏱️ Càrrega lenta</h3>
                <p>L'aplicació està tardant més del normal a carregar.</p>
                <p>Això pot ser normal en la primera càrrega.</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    🔄 Recarregar pàgina
                </button>
            </div>
        `;
    }
}

// ========================================================================
// EVENT LISTENERS I INICIALITZACIÓ
// ========================================================================

/**
 * Configurar event listeners globals
 */
function configurarEventListeners() {
    // Event listener per tancar modals amb ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Tancar modal si està obert
            const modal = document.querySelector('.planta-modal.actiu');
            if (modal) {
                modal.classList.remove('actiu');
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Tancar lightbox si està obert
            const lightbox = document.querySelector('.planta-lightbox.actiu');
            if (lightbox) {
                lightbox.classList.remove('actiu');
                setTimeout(() => lightbox.remove(), 300);
            }
        }
    });
    
    // Event listener per canvis d'URL (navegació amb hash)
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        
        if (hash === '#galeria') {
            mostrarGaleria();
        } else if (hash === '#mapa') {
            mostrarMapa();
        } else if (hash === '' || hash === '#inici') {
            mostrarInici();
        }
    });
    
    console.log('👂 Event listeners configurats');
}

/**
 * Verificar navegació per hash inicial
 */
function verificarNavegacioInicial() {
    const hash = window.location.hash;
    
    if (hash === '#galeria') {
        // Esperar que la galeria estigui carregada
        setTimeout(mostrarGaleria, 500);
    } else if (hash === '#mapa') {
        // Esperar que el mapa estigui carregat
        setTimeout(mostrarMapa, 500);
    }
    // Per defecte es mostra la pàgina d'inici
}

// ========================================================================
// PUNT D'ENTRADA PRINCIPAL
// ========================================================================

/**
 * Inicialització quan el DOM està carregat
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌿 Galeria Botànica UAB - Inicialitzant...');
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Verificar navegació inicial
    verificarNavegacioInicial();
    
    // Inicialitzar aplicació
    inicialitzarAplicacio();
});

// Fer funcions disponibles globalment per compatibilitat
window.mostrarInici = mostrarInici;
window.mostrarGaleria = mostrarGaleria;
window.mostrarMapa = mostrarMapa;
window.mostrarEstadistiquesImatges = mostrarEstadistiquesImatges;
