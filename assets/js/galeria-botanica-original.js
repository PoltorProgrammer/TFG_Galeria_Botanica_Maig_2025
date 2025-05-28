/**
 * Mapa Botànica UAB - Adaptat per funcionar sense WordPress
 * Basat en mapa-botanica.js original
 */

// Variables globals del mapa
let map = null;
let markers = null;
let totsElsMarcadors = [];
let habitatsLayers = {};

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
    
    let html = '<div class="mapa-filtres">';
    html += '<div class="filtres-grup">';
    
    // Generar filtres
    html += generarFiltresTipusMapa(plantes);
    html += generarFiltresHabitatMapa(plantes);
    html += generarFiltresFloracioMapa(plantes);
    html += generarFiltresUsosMapa(plantes);
    html += generarFiltresFullatgeMapa(plantes);
    
    // Cercador
    html += `<div class="cerca-contenidor">
        <input type="text" id="mapa-cerca" placeholder="Cercar per paraules clau..." class="cerca-input" />
    </div>`;
    
    html += '</div>'; // Fi filtres-grup
    
    // Filtres actius + botó netejar
    html += `<div class="filtres-actius-contenidor">
        <span class="etiqueta-filtres-actius">Filtres actius:</span>
        <div class="filtres-actius"></div>
        <button class="netejar-filtres" style="display:none;">Netejar tots els filtres</button>
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
    html += '<button class="filtre-boto actiu" data-group="tipus" data-filtre="tots">Totes les plantes</button>';
    
    tipus.forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto" data-group="tipus" data-filtre="${tipus}">${nomTipus}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="habitat" data-filtre="tots">Tots</button>';
    
    [...habitats.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([habitatNorm, habitatNom]) => {
        const nomMostrar = habitatNom.replace(/_/g, ' ');
        const nomCapitalitzat = nomMostrar.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        html += `<button class="filtre-boto" data-group="habitat" data-filtre="${habitatNorm}">${nomCapitalitzat}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="floracio" data-filtre="tots">Totes</button>';
    
    [...floracions].sort().forEach(floracio => {
        const nomFloracio = floracio.charAt(0).toUpperCase() + floracio.slice(1);
        html += `<button class="filtre-boto" data-group="floracio" data-filtre="${floracio}">${nomFloracio}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'usos per al mapa
function generarFiltresUsosMapa(plantes) {
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
    html += '<button class="filtre-boto actiu" data-group="usos" data-filtre="tots">Tots</button>';
    
    [...usos.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([usNorm, usNom]) => {
        html += `<button class="filtre-boto" data-group="usos" data-filtre="${usNorm}">${usNom.charAt(0).toUpperCase() + usNom.slice(1)}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="fullatge" data-filtre="tots">Tots</button>';
    
    [...fullatges].sort().forEach(fullatge => {
        const nomFullatge = fullatge.charAt(0).toUpperCase() + fullatge.slice(1);
        html += `<button class="filtre-boto" data-group="fullatge" data-filtre="${fullatge}">${nomFullatge}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Inicialitzar el mapa Leaflet
function inicialitzarMapa() {
    console.log("Inicialitzant mapa botànic UAB...");
    
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
    
    console.log("Mapa inicialitzat correctament");
}

// Carregar marcadors de plantes
function carregarMarcadorsPlantes() {
    if (!mb_vars.dades_plantes || mb_vars.dades_plantes.length === 0) {
        console.warn("No hi ha dades de plantes per carregar al mapa");
        return;
    }
    
    console.log("Carregant marcadors de plantes:", mb_vars.dades_plantes.length);
    
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
    
    console.log(`Carregats ${totsElsMarcadors.length} marcadors`);
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
    
    // Botó per veure detalls
    html += `<a href="#" class="boto-veure-detalls" data-planta-id="${plantaId}" data-planta-nom="${escapeHtml(planta.nom_cientific)}">Veure detalls</a>`;
    
    html += '</div>';
    
    return html;
}

// Afegir polígons d'hàbitats
async function afegirPoligonsHabitats() {
    try {
        console.log("Afegint polígons d'hàbitats...");
        
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
                    
                    console.log(`GeoJSON carregat: ${zona.nom}`);
                }
            } catch (error) {
                console.warn(`No s'ha pogut carregar GeoJSON per: ${zona.nom}`, error);
            }
        }
        
        // Actualitzar control de capes
        actualitzarControlCapes(habitats);
        
    } catch (error) {
        console.error("Error afegint polígons d'hàbitats:", error);
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
    // Events per als botons de filtre (delegació d'esdeveniments)
    jQuery(document).on('click', '.mapa-botanica-contenidor .filtre-boto', function() {
        gestionarClicFiltreMapa(jQuery(this));
    });
    
    // Event per netejar filtres
    jQuery(document).on('click', '.mapa-botanica-contenidor .netejar-filtres', function() {
        netejarTotsFiltresMapa();
    });
    
    // Event per eliminar filtres individuals
    jQuery(document).on('click', '.mapa-botanica-contenidor .eliminar-filtre', function() {
        eliminarFiltreMapa(jQuery(this));
    });
    
    // Event per a la cerca
    jQuery(document).on('input', '#mapa-cerca', function() {
        console.log("Aplicant filtre de text:", jQuery(this).val());
        aplicarFiltresMapa();
    });
    
    // Event per al botó "Veure detalls" als popups
    jQuery(document).on('click', '.boto-veure-detalls', function(e) {
        e.preventDefault();
        
        const plantaId = jQuery(this).data('planta-id');
        const plantaNom = jQuery(this).data('planta-nom');
        
        console.log("Obrint detalls de planta des del mapa:", { plantaId, plantaNom });
        
        // Tancar popup del mapa
        map.closePopup();
        
        // Obrir modal de detalls (simulem la funció AJAX)
        obrirDetallsPlantaMapa(plantaId, plantaNom);
    });
}

// Variables dels filtres del mapa
const filtresActiusMapa = {
    tipus: 'tots',
    habitat: 'tots',
    floracio: 'tots',
    usos: 'tots',
    fullatge: 'tots'
};

// Gestionar clic en botons de filtre del mapa
function gestionarClicFiltreMapa($boto) {
    // Implementació dels filtres del mapa...
    // (Similar a la galeria però adaptat per marcadors)
    console.log("Filtres del mapa en desenvolupament...");
}

// Aplicar filtres als marcadors del mapa
function aplicarFiltresMapa() {
    // Implementació del filtratge de marcadors...
    console.log("Aplicant filtres del mapa...");
}

// Netejar tots els filtres del mapa
function netejarTotsFiltresMapa() {
    console.log("Netejant filtres del mapa...");
}

// Eliminar un filtre individual del mapa
function eliminarFiltreMapa($element) {
    console.log("Eliminant filtre del mapa...");
}

// Obrir detalls de planta (simulació sense AJAX de WordPress)
function obrirDetallsPlantaMapa(plantaId, plantaNom) {
    // Buscar la planta a les dades
    const planta = gb_plantes_data.find(p => 
        p.id === plantaId || 
        sanitizeTitle(p.nom_cientific) === plantaId ||
        p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
    );
    
    if (!planta) {
        console.error(`No s'ha trobat la planta amb ID: ${plantaId}`);
        return;
    }
    
    // Generar HTML dels detalls
    const htmlDetalls = generarHTMLDetallsPlanta(planta);
    
    // Assegurar-se que l'element modal existeix
    if (jQuery('.planta-modal').length === 0) {
        jQuery('body').append(`
            <div class="planta-modal" style="display: none;">
                <div class="planta-modal-contingut">
                    <span class="planta-modal-tancar">&times;</span>
                    <div class="planta-modal-cos"></div>
                </div>
            </div>
        `);
    }
    
    // Mostrar el modal amb els detalls
    jQuery('.planta-modal-cos').html(htmlDetalls);
    jQuery('.planta-modal').fadeIn(300).addClass('actiu');
    jQuery('body').css('overflow', 'hidden');
    
    // Activar lightbox per a les imatges
    activarLightbox();
}

// Generar HTML dels detalls d'una planta
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
            html += '<div class="planta-imatge-detall" data-tipus="' + escapeHtml(tipus) + '">';
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

// Funcions del lightbox per a les imatges
function activarLightbox() {
    jQuery('.planta-imatge-detall img, .planta-imatge-principal img').on('click', function() {
        const imgSrc = jQuery(this).attr('src');
        const tipusImatge = jQuery(this).data('tipus') || 'general';
        
        // Crear el lightbox
        const lightbox = jQuery('<div class="planta-lightbox">');
        const img = jQuery('<img>').attr('src', imgSrc);
        const tancaBtn = jQuery('<span class="planta-lightbox-tancar">&times;</span>');
        
        // Afegir elements al DOM
        lightbox.append(img).append(tancaBtn).appendTo('body');
        
        // Mostrar amb animació
        setTimeout(function() {
            lightbox.addClass('actiu');
        }, 10);
        
        // Afegir etiqueta de tipus si no és general
        if (tipusImatge && tipusImatge !== 'general') {
            const tipusEtiqueta = jQuery('<div class="planta-lightbox-tipus">' + tipusImatge + '</div>');
            lightbox.append(tipusEtiqueta);
        }
        
        // Esdeveniments de tancament
        tancaBtn.on('click', function(e) {
            e.stopPropagation();
            tancarLightbox(lightbox);
        });
        
        lightbox.on('click', function() {
            tancarLightbox(lightbox);
        });
        
        // Aturar la propagació del clic a la imatge
        img.on('click', function(e) {
            e.stopPropagation();
        });
        
        // Tancar amb ESC
        jQuery(document).on('keydown.lightbox', function(e) {
            if (e.key === "Escape") {
                tancarLightbox(lightbox);
            }
        });
    });
}

// Funció per tancar el lightbox
function tancarLightbox(lightbox) {
    lightbox.removeClass('actiu');
    setTimeout(function() {
        lightbox.remove();
        jQuery(document).off('keydown.lightbox');
    }, 300);
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

/**
 * Events i funcionalitat de la galeria botànica
 * Aquest codi s'afegeix al final de galeria-botanica-original.js
 */

// Variables globals de la galeria
let modalObert = false;
const filtresActius = {
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
    console.log("Inicialitzant funcionalitat de la galeria...");
    
    // Configurar event listeners
    configurarEventListenersGaleria();
    
    // Aplicar filtres inicials
    actualitzarFiltresActius();
    aplicarFiltres();
    mostrarFiltresActius();
    
    console.log("Galeria inicialitzada correctament");
}

// Configurar event listeners de la galeria
function configurarEventListenersGaleria() {
    // Event listeners per als botons de filtre
    jQuery(document).on('click', '.galeria-botanica .filtre-boto', function() {
        gestionarClicFiltre(jQuery(this));
    });
    
    // Event listener per al botó de neteja
    jQuery(document).on('click', '.galeria-botanica .netejar-filtres', function() {
        netejarTotsFiltres();
    });
    
    // Event listeners per eliminar filtres individuals
    jQuery(document).on('click', '.galeria-botanica .eliminar-filtre', function() {
        eliminarFiltre(jQuery(this));
    });
    
    // Event listener per al camp de cerca
    jQuery(document).on('input', '#cerca-plantes', function() {
        aplicarFiltres();
    });
    
    // Event listeners per obrir detalls de planta
    jQuery(document).on('click', '.galeria-botanica .planta-obrir-detall', function(e) {
        e.preventDefault();
        const plantaId = jQuery(this).data('planta');
        if (plantaId) {
            obrirDetallsPlanta(plantaId);
            // Actualitzar URL amb hash
            window.location.hash = `planta-${plantaId}`;
        }
    });
    
    // Event listeners per tancar el modal
    jQuery(document).on('click', '.planta-modal-tancar, .planta-modal', function(e) {
        if (e.target === this) {
            tancarModal();
            // Eliminar hash de l'URL
            if (window.location.hash.startsWith('#planta-')) {
                window.location.hash = '';
            }
        }
    });
    
    // Tancar modal amb ESC
    jQuery(document).keydown(function(e) {
        if (e.key === "Escape" && modalObert) {
            tancarModal();
            if (window.location.hash.startsWith('#planta-')) {
                window.location.hash = '';
            }
        }
    });
}

// Gestionar clic en botons de filtre
function gestionarClicFiltre($boto) {
    try {
        const grupFiltre = $boto.data('group');
        const valorFiltre = $boto.data('filtre');
        
        if (!grupFiltre || !valorFiltre) {
            console.warn("Botó sense atributs necessaris:", $boto[0]);
            return;
        }
        
        console.log(`Botó clicat: grup=${grupFiltre}, valor=${valorFiltre}, actiu=${$boto.hasClass('actiu')}`);
        
        // Comportament especial per al filtre d'imatges (excloent)
        if (grupFiltre === 'imatge') {
            jQuery('.filtre-boto[data-group="imatge"]').removeClass('actiu');
            $boto.addClass('actiu');
            filtresActius.imatge = valorFiltre;
            
            aplicarCanviImatges(valorFiltre);
            aplicarFiltres();
            mostrarFiltresActius();
            return;
        }
        
        // Comportament especial per al filtre de fullatge (excloent)
        if (grupFiltre === 'fullatge') {
            jQuery('.filtre-boto[data-group="fullatge"]').removeClass('actiu');
            $boto.addClass('actiu');
            filtresActius.fullatge = valorFiltre;
            
            aplicarFiltres();
            mostrarFiltresActius();
            return;
        }
        
        // Per a filtres multi-selecció
        if ($boto.hasClass('actiu') && valorFiltre !== 'tots') {
            $boto.removeClass('actiu');
            
            if (jQuery(`.filtre-boto[data-group="${grupFiltre}"].actiu`).length === 0) {
                jQuery(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
                filtresActius[grupFiltre] = 'tots';
            }
        } else {
            if (valorFiltre === 'tots') {
                jQuery(`.filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
                $boto.addClass('actiu');
                filtresActius[grupFiltre] = 'tots';
            } else {
                jQuery(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).removeClass('actiu');
                $boto.addClass('actiu');
                
                setTimeout(function() {
                    if (verificarTotesOpcionsSeleccionades(grupFiltre)) {
                        activarBotoTots(grupFiltre);
                    }
                }, 10);
            }
        }
        
        actualitzarFiltresActius();
        aplicarFiltres();
        mostrarFiltresActius();
    } catch (error) {
        console.error("Error en clic a botó de filtre:", error);
    }
}

// Verificar si s'han seleccionat totes les opcions d'un filtre
function verificarTotesOpcionsSeleccionades(grupFiltre) {
    try {
        if (grupFiltre === 'imatge' || grupFiltre === 'fullatge') {
            return false;
        }
        
        const botonsGrup = jQuery(`.filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
        const botonsActius = jQuery(`.filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
        
        return botonsGrup.length > 0 && botonsGrup.length === botonsActius.length;
    } catch (error) {
        console.error("Error en verificarTotesOpcionsSeleccionades:", error);
        return false;
    }
}

// Activar el botó "Tots" d'un grup específic
function activarBotoTots(grupFiltre) {
    try {
        jQuery(`.filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
        jQuery(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
        filtresActius[grupFiltre] = 'tots';
    } catch (error) {
        console.error("Error en activarBotoTots:", error);
    }
}

// Actualitzar l'objecte de filtres actius
function actualitzarFiltresActius() {
    try {
        ['tipus', 'imatge', 'color', 'habitat', 'floracio', 'fullatge', 'usos'].forEach(grup => {
            if (grup === 'imatge' || grup === 'fullatge') {
                const filtreActiu = jQuery(`.filtre-boto[data-group="${grup}"].actiu`);
                const valorFiltre = filtreActiu.data('filtre');
                filtresActius[grup] = valorFiltre || 'tots';
            } else {
                if (jQuery(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`).hasClass('actiu')) {
                    filtresActius[grup] = 'tots';
                } else {
                    const filtresGrup = jQuery(`.filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                    
                    if (filtresGrup.length === 0) {
                        filtresActius[grup] = 'tots';
                    } else {
                        const valors = [];
                        filtresGrup.each(function() {
                            const valorFiltre = jQuery(this).data('filtre');
                            if (valorFiltre) valors.push(valorFiltre);
                        });
                        filtresActius[grup] = valors.length > 0 ? valors : 'tots';
                    }
                }
            }
        });
        
        console.log("Filtres actius actualitzats:", filtresActius);
    } catch (error) {
        console.error("Error en actualitzarFiltresActius:", error);
        Object.keys(filtresActius).forEach(key => {
            filtresActius[key] = 'tots';
        });
    }
}

// Mostrar filtres actius
function mostrarFiltresActius() {
    try {
        const contFiltre = jQuery('.filtres-actius');
        contFiltre.empty();
        
        let hiHaFiltresActius = false;
        
        Object.entries(filtresActius).forEach(([grup, valors]) => {
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
                    if (valors) {
                        const valorStr = String(valors);
                        const valorText = valorStr.charAt(0).toUpperCase() + valorStr.slice(1).replace(/_/g, ' ');
                        const etiqueta = jQuery(`<span class="filtre-actiu" data-group="${grup}" data-filtre="${valorStr}">
                            ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                        </span>`);
                        contFiltre.append(etiqueta);
                    }
                } else if (Array.isArray(valors)) {
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
            jQuery('.netejar-filtres').show();
        } else {
            jQuery('.netejar-filtres').hide();
        }
    } catch (error) {
        console.error("Error en mostrarFiltresActius:", error);
        jQuery('.netejar-filtres').hide();
    }
}

// Eliminar un filtre individual
function eliminarFiltre($element) {
    try {
        const $etiqueta = $element.parent();
        const grup = $etiqueta.data('group');
        const valor = $etiqueta.data('filtre');
        
        if (!grup || valor === undefined) {
            console.warn("Etiqueta sense atributs necessaris:", $etiqueta);
            return;
        }
        
        jQuery(`.filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`).removeClass('actiu');
        
        if (jQuery(`.filtre-boto[data-group="${grup}"].actiu`).length === 0) {
            jQuery(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
        }
        
        setTimeout(function() {
            if (verificarTotesOpcionsSeleccionades(grup)) {
                activarBotoTots(grup);
            }
        }, 10);
        
        actualitzarFiltresActius();
        aplicarFiltres();
        mostrarFiltresActius();
    } catch (error) {
        console.error("Error en eliminar filtre:", error);
    }
}

// Netejar tots els filtres
function netejarTotsFiltres() {
    try {
        console.log("Netejant tots els filtres");
        
        jQuery('.filtre-boto').removeClass('actiu');
        jQuery('.filtre-boto[data-filtre="tots"]').addClass('actiu');
        
        Object.keys(filtresActius).forEach(key => {
            filtresActius[key] = 'tots';
        });
        
        jQuery('#cerca-plantes').val('');
        
        aplicarCanviImatges('tots');
        aplicarFiltres();
        mostrarFiltresActius();
        
    } catch (error) {
        console.error("Error en netejar filtres:", error);
    }
}

// Aplicar filtres a les plantes
function aplicarFiltres() {
    try {
        jQuery('.planta-item').fadeOut(300);
        
        const textCerca = String(jQuery('#cerca-plantes').val() || '').toLowerCase().trim();
        
        setTimeout(function() {
            let plantesVisibles = 0;
            
            jQuery('.planta-item').each(function() {
                const $planta = jQuery(this);
                let passaFiltres = true;
                
                // Filtre de tipus de planta
                if (filtresActius.tipus !== 'tots') {
                    const tipusPlanta = $planta.data('tipus');
                    if (!tipusPlanta) {
                        passaFiltres = false;
                    } else if (Array.isArray(filtresActius.tipus)) {
                        passaFiltres = passaFiltres && filtresActius.tipus.includes(tipusPlanta);
                    } else {
                        passaFiltres = passaFiltres && (tipusPlanta === filtresActius.tipus);
                    }
                }
                
                // Filtre de colors (EXCLOENT)
                if (passaFiltres && filtresActius.color !== 'tots') {
                    const colorsPlanta = $planta.data('colors');
                    if (colorsPlanta) {
                        const arrColors = String(colorsPlanta).split(' ');
                        if (Array.isArray(filtresActius.color)) {
                            for (const colorFiltre of filtresActius.color) {
                                if (!arrColors.includes(colorFiltre)) {
                                    passaFiltres = false;
                                    break;
                                }
                            }
                        } else {
                            passaFiltres = passaFiltres && arrColors.includes(filtresActius.color);
                        }
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre d'hàbitat
                if (passaFiltres && filtresActius.habitat !== 'tots') {
                    const habitatsPlanta = $planta.data('habitats');
                    if (habitatsPlanta) {
                        const arrHabitats = String(habitatsPlanta).split(' ');
                        let passaHabitat = false;
                        if (Array.isArray(filtresActius.habitat)) {
                            for (const habitat of arrHabitats) {
                                if (filtresActius.habitat.includes(habitat)) {
                                    passaHabitat = true;
                                    break;
                                }
                            }
                        } else {
                            passaHabitat = arrHabitats.includes(filtresActius.habitat);
                        }
                        passaFiltres = passaFiltres && passaHabitat;
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre de floració
                if (passaFiltres && filtresActius.floracio !== 'tots') {
                    const floracioPlanta = $planta.data('floracio');
                    if (floracioPlanta) {
                        const arrFloracio = String(floracioPlanta).split(' ');
                        let passaFloracio = false;
                        if (Array.isArray(filtresActius.floracio)) {
                            for (const floracio of arrFloracio) {
                                if (filtresActius.floracio.includes(floracio)) {
                                    passaFloracio = true;
                                    break;
                                }
                            }
                        } else {
                            passaFloracio = arrFloracio.includes(filtresActius.floracio);
                        }
                        passaFiltres = passaFiltres && passaFloracio;
                    } else {
                        passaFiltres = false;
                    }
                }
                
                // Filtre de fullatge (excloent)
                if (passaFiltres && filtresActius.fullatge !== 'tots') {
                    const fullatgePlanta = $planta.data('fullatge');
                    passaFiltres = passaFiltres && (fullatgePlanta === filtresActius.fullatge);
                }
                
                // Filtre d'usos
                if (passaFiltres && filtresActius.usos !== 'tots') {
                    const usosPlanta = $planta.data('usos');
                    if (usosPlanta) {
                        const arrUsos = String(usosPlanta).split(' ');
                        let passaUsos = false;
                        if (Array.isArray(filtresActius.usos)) {
                            for (const us of arrUsos) {
                                if (filtresActius.usos.includes(us)) {
                                    passaUsos = true;
                                    break;
                                }
                            }
                        } else {
                            passaUsos = arrUsos.includes(filtresActius.usos);
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
            
            console.log(`Filtres aplicats: ${plantesVisibles} plantes visibles`);
        }, 300);
        
    } catch (error) {
        console.error("Error en aplicarFiltres:", error);
        jQuery('.planta-item').fadeIn(300);
    }
}

// Aplicar canvis d'imatges segons el filtre d'imatges seleccionat
function aplicarCanviImatges(tipusImatge) {
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
        console.error("Error en aplicarCanviImatges:", error);
    }
}

// Obrir modal de detalls de planta (sense AJAX)
function obrirDetallsPlanta(plantaId) {
    // Buscar la planta a les dades
    const planta = gb_plantes_data.find(p => 
        p.id === plantaId || 
        sanitizeTitle(p.nom_cientific) === plantaId ||
        p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
    );
    
    if (!planta) {
        console.error(`No s'ha trobat la planta amb ID: ${plantaId}`);
        return;
    }
    
    // Assegurar-se que l'element modal existeix
    if (jQuery('.planta-modal').length === 0) {
        jQuery('body').append(`
            <div class="planta-modal" style="display: none;">
                <div class="planta-modal-contingut">
                    <span class="planta-modal-tancar">&times;</span>
                    <div class="planta-modal-cos"></div>
                </div>
            </div>
        `);
    }
    
    // Generar HTML dels detalls
    const htmlDetalls = generarHTMLDetallsPlanta(planta);
    
    // Mostrar el modal
    jQuery('.planta-modal-cos').html(htmlDetalls);
    jQuery('.planta-modal').fadeIn(300).addClass('actiu');
    modalObert = true;
    jQuery('body').css('overflow', 'hidden');
    
    // Activar lightbox per a les imatges
    activarLightboxGaleria();
}

// Tancar modal
function tancarModal() {
    jQuery('.planta-modal').fadeOut(300).removeClass('actiu');
    modalObert = false;
    jQuery('body').css('overflow', 'auto');
}

// Activar lightbox per a les imatges de detall (versió galeria)
function activarLightboxGaleria() {
    try {
        jQuery('.planta-imatge-detall img, .planta-imatge-principal img').on('click', function() {
            const imgSrc = jQuery(this).attr('src');
            const tipusImatge = jQuery(this).data('tipus') || 'general';
            
            const lightbox = jQuery('<div class="planta-lightbox">');
            const img = jQuery('<img>').attr('src', imgSrc);
            const tancaBtn = jQuery('<span class="planta-lightbox-tancar">&times;</span>');
            
            lightbox.append(img).append(tancaBtn).appendTo('body');
            
            setTimeout(function() {
                lightbox.addClass('actiu');
            }, 10);
            
            if (tipusImatge && tipusImatge !== 'general') {
                const tipusEtiqueta = jQuery('<div class="planta-lightbox-tipus">' + tipusImatge + '</div>');
                lightbox.append(tipusEtiqueta);
            }
            
            tancaBtn.on('click', function(e) {
                e.stopPropagation();
                tancarLightboxGaleria(lightbox);
            });
            
            lightbox.on('click', function() {
                tancarLightboxGaleria(lightbox);
            });
            
            img.on('click', function(e) {
                e.stopPropagation();
            });
            
            jQuery(document).on('keydown.lightboxGaleria', function(e) {
                if (e.key === "Escape") {
                    tancarLightboxGaleria(lightbox);
                }
            });
        });
    } catch (error) {
        console.error("Error en activarLightboxGaleria:", error);
    }
}

// Tancar lightbox de la galeria
function tancarLightboxGaleria(lightbox) {
    try {
        lightbox.removeClass('actiu');
        setTimeout(function() {
            lightbox.remove();
            jQuery(document).off('keydown.lightboxGaleria');
        }, 300);
    } catch (error) {
        console.error("Error en tancarLightboxGaleria:", error);
        lightbox.remove();
        jQuery(document).off('keydown.lightboxGaleria');
    }
}

// Verificar si hi ha un hash a l'URL per obrir directament una planta
function verificarHashURL() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#planta-')) {
        const plantaId = hash.substring(8);
        setTimeout(function() {
            obrirDetallsPlanta(plantaId);
        }, 500);
    }
}

// Cridar verificarHashURL quan es carregui la pàgina
jQuery(window).on('load', verificarHashURL);
