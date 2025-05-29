/**
 * App Init - Galeria Botànica UAB
 * Script d'inicialització principal de l'aplicació
 */

// Funcions de navegació
function mostrarInici() {
    document.getElementById('inici-section').style.display = 'block';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'none';
    
    document.getElementById('btn-inici').classList.add('active');
    document.getElementById('btn-galeria').classList.remove('active');
    document.getElementById('btn-mapa').classList.remove('active');
    
    console.log('🏠 Mostrant secció d\'inici');
}

function mostrarGaleria() {
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'block';
    document.getElementById('mapa-section').style.display = 'none';
    
    document.getElementById('btn-inici').classList.remove('active');
    document.getElementById('btn-galeria').classList.add('active');
    document.getElementById('btn-mapa').classList.remove('active');
    
    console.log('🖼️ Mostrant galeria');
}

function mostrarMapa() {
    document.getElementById('inici-section').style.display = 'none';
    document.getElementById('galeria-section').style.display = 'none';
    document.getElementById('mapa-section').style.display = 'block';
    
    document.getElementById('btn-inici').classList.remove('active');
    document.getElementById('btn-galeria').classList.remove('active');
    document.getElementById('btn-mapa').classList.add('active');
    
    // Redimensionar el mapa si ja existeix
    if (window.map) {
        setTimeout(() => {
            window.map.invalidateSize();
            console.log('🗺️ Mapa redimensionat');
        }, 100);
    }
    
    console.log('🗺️ Mostrant mapa');
}

// Fer funcions accessibles globalment
window.mostrarInici = mostrarInici;
window.mostrarGaleria = mostrarGaleria;
window.mostrarMapa = mostrarMapa;

// Processar dades per al mapa (format compatible)
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

// Construir informació completa per la cerca
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

// Gestió d'errors globals
function gestionarError(error, context = 'aplicació') {
    console.error(`❌ Error en ${context}:`, error);
    
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.innerHTML = `
            <div style="color: #721c24; text-align: center; padding: 2rem;">
                <h3>⚠️ Error carregant l'aplicació</h3>
                <p><strong>Context:</strong> ${context}</p>
                <p><strong>Error:</strong> ${error.message || error}</p>
                <button onclick="location.reload()" style="
                    margin-top: 1rem; 
                    padding: 0.5rem 1rem; 
                    background: #4CAF50; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    cursor: pointer;
                ">🔄 Recarregar pàgina</button>
            </div>`;
        loadingOverlay.classList.remove('hidden');
    }
}

// Validar integritat de les dades carregades
function validarDadesPlantes(data) {
    if (!data) {
        throw new Error('No s\'han pogut carregar les dades');
    }
    
    const plantes = data.plantes || data;
    
    if (!Array.isArray(plantes)) {
        throw new Error('Format de dades incorrecte: s\'esperava un array de plantes');
    }
    
    if (plantes.length === 0) {
        throw new Error('No s\'han trobat dades de plantes');
    }
    
    // Validar estructura bàsica de cada planta
    const plantesInvalides = [];
    plantes.forEach((planta, index) => {
        if (!planta.nom_cientific || !planta.nom_comu || !planta.familia) {
            plantesInvalides.push(index);
        }
    });
    
    if (plantesInvalides.length > 0) {
        console.warn(`⚠️ ${plantesInvalides.length} plantes amb dades incompletes:`, plantesInvalides);
    }
    
    console.log(`✅ Dades validades: ${plantes.length} plantes carregades`);
    return plantes;
}

// Mostrar progres de carregament
function actualitzarProgresCarregament(pas, total, missatge) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const percentatge = Math.round((pas / total) * 100);
        loadingOverlay.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${missatge}</p>
            <div style="
                width: 300px; 
                height: 20px; 
                background: #e9ecef; 
                border-radius: 10px; 
                margin: 1rem 0;
                overflow: hidden;
            ">
                <div style="
                    width: ${percentatge}%; 
                    height: 100%; 
                    background: linear-gradient(90deg, #4CAF50, #388E3C); 
                    transition: width 0.3s ease;
                "></div>
            </div>
            <small>${percentatge}% completat</small>
        `;
    }
}

// Inicialització principal de l'aplicació
async function inicialitzarAplicacio() {
    try {
        console.log('🚀 === INICIANT APLICACIÓ GALERIA BOTÀNICA UAB ===');
        
        // Pas 1: Mostrar loading i validar entorn
        actualitzarProgresCarregament(1, 6, '🔧 Inicialitzant entorn...');
        
        // Verificar dependències essencials
        if (typeof jQuery === 'undefined') {
            throw new Error('jQuery no està carregat');
        }
        if (typeof L === 'undefined') {
            throw new Error('Leaflet no està carregat');
        }
        
        console.log('✅ Dependències verificades');
        
        // Pas 2: Carregar dades de plantes
        actualitzarProgresCarregament(2, 6, '📊 Carregant dades de plantes...');
        
        const response = await fetch('dades/plantes.json');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        const plantesValidades = validarDadesPlantes(data);
        
        // Pas 3: Processar imatges amb el sistema millorat
        actualitzarProgresCarregament(3, 6, '🖼️ Processant imatges des de GitHub...');
        
        if (typeof SistemaImatgesGitHub === 'undefined') {
            throw new Error('Sistema d\'imatges no carregat');
        }
        
        const sistemaImatges = new SistemaImatgesGitHub();
        const plantesAmbImatges = await sistemaImatges.processarTotesLesPlantes(plantesValidades);
        
        // Pas 4: Assignar a variables globals
        actualitzarProgresCarregament(4, 6, '🔗 Configurant variables globals...');
        
        window.gb_plantes_data = plantesAmbImatges;
        window.mb_vars.dades_plantes = processarDadesPerMapa(plantesAmbImatges);
        
        console.log(`📦 Variables globals configurades: ${plantesAmbImatges.length} plantes`);
        
        // Pas 5: Generar contingut de galeria i mapa
        actualitzarProgresCarregament(5, 6, '🎨 Generant interfície...');
        
        // Esperar que les funcions estiguin disponibles
        await esperarFuncionsDisponibles();
        
        // Generar contingut de la galeria
        await window.generarGaleriaHTML(plantesAmbImatges);
        console.log('✅ Galeria generada');
        
        // Generar contingut del mapa
        await window.generarMapaHTML();
        console.log('✅ Mapa generat');
        
        // Pas 6: Finalitzar inicialització
        actualitzarProgresCarregament(6, 6, '✨ Finalitzant...');
        
        // Configurar event listeners globals
        configurarEventListenersGlobals();
        
        // Amagar loading overlay
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
            console.log('🎉 APLICACIÓ INICIALITZADA CORRECTAMENT');
        }, 500);
        
    } catch (error) {
        gestionarError(error, 'inicialització de l\'aplicació');
    }
}

// Esperar que les funcions necessàries estiguin disponibles
function esperarFuncionsDisponibles() {
    return new Promise((resolve, reject) => {
        let intents = 0;
        const maxIntents = 50; // Màxim 5 segons d'espera
        
        const verificar = () => {
            if (typeof window.generarGaleriaHTML === 'function' && 
                typeof window.generarMapaHTML === 'function') {
                resolve();
            } else {
                intents++;
                if (intents < maxIntents) {
                    setTimeout(verificar, 100);
                } else {
                    reject(new Error('No s\'han pogut carregar les funcions necessàries després de 5 segons'));
                }
            }
        };
        
        verificar();
    });
}

// Configurar event listeners globals de l'aplicació
function configurarEventListenersGlobals() {
    console.log('🔧 Configurant event listeners globals...');
    
    // Event listeners per tancar modals globals
    jQuery(document).on('click', '.planta-modal-tancar, .planta-modal', function(e) {
        if (e.target === this) {
            jQuery('.planta-modal').fadeOut(300).removeClass('actiu');
            jQuery('body').css('overflow', 'auto');
            
            // Eliminar hash de l'URL si és necessari
            if (window.location.hash.startsWith('#planta-')) {
                window.location.hash = '';
            }
        }
    });
    
    // Event listeners per tancar lightbox globals
    jQuery(document).on('click', '.planta-lightbox-tancar', function(e) {
        e.stopPropagation();
        const lightbox = jQuery(this).parent();
        lightbox.removeClass('actiu');
        setTimeout(function() {
            lightbox.remove();
            jQuery(document).off('keydown.lightbox');
        }, 300);
    });
    
    // Tancar modals i lightbox amb ESC
    jQuery(document).keydown(function(e) {
        if (e.key === "Escape") {
            // Tancar lightbox si està obert
            const lightbox = jQuery('.planta-lightbox.actiu');
            if (lightbox.length > 0) {
                lightbox.removeClass('actiu');
                setTimeout(function() {
                    lightbox.remove();
                    jQuery(document).off('keydown.lightbox');
                }, 300);
                return;
            }
            
            // Tancar modal si està obert
            const modal = jQuery('.planta-modal.actiu');
            if (modal.length > 0) {
                modal.fadeOut(300).removeClass('actiu');
                jQuery('body').css('overflow', 'auto');
                if (window.location.hash.startsWith('#planta-')) {
                    window.location.hash = '';
                }
            }
        }
    });
    
    // Event listener per a canvis de hash URL
    jQuery(window).on('hashchange', function() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#planta-')) {
            const plantaId = hash.substring(8);
            // Intentar obrir detalls si les funcions estan disponibles
            if (typeof window.obrirDetallsPlanta === 'function') {
                window.obrirDetallsPlanta(plantaId);
            }
        }
    });
    
    // Event listener per a errors de càrrega d'imatges globals
    jQuery(document).on('error', 'img', function() {
        const $img = jQuery(this);
        if (!$img.attr('src').includes('default_planta.jpg')) {
            $img.attr('src', 'assets/imatges/default_planta.jpg');
        }
    });
    
    // Event listener per a redimensionament de finestra
    jQuery(window).on('resize', function() {
        // Redimensionar mapa si està visible i existeix
        if (window.map && jQuery('#mapa-section').is(':visible')) {
            setTimeout(() => {
                window.map.invalidateSize();
            }, 100);
        }
    });
    
    console.log('✅ Event listeners globals configurats');
}

// Funcions per gestionar l'estat de l'aplicació
const AppState = {
    seccioActual: 'inici',
    modalObert: false,
    lightboxObert: false,
    
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
    }
};

// Fer AppState accessible globalment
window.AppState = AppState;

// Verificar hash inicial de l'URL
function verificarHashInicial() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#planta-')) {
        // Canviar a la galeria si s'intenta obrir una planta directament
        setTimeout(() => {
            mostrarGaleria();
        }, 1000);
    }
}

// Carregar dades i inicialitzar quan el DOM estigui llest
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregat, iniciant aplicació...');
    
    // Verificar hash inicial
    verificarHashInicial();
    
    // Inicialitzar aplicació
    inicialitzarAplicacio();
});

// Event listener per quan es carregui completament la pàgina
window.addEventListener('load', function() {
    console.log('🌐 Pàgina completament carregada');
    
    // Verificar novament el hash per si és necessari
    verificarHashInicial();
});

// Gestió d'errors globals no capturats
window.addEventListener('error', function(event) {
    console.error('❌ Error global no capturat:', event.error);
    gestionarError(event.error, 'error global');
});

// Gestió de promeses rebutjades no capturades
window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Promesa rebutjada no capturada:', event.reason);
    gestionarError(event.reason, 'promesa rebutjada');
    event.preventDefault(); // Evitar que aparegui a la consola
});

console.log('🔧 Script d\'inicialització carregat');
