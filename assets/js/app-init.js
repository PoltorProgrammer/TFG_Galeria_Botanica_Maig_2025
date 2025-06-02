/**
 * App Init - Galeria Botànica UAB
 * Script d'inicialització principal de l'aplicació - VERSIÓ ACTUALITZADA
 * Compatible amb les correccions dels popups i sistema millorat
 */

// ========================================================================
// VARIABLES GLOBALS I CONFIGURACIÓ
// ========================================================================

// Variables globals necessàries per compatibilitat
var gb_vars = {
    ajaxurl: 'api/ajax.php',
    nonce: 'galeria_botanica_nonce',
    version: '2.1.0'
};

var mb_vars = {
    ajaxurl: 'api/ajax.php',
    plugin_url: '.',
    dades_plantes: [],
    version: '2.1.0'
};

// Variable global per a les dades de plantes
var gb_plantes_data = [];

// Configuració de l'aplicació
const APP_CONFIG = {
    dataUrl: 'dades/plantes.json',
    maxRetries: 3,
    retryDelay: 1000,
    timeouts: {
        dataLoad: 10000,
        imageProcess: 15000,
        functionWait: 5000
    }
};

// ========================================================================
// FUNCIONS DE NAVEGACIÓ MILLORADES
// ========================================================================

/**
 * Mostrar la pàgina d'inici
 */
function mostrarInici() {
    console.log('🏠 Navegant a la pàgina d\'inici');
    
    // Canviar seccions
    document.getElementById('inici-section').style.display = 'block';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'none';
    
    // Actualitzar botons de navegació
    updateNavigationButtons('inici');
    
    // Tancar modal si està obert
    if (window.modalObert) {
        window.tancarModal();
    }
    
    console.log('✅ Pàgina d\'inici mostrada');
}

/**
 * Mostrar la galeria botànica
 */
function mostrarGaleria() {
    console.log('🌿 Navegant a la galeria');
    
    // Canviar seccions
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'block';
    document.getElementById('mapa-section').style.display = 'none';
    
    // Actualitzar botons de navegació
    updateNavigationButtons('galeria');
    
    // Tancar modal si està obert
    if (window.modalObert) {
        window.tancarModal();
    }
    
    console.log('✅ Galeria mostrada');
}

/**
 * Mostrar el mapa botànic
 */
function mostrarMapa() {
    console.log('🗺️ Navegant al mapa');
    
    // Canviar seccions
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'block';
    
    // Actualitzar botons de navegació
    updateNavigationButtons('mapa');
    
    // Tancar modal si està obert
    if (window.modalObert) {
        window.tancarModal();
    }
    
    // Redimensionar el mapa si ja existeix
    if (window.map && typeof window.map.invalidateSize === 'function') {
        setTimeout(() => {
            window.map.invalidateSize();
            console.log('🗺️ Mapa redimensionat');
        }, 100);
    }
    
    console.log('✅ Mapa mostrat');
}

/**
 * Actualitzar botons de navegació
 */
function updateNavigationButtons(seccioActiva) {
    // Eliminar classe activa de tots els botons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Afegir classe activa al botó corresponent
    const botoActiu = document.getElementById(`btn-${seccioActiva}`);
    if (botoActiu) {
        botoActiu.classList.add('active');
    }
    
    // Actualitzar estat global
    if (window.AppState) {
        window.AppState.setSeccio(seccioActiva);
    }
}

// Fer funcions accessibles globalment
window.mostrarInici = mostrarInici;
window.mostrarGaleria = mostrarGaleria;
window.mostrarMapa = mostrarMapa;

// ========================================================================
// PROCESSAMENT DE DADES MILLORAT
// ========================================================================

/**
 * Processar dades per al mapa (format compatible)
 */
function processarDadesPerMapa(plantes) {
    console.log('🔄 Processant dades per al mapa...');
    
    const dadesProcessades = plantes.map(planta => ({
        ...planta,
        imatge: planta.imatges?.principal ? `assets/imatges/${planta.imatges.principal}` : '',
        habitat_norm: planta.habitat ? planta.habitat.map(h => normalitzarText(h)) : [],
        floracio_norm: processarArrayOString(planta.caracteristiques?.floracio),
        usos_norm: planta.usos ? planta.usos.map(u => normalitzarText(u)) : [],
        floracio: planta.caracteristiques?.floracio ? 
            (Array.isArray(planta.caracteristiques.floracio) ? planta.caracteristiques.floracio : [planta.caracteristiques.floracio]) : [],
        fullatge: planta.caracteristiques?.fullatge || '',
        info_completa: construirInfoCompleta(planta)
    }));
    
    console.log(`✅ ${dadesProcessades.length} plantes processades per al mapa`);
    return dadesProcessades;
}

/**
 * Normalitzar text eliminant parèntesis i convertint a format consistent
 */
function normalitzarText(text) {
    if (!text) return '';
    return text.toLowerCase()
               .replace(/\s*\(.*?\)\s*/g, '')
               .trim()
               .replace(/\s+/g, '_');
}

/**
 * Processar array o string per a formats consistents
 */
function processarArrayOString(valor) {
    if (!valor) return [];
    
    if (Array.isArray(valor)) {
        return valor.map(v => normalitzarText(v));
    }
    
    return [normalitzarText(valor)];
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
    
    // Afegir característiques
    if (planta.caracteristiques) {
        Object.values(planta.caracteristiques).forEach(valor => {
            if (Array.isArray(valor)) {
                info.push(...valor);
            } else if (valor) {
                info.push(valor);
            }
        });
    }
    
    // Afegir usos
    if (planta.usos) {
        const usosNetejats = planta.usos.map(us => us.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...usosNetejats);
    }
    
    // Afegir colors
    if (planta.colors) {
        const colorsNetejats = planta.colors.map(c => c.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...colorsNetejats);
    }
    
    // Afegir hàbitats
    if (planta.habitat) {
        const habitatsNetejats = planta.habitat.map(h => h.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...habitatsNetejats);
    }
    
    return info.filter(i => i).join(' ');
}

// ========================================================================
// GESTIÓ D'ERRORS MILLORADA
// ========================================================================

/**
 * Gestió d'errors globals amb retry automàtic
 */
function gestionarError(error, context = 'aplicació', canRetry = false) {
    console.error(`❌ Error en ${context}:`, error);
    
    const errorInfo = {
        context: context,
        message: error.message || error.toString(),
        stack: error.stack,
        timestamp: new Date().toISOString(),
        canRetry: canRetry
    };
    
    // Mostrar error a la interfície
    mostrarErrorInterficie(errorInfo);
    
    // Enviar a analytics si està disponible (opcional)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: `${context}: ${errorInfo.message}`,
            fatal: false
        });
    }
}

/**
 * Mostrar error a la interfície
 */
function mostrarErrorInterficie(errorInfo) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const retryButton = errorInfo.canRetry ? 
            `<button onclick="location.reload()" style="
                margin-top: 1rem; 
                padding: 0.8rem 1.5rem; 
                background: #4CAF50; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.3s;
            " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                🔄 Recarregar pàgina
            </button>` : '';
        
        loadingOverlay.innerHTML = `
            <div style="color: #721c24; text-align: center; padding: 2rem; max-width: 600px;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="margin: 0 0 1rem 0; color: #721c24;">Error carregant l'aplicació</h3>
                <div style="background: rgba(114, 28, 36, 0.1); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <strong>Context:</strong> ${errorInfo.context}<br>
                    <strong>Detalls:</strong> ${errorInfo.message}
                </div>
                <p style="font-size: 0.9rem; opacity: 0.8;">
                    Si el problema persisteix, comprova la connexió a internet o contacta amb l'administrador.
                </p>
                ${retryButton}
                <div style="margin-top: 1rem;">
                    <small style="opacity: 0.6;">Timestamp: ${errorInfo.timestamp}</small>
                </div>
            </div>`;
        loadingOverlay.classList.remove('hidden');
    }
}

/**
 * Validar integritat de les dades carregades
 */
function validarDadesPlantes(data) {
    if (!data) {
        throw new Error('No s\'han pogut carregar les dades del servidor');
    }
    
    const plantes = data.plantes || data;
    
    if (!Array.isArray(plantes)) {
        throw new Error('Format de dades incorrecte: s\'esperava un array de plantes');
    }
    
    if (plantes.length === 0) {
        throw new Error('La base de dades està buida o no s\'han trobat plantes');
    }
    
    // Validar estructura bàsica
    const plantesInvalides = [];
    const campsObligatoris = ['nom_cientific', 'nom_comu', 'familia'];
    
    plantes.forEach((planta, index) => {
        const campsManquents = campsObligatoris.filter(camp => !planta[camp]);
        if (campsManquents.length > 0) {
            plantesInvalides.push({ index, campsManquents });
        }
    });
    
    if (plantesInvalides.length > 0) {
        console.warn(`⚠️ ${plantesInvalides.length} plantes amb dades incompletes:`, plantesInvalides.slice(0, 5));
    }
    
    console.log(`✅ Dades validades: ${plantes.length} plantes carregades correctament`);
    return plantes;
}

// ========================================================================
// GESTIÓ DE PROGRES MILLORADA
// ========================================================================

/**
 * Mostrar progres de carregament amb animacions
 */
function actualitzarProgresCarregament(pas, total, missatge, tipus = 'loading') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingStatus = document.getElementById('loading-status');
    
    if (loadingOverlay && loadingStatus) {
        const percentatge = Math.round((pas / total) * 100);
        
        // Actualitzar estat de càrrega
        loadingStatus.textContent = missatge;
        loadingStatus.className = `loading-stats ${tipus}`;
        
        // Actualitzar overlay amb barra de progres
        const progressBarHTML = `
            <div class="loading-spinner"></div>
            <p style="margin: 1rem 0; font-size: 1.1rem; font-weight: 600;">${missatge}</p>
            <div style="
                width: 350px; 
                height: 24px; 
                background: rgba(255, 255, 255, 0.2); 
                border-radius: 12px; 
                margin: 1.5rem 0;
                overflow: hidden;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            ">
                <div style="
                    width: ${percentatge}%; 
                    height: 100%; 
                    background: linear-gradient(90deg, #4CAF50, #45a049, #388E3C); 
                    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 12px;
                    position: relative;
                    overflow: hidden;
                ">
                    <div style="
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                        animation: shimmer 2s infinite;
                    "></div>
                </div>
            </div>
            <div style="
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                width: 350px;
                font-size: 0.9rem;
                color: rgba(44, 85, 48, 0.8);
            ">
                <span>Pas ${pas} de ${total}</span>
                <span style="font-weight: bold;">${percentatge}%</span>
            </div>
        `;
        
        // Afegir animació CSS si no existeix
        if (!document.getElementById('shimmer-animation')) {
            const style = document.createElement('style');
            style.id = 'shimmer-animation';
            style.textContent = `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loadingOverlay.innerHTML = progressBarHTML;
    }
    
    console.log(`📊 Progres: ${pas}/${total} (${Math.round((pas/total)*100)}%) - ${missatge}`);
}

// ========================================================================
// INICIALITZACIÓ PRINCIPAL MILLORADA
// ========================================================================

/**
 * Carregar dades amb retry automàtic
 */
async function carregarDadesAmbRetry(url, maxRetries = APP_CONFIG.maxRetries) {
    for (let intent = 1; intent <= maxRetries; intent++) {
        try {
            console.log(`🔄 Intent ${intent}/${maxRetries} carregant dades...`);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), APP_CONFIG.timeouts.dataLoad);
            
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(`✅ Dades carregades correctament en l'intent ${intent}`);
            return data;
            
        } catch (error) {
            console.warn(`⚠️ Intent ${intent} fallit:`, error.message);
            
            if (intent === maxRetries) {
                throw new Error(`Error carregant dades després de ${maxRetries} intents: ${error.message}`);
            }
            
            // Esperar abans del següent intent
            await new Promise(resolve => setTimeout(resolve, APP_CONFIG.retryDelay * intent));
        }
    }
}

/**
 * Inicialització principal de l'aplicació
 */
async function inicialitzarAplicacio() {
    try {
        console.log('🚀 === INICIANT APLICACIÓ GALERIA BOTÀNICA UAB v2.1 ===');
        
        // Pas 1: Mostrar loading i validar entorn
        actualitzarProgresCarregament(1, 6, '🔧 Verificant entorn i dependències...');
        
        // Verificar dependències essencials
        const dependenciesResult = verificarDependencies();
        if (!dependenciesResult.success) {
            throw new Error(`Dependències manquents: ${dependenciesResult.missing.join(', ')}`);
        }
        
        console.log('✅ Totes les dependències verificades');
        
        // Pas 2: Carregar dades de plantes
        actualitzarProgresCarregament(2, 6, '📊 Carregant base de dades de plantes...');
        
        const data = await carregarDadesAmbRetry(APP_CONFIG.dataUrl);
        const plantesValidades = validarDadesPlantes(data);
        
        // Pas 3: Processar imatges amb el sistema millorat
        actualitzarProgresCarregament(3, 6, '🖼️ Processant imatges des de GitHub API...');
        
        const sistemaImatges = new SistemaImatgesGitHub();
        const plantesAmbImatges = await sistemaImatges.processarTotesLesPlantes(plantesValidades);
        
        // Pas 4: Assignar a variables globals
        actualitzarProgresCarregament(4, 6, '🔗 Configurant variables globals...');
        
        window.gb_plantes_data = plantesAmbImatges;
        window.mb_vars.dades_plantes = processarDadesPerMapa(plantesAmbImatges);
        
        console.log(`📦 Variables globals configurades: ${plantesAmbImatges.length} plantes`);
        
        // Pas 5: Inicialitzar components
        actualitzarProgresCarregament(5, 6, '🎨 Generant interfície de galeria i mapa...');
        
        await inicialitzarComponents();
        
        // Pas 6: Finalitzar
        actualitzarProgresCarregament(6, 6, '✨ Finalitzant inicialització...');
        
        // Configurar event listeners globals
        configurarEventListenersGlobals();
        
        // Gestionar navegació inicial
        gestionarNavegacioInicial();
        
        // Amagar loading amb transició
        setTimeout(() => {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    loadingOverlay.style.opacity = '1'; // Reset per proper ús
                }, 500);
            }
            console.log('🎉 APLICACIÓ INICIALITZADA CORRECTAMENT');
        }, 1000);
        
        // Generar estadístiques
        generarEstadistiquesAplicacio(plantesAmbImatges);
        
    } catch (error) {
        gestionarError(error, 'inicialització de l\'aplicació', true);
    }
}

/**
 * Verificar dependències necessàries
 */
function verificarDependencies() {
    const dependencies = [
        { name: 'jQuery', check: () => typeof jQuery !== 'undefined' },
        { name: 'Leaflet', check: () => typeof L !== 'undefined' },
        { name: 'SistemaImatgesGitHub', check: () => typeof SistemaImatgesGitHub !== 'undefined' }
    ];
    
    const missing = dependencies.filter(dep => !dep.check()).map(dep => dep.name);
    
    return {
        success: missing.length === 0,
        missing: missing
    };
}

/**
 * Inicialitzar components de galeria i mapa
 */
async function inicialitzarComponents() {
    return new Promise((resolve, reject) => {
        let intents = 0;
        const maxIntents = APP_CONFIG.timeouts.functionWait / 100;
        
        const verificarFuncions = () => {
            if (typeof window.generarGaleriaHTML === 'function' && 
                typeof window.generarMapaHTML === 'function') {
                
                // Generar contingut de la galeria
                Promise.all([
                    window.generarGaleriaHTML(window.gb_plantes_data),
                    window.generarMapaHTML()
                ]).then(() => {
                    console.log('✅ Components de galeria i mapa generats');
                    resolve();
                }).catch(error => {
                    console.error('❌ Error generant components:', error);
                    reject(error);
                });
                
            } else {
                intents++;
                if (intents < maxIntents) {
                    setTimeout(verificarFuncions, 100);
                } else {
                    reject(new Error(`Timeout esperant funcions de galeria/mapa després de ${APP_CONFIG.timeouts.functionWait}ms`));
                }
            }
        };
        
        verificarFuncions();
    });
}

// ========================================================================
// EVENT LISTENERS GLOBALS MILLORATS
// ========================================================================

/**
 * Configurar event listeners globals de l'aplicació
 */
function configurarEventListenersGlobals() {
    console.log('🔧 Configurant event listeners globals...');
    
    // Event listeners per errors globals
    window.addEventListener('error', function(event) {
        gestionarError(event.error || event, 'error global JavaScript');
    });
    
    window.addEventListener('unhandledrejection', function(event) {
        gestionarError(event.reason, 'promesa rebutjada');
        event.preventDefault();
    });
    
    // Event listeners per navegació
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash;
        
        if (hash === '#galeria') {
            mostrarGaleria();
        } else if (hash === '#mapa') {
            mostrarMapa();
        } else if (hash === '' || hash === '#inici') {
            mostrarInici();
        } else if (hash.startsWith('#planta-')) {
            // Obrir detalls de planta específica
            const plantaId = hash.substring(8);
            setTimeout(() => {
                if (typeof window.obrirDetallsPlanta === 'function') {
                    window.obrirDetallsPlanta(plantaId);
                }
            }, 500);
        }
    });
    
    // Event listeners per redimensionament
    window.addEventListener('resize', debounce(function() {
        if (window.map && jQuery('#mapa-section').is(':visible')) {
            setTimeout(() => {
                window.map.invalidateSize();
                console.log('🗺️ Mapa redimensionat automàticament');
            }, 100);
        }
    }, 250));
    
    // Event listeners per visibilitat de la pàgina
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            console.log('👁️ Pàgina amagada');
        } else {
            console.log('👁️ Pàgina visible');
            // Revalidar components si cal
            if (window.map && jQuery('#mapa-section').is(':visible')) {
                setTimeout(() => window.map.invalidateSize(), 100);
            }
        }
    });
    
    console.log('✅ Event listeners globals configurats');
}

/**
 * Gestionar navegació inicial basada en hash URL
 */
function gestionarNavegacioInicial() {
    const hash = window.location.hash;
    
    console.log('🔗 Gestionant navegació inicial:', hash || 'cap hash');
    
    if (hash === '#galeria') {
        setTimeout(mostrarGaleria, 500);
    } else if (hash === '#mapa') {
        setTimeout(mostrarMapa, 500);
    } else if (hash.startsWith('#planta-')) {
        // Mostrar galeria primer, després obrir planta
        setTimeout(() => {
            mostrarGaleria();
            const plantaId = hash.substring(8);
            setTimeout(() => {
                if (typeof window.obrirDetallsPlanta === 'function') {
                    window.obrirDetallsPlanta(plantaId);
                }
            }, 1000);
        }, 500);
    }
    // Per defecte es mostra la pàgina d'inici
}

// ========================================================================
// UTILITATS I FUNCIONS D'AJUDA
// ========================================================================

/**
 * Funció debounce per optimitzar events repetitius
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Generar estadístiques de l'aplicació
 */
function generarEstadistiquesAplicacio(plantes) {
    try {
        const stats = {
            totalPlantes: plantes.length,
            plantesAmbImatges: plantes.filter(p => p.imatges?.principal).length,
            totalImatges: plantes.reduce((total, p) => {
                return total + (p.imatges?.principal ? 1 : 0) + (p.imatges?.detalls?.length || 0);
            }, 0),
            families: new Set(plantes.map(p => p.familia)).size,
            tipusPlantes: plantes.reduce((acc, p) => {
                acc[p.tipus] = (acc[p.tipus] || 0) + 1;
                return acc;
            }, {})
        };
        
        console.log('📊 ESTADÍSTIQUES DE L\'APLICACIÓ:');
        console.log(`   🌱 Total plantes: ${stats.totalPlantes}`);
        console.log(`   🖼️ Plantes amb imatges: ${stats.plantesAmbImatges}`);
        console.log(`   📸 Total imatges: ${stats.totalImatges}`);
        console.log(`   🏷️ Famílies úniques: ${stats.families}`);
        console.log(`   📋 Distribució per tipus:`, stats.tipusPlantes);
        
        // Actualitzar interfície si cal
        if (typeof window.mostrarEstadistiquesImatges === 'function') {
            window.mostrarEstadistiquesImatges(stats);
        }
        
    } catch (error) {
        console.error('❌ Error generant estadístiques:', error);
    }
}

/**
 * Funcions globals per compatibilitat
 */
window.processarDadesPerMapa = processarDadesPerMapa;
window.construirInfoCompleta = construirInfoCompleta;
window.actualitzarProgresCarregament = actualitzarProgresCarregament;

// ========================================================================
// GESTIÓ D'ESTAT DE L'APLICACIÓ
// ========================================================================

const AppState = {
    seccioActual: 'inici',
    modalObert: false,
    lightboxObert: false,
    dadesCarregades: false,
    componentesInicialitzats: false,
    
    setSeccio(seccio) {
        this.seccioActual = seccio;
        console.log(`📍 Secció actual: ${seccio}`);
    },
    
    setModal(obert) {
        this.modalObert = obert;
        console.log(`📱 Modal: ${obert ? 'obert' : 'tancat'}`);
    },
    
    setLightbox(obert) {
        this.lightboxObert = obert;
        console.log(`🖼️ Lightbox: ${obert ? 'obert' : 'tancat'}`);
    },
    
    setDadesCarregades(carregades) {
        this.dadesCarregades = carregades;
        console.log(`📊 Dades carregades: ${carregades}`);
    },
    
    setComponentsInicialitzats(inicialitzats) {
        this.componentesInicialitzats = inicialitzats;
        console.log(`🎨 Components inicialitzats: ${inicialitzats}`);
    },
    
    getEstat() {
        return {
            seccio: this.seccioActual,
            modal: this.modalObert,
            lightbox: this.lightboxObert,
            dades: this.dadesCarregades,
            components: this.componentesInicialitzats
        };
    }
};

// Fer AppState accessible globalment
window.AppState = AppState;

// ========================================================================
// INICIALITZACIÓ I PUNT D'ENTRADA
// ========================================================================

/**
 * Inicialització quan el DOM estigui llest
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregat, preparant inicialització...');
    
    // Afegir meta informació de l'aplicació
    const metaInfo = document.createElement('meta');
    metaInfo.name = 'app-version';
    metaInfo.content = gb_vars.version;
    document.head.appendChild(metaInfo);
    
    // Inicialitzar aplicació
    inicialitzarAplicacio();
});

// Event listener complementari per la càrrega completa
window.addEventListener('load', function() {
    console.log('🌐 Pàgina completament carregada, verificant estat...');
    
    // Verificacions addicionals si cal
    setTimeout(() => {
        if (!window.AppState.dadesCarregades) {
            console.warn('⚠️ Les dades encara no s\'han carregat després de la càrrega completa');
        }
        
        if (!window.AppState.componentesInicialitzats) {
            console.warn('⚠️ Els components encara no s\'han inicialitzat després de la càrrega completa');
        }
    }, 2000);
});

// Missatge final
console.log('🔧 App Init v2.1 carregat i llest per a la inicialització');

// ========================================================================
// FUNCIONS ESPECIALS PER POPUP-FIXES COMPATIBILITY
// ========================================================================

/**
 * Verificar si popup-fixes està carregat
 */
window.verificarPopupFixes = function() {
    const funcionsNecessaries = [
        'obrirDetallsPlanta',
        'tancarModal',
        'obrirDetallsPlantaMapa'
    ];
    
    const disponibles = funcionsNecessaries.filter(func => typeof window[func] === 'function');
    const manquents = funcionsNecessaries.filter(func => typeof window[func] !== 'function');
    
    console.log('🔧 Verificació popup-fixes:');
    console.log(`   ✅ Disponibles: ${disponibles.join(', ')}`);
    if (manquents.length > 0) {
        console.log(`   ❌ Manquents: ${manquents.join(', ')}`);
    }
    
    return manquents.length === 0;
};

/**
 * Esperar que popup-fixes estigui carregat
 */
window.esperarPopupFixes = function(callback, maxIntents = 50) {
    let intents = 0;
    
    const verificar = () => {
        if (window.verificarPopupFixes()) {
            console.log('✅ Popup-fixes verificat i disponible');
            if (callback) callback();
        } else {
            intents++;
            if (intents < maxIntents) {
                setTimeout(verificar, 100);
            } else {
                console.warn('⚠️ Timeout esperant popup-fixes');
                if (callback) callback(); // Continuar igualment
            }
        }
    };
    
    verificar();
};
