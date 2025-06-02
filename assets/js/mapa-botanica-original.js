/**
 * Mapa Botànica UAB - VERSIÓ ACTUALITZADA AMB CORRECCIONS DELS POPUPS
 * Integra les correccions dels modals amb el sistema popup-fixes.js
 */

// Variables globals del mapa
var map = null;
var markers = null;
var totsElsMarcadors = [];
var habitatsLayers = {};

// Fer accessible globalment
window.generarMapaHTML = generarMapaHTML;

// ========================================================================
// FUNCIONS D'UTILITAT PER A FILTRES MILLORATS
// ========================================================================

/**
 * Normalitza un valor eliminant parèntesis i text extra
 * Exemple: "usos productius (producció de carbó)" -> "usos_productius"
 */
function normalitzarValor(valor) {
    if (!valor) return '';
    
    // Eliminar contingut entre parèntesis
    let valorNet = valor.replace(/\s*\(.*?\)\s*/g, '').trim();
    
    // Convertir a minúscules i reemplaçar espais per guions baixos
    return valorNet.toLowerCase().replace(/\s+/g, '_');
}

/**
 * Comprova si un valor coincideix amb un filtre, tenint en compte grups
 * @param {string} valorPlanta - Valor de la planta (pot incloure parèntesis)
 * @param {string} valorFiltre - Valor del filtre (grup o valor específic)
 * @returns {boolean}
 */
function coincideixAmbFiltre(valorPlanta, valorFiltre) {
    // Normalitzar ambdós valors
    const plantaNorm = normalitzarValor(valorPlanta);
    const filtreNorm = normalitzarValor(valorFiltre);
    
    console.log(`🔍 Comparant: "${valorPlanta}" (norm: "${plantaNorm}") amb filtre "${valorFiltre}" (norm: "${filtreNorm}")`);
    
    // Comparació exacta
    if (plantaNorm === filtreNorm) {
        console.log(`✅ Match exacte!`);
        return true;
    }
    
    // Comprovar si el valor de la planta comença amb el filtre
    // Això permet que "usos_agricoles" coincideixi amb "usos_agricoles_i_millora_del_sol"
    if (plantaNorm.startsWith(filtreNorm)) {
        console.log(`✅ Match per prefix (planta comença amb filtre)!`);
        return true;
    }
    
    // Comprovar al revés: si el filtre comença amb el valor de la planta
    // Això permet que "usos_agricoles_i_millora_del_sol" coincideixi amb plantes que tenen "usos agricoles"
    if (filtreNorm.startsWith(plantaNorm)) {
        console.log(`✅ Match per prefix (filtre comença amb planta)!`);
        return true;
    }
    
    // Cas especial per gestionar diferències en com es normalitzen els valors
    // Per exemple: "usos agrícoles i millora del sòl" -> "usos_agricoles_i_millora_del_sol"
    // però el filtre podria ser "usos_agricoles_i_millora_del_sòl" (amb accent)
    const plantaNormSenseAccents = eliminarAccents(plantaNorm);
    const filtreNormSenseAccents = eliminarAccents(filtreNorm);
    
    if (plantaNormSenseAccents === filtreNormSenseAccents) {
        console.log(`✅ Match sense accents!`);
        return true;
    }
    
    if (plantaNormSenseAccents.startsWith(filtreNormSenseAccents) || 
        filtreNormSenseAccents.startsWith(plantaNormSenseAccents)) {
        console.log(`✅ Match per prefix sense accents!`);
        return true;
    }
    
    console.log(`❌ No match`);
    return false;
}

/**
 * Elimina accents d'un text
 */
function eliminarAccents(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Comprova si una llista de valors de planta coincideix amb els filtres actius
 * @param {Array} valorsPlanta - Array de valors de la planta
 * @param {string|Array} filtresActius - Filtre(s) actiu(s)
 * @returns {boolean}
 */
function passaFiltreMultiple(valorsPlanta, filtresActius) {
    if (!valorsPlanta || valorsPlanta.length === 0) {
        console.log('❌ Planta sense valors per aquest camp');
        return false;
    }
    
    console.log(`🔍 Comprovant ${valorsPlanta.length} valors de planta amb filtres:`, filtresActius);
    
    // Si filtresActius és un array
    if (Array.isArray(filtresActius)) {
        // La planta ha de coincidir amb ALGUN dels filtres actius (OR)
        for (const filtre of filtresActius) {
            for (const valorPlanta of valorsPlanta) {
                if (coincideixAmbFiltre(valorPlanta, filtre)) {
                    console.log(`✅ Planta passa el filtre!`);
                    return true;
                }
            }
        }
        console.log(`❌ Planta NO passa cap filtre`);
        return false;
    } else {
        // Si és un sol filtre
        for (const valorPlanta of valorsPlanta) {
            if (coincideixAmbFiltre(valorPlanta, filtresActius)) {
                console.log(`✅ Planta passa el filtre!`);
                return true;
            }
        }
        console.log(`❌ Planta NO passa el filtre`);
        return false;
    }
}

// ========================================================================
// FUNCIONS PRINCIPALS DEL MAPA
// ========================================================================

// Funció per generar el HTML del mapa
async function generarMapaHTML() {
    const mapaContainer = document.getElementById('mapa-section');
    if (!mapaContainer) return;
    
    let html = '';
    
    // Generar filtres del mapa
    html += await generarHTMLFiltresMapa();
    
    // Contenidor del mapa
    html += '<div id="mapa-botanica" style="height: 600px;"></div>';
    
    mapaContainer.innerHTML = html;
    
    // Inicialitzar el mapa després de generar el HTML
    setTimeout(() => {
        inicialitzarMapa();
    }, 100);
}

// Generar HTML dels filtres del mapa
async function generarHTMLFiltresMapa() {
    const plantes = mb_vars.dades_plantes || [];
    
    let html = '<div class="mapa-filtres mapa-filtres-contenidor">';
    html += '<div class="filtres-grup">';
    
    // 1. PRIMER: Generar filtres
    html += generarFiltresTipusMapa(plantes);
    html += generarFiltresHabitatMapa(plantes);
    html += generarFiltresFloracioMapa(plantes);
    html += generarFiltresUsosMapa(plantes);
    html += generarFiltresFullatgeMapa(plantes);
    
    html += '</div>'; // Fi filtres-grup
    
    // 2. SEGON: Filtres actius
    html += `<div class="filtres-actius-contenidor mapa-filtres-actius-contenidor">
        <span class="etiqueta-filtres-actius">Filtres actius:</span>
        <div class="filtres-actius mapa-filtres-actius"></div>
        <button class="netejar-filtres mapa-netejar-filtres" style="display:none;">Netejar tots els filtres</button>
    </div>`;
    
    // 3. TERCER: Cercador (AL FINAL, com a la galeria)
    html += `<div class="cerca-contenidor">
        <input type="text" id="mapa-cerca-plantes" placeholder="Cercar per paraules clau..." class="cerca-input mapa-cerca-input" />
    </div>`;
    
    html += '</div>'; // Fi mapa-filtres
    
    return html;
}

// Generar filtres de tipus per al mapa
function generarFiltresTipusMapa(plantes) {
    const tipus = [...new Set(plantes.map(p => p.tipus))].sort();
    
    let html = '<div class="grup-filtre tipus-planta-filtre">';
    html += '<span class="etiqueta-filtre">Tipus:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto mapa-filtre-boto actiu" data-group="tipus" data-filtre="tots">Totes les plantes</button>';
    
    tipus.forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto mapa-filtre-boto" data-group="tipus" data-filtre="${tipus}">${nomTipus}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'hàbitat per al mapa
function generarFiltresHabitatMapa(plantes) {
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
    html += '<button class="filtre-boto mapa-filtre-boto actiu" data-group="habitat" data-filtre="tots">Tots</button>';
    
    [...habitats.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([habitatNorm, habitatNom]) => {
        const nomMostrar = habitatNom.replace(/_/g, ' ');
        const nomCapitalitzat = nomMostrar.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        html += `<button class="filtre-boto mapa-filtre-boto" data-group="habitat" data-filtre="${habitatNorm}">${nomCapitalitzat}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres de floració per al mapa
function generarFiltresFloracioMapa(plantes) {
    const floracions = new Set();
    
    plantes.forEach(planta => {
        if (planta.floracio && Array.isArray(planta.floracio)) {
            planta.floracio.forEach(f => {
                const fPrincipal = f.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase();
                if (fPrincipal) floracions.add(fPrincipal);
            });
        }
    });
    
    if (floracions.size === 0) return '';
    
    let html = '<div class="grup-filtre floracio-filtre">';
    html += '<span class="etiqueta-filtre">Floració:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto mapa-filtre-boto actiu" data-group="floracio" data-filtre="tots">Totes</button>';
    
    [...floracions].sort().forEach(floracio => {
        const nomFloracio = floracio.charAt(0).toUpperCase() + floracio.slice(1);
        html += `<button class="filtre-boto mapa-filtre-boto" data-group="floracio" data-filtre="${floracio}">${nomFloracio}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'usos per al mapa
function generarFiltresUsosMapa(plantes) {
    const usos = new Map();
    const grups = new Map(); // Per detectar grups de categories
    
    plantes.forEach(planta => {
        if (planta.usos) {
            planta.usos.forEach(us => {
                const usPrincipal = us.replace(/\s*\(.*?\)\s*/g, '').trim();
                const usNormalitzat = usPrincipal.toLowerCase().replace(/\s+/g, '_');
                if (usNormalitzat) {
                    usos.set(usNormalitzat, usPrincipal);
                    
                    // Detectar grups (ex: "usos_agricoles", "usos_productius", etc.)
                    const parts = usNormalitzat.split('_');
                    if (parts.length > 1 && parts[0] === 'usos') {
                        const grupBase = parts.slice(0, 2).join('_'); // "usos_agricoles", "usos_productius", etc.
                        if (!grups.has(grupBase)) {
                            grups.set(grupBase, new Set());
                        }
                        grups.get(grupBase).add(usNormalitzat);
                    }
                }
            });
        }
    });
    
    if (usos.size === 0) return '';
    
    // Logging per depuració
    console.log('🔍 USOS DETECTATS:');
    console.log('  - Únics:', [...usos.entries()].map(([k,v]) => `${k} = "${v}"`));
    console.log('  - Grups:', [...grups.entries()].map(([k,v]) => `${k} (${v.size} variants)`));
    
    let html = '<div class="grup-filtre usos-filtre">';
    html += '<span class="etiqueta-filtre">Usos:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto mapa-filtre-boto actiu" data-group="usos" data-filtre="tots">Tots</button>';
    
    [...usos.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([usNorm, usNom]) => {
        html += `<button class="filtre-boto mapa-filtre-boto" data-group="usos" data-filtre="${usNorm}">${usNom.charAt(0).toUpperCase() + usNom.slice(1)}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres de fullatge per al mapa
function generarFiltresFullatgeMapa(plantes) {
    const fullatges = new Set();
    
    plantes.forEach(planta => {
        if (planta.fullatge) {
            fullatges.add(planta.fullatge);
        }
    });
    
    if (fullatges.size === 0) return '';
    
    let html = '<div class="grup-filtre fullatge-filtre">';
    html += '<span class="etiqueta-filtre">Fullatge:</span>';
    html += '<div class="botons-filtre">';
    html += '<button class="filtre-boto mapa-filtre-boto actiu" data-group="fullatge" data-filtre="tots">Tots</button>';
    
    [...fullatges].sort().forEach(fullatge => {
        const nomFullatge = fullatge.charAt(0).toUpperCase() + fullatge.slice(1);
        html += `<button class="filtre-boto mapa-filtre-boto" data-group="fullatge" data-filtre="${fullatge}">${nomFullatge}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Inicialitzar el mapa Leaflet
function inicialitzarMapa() {
    console.log("🗺️ Inicialitzant mapa botànic UAB...");
    
    // Crear el mapa centrat a la UAB
    map = L.map('mapa-botanica').setView([41.50085, 2.09342], 16);
    
    // Capes base
    const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap | Flora UAB',
        maxZoom: 19,
    }).addTo(map);
    
    const baseSat = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
            attribution: 'Tiles © Esri',
            maxZoom: 19,
        }
    );
    
    // Control de capes
    L.control.layers({ 
        'Mapa': baseOSM, 
        'Satèl·lit': baseSat 
    }).addTo(map);
    
    // Clúster de marcadors
    markers = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
    });
    
    map.addLayer(markers);
    
    // Carregar marcadors de plantes
    carregarMarcadorsPlantes();
    
    // Afegir polígons d'hàbitats
    afegirPoligonsHabitats();
    
    // Configurar esdeveniments del mapa
    configurarEventListenersMapa();
    
    // Fer que el mapa sigui accessible globalment
    window.map = map;
    
    console.log("✅ Mapa inicialitzat correctament");
}

// Carregar marcadors de plantes
function carregarMarcadorsPlantes() {
    if (!mb_vars.dades_plantes || mb_vars.dades_plantes.length === 0) {
        console.warn("⚠️ No hi ha dades de plantes per carregar al mapa");
        return;
    }
    
    console.log("📍 Carregant marcadors de plantes:", mb_vars.dades_plantes.length);
    
    mb_vars.dades_plantes.forEach(planta => {
        if (!planta.coordenades || planta.coordenades.length === 0) {
            return; // Saltar plantes sense coordenades
        }
        
        planta.coordenades.forEach(coord => {
            // Crear marcador personalitzat
            const icona = crearIconaPersonalitzada(planta.tipus);
            const marcador = L.marker([coord.lat, coord.lng], { icon: icona });
            
            // Crear popup
            const popupHTML = crearPopupHTML(planta);
            marcador.bindPopup(popupHTML);
            
            // Afegir dades de la planta al marcador per al filtratge
            marcador.plantaData = planta;
            
            // Afegir a la llista global i al grup de clústers
            totsElsMarcadors.push(marcador);
            markers.addLayer(marcador);
        });
    });
    
    console.log(`✅ Carregats ${totsElsMarcadors.length} marcadors`);
}

// Crear icona personalitzada segons el tipus de planta
function crearIconaPersonalitzada(tipus) {
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

// Crear HTML del popup
function crearPopupHTML(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    
    // Funció per formatar text (substituir guions baixos per espais)
    function formatVisual(text) {
        if (!text) return '';
        return String(text).replace(/_/g, ' ');
    }
    
    let html = '<div class="planta-popup">';
    
    // Imatge si està disponible
    if (planta.imatge) {
        html += `<img src="${planta.imatge}" alt="${escapeHtml(planta.nom_comu)}" class="planta-popup-imatge" onerror="this.style.display='none'">`;
    }
    
    // Informació bàsica
    html += `<h3>${escapeHtml(planta.nom_comu)}</h3>`;
    html += `<p class="nom-cientific">${escapeHtml(planta.nom_cientific)}</p>`;
    
    html += '<div class="planta-popup-info">';
    html += `<p><strong>Família:</strong> ${escapeHtml(planta.familia)}</p>`;
    
    // Hàbitat (només el primer)
    if (planta.habitat && planta.habitat.length > 0) {
        const habitat = Array.isArray(planta.habitat) ? planta.habitat[0] : planta.habitat;
        html += `<p><strong>Hàbitat:</strong> ${escapeHtml(formatVisual(habitat))}</p>`;
    }
    
    // Floració
    if (planta.floracio && planta.floracio.length > 0) {
        const floracio = planta.floracio;
        let floracioText = '';
        if (Array.isArray(floracio)) {
            floracioText = floracio.map(f => formatVisual(escapeHtml(f))).join(', ');
        } else {
            floracioText = formatVisual(escapeHtml(floracio));
        }
        html += `<p><strong>Floració:</strong> ${floracioText}</p>`;
    }
    
    // Fullatge
    if (planta.fullatge) {
        html += `<p><strong>Fullatge:</strong> ${escapeHtml(formatVisual(planta.fullatge))}</p>`;
    }
    
    html += '</div>';
    
    // Botó per veure detalls - CORRECCIÓ: usar atributs compatibles amb popup-fixes.js
    html += `<a href="#" class="boto-veure-detalls" data-planta-id="${plantaId}" data-planta="${plantaId}" data-planta-nom="${escapeHtml(planta.nom_cientific)}">Veure detalls</a>`;
    
    html += '</div>';
    
    return html;
}

// Afegir polígons d'hàbitats
async function afegirPoligonsHabitats() {
    try {
        console.log("🌍 Afegint polígons d'hàbitats...");
        
        // Grup per contenir tots els polígons
        const habitats = L.layerGroup().addTo(map);
        
        // Definir zones d'hàbitat amb els seus fitxers GeoJSON
        const zonesHabitat = [
            {
                nom: 'Camí de Ho Chi Minh',
                id: 'cami_ho_chi_minh',
                descripcio: 'Pas central del campus amb vegetació natural als seus marges.',
                geojson: 'dades/geojson/cami_ho_chi_minh.geojson',
                color: '#8BC34A',
                fillOpacity: 0.30
            },
            {
                nom: "Torrent de Can Domènech",
                id: "torrent_can_domenech", 
                descripcio: "Zona de vegetació de ribera amb espècies adaptades a ambients humits.",
                geojson: 'dades/geojson/torrent_can_domenech.geojson',
                color: "#03A9F4",
                fillOpacity: 0.3
            },
            {
                nom: "Camins del campus",
                id: "camins",
                descripcio: "Xarxa principal de camins que travessen el campus universitari.",
                geojson: "dades/geojson/camins.geojson",
                color: "#795548",
                fillOpacity: 0.3
            },
            {
                nom: "Eix central",
                id: "eix_central",
                descripcio: "Via principal que vertebra el campus i connecta les diferents facultats i edificis.",
                geojson: "dades/geojson/eix_central.geojson",
                color: "#607D8B",
                fillOpacity: 0.3
            },
            {
                nom: "Zones assolellades",
                id: "zones_assolellades",
                descripcio: "Àrees amb exposició directa al sol on creixen espècies adaptades a la llum solar intensa.",
                geojson: "dades/geojson/purament_assolellades.geojson",
                color: "#FFC107",
                fillOpacity: 0.3
            },
            {
                nom: "Vegetació de ribera",
                id: "vegetacio_ribera",
                descripcio: "Vegetació pròpia de les vores d'aigua, típica de zones ripàries.",
                geojson: "dades/geojson/vegetacio_ribera.geojson",
                color: "#4CAF50",
                fillOpacity: 0.3
            },
            {
                nom: "Zones ombrívoles",
                id: "zones_ombrivoles",
                descripcio: "Àrees amb ombra permanent on creixen espècies adaptades a poca llum solar directa.",
                geojson: "dades/geojson/zones_ombrivoles.geojson",
                color: "#673AB7",
                fillOpacity: 0.3
            }
        ];
        
        // Carregar cada zona
        for (const zona of zonesHabitat) {
            try {
                const response = await fetch(zona.geojson);
                if (response.ok) {
                    const geoJson = await response.json();
                    
                    const capaZona = L.geoJSON(geoJson, {
                        style: {
                            color: zona.color,
                            fillColor: zona.color,
                            fillOpacity: zona.fillOpacity,
                            weight: 2,
                            opacity: 0.7
                        }
                    }).addTo(habitats);
                    
                    // Afegir popup a cada feature
                    capaZona.eachLayer(function(layer) {
                        layer.bindPopup(`
                            <div class="habitat-popup">
                                <h3>${zona.nom}</h3>
                                <p>${zona.descripcio}</p>
                            </div>
                        `);
                    });
                    
                    // Guardar per als filtres
                    habitatsLayers[zona.id] = capaZona;
                    
                    console.log(`✅ GeoJSON carregat: ${zona.nom}`);
                }
            } catch (error) {
                console.warn(`⚠️ No s'ha pogut carregar GeoJSON per: ${zona.nom}`, error);
            }
        }
        
        // Actualitzar control de capes
        actualitzarControlCapes(habitats);
        
    } catch (error) {
        console.error("❌ Error afegint polígons d'hàbitats:", error);
    }
}

// Actualitzar control de capes
function actualitzarControlCapes(habitats) {
    // Crear nou control amb les capes base existents
    const overlayMaps = {
        "Hàbitats": habitats
    };
    
    L.control.layers(null, overlayMaps).addTo(map);
}

// Configurar event listeners del mapa
function configurarEventListenersMapa() {
    // Events ESPECÍFICS per als botons de filtre del MAPA
    jQuery(document).on('click', '.mapa-filtres-contenidor .mapa-filtre-boto', function() {
        gestionarClicFiltreMapa(jQuery(this));
    });
    
    // Event per netejar filtres del MAPA
    jQuery(document).on('click', '.mapa-netejar-filtres', function() {
        netejarTotsFiltresMapa();
    });
    
    // Event per eliminar filtres individuals del MAPA
    jQuery(document).on('click', '.mapa-filtres-actius .eliminar-filtre', function() {
        eliminarFiltreMapa(jQuery(this));
    });
    
    // Event per a la cerca del MAPA
    jQuery(document).on('input', '#mapa-cerca-plantes', function() {
        console.log("🔍 Aplicant filtre de text al mapa:", jQuery(this).val());
        aplicarFiltresMapa();
    });
    
    // CORRECCIÓ: Els event listeners dels popups ara estan gestionats per popup-fixes.js
    console.log('🗺️ Event listeners del mapa configurats (els modals són gestionats per popup-fixes.js)');
}

// Variables dels filtres del mapa - CORREGIDES I SEPARADES
const filtresActiusMapa = {
    tipus: 'tots',
    habitat: 'tots', 
    floracio: 'tots',
    usos: 'tots',
    fullatge: 'tots'
};

// FUNCIÓ CORREGIDA: Gestionar clic en botons de filtre del MAPA
function gestionarClicFiltreMapa($boto) {
    try {
        const grupFiltre = $boto.data('group');
        const valorFiltre = $boto.data('filtre');
        
        if (!grupFiltre || !valorFiltre) {
            console.warn("⚠️ Botó mapa sense atributs necessaris:", $boto[0]);
            return;
        }
        
        console.log(`🔘 Filtre MAPA clicat: ${grupFiltre}=${valorFiltre}, actiu=${$boto.hasClass('actiu')}`);
        
        // Comportament especial per al filtre de fullatge (excloent)
        if (grupFiltre === 'fullatge') {
            jQuery('.mapa-filtres-contenidor .mapa-filtre-boto[data-group="fullatge"]').removeClass('actiu');
            $boto.addClass('actiu');
            filtresActiusMapa.fullatge = valorFiltre;
            
            aplicarFiltresMapa();
            mostrarFiltresActiusMapa();
            return;
        }
        
        // Per a filtres multi-selecció (tipus, habitat, floracio, usos)
        if (valorFiltre === 'tots') {
            // Si cliquem "Tots", desactivar tots els altres i activar només "Tots"
            jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
            $boto.addClass('actiu');
            filtresActiusMapa[grupFiltre] = 'tots';
        } else {
            // Si cliquem una opció específica
            if ($boto.hasClass('actiu')) {
                // Si ja estava activa, la desactivem
                $boto.removeClass('actiu');
                
                // Si no queda cap opció activa, activar "Tots"
                const botonsActius = jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
                if (botonsActius.length === 0) {
                    jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
                    filtresActiusMapa[grupFiltre] = 'tots';
                }
            } else {
                // Si no estava activa, l'activem
                jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).removeClass('actiu');
                $boto.addClass('actiu');
                
                // CORRECCIÓ: Verificar si hem seleccionat totes les opcions DESPRÉS d'un petit delay
                setTimeout(function() {
                    if (verificarTotesOpcionsSeleccionadesMapa(grupFiltre)) {
                        activarBotoTotsMapa(grupFiltre);
                    }
                }, 50); // Augmentat el delay per assegurar que l'estat està actualitzat
            }
        }
        
        actualitzarFiltresActiusMapa();
        aplicarFiltresMapa();
        mostrarFiltresActiusMapa();
    } catch (error) {
        console.error("❌ Error en clic a botó de filtre del mapa:", error);
    }
}

// FUNCIÓ CORREGIDA: Verificar si s'han seleccionat totes les opcions d'un filtre del MAPA
function verificarTotesOpcionsSeleccionadesMapa(grupFiltre) {
    try {
        // No aplica per filtres excloents
        if (grupFiltre === 'fullatge') {
            return false;
        }
        
        const botonsGrup = jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
        const botonsActius = jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
        
        const totesSeleccionades = botonsGrup.length > 0 && botonsGrup.length === botonsActius.length;
        
        console.log(`🔍 Verificant MAPA ${grupFiltre}: ${botonsActius.length}/${botonsGrup.length} opcions seleccionades = ${totesSeleccionades}`);
        
        return totesSeleccionades;
    } catch (error) {
        console.error("❌ Error en verificarTotesOpcionsSeleccionadesMapa:", error);
        return false;
    }
}

// FUNCIÓ CORREGIDA: Activar el botó "Tots" d'un grup específic del MAPA
function activarBotoTotsMapa(grupFiltre) {
    try {
        console.log(`✅ Activant "Tots" per ${grupFiltre} al MAPA (totes les opcions seleccionades)`);
        
        jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
        jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
        filtresActiusMapa[grupFiltre] = 'tots';
    } catch (error) {
        console.error("❌ Error en activarBotoTotsMapa:", error);
    }
}

// FUNCIÓ CORREGIDA: Actualitzar l'objecte de filtres actius del MAPA
function actualitzarFiltresActiusMapa() {
    try {
        ['tipus', 'habitat', 'floracio', 'usos', 'fullatge'].forEach(grup => {
            if (grup === 'fullatge') {
                // Filtre excloent
                const filtreActiu = jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"].actiu`);
                const valorFiltre = filtreActiu.data('filtre');
                filtresActiusMapa[grup] = valorFiltre || 'tots';
            } else {
                // Filtres multi-selecció
                if (jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"][data-filtre="tots"]`).hasClass('actiu')) {
                    filtresActiusMapa[grup] = 'tots';
                } else {
                    const filtresGrup = jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                    
                    if (filtresGrup.length === 0) {
                        filtresActiusMapa[grup] = 'tots';
                    } else {
                        const valors = [];
                        filtresGrup.each(function() {
                            const valorFiltre = jQuery(this).data('filtre');
                            if (valorFiltre) valors.push(valorFiltre);
                        });
                        filtresActiusMapa[grup] = valors.length > 0 ? valors : 'tots';
                    }
                }
            }
        });
        
        console.log("🔄 Filtres MAPA actualitzats:", filtresActiusMapa);
    } catch (error) {
        console.error("❌ Error en actualitzarFiltresActiusMapa:", error);
        Object.keys(filtresActiusMapa).forEach(key => {
            filtresActiusMapa[key] = 'tots';
        });
    }
}

// FUNCIÓ CORREGIDA: Mostrar filtres actius del MAPA
function mostrarFiltresActiusMapa() {
    try {
        const contFiltre = jQuery('.mapa-filtres-actius');
        contFiltre.empty();
        
        let hiHaFiltresActius = false;
        
        Object.entries(filtresActiusMapa).forEach(([grup, valors]) => {
            if (valors !== 'tots') {
                hiHaFiltresActius = true;
                
                let grupText = '';
                switch (grup) {
                    case 'tipus': grupText = 'Tipus'; break;
                    case 'habitat': grupText = 'Hàbitat'; break;
                    case 'floracio': grupText = 'Floració'; break;
                    case 'fullatge': grupText = 'Fullatge'; break;
                    case 'usos': grupText = 'Usos'; break;
                    default: grupText = grup.charAt(0).toUpperCase() + grup.slice(1);
                }
                
                if (grup === 'fullatge') {
                    // Filtre excloent - només mostrar si no és "tots"
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
            jQuery('.mapa-netejar-filtres').show();
        } else {
            jQuery('.mapa-netejar-filtres').hide();
        }
        
        console.log("🏷️ Filtres actius MAPA mostrats:", hiHaFiltresActius ? "Sí" : "No");
    } catch (error) {
        console.error("❌ Error en mostrarFiltresActiusMapa:", error);
        jQuery('.mapa-netejar-filtres').hide();
    }
}

// FUNCIÓ ACTUALITZADA: Aplicar filtres als marcadors del mapa
function aplicarFiltresMapa() {
    try {
        // Obtenir text de cerca
        const textCerca = String(jQuery('#mapa-cerca-plantes').val() || '').toLowerCase().trim();
        
        // Netejar marcadors actuals
        markers.clearLayers();
        
        let marcadorsVisibles = 0;
        
        // Filtrar marcadors
        totsElsMarcadors.forEach(marcador => {
            const planta = marcador.plantaData;
            let passaFiltres = true;
            
            // Filtre de tipus
            if (filtresActiusMapa.tipus !== 'tots') {
                const tipusPlanta = planta.tipus;
                if (Array.isArray(filtresActiusMapa.tipus)) {
                    passaFiltres = passaFiltres && filtresActiusMapa.tipus.includes(tipusPlanta);
                } else {
                    passaFiltres = passaFiltres && (tipusPlanta === filtresActiusMapa.tipus);
                }
            }
            
            // FILTRE D'HÀBITAT MILLORAT
            if (passaFiltres && filtresActiusMapa.habitat !== 'tots') {
                // Utilitzar els valors originals de planta.habitat en lloc de habitat_norm
                const habitatsPlanta = planta.habitat || [];
                passaFiltres = passaFiltres && passaFiltreMultiple(habitatsPlanta, filtresActiusMapa.habitat);
            }
            
            // FILTRE DE FLORACIÓ MILLORAT
            if (passaFiltres && filtresActiusMapa.floracio !== 'tots') {
                // Utilitzar els valors originals de planta.floracio
                const floracioPlanta = planta.floracio || [];
                passaFiltres = passaFiltres && passaFiltreMultiple(floracioPlanta, filtresActiusMapa.floracio);
            }
            
            // FILTRE D'USOS MILLORAT
            if (passaFiltres && filtresActiusMapa.usos !== 'tots') {
                // Utilitzar els valors originals de planta.usos
                const usosPlanta = planta.usos || [];
                passaFiltres = passaFiltres && passaFiltreMultiple(usosPlanta, filtresActiusMapa.usos);
            }
            
            // Filtre de fullatge (excloent)
            if (passaFiltres && filtresActiusMapa.fullatge !== 'tots') {
                const fullatgePlanta = planta.fullatge;
                passaFiltres = passaFiltres && (fullatgePlanta === filtresActiusMapa.fullatge);
            }
            
            // Filtre de cerca per text
            if (passaFiltres && textCerca) {
                const infoPlanta = String(planta.info_completa || '').toLowerCase();
                passaFiltres = passaFiltres && infoPlanta.includes(textCerca);
            }
            
            // Afegir marcador si passa tots els filtres
            if (passaFiltres) {
                markers.addLayer(marcador);
                marcadorsVisibles++;
            }
        });
        
        console.log(`🗺️ Filtres MAPA aplicats: ${marcadorsVisibles} marcadors visibles`);
        
        // Log detallat per depuració
        if (marcadorsVisibles === 0 && (filtresActiusMapa.habitat !== 'tots' || filtresActiusMapa.usos !== 'tots')) {
            console.log('🔍 DEPURACIÓ - Filtres actius:', filtresActiusMapa);
            console.log('🔍 DEPURACIÓ - Exemple de valors de plantes:');
            
            // Mostrar exemples de diverses plantes
            let plantesAmbUsos = 0;
            for (let i = 0; i < Math.min(5, mb_vars.dades_plantes.length); i++) {
                const planta = mb_vars.dades_plantes[i];
                if (planta.usos && planta.usos.length > 0) {
                    console.log(`  🌱 ${planta.nom_cientific}:`);
                    console.log('    - Usos originals:', planta.usos);
                    console.log('    - Usos normalitzats:', planta.usos.map(u => normalitzarValor(u)));
                    plantesAmbUsos++;
                }
            }
            
            if (plantesAmbUsos === 0) {
                console.log('  ⚠️ Cap planta amb usos trobada en els primers 5 exemples');
            }
            
            console.log('🔍 DEPURACIÓ - Filtre d\'usos actiu:', filtresActiusMapa.usos);
        }
        
    } catch (error) {
        console.error("❌ Error en aplicarFiltresMapa:", error);
        // En cas d'error, mostrar tots els marcadors
        markers.clearLayers();
        totsElsMarcadors.forEach(marcador => {
            markers.addLayer(marcador);
        });
    }
}

// FUNCIÓ CORREGIDA: Netejar tots els filtres del MAPA
function netejarTotsFiltresMapa() {
    try {
        console.log("🧹 Netejant filtres del MAPA");
        
        jQuery('.mapa-filtres-contenidor .mapa-filtre-boto').removeClass('actiu');
        jQuery('.mapa-filtres-contenidor .mapa-filtre-boto[data-filtre="tots"]').addClass('actiu');
        
        Object.keys(filtresActiusMapa).forEach(key => {
            filtresActiusMapa[key] = 'tots';
        });
        
        jQuery('#mapa-cerca-plantes').val('');
        
        aplicarFiltresMapa();
        mostrarFiltresActiusMapa();
        
    } catch (error) {
        console.error("❌ Error en netejar filtres del mapa:", error);
    }
}

// FUNCIÓ CORREGIDA: Eliminar un filtre individual del MAPA
function eliminarFiltreMapa($element) {
    try {
        const $etiqueta = $element.parent();
        const grup = $etiqueta.data('group');
        const valor = $etiqueta.data('filtre');
        
        if (!grup || valor === undefined) {
            console.warn("⚠️ Etiqueta mapa sense atributs necessaris:", $etiqueta);
            return;
        }
        
        console.log(`❌ Eliminant filtre MAPA: ${grup}=${valor}`);
        
        // Desactivar el botó corresponent
        jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`).removeClass('actiu');
        
        // Si no queda cap botó actiu en aquest grup, activar "Tots"
        if (jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"].actiu`).length === 0) {
            jQuery(`.mapa-filtres-contenidor .mapa-filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
            filtresActiusMapa[grup] = 'tots';
        }
        
        // Verificar si totes les opcions segueixen seleccionades després d'eliminar una
        setTimeout(function() {
            if (verificarTotesOpcionsSeleccionadesMapa(grup)) {
                activarBotoTotsMapa(grup);
            }
        }, 50);
        
        actualitzarFiltresActiusMapa();
        aplicarFiltresMapa();
        mostrarFiltresActiusMapa();
    } catch (error) {
        console.error("❌ Error en eliminar filtre del mapa:", error);
    }
}

// Funcions d'utilitat (duplicades per assegurar compatibilitat)
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

console.log('✅ Mapa botànic carregat (versió actualitzada amb popup-fixes integrat)');
