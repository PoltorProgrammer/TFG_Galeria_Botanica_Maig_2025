/**
 * Galeria Botànica UAB - VERSIÓ CORREGIDA AMB SELECTORS ESPECÍFICS
 * Soluciona els problemes de filtres compartits entre galeria i mapa
 * ACTUALITZAT: Correccions dels popups aplicades
 */

// Assegurar-se que les funcions són globals
window.generarGaleriaHTML = generarGaleriaHTML;

// Funció per generar el HTML de la galeria
async function generarGaleriaHTML(plantes) {
    const galeriaContainer = document.getElementById('galeria-section');
    if (!galeriaContainer || !plantes) return;
    
    let html = '';
    
    // Generar filtres
    html += generarHTMLFiltres(plantes);
    
    // Generar graella de plantes
    html += '<div class="plantes-grid">';
    
    plantes.forEach(planta => {
        html += generarHTMLPlantaItem(planta);
    });
    
    html += '</div>';
    
    // CORRECCIÓ: El modal ja existeix al HTML principal, no el duplicar
    // Comentat per evitar duplicats:
    // html += `<div class="planta-modal" style="display: none;">
    //     <div class="planta-modal-contingut">
    //         <span class="planta-modal-tancar">&times;</span>
    //         <div class="planta-modal-cos"></div>
    //     </div>
    // </div>`;
    
    galeriaContainer.innerHTML = html;
    
    // Inicialitzar funcionalitat després de generar el HTML
    inicialitzarGaleria();
}

// Generar HTML dels filtres
function generarHTMLFiltres(plantes) {
    let html = '<div class="filtres-contenidor galeria-filtres-contenidor">';
    html += '<div class="filtres-barra">';
    
    // Filtre per tipus de planta
    html += generarFiltresTipus(plantes);
    
    // Filtre per tipus d'imatge
    html += generarFiltresImatge(plantes);
    
    // Filtre per colors
    html += generarFiltresColors(plantes);
    
    // Filtre per hàbitat
    html += generarFiltresHabitat(plantes);
    
    // Filtre per floració
    html += generarFiltresFloracio(plantes);
    
    // Filtre per fullatge
    html += generarFiltresFullatge(plantes);
    
    // Filtre per usos
    html += generarFiltresUsos(plantes);
    
    html += '</div>'; // Fi filtres-barra
    
    // Secció per mostrar filtres actius
    html += `<div class="filtres-actius-contenidor galeria-filtres-actius-contenidor">
        <span class="etiqueta-filtres-actius">Filtres actius:</span>
        <div class="filtres-actius galeria-filtres-actius"></div>
        <button class="netejar-filtres galeria-netejar-filtres" style="display: none;">Netejar tots els filtres</button>
    </div>`;
    
    // Barra de cerca
    html += `<div class="cerca-contenidor">
        <input type="text" id="galeria-cerca-plantes" placeholder="Cercar per paraules clau..." class="cerca-input galeria-cerca-input" />
    </div>`;
    
    html += '</div>'; // Fi filtres-contenidor
    
    return html;
}

// Generar filtres de tipus
function generarFiltresTipus(plantes) {
    const tipus = [...new Set(plantes.map(p => p.tipus))].sort();
    
    let html = '<div class="grup-filtre tipus-planta-filtre">';
    html += '<span class="etiqueta-filtre">Tipus:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="tipus" data-filtre="tots">Totes les plantes</button>';
    
    tipus.forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="tipus" data-filtre="${tipus}">${nomTipus}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'imatge
function generarFiltresImatge(plantes) {
    const tipusImatges = new Set();
    
    plantes.forEach(planta => {
        if (planta.imatges?.principal_tipus && planta.imatges.principal_tipus !== 'general') {
            tipusImatges.add(planta.imatges.principal_tipus);
        }
        if (planta.imatges?.detalls_tipus) {
            planta.imatges.detalls_tipus.forEach(tipus => {
                if (tipus !== 'general') {
                    tipusImatges.add(tipus);
                }
            });
        }
    });
    
    if (tipusImatges.size === 0) return '';
    
    let html = '<div class="grup-filtre tipus-imatge-filtre">';
    html += '<span class="etiqueta-filtre">Imatges:</span>';
    html += '<div class="botons-filtre botons-filtre-imatges">';
    html += '<button class="filtre-boto galeria-filtre-boto filtre-imatge actiu" data-group="imatge" data-filtre="tots">Totes</button>';
    
    [...tipusImatges].sort().forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto galeria-filtre-boto filtre-imatge" data-group="imatge" data-filtre="${tipus}">${nomTipus}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres de colors
function generarFiltresColors(plantes) {
    const colors = new Set();
    
    plantes.forEach(planta => {
        if (planta.colors) {
            planta.colors.forEach(color => {
                const colorPrincipal = color.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                if (colorPrincipal) colors.add(colorPrincipal);
            });
        }
    });
    
    if (colors.size === 0) return '';
    
    let html = '<div class="grup-filtre colors-filtre">';
    html += '<span class="etiqueta-filtre">Colors:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="color" data-filtre="tots">Tots</button>';
    
    [...colors].sort().forEach(color => {
        const nomColor = color.charAt(0).toUpperCase() + color.slice(1);
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="color" data-filtre="${color}">${nomColor}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'hàbitat
function generarFiltresHabitat(plantes) {
    const habitats = new Map();
    
    plantes.forEach(planta => {
        if (planta.habitat) {
            planta.habitat.forEach(habitat => {
                const habitatPrincipal = habitat.replace(/\s*\(.*?\)\s*/g, '').trim();
                const habitatNormalitzat = habitatPrincipal.toLowerCase().replace(/\s+/g, '_');
                if (habitatNormalitzat) {
                    habitats.set(habitatNormalitzat, habitatPrincipal);
                }
            });
        }
    });
    
    if (habitats.size === 0) return '';
    
    let html = '<div class="grup-filtre habitat-filtre">';
    html += '<span class="etiqueta-filtre">Hàbitat:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="habitat" data-filtre="tots">Tots</button>';
    
    [...habitats.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([habitatNorm, habitatNom]) => {
        const nomMostrar = habitatNom.replace(/_/g, ' ');
        const nomCapitalitzat = nomMostrar.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="habitat" data-filtre="${habitatNorm}">${nomCapitalitzat}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres de floració
function generarFiltresFloracio(plantes) {
    const floracions = new Set();
    
    plantes.forEach(planta => {
        if (planta.caracteristiques?.floracio) {
            const floracio = planta.caracteristiques.floracio;
            if (Array.isArray(floracio)) {
                floracio.forEach(f => {
                    const fPrincipal = f.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                    if (fPrincipal) floracions.add(fPrincipal);
                });
            } else if (typeof floracio === 'string') {
                const fPrincipal = floracio.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                if (fPrincipal) floracions.add(fPrincipal);
            }
        }
    });
    
    if (floracions.size === 0) return '';
    
    let html = '<div class="grup-filtre floracio-filtre">';
    html += '<span class="etiqueta-filtre">Floració:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="floracio" data-filtre="tots">Totes</button>';
    
    [...floracions].sort().forEach(floracio => {
        const nomFloracio = floracio.charAt(0).toUpperCase() + floracio.slice(1);
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="floracio" data-filtre="${floracio}">${nomFloracio}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres de fullatge
function generarFiltresFullatge(plantes) {
    const fullatges = new Set();
    
    plantes.forEach(planta => {
        if (planta.caracteristiques?.fullatge) {
            fullatges.add(planta.caracteristiques.fullatge);
        }
    });
    
    if (fullatges.size === 0) return '';
    
    let html = '<div class="grup-filtre fullatge-filtre">';
    html += '<span class="etiqueta-filtre">Fullatge:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="fullatge" data-filtre="tots">Tots</button>';
    
    [...fullatges].sort().forEach(fullatge => {
        const nomFullatge = fullatge.charAt(0).toUpperCase() + fullatge.slice(1);
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="fullatge" data-filtre="${fullatge}">${nomFullatge}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'usos
function generarFiltresUsos(plantes) {
    const usos = new Map();
    
    plantes.forEach(planta => {
        if (planta.usos) {
            planta.usos.forEach(us => {
                const usPrincipal = us.replace(/\s*\(.*?\)\s*/g, '').trim();
                const usNormalitzat = usPrincipal.toLowerCase().replace(/\s+/g, '_');
                if (usNormalitzat) {
                    usos.set(usNormalitzat, usPrincipal);
                }
            });
        }
    });
    
    if (usos.size === 0) return '';
    
    let html = '<div class="grup-filtre usos-filtre">';
    html += '<span class="etiqueta-filtre">Usos:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto galeria-filtre-boto actiu" data-group="usos" data-filtre="tots">Tots</button>';
    
    [...usos.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([usNorm, usNom]) => {
        html += `<button class="filtre-boto galeria-filtre-boto" data-group="usos" data-filtre="${usNorm}">${usNom.charAt(0).toUpperCase() + usNom.slice(1)}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar HTML d'un item de planta
function generarHTMLPlantaItem(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    const imatges = planta.imatges || { principal: 'default_planta.jpg', principal_tipus: 'general', detalls: [], detalls_tipus: [] };
    
    // Preparar atributs de dades per als filtres
    const dataAttrs = prepararDataAttributsPlanta(planta, imatges);
    
    let html = `<div class="planta-item" ${dataAttrs} id="planta-${plantaId}">`;
    
    // Imatge principal
    html += '<div class="planta-imatge">';
    html += `<a href="#" class="planta-obrir-detall" data-planta="${plantaId}">`;
    
    if (imatges.principal) {
        const imatgeUrl = `assets/imatges/${imatges.principal}`;
        html += `<img class="planta-imatge-principal" src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" onerror="this.src='assets/imatges/default_planta.jpg'">`;
        
        if (imatges.principal_tipus !== 'general') {
            html += `<span class="planta-tipus-imatge">${imatges.principal_tipus.charAt(0).toUpperCase() + imatges.principal_tipus.slice(1)}</span>`;
        }
    } else {
        html += '<div class="planta-sense-imatge">Imatge no disponible</div>';
    }
    
    html += '</a>';
    html += '</div>';
    
    // Informació bàsica
    html += '<div class="planta-info">';
    html += `<h3>${escapeHtml(planta.nom_comu)}</h3>`;
    html += `<p class="nom-cientific">${escapeHtml(planta.nom_cientific)}</p>`;
    html += `<p class="familia">Família: ${escapeHtml(planta.familia)}</p>`;
    html += '</div>';
    
    // Botó per veure més detalls
    html += '<div class="planta-boto-detalls">';
    html += `<a href="#" class="planta-obrir-detall" data-planta="${plantaId}">Veure detalls</a>`;
    html += '</div>';
    
    html += '</div>';
    
    return html;
}

// Preparar atributs de dades per als filtres
function prepararDataAttributsPlanta(planta, imatges) {
    let attrs = [];
    
    // Tipus de planta
    attrs.push(`data-tipus="${escapeHtml(planta.tipus)}"`);
    
    // Tipus d'imatge principal
    attrs.push(`data-tipus-imatge="${escapeHtml(imatges.principal_tipus)}"`);
    
    // Colors
    if (planta.colors && planta.colors.length > 0) {
        const colorsProcessats = planta.colors.map(color => {
            return color.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
        }).filter(c => c);
        attrs.push(`data-colors="${colorsProcessats.join(' ')}"`);
    }
    
    // Hàbitats
    if (planta.habitat && planta.habitat.length > 0) {
        const habitatsNormalitzats = planta.habitat.map(habitat => {
            const habitatPrincipal = habitat.replace(/\s*\(.*?\)\s*/g, '').trim();
            return habitatPrincipal.toLowerCase().replace(/\s+/g, '_');
        }).filter(h => h);
        attrs.push(`data-habitats="${habitatsNormalitzats.join(' ')}"`);
    }
    
    // Floració
    if (planta.caracteristiques?.floracio) {
        const floracio = planta.caracteristiques.floracio;
        let floracions = [];
        
        if (Array.isArray(floracio)) {
            floracions = floracio.map(f => f.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase()).filter(f => f);
        } else if (typeof floracio === 'string') {
            const f = floracio.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
            if (f) floracions = [f];
        }
        
        if (floracions.length > 0) {
            attrs.push(`data-floracio="${floracions.join(' ')}"`);
        }
    }
    
    // Fullatge
    if (planta.caracteristiques?.fullatge) {
        attrs.push(`data-fullatge="${escapeHtml(planta.caracteristiques.fullatge)}"`);
    }
    
    // Usos
    if (planta.usos && planta.usos.length > 0) {
        const usosNormalitzats = planta.usos.map(us => {
            const usPrincipal = us.replace(/\s*\(.*?\)\s*/g, '').trim();
            return usPrincipal.toLowerCase().replace(/\s+/g, '_');
        }).filter(u => u);
        attrs.push(`data-usos="${usosNormalitzats.join(' ')}"`);
    }
    
    // Informació completa per a la cerca
    const infoCompleta = construirInfoCompletaCerca(planta);
    attrs.push(`data-info-completa="${escapeHtml(infoCompleta)}"`);
    
    // Dades d'imatges en JSON
    const imatgesJson = {
        principal: imatges.principal,
        [imatges.principal_tipus]: imatges.principal
    };
    
    if (imatges.detalls && imatges.detalls.length > 0) {
        imatges.detalls.forEach((img, i) => {
            const tipus = imatges.detalls_tipus[i] || 'general';
            if (!imatgesJson[tipus]) {
                imatgesJson[tipus] = img;
            }
        });
    }
    
    attrs.push(`data-imatges='${JSON.stringify(imatgesJson).replace(/'/g, "&apos;")}'`);
    
    return attrs.join(' ');
}

// Funcions d'utilitat
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeTitle(text) {
    return text.toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/[^a-z0-9\-]/g, '')
               .replace(/\-+/g, '-')
               .replace(/^-|-$/g, '');
}

function construirInfoCompletaCerca(planta) {
    let info = [planta.nom_comu, planta.nom_cientific, planta.familia, planta.descripcio, planta.tipus];
    
    // Característiques
    if (planta.caracteristiques) {
        for (const valor of Object.values(planta.caracteristiques)) {
            if (Array.isArray(valor)) {
                info.push(...valor);
            } else if (valor) {
                info.push(valor);
            }
        }
    }
    
    // Usos
    if (planta.usos) {
        const usosNetejats = planta.usos.map(us => us.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...usosNetejats);
    }
    
    // Colors
    if (planta.colors) {
        const colorsNetejats = planta.colors.map(c => c.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...colorsNetejats);
    }
    
    // Hàbitats
    if (planta.habitat) {
        const habitatsNetejats = planta.habitat.map(h => h.replace(/\s*\(.*?\)\s*/g, '').trim());
        info.push(...habitatsNetejats);
    }
    
    return info.filter(i => i).join(' ');
}

/* ========================================================================
   EVENTS I FUNCIONALITAT DE LA GALERIA BOTÀNICA - SELECTORS ESPECÍFICS
   ACTUALITZAT: Correccions dels popups aplicades
   ======================================================================== */

// Variables globals de la galeria
let modalObert = false;
const filtresActiusGaleria = {
    tipus: 'tots',
    imatge: 'tots',
    color: 'tots',
    habitat: 'tots',
    floracio: 'tots',
    fullatge: 'tots',
    usos: 'tots'
};

// Inicialitzar la galeria després de generar el HTML
function inicialitzarGaleria() {
    console.log("🎯 Inicialitzant funcionalitat de la galeria...");
    
    // Configurar event listeners específics per a la galeria
    configurarEventListenersGaleria();
    
    // CORRECCIÓ: No inicialitzar modal aquí (es fa al popup-fixes.js)
    // inicialitzarModalGaleria();
    
    // Aplicar filtres inicials
    actualitzarFiltresActiusGaleria();
    aplicarFiltresGaleria();
    mostrarFiltresActiusGaleria();
    
    console.log("✅ Galeria inicialitzada correctament");
}

// Configurar event listeners específics de la galeria
function configurarEventListenersGaleria() {
    // Event listeners ESPECÍFICS per als botons de filtre de la GALERIA
    jQuery(document).on('click', '.galeria-filtres-contenidor .galeria-filtre-boto', function() {
        gestionarClicFiltreGaleria(jQuery(this));
    });
    
    // Event listener per al botó de neteja de la GALERIA
    jQuery(document).on('click', '.galeria-netejar-filtres', function() {
        netejarTotsFiltresGaleria();
    });
    
    // Event listeners per eliminar filtres individuals de la GALERIA
    jQuery(document).on('click', '.galeria-filtres-actius .eliminar-filtre', function() {
        eliminarFiltreGaleria(jQuery(this));
    });
    
    // Event listener per al camp de cerca de la GALERIA
    jQuery(document).on('input', '#galeria-cerca-plantes', function() {
        aplicarFiltresGaleria();
    });
    
    // CORRECCIÓ: Event listeners per obrir detalls de planta millorats
    // Aquests es gestionen millor al popup-fixes.js, però mantenim compatibilitat
    jQuery(document).on('click', '.galeria-botanica .planta-obrir-detall', function(e) {
        e.preventDefault();
        const plantaId = jQuery(this).data('planta');
        if (plantaId) {
            // Comprovar si la funció global existeix (del popup-fixes.js)
            if (typeof window.obrirDetallsPlanta === 'function') {
                window.obrirDetallsPlanta(plantaId);
            } else {
                // Fallback a la funció local
                obrirDetallsPlantaLocal(plantaId);
            }
            // Actualitzar URL amb hash
            window.location.hash = `planta-${plantaId}`;
        }
    });
}

// FUNCIÓ CORREGIDA: Gestionar clic en botons de filtre de la GALERIA
function gestionarClicFiltreGaleria($boto) {
    try {
        const grupFiltre = $boto.data('group');
        const valorFiltre = $boto.data('filtre');
        
        if (!grupFiltre || !valorFiltre) {
            console.warn("⚠️ Botó galeria sense atributs necessaris:", $boto[0]);
            return;
        }
        
        console.log(`🔘 Filtre GALERIA clicat: ${grupFiltre}=${valorFiltre}, actiu=${$boto.hasClass('actiu')}`);
        
        // Comportament especial per al filtre d'imatges (excloent)
        if (grupFiltre === 'imatge') {
            jQuery('.galeria-filtres-contenidor .galeria-filtre-boto[data-group="imatge"]').removeClass('actiu');
            $boto.addClass('actiu');
            filtresActiusGaleria.imatge = valorFiltre;
            
            aplicarCanviImatgesGaleria(valorFiltre);
            aplicarFiltresGaleria();
            mostrarFiltresActiusGaleria();
            return;
        }
        
        // Comportament especial per al filtre de fullatge (excloent)
        if (grupFiltre === 'fullatge') {
            jQuery('.galeria-filtres-contenidor .galeria-filtre-boto[data-group="fullatge"]').removeClass('actiu');
            $boto.addClass('actiu');
            filtresActiusGaleria.fullatge = valorFiltre;
            
            aplicarFiltresGaleria();
            mostrarFiltresActiusGaleria();
            return;
        }
        
        // Per a filtres multi-selecció (tipus, color, habitat, floracio, usos)
        if (valorFiltre === 'tots') {
            // Si cliquem "Tots", desactivar tots els altres i activar només "Tots"
            jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
            $boto.addClass('actiu');
            filtresActiusGaleria[grupFiltre] = 'tots';
        } else {
            // Si cliquem una opció específica
            if ($boto.hasClass('actiu')) {
                // Si ja estava activa, la desactivem
                $boto.removeClass('actiu');
                
                // Si no queda cap opció activa, activar "Tots"
                const botonsActius = jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
                if (botonsActius.length === 0) {
                    jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
                    filtresActiusGaleria[grupFiltre] = 'tots';
                }
            } else {
                // Si no estava activa, l'activem
                jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).removeClass('actiu');
                $boto.addClass('actiu');
                
                // CORRECCIÓ: Verificar si hem seleccionat totes les opcions DESPRÉS d'un petit delay
                setTimeout(function() {
                    if (verificarTotesOpcionsSeleccionadesGaleria(grupFiltre)) {
                        activarBotoTotsGaleria(grupFiltre);
                    }
                }, 50);
            }
        }
        
        actualitzarFiltresActiusGaleria();
        aplicarFiltresGaleria();
        mostrarFiltresActiusGaleria();
    } catch (error) {
        console.error("❌ Error en clic a botó de filtre de la galeria:", error);
    }
}

// FUNCIÓ CORREGIDA: Verificar si s'han seleccionat totes les opcions d'un filtre de la GALERIA
function verificarTotesOpcionsSeleccionadesGaleria(grupFiltre) {
    try {
        // No aplica per filtres excloents
        if (grupFiltre === 'imatge' || grupFiltre === 'fullatge') {
            return false;
        }
        
        const botonsGrup = jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
        const botonsActius = jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
        
        const totesSeleccionades = botonsGrup.length > 0 && botonsGrup.length === botonsActius.length;
        
        console.log(`🔍 Verificant GALERIA ${grupFiltre}: ${botonsActius.length}/${botonsGrup.length} opcions seleccionades = ${totesSeleccionades}`);
        
        return totesSeleccionades;
    } catch (error) {
        console.error("❌ Error en verificarTotesOpcionsSeleccionadesGaleria:", error);
        return false;
    }
}

// FUNCIÓ CORREGIDA: Activar el botó "Tots" d'un grup específic de la GALERIA
function activarBotoTotsGaleria(grupFiltre) {
    try {
        console.log(`✅ Activant "Tots" per ${grupFiltre} a la GALERIA (totes les opcions seleccionades)`);
        
        jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
        jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
        filtresActiusGaleria[grupFiltre] = 'tots';
    } catch (error) {
        console.error("❌ Error en activarBotoTotsGaleria:", error);
    }
}

// FUNCIÓ CORREGIDA: Actualitzar l'objecte de filtres actius de la GALERIA
function actualitzarFiltresActiusGaleria() {
    try {
        ['tipus', 'imatge', 'color', 'habitat', 'floracio', 'fullatge', 'usos'].forEach(grup => {
            if (grup === 'imatge' || grup === 'fullatge') {
                // Filtres excloents
                const filtreActiu = jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"].actiu`);
                const valorFiltre = filtreActiu.data('filtre');
                filtresActiusGaleria[grup] = valorFiltre || 'tots';
            } else {
                // Filtres multi-selecció
                if (jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"][data-filtre="tots"]`).hasClass('actiu')) {
                    filtresActiusGaleria[grup] = 'tots';
                } else {
                    const filtresGrup = jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                    
                    if (filtresGrup.length === 0) {
                        filtresActiusGaleria[grup] = 'tots';
                    } else {
                        const valors = [];
                        filtresGrup.each(function() {
                            const valorFiltre = jQuery(this).data('filtre');
                            if (valorFiltre) valors.push(valorFiltre);
                        });
                        filtresActiusGaleria[grup] = valors.length > 0 ? valors : 'tots';
                    }
                }
            }
        });
        
        console.log("🔄 Filtres actius GALERIA actualitzats:", filtresActiusGaleria);
    } catch (error) {
        console.error("❌ Error en actualitzarFiltresActiusGaleria:", error);
        Object.keys(filtresActiusGaleria).forEach(key => {
            filtresActiusGaleria[key] = 'tots';
        });
    }
}

// FUNCIÓ CORREGIDA: Mostrar filtres actius de la GALERIA
function mostrarFiltresActiusGaleria() {
    try {
        const contFiltre = jQuery('.galeria-filtres-actius');
        contFiltre.empty();
        
        let hiHaFiltresActius = false;
        
        Object.entries(filtresActiusGaleria).forEach(([grup, valors]) => {
            if (valors !== 'tots') {
                hiHaFiltresActius = true;
                
                let grupText = '';
                switch (grup) {
                    case 'tipus': grupText = 'Tipus'; break;
                    case 'imatge': grupText = 'Imatge'; break;
                    case 'color': grupText = 'Color'; break;
                    case 'habitat': grupText = 'Hàbitat'; break;
                    case 'floracio': grupText = 'Floració'; break;
                    case 'fullatge': grupText = 'Fullatge'; break;
                    case 'usos': grupText = 'Usos'; break;
                    default: grupText = grup.charAt(0).toUpperCase() + grup.slice(1);
                }
                
                if (grup === 'imatge' || grup === 'fullatge') {
                    // Filtres excloents - només mostrar si no és "tots"
                    if (valors && valors !== 'tots') {
                        const valorStr = String(valors);
                        const valorText = valorStr.charAt(0).toUpperCase() + valorStr.slice(1).replace(/_/g, ' ');
                        const etiqueta = jQuery(`<span class="filtre-actiu" data-group="${grup}" data-filtre="${valorStr}">
                            ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                        </span>`);
                        contFiltre.append(etiqueta);
                    }
                } else if (Array.isArray(valors)) {
                    // Filtres multi-selecció - només mostrar si no és "tots"
                    valors.forEach(valor => {
                        if (valor) {
                            const valorStr = String(valor);
                            const valorText = valorStr.charAt(0).toUpperCase() + valorStr.slice(1).replace(/_/g, ' ');
                            
                            const etiqueta = jQuery(`<span class="filtre-actiu" data-group="${grup}" data-filtre="${valorStr}">
                                ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                            </span>`);
                            
                            contFiltre.append(etiqueta);
                        }
                    });
                }
            }
        });
        
        if (hiHaFiltresActius) {
            jQuery('.galeria-netejar-filtres').show();
        } else {
            jQuery('.galeria-netejar-filtres').hide();
        }
        
        console.log("🏷️ Filtres actius GALERIA mostrats:", hiHaFiltresActius ? "Sí" : "No");
    } catch (error) {
        console.error("❌ Error en mostrarFiltresActiusGaleria:", error);
        jQuery('.galeria-netejar-filtres').hide();
    }
}

// FUNCIÓ CORREGIDA: Eliminar un filtre individual de la GALERIA
function eliminarFiltreGaleria($element) {
    try {
        const $etiqueta = $element.parent();
        const grup = $etiqueta.data('group');
        const valor = $etiqueta.data('filtre');
        
        if (!grup || valor === undefined) {
            console.warn("⚠️ Etiqueta galeria sense atributs necessaris:", $etiqueta);
            return;
        }
        
        console.log(`❌ Eliminant filtre GALERIA: ${grup}=${valor}`);
        
        // Desactivar el botó corresponent
        jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`).removeClass('actiu');
        
        // Si no queda cap botó actiu en aquest grup, activar "Tots"
        if (jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"].actiu`).length === 0) {
            jQuery(`.galeria-filtres-contenidor .galeria-filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
            filtresActiusGaleria[grup] = 'tots';
        }
        
        // Verificar si totes les opcions segueixen seleccionades després d'eliminar una
        setTimeout(function() {
            if (verificarTotesOpcionsSeleccionadesGaleria(grup)) {
                activarBotoTotsGaleria(grup);
            }
        }, 50);
        
        actualitzarFiltresActiusGaleria();
        aplicarFiltresGaleria();
        mostrarFiltresActiusGaleria();
    } catch (error) {
        console.error("❌ Error en eliminar filtre de la galeria:", error);
    }
}

// FUNCIÓ CORREGIDA: Netejar tots els filtres de la GALERIA
function netejarTotsFiltresGaleria() {
    try {
        console.log("🧹 Netejant filtres de la GALERIA");
        
        jQuery('.galeria-filtres-contenidor .galeria-filtre-boto').removeClass('actiu');
        jQuery('.galeria-filtres-contenidor .galeria-filtre-boto[data-filtre="tots"]').addClass('actiu');
        
        Object.keys(filtresActiusGaleria).forEach(key => {
            filtresActiusGaleria[key] = 'tots';
        });
        
        jQuery('#galeria-cerca-plantes').val('');
        
        aplicarCanviImatgesGaleria('tots');
        aplicarFiltresGaleria();
        mostrarFiltresActiusGaleria();
        
    } catch (error) {
        console.error("❌ Error en netejar filtres de la galeria:", error);
    }
}

// Aplicar filtres a les plantes de la GALERIA
function aplicarFiltresGaleria() {
    try {
        jQuery('.planta-item').fadeOut(200);
        
        const textCerca = String(jQuery('#galeria-cerca-plantes').val() || '').toLowerCase().trim();
        
        setTimeout(function() {
            let plantesVisibles = 0;
            
            jQuery('.planta-item').each(function() {
                const $planta = jQuery(this);
                let passaFiltres = true;
                
                // Filtre de tipus de planta
                if (filtresActiusGaleria.tipus !== 'tots') {
                    const tipusPlanta = $planta.data('tipus');
                    if (!tipusPlanta) {
                        passaFiltres = false;
                    } else if (Array.isArray(filtresActiusGaleria.tipus)) {
                        passaFiltres = passaFiltres && filtresActiusGaleria.tipus.includes(tipusPlanta);
                    } else {
                        passaFiltres = passaFiltres && (tipusPlanta === filtresActiusGaleria.tipus);
                    }
                }
                
                // Filtre de colors
                if (passaFiltres && filtresActiusGaleria.color !== 'tots') {
                    const colorsPlanta = $planta.data('colors');
                    if (colorsPlanta) {
                        const arrColors = String(colorsPlanta).split(' ');
                        if (Array.isArray(filtresActiusGaleria.color)) {
                            let passaColor = false;
                            for (const colorFiltre of filtresActiusGaleria.color) {
                                if (arrColors.includes(colorFiltre)) {
                                    passaColor = true;
                                    break;
                                }
                            }
                            passaFiltres = passaFiltres && passaColor;
                        } else {
                            passaFiltres = passaFiltres && arrColors.includes(filtresActiusGaleria.color);
                        }
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre d'hàbitat
                if (passaFiltres && filtresActiusGaleria.habitat !== 'tots') {
                    const habitatsPlanta = $planta.data('habitats');
                    if (habitatsPlanta) {
                        const arrHabitats = String(habitatsPlanta).split(' ');
                        let passaHabitat = false;
                        if (Array.isArray(filtresActiusGaleria.habitat)) {
                            for (const habitat of arrHabitats) {
                                if (filtresActiusGaleria.habitat.includes(habitat)) {
                                    passaHabitat = true;
                                    break;
                                }
                            }
                        } else {
                            passaHabitat = arrHabitats.includes(filtresActiusGaleria.habitat);
                        }
                        passaFiltres = passaFiltres && passaHabitat;
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre de floració
                if (passaFiltres && filtresActiusGaleria.floracio !== 'tots') {
                    const floracioPlanta = $planta.data('floracio');
                    if (floracioPlanta) {
                        const arrFloracio = String(floracioPlanta).split(' ');
                        let passaFloracio = false;
                        if (Array.isArray(filtresActiusGaleria.floracio)) {
                            for (const floracio of arrFloracio) {
                                if (filtresActiusGaleria.floracio.includes(floracio)) {
                                    passaFloracio = true;
                                    break;
                                }
                            }
                        } else {
                            passaFloracio = arrFloracio.includes(filtresActiusGaleria.floracio);
                        }
                        passaFiltres = passaFiltres && passaFloracio;
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre de fullatge (excloent)
                if (passaFiltres && filtresActiusGaleria.fullatge !== 'tots') {
                    const fullatgePlanta = $planta.data('fullatge');
                    passaFiltres = passaFiltres && (fullatgePlanta === filtresActiusGaleria.fullatge);
                }
                
                // Filtre d'usos
                if (passaFiltres && filtresActiusGaleria.usos !== 'tots') {
                    const usosPlanta = $planta.data('usos');
                    if (usosPlanta) {
                        const arrUsos = String(usosPlanta).split(' ');
                        let passaUsos = false;
                        if (Array.isArray(filtresActiusGaleria.usos)) {
                            for (const us of arrUsos) {
                                if (filtresActiusGaleria.usos.includes(us)) {
                                    passaUsos = true;
                                    break;
                                }
                            }
                        } else {
                            passaUsos = arrUsos.includes(filtresActiusGaleria.usos);
                        }
                        passaFiltres = passaFiltres && passaUsos;
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre de cerca per text
                if (passaFiltres && textCerca) {
                    const dadesPlanta = String($planta.data('info-completa') || '').toLowerCase();
                    passaFiltres = passaFiltres && dadesPlanta.includes(textCerca);
                }
                
                if (passaFiltres) {
                    $planta.fadeIn(300);
                    plantesVisibles++;
                }
            });
            
            console.log(`🔍 Filtres GALERIA aplicats: ${plantesVisibles} plantes visibles`);
        }, 200);
        
    } catch (error) {
        console.error("❌ Error en aplicarFiltresGaleria:", error);
        jQuery('.planta-item').fadeIn(300);
    }
}

// Aplicar canvis d'imatges segons el filtre d'imatges seleccionat de la GALERIA
function aplicarCanviImatgesGaleria(tipusImatge) {
    try {
        jQuery('.planta-item').each(function() {
            const $planta = jQuery(this);
            const imatgesData = $planta.data('imatges');
            
            if (imatgesData && typeof imatgesData === 'object') {
                const $img = $planta.find('.planta-imatge-principal');
                const $indicator = $planta.find('.planta-tipus-imatge');
                
                let novaImatge = '';
                
                if (tipusImatge === 'tots') {
                    novaImatge = imatgesData.principal;
                } else {
                    if (imatgesData[tipusImatge]) {
                        novaImatge = imatgesData[tipusImatge];
                    } else {
                        novaImatge = imatgesData.principal || '';
                    }
                }
                
                if (novaImatge && $img.length) {
                    const src = $img.attr('src');
                    if (src) {
                        const urlBase = src.substring(0, src.lastIndexOf('/') + 1);
                        $img.attr('src', urlBase + novaImatge);
                    }
                }
                
                if (tipusImatge !== 'tots' && tipusImatge !== 'general') {
                    if ($indicator.length === 0) {
                        $planta.find('.planta-imatge a').append(`<span class="planta-tipus-imatge">${tipusImatge.charAt(0).toUpperCase() + tipusImatge.slice(1)}</span>`);
                    } else {
                        $indicator.text(tipusImatge.charAt(0).toUpperCase() + tipusImatge.slice(1));
                    }
                } else {
                    $indicator.remove();
                }
            }
        });
    } catch (error) {
        console.error("❌ Error en aplicarCanviImatgesGaleria:", error);
    }
}

// CORRECCIÓ: Funció de fallback per obrir detalls localment
// Aquesta funció s'utilitzarà només si popup-fixes.js no està carregat
function obrirDetallsPlantaLocal(plantaId) {
    console.log('⚠️ Usant funció local per obrir detalls (popup-fixes.js no disponible)');
    
    // Buscar la planta a les dades
    const planta = gb_plantes_data.find(p => 
        p.id === plantaId || 
        sanitizeTitle(p.nom_cientific) === plantaId ||
        p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
    );
    
    if (!planta) {
        console.error(`❌ No s'ha trobat la planta amb ID: ${plantaId}`);
        return;
    }
    
    // Buscar o crear modal
    let $modal = jQuery('.planta-modal');
    if ($modal.length === 0) {
        jQuery('body').append(`
            <div class="planta-modal" style="display: none;">
                <div class="planta-modal-contingut">
                    <span class="planta-modal-tancar">&times;</span>
                    <div class="planta-modal-cos"></div>
                </div>
            </div>
        `);
        $modal = jQuery('.planta-modal');
    }
    
    // Generar HTML dels detalls
    const htmlDetalls = generarHTMLDetallsPlanta(planta);
    
    // Mostrar el modal
    $modal.find('.planta-modal-cos').html(htmlDetalls);
    $modal.css('display', 'flex').addClass('actiu');
    modalObert = true;
    jQuery('body').css('overflow', 'hidden');
    
    console.log('✅ Modal local obert');
}

// CORRECCIÓ: Funció local per tancar modal
function tancarModalLocal() {
    const $modal = jQuery('.planta-modal');
    
    if ($modal.length === 0) return;
    
    console.log('🚪 Tancant modal local...');
    
    $modal.removeClass('actiu');
    setTimeout(() => {
        $modal.css('display', 'none');
        modalObert = false;
        jQuery('body').css('overflow', 'auto');
        $modal.find('.planta-modal-cos').empty();
    }, 300);
}

// Verificar si hi ha un hash a l'URL per obrir directament una planta
function verificarHashURL() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#planta-')) {
        const plantaId = hash.substring(8);
        setTimeout(function() {
            // Prioritzar la funció global si existeix
            if (typeof window.obrirDetallsPlanta === 'function') {
                window.obrirDetallsPlanta(plantaId);
            } else {
                obrirDetallsPlantaLocal(plantaId);
            }
        }, 500);
    }
}

// Funció per generar HTML dels detalls de planta (reutilitzable)
function generarHTMLDetallsPlanta(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    const imatges = planta.imatges || { principal: 'default_planta.jpg', principal_tipus: 'general', detalls: [], detalls_tipus: [] };
    
    let html = '<div class="planta-detall-individual">';
    
    // Informació principal
    html += `<h2>${escapeHtml(planta.nom_comu)}</h2>`;
    html += `<h3 class="nom-cientific">${escapeHtml(planta.nom_cientific)}</h3>`;
    
    // Galeria d'imatges
    html += '<div class="planta-galeria-completa">';
    
    // Imatge principal
    if (imatges.principal) {
        const imatgeUrl = `assets/imatges/${imatges.principal}`;
        html += '<div class="planta-imatge-principal">';
        html += `<img src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" data-tipus="${escapeHtml(imatges.principal_tipus)}" onerror="this.src='assets/imatges/default_planta.jpg'">`;
        if (imatges.principal_tipus !== 'general') {
            html += `<span class="planta-tipus-imatge-detall">${imatges.principal_tipus.charAt(0).toUpperCase() + imatges.principal_tipus.slice(1)}</span>`;
        }
        html += '</div>';
    } else {
        html += '<div class="planta-imatge-principal planta-sense-imatge">';
        html += '<div>Imatge no disponible</div>';
        html += '</div>';
    }
    
    // Imatges de detall
    if (imatges.detalls && imatges.detalls.length > 0) {
        html += '<div class="planta-imatges-detall-galeria">';
        imatges.detalls.forEach((imatge, i) => {
            const imatgeUrl = `assets/imatges/${imatge}`;
            const tipus = imatges.detalls_tipus[i] || 'general';
            html += `<div class="planta-imatge-detall" data-tipus="${escapeHtml(tipus)}">`;
            html += `<img src="${imatgeUrl}" alt="Detall de ${escapeHtml(planta.nom_comu)}" data-tipus="${escapeHtml(tipus)}" onerror="this.src='assets/imatges/default_planta.jpg'">`;
            if (tipus !== 'general') {
                html += `<span class="planta-tipus-imatge-detall">${tipus.charAt(0).toUpperCase() + tipus.slice(1)}</span>`;
            }
            html += '</div>';
        });
        html += '</div>';
    }
    
    html += '</div>'; // Fi de la galeria
    
    // Informació completa
    html += '<div class="planta-info-completa">';
    
    // Descripció
    html += '<div class="planta-seccio">';
    html += '<h4>Descripció</h4>';
    html += `<p>${escapeHtml(planta.descripcio)}</p>`;
    html += '</div>';
    
    // Classificació
    html += '<div class="planta-seccio">';
    html += '<h4>Classificació</h4>';
    html += `<p><strong>Família:</strong> ${escapeHtml(planta.familia)}</p>`;
    html += `<p><strong>Tipus:</strong> ${planta.tipus.charAt(0).toUpperCase() + planta.tipus.slice(1)}</p>`;
    html += '</div>';
    
    // Característiques
    if (planta.caracteristiques && Object.keys(planta.caracteristiques).length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Característiques</h4>';
        html += '<ul>';
        
        for (const [clau, valor] of Object.entries(planta.caracteristiques)) {
            if (valor !== null && valor !== undefined && valor !== '') {
                const clauFormatada = clau.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                const valorFormatat = Array.isArray(valor) ? valor.map(v => escapeHtml(v)).join(', ') : escapeHtml(valor);
                html += `<li><strong>${clauFormatada}:</strong> ${valorFormatat}</li>`;
            }
        }
        
        html += '</ul>';
        html += '</div>';
    }
    
    // Usos
    if (planta.usos && planta.usos.length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Usos</h4>';
        html += `<p>${planta.usos.map(u => escapeHtml(u)).join(', ')}</p>`;
        html += '</div>';
    }
    
    // Colors
    if (planta.colors && planta.colors.length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Colors</h4>';
        html += `<p>${planta.colors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).map(c => escapeHtml(c)).join(', ')}</p>`;
        html += '</div>';
    }
    
    // Hàbitat
    if (planta.habitat && planta.habitat.length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Hàbitat al campus</h4>';
        html += '<ul>';
        planta.habitat.forEach(habitat => {
            const parts = habitat.split('(');
            let habitatPrincipal = parts[0].trim().replace(/_/g, ' ');
            let textHabitat = habitatPrincipal.charAt(0).toUpperCase() + habitatPrincipal.slice(1);
            
            if (parts.length > 1) {
                const detalls = parts[1].replace(')', '').trim().replace(/_/g, ' ');
                textHabitat += ` (${detalls})`;
            }
            
            html += `<li>${escapeHtml(textHabitat)}</li>`;
        });
        html += '</ul>';
        html += '</div>';
    }
    
    // Coordenades
    if (planta.coordenades && planta.coordenades.length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Localització al campus</h4>';
        html += '<ul>';
        planta.coordenades.forEach(coord => {
            const zona = coord.zona || 'Campus UAB';
            html += `<li><strong>${escapeHtml(zona)}</strong> `;
            html += `Coordenades: ${coord.lat}, ${coord.lng}</li>`;
        });
        html += '</ul>';
        html += '</div>';
    }
    
    html += '</div>'; // Fi de planta-info-completa
    html += '</div>'; // Fi de planta-detall-individual
    
    return html;
}

// Al final del fitxer, després de totes les funcions
jQuery(document).ready(function() {
    verificarHashURL();
});
                                 
// Cridar verificarHashURL quan es carregui la pàgina
jQuery(window).on('load', verificarHashURL);                

// Assegurar funcions globals per compatibilitat
window.generarGaleriaHTML = generarGaleriaHTML;
window.mostrarFiltresActiusGaleria = mostrarFiltresActiusGaleria;
window.generarHTMLDetallsPlanta = generarHTMLDetallsPlanta; // CORRECCIÓ: Fer aquesta funció global

// CORRECCIÓ: No fer aquestes funcions globals si popup-fixes.js està present
if (typeof window.obrirDetallsPlanta === 'undefined') {
    window.obrirDetallsPlanta = obrirDetallsPlantaLocal;
}

console.log('✅ galeria-botanica-original.js carregat amb correccions aplicades');
