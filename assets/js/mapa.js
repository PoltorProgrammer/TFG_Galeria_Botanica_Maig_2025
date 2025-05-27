/**
* Mapa Botànic UAB - JavaScript adaptat 
* Versió independent sense WordPress
* Basat en mapa-botanica.js original
*/

// Variables globals del mapa
window.mapa = {
   map: null,
   markers: null,
   totsElsMarcadors: [],
   habitatsLayers: {},
   filtresActius: {
       tipus: 'tots',
       habitat: 'tots',
       floracio: 'tots',
       usos: 'tots',
       fullatge: 'tots'
   }
};

// Inicialitzar el mapa
async function inicialitzarMapa() {
   try {
       console.log("Inicialitzant mapa botànic UAB...");
       
       if (window.app.mapaInicialitzat) {
           console.log("El mapa ja està inicialitzat");
           return;
       }
       
       // Generar HTML dels filtres del mapa
       await generarHTMLFiltresMapa();
       
       // Crear el mapa Leaflet
       crearMapaLeaflet();
       
       // Carregar marcadors de plantes
       await carregarMarcadorsPlantes();
       
       // Afegir polígons d'hàbitats
       await afegirPoligonsHabitats();
       
       // Configurar esdeveniments del mapa
       configurarEventListenersMapa();
       
       // Aplicar filtres inicials
       actualitzarFiltresActiusMapa();
       aplicarFiltresMapa();
       mostrarFiltresActiusMapa();
       
       window.app.mapaInicialitzat = true;
       console.log("Mapa inicialitzat correctament");
       
   } catch (error) {
       console.error("Error inicialitzant el mapa:", error);
       mostrarError("Error inicialitzant el mapa: " + error.message);
   }
}

// Generar HTML dels filtres del mapa
async function generarHTMLFiltresMapa() {
   const mapaContainer = document.getElementById('mapa-section');
   if (!mapaContainer) return;
   
   let html = '<div class="mapa-filtres">';
   html += '<div class="filtres-grup">';
   
   // Generar filtres similars a la galeria però adaptats al mapa
   html += await generarFiltresTipusMapa();
   html += await generarFiltresHabitatMapa();
   html += await generarFiltresFloracioMapa();
   html += await generarFiltresUsosMapa();
   html += await generarFiltresFullatgeMapa();
   
   // Cercador
   html += '<div class="cerca-contenidor">';
   html += '<input type="text" id="mapa-cerca" placeholder="Cercar per paraules clau..." class="cerca-input" />';
   html += '</div>';
   
   html += '</div>'; // Fi filtres-grup
   
   // Filtres actius + botó netejar
   html += '<div class="filtres-actius-contenidor">';
   html += '<span class="etiqueta-filtres-actius">Filtres actius:</span>';
   html += '<div class="filtres-actius"></div>';
   html += '<button class="netejar-filtres" style="display:none;">Netejar tots els filtres</button>';
   html += '</div>';
   
   html += '</div>'; // Fi mapa-filtres
   
   // Contenidor del mapa
   html += '<div id="mapa-botanica" style="height: 600px;"></div>';
   
   mapaContainer.innerHTML = html;
}

// Generar filtres de tipus per al mapa
async function generarFiltresTipusMapa() {
   const tipus = [...new Set(window.app.plantes.map(p => p.tipus))].sort();
   
   let html = '<div class="grup-filtre tipus-planta-filtre">';
   html += '<span class="etiqueta-filtre">Tipus:</span>';
   html += '<div class="botons-filtre">';
   html += '<button class="filtre-boto actiu" data-group="tipus" data-filtre="tots">Totes les plantes</button>';
   
   tipus.forEach(tipus => {
       const nomTipus = capitalitzar(tipus);
       html += `<button class="filtre-boto" data-group="tipus" data-filtre="${tipus}">${nomTipus}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres d'hàbitat per al mapa
async function generarFiltresHabitatMapa() {
   const habitats = new Map();
   
   window.app.plantes.forEach(planta => {
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
       const nomCapitalitzat = nomMostrar.split(' ').map(word => capitalitzar(word)).join(' ');
       html += `<button class="filtre-boto" data-group="habitat" data-filtre="${habitatNorm}">${nomCapitalitzat}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres de floració per al mapa
async function generarFiltresFloracioMapa() {
   const floracions = new Set();
   
   window.app.plantes.forEach(planta => {
       if (planta.caracteristiques && planta.caracteristiques.floracio) {
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
   html += '<button class="filtre-boto actiu" data-group="floracio" data-filtre="tots">Totes</button>';
   
   [...floracions].sort().forEach(floracio => {
       const nomFloracio = capitalitzar(floracio);
       html += `<button class="filtre-boto" data-group="floracio" data-filtre="${floracio}">${nomFloracio}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres d'usos per al mapa
async function generarFiltresUsosMapa() {
   const usos = new Map();
   
   window.app.plantes.forEach(planta => {
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
       html += `<button class="filtre-boto" data-group="usos" data-filtre="${usNorm}">${capitalitzar(usNom)}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres de fullatge per al mapa
async function generarFiltresFullatgeMapa() {
   const fullatges = new Set();
   
   window.app.plantes.forEach(planta => {
       if (planta.caracteristiques && planta.caracteristiques.fullatge) {
           fullatges.add(planta.caracteristiques.fullatge);
       }
   });
   
   if (fullatges.size === 0) return '';
   
   let html = '<div class="grup-filtre fullatge-filtre">';
   html += '<span class="etiqueta-filtre">Fullatge:</span>';
   html += '<div class="botons-filtre">';
   html += '<button class="filtre-boto actiu" data-group="fullatge" data-filtre="tots">Tots</button>';
   
   [...fullatges].sort().forEach(fullatge => {
       const nomFullatge = capitalitzar(fullatge);
       html += `<button class="filtre-boto" data-group="fullatge" data-filtre="${fullatge}">${nomFullatge}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Crear el mapa Leaflet
function crearMapaLeaflet() {
   // Crear el mapa centrat a la UAB
   window.mapa.map = L.map('mapa-botanica').setView([41.50085, 2.09342], 16);
   
   // Capes base
   const baseOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       attribution: '© OpenStreetMap | Flora UAB',
       maxZoom: 19,
   }).addTo(window.mapa.map);
   
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
   }).addTo(window.mapa.map);
   
   // Clúster de marcadors
   window.mapa.markers = L.markerClusterGroup({
       maxClusterRadius: 50,
       spiderfyOnMaxZoom: true,
       showCoverageOnHover: false,
       zoomToBoundsOnClick: true,
   });
   
   window.mapa.map.addLayer(window.mapa.markers);
}

// Carregar marcadors de plantes
async function carregarMarcadorsPlantes() {
   if (!window.app.plantes || window.app.plantes.length === 0) {
       console.warn("No hi ha dades de plantes per carregar al mapa");
       return;
   }
   
   console.log("Carregant marcadors de plantes:", window.app.plantes.length);
   
   window.app.plantes.forEach(planta => {
       if (!planta.coordenades || planta.coordenades.length === 0) {
           return; // Saltar plantes sense coordenades
       }
       
       // Preparar dades processades per al filtratge
       const plantaProcessada = processarDadesPlantaMapa(planta);
       
       planta.coordenades.forEach(coord => {
           // Crear marcador personalitzat
           const icona = crearIconaPersonalitzada(planta.tipus);
           const marcador = L.marker([coord.lat, coord.lng], { icon: icona });
           
           // Crear popup
           const popupHTML = crearPopupHTML(planta);
           marcador.bindPopup(popupHTML);
           
           // Afegir dades de la planta al marcador per al filtratge
           marcador.plantaData = plantaProcessada;
           
           // Afegir a la llista global i al grup de clústers
           window.mapa.totsElsMarcadors.push(marcador);
           window.mapa.markers.addLayer(marcador);
       });
   });
   
   console.log(`Carregats ${window.mapa.totsElsMarcadors.length} marcadors`);
}

// Processar dades de planta per al mapa
function processarDadesPlantaMapa(planta) {
   // Normalitzar habitat
   const habitatsNormalitzats = [];
   if (planta.habitat) {
       planta.habitat.forEach(h => {
           const hNorm = normalitzarText(h);
           if (hNorm) habitatsNormalitzats.push(hNorm);
       });
   }
   
   // Normalitzar floració
   const floracioNormalitzada = [];
   if (planta.caracteristiques && planta.caracteristiques.floracio) {
       const floracio = planta.caracteristiques.floracio;
       if (Array.isArray(floracio)) {
           floracio.forEach(f => {
               const fNorm = normalitzarText(f);
               if (fNorm) floracioNormalitzada.push(fNorm);
           });
       } else if (typeof floracio === 'string') {
           const fNorm = normalitzarText(floracio);
           if (fNorm) floracioNormalitzada.push(fNorm);
       }
   }
   
   // Normalitzar usos
   const usosNormalitzats = [];
   if (planta.usos) {
       planta.usos.forEach(u => {
           const uNorm = normalitzarText(u);
           if (uNorm) usosNormalitzats.push(uNorm);
       });
   }
   
   // Construir text de cerca complet
   const infoCompleta = construirInfoCompletaCerca(planta);
   
   return {
       ...planta,
       habitat_norm: habitatsNormalitzats,
       floracio_norm: floracioNormalitzada,
       usos_norm: usosNormalitzats,
       info_completa: infoCompleta
   };
}

// Normalitzar text (eliminar parèntesis i convertir a minúscules amb guions baixos)
function normalitzarText(text) {
   if (!text) return '';
   return text.toLowerCase()
             .replace(/\s*\(.*?\)\s*/g, '')
             .trim()
             .replace(/\s+/g, '_');
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
   const imatges = obtenirImatgesPlanta(plantaId);
   
   // Funció per formatar text (substituir guions baixos per espais)
   function formatVisual(text) {
       if (!text) return '';
       return String(text).replace(/_/g, ' ');
   }
   
   let html = '<div class="planta-popup">';
   
   // Imatge si està disponible
   if (imatges.principal) {
       const imatgeUrl = obtenirURLImatge(imatges.principal);
       html += `<img src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" class="planta-popup-imatge" onerror="this.style.display='none'">`;
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
   if (planta.caracteristiques && planta.caracteristiques.floracio) {
       const floracio = planta.caracteristiques.floracio;
       let floracioText = '';
       if (Array.isArray(floracio)) {
           floracioText = floracio.map(f => formatVisual(escapeHtml(f))).join(', ');
       } else {
           floracioText = formatVisual(escapeHtml(floracio));
       }
       html += `<p><strong>Floració:</strong> ${floracioText}</p>`;
   }
   
   // Fullatge
   if (planta.caracteristiques && planta.caracteristiques.fullatge) {
       html += `<p><strong>Fullatge:</strong> ${escapeHtml(formatVisual(planta.caracteristiques.fullatge))}</p>`;
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
       const habitats = L.layerGroup().addTo(window.mapa.map);
       
       // Definir zones d'hàbitat amb els seus fitxers GeoJSON
       const zonesHabitat = [
           {
               nom: 'Camí de Ho Chi Minh',
               id: 'cami_ho_chi_minh',
               descripcio: 'Pas central del campus amb vegetació natural als seus marges.',
               geojson: CONFIG.geojsonPath + 'cami_ho_chi_minh.geojson',
               color: '#8BC34A',
               fillOpacity: 0.30
           },
           {
               nom: "Torrent de Can Domènech",
               id: "torrent_can_domenech",
               descripcio: "Zona de vegetació de ribera amb espècies adaptades a ambients humits.",
               geojson: CONFIG.geojsonPath + 'torrent_can_domenech.geojson',
               color: "#03A9F4",
               fillOpacity: 0.3
           },
           {
               nom: "Camins del campus",
               id: "camins",
               descripcio: "Xarxa principal de camins que travessen el campus universitari.",
               geojson: CONFIG.geojsonPath + "camins.geojson",
               color: "#795548",
               fillOpacity: 0.3
           },
           {
               nom: "Eix central",
               id: "eix_central",
               descripcio: "Via principal que vertebra el campus i connecta les diferents facultats i edificis.",
               geojson: CONFIG.geojsonPath + "eix_central.geojson",
               color: "#607D8B",
               fillOpacity: 0.3
           },
           {
               nom: "Zones assolellades",
               id: "zones_assolellades",
               descripcio: "Àrees amb exposició directa al sol on creixen espècies adaptades a la llum solar intensa.",
               geojson: CONFIG.geojsonPath + "purament_assolellades.geojson",
               color: "#FFC107",
               fillOpacity: 0.3
           },
           {
               nom: "Vegetació de ribera",
               id: "vegetacio_ribera",
               descripcio: "Vegetació pròpia de les vores d'aigua, típica de zones ripàries.",
               geojson: CONFIG.geojsonPath + "vegetacio_ribera.geojson",
               color: "#4CAF50",
               fillOpacity: 0.3
           },
           {
               nom: "Zones ombrívoles",
               id: "zones_ombrivoles",
               descripcio: "Àrees amb ombra permanent on creixen espècies adaptades a poca llum solar directa.",
               geojson: CONFIG.geojsonPath + "zones_ombrivoles.geojson",
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
                   window.mapa.habitatsLayers[zona.id] = capaZona;
                   
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
   // Eliminar control existent si hi ha
   window.mapa.map.eachLayer(function(layer) {
       if (layer instanceof L.Control.Layers) {
           window.mapa.map.removeControl(layer);
       }
   });
   
   // Crear nou control amb les capes base existents
   const overlayMaps = {
       "Hàbitats": habitats
   };
   
   L.control.layers(null, overlayMaps).addTo(window.mapa.map);
}

// Configurar event listeners del mapa
function configurarEventListenersMapa() {
   // Events per als botons de filtre
   $(document).on('click', '.mapa-botanica-contenidor .filtre-boto', function() {
       gestionarClicFiltreMapa($(this));
   });
   
   // Event per netejar filtres
   $(document).on('click', '.mapa-botanica-contenidor .netejar-filtres', function() {
       netejarTotsFiltresMapa();
   });
   
   // Event per eliminar filtres individuals
   $(document).on('click', '.mapa-botanica-contenidor .eliminar-filtre', function() {
       eliminarFiltreMapa($(this));
   });
   
   // Event per a la cerca
   $(document).on('input', '#mapa-cerca', function() {
       console.log("Aplicant filtre de text:", $(this).val());
       aplicarFiltresMapa();
   });
   
   // Event per al botó "Veure detalls" als popups
   $(document).on('click', '.boto-veure-detalls', function(e) {
       e.preventDefault();
       
       const plantaId = $(this).data('planta-id');
       const plantaNom = $(this).data('planta-nom');
       
       console.log("Obrint detalls de planta des del mapa:", { plantaId, plantaNom });
       
       // Tancar popup del mapa
       window.mapa.map.closePopup();
       
       // Obrir modal de detalls
       obrirDetallsPlanta(plantaId);
       
       // Actualitzar URL
       window.location.hash = `planta-${plantaId}`;
   });
}

// Gestionar clic en botons de filtre del mapa
function gestionarClicFiltreMapa($boto) {
   try {
       const grup = $boto.data('group');
       const valor = $boto.data('filtre');
       
       if (!grup || !valor) {
           console.warn("Botó sense atributs necessaris:", $boto[0]);
           return;
       }
       
       console.log(`Botó mapa clicat: grup=${grup}, valor=${valor}, actiu=${$boto.hasClass('actiu')}`);
       
       // Comportament especial per al filtre de fullatge (excloent)
       if (grup === 'fullatge') {
           $('.mapa-botanica-contenidor .filtre-boto[data-group="fullatge"]').removeClass('actiu');
           $boto.addClass('actiu');
           window.mapa.filtresActius.fullatge = valor;
           
           actualitzarFiltresActiusMapa();
           aplicarFiltresMapa();
           mostrarFiltresActiusMapa();
           return;
       }
       
       // Per a filtres multi-selecció
       if ($boto.hasClass('actiu') && valor !== 'tots') {
           $boto.removeClass('actiu');
           
           if ($(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu`).length === 0) {
               $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
           }
       } else {
           if (valor === 'tots') {
               $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"]`).removeClass('actiu');
               $boto.addClass('actiu');
           } else {
               $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`).removeClass('actiu');
               $boto.addClass('actiu');
           }
       }
       
       actualitzarFiltresActiusMapa();
       aplicarFiltresMapa();
       mostrarFiltresActiusMapa();
       
   } catch (error) {
       console.error("Error en clic a botó de filtre del mapa:", error);
   }
}

// Actualitzar filtres actius del mapa
function actualitzarFiltresActiusMapa() {
   try {
       ['tipus', 'habitat', 'floracio', 'usos', 'fullatge'].forEach(grup => {
           if (grup === 'fullatge') {
               // Per al filtre excloent
               const filtreActiu = $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu`);
               const valorFiltre = filtreActiu.data('filtre');
               window.mapa.filtresActius[grup] = valorFiltre || 'tots';
           } else {
               // Per als filtres multi-selecció
               if ($(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`).hasClass('actiu')) {
                   window.mapa.filtresActius[grup] = 'tots';
               } else {
                   const filtresGrup = $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                   
                   if (filtresGrup.length === 0) {
                       window.mapa.filtresActius[grup] = 'tots';
                   } else {
                       const valors = [];
                       filtresGrup.each(function() {
                           const filtre = $(this).data('filtre');
                           if (filtre) valors.push(filtre);
                       });
                       window.mapa.filtresActius[grup] = valors.length > 0 ? valors : 'tots';
                   }
               }
           }
       });
       
       console.log("Filtres actius del mapa actualitzats:", JSON.stringify(window.mapa.filtresActius, null, 2));
   } catch (error) {
       console.error("Error en actualitzarFiltresActiusMapa:", error);
       Object.keys(window.mapa.filtresActius).forEach(key => window.mapa.filtresActius[key] = 'tots');
   }
}

// Mostrar filtres actius del mapa
function mostrarFiltresActiusMapa() {
   try {
       const $contenidor = $('.mapa-botanica-contenidor .filtres-actius').empty();
       let hiHaFiltresActius = false;
       
       Object.entries(window.mapa.filtresActius).forEach(([grup, valors]) => {
           if (valors !== 'tots') {
               hiHaFiltresActius = true;
               
               const grupTexts = {
                   tipus: 'Tipus',
                   habitat: 'Hàbitat',
                   floracio: 'Floració',
                   usos: 'Usos',
                   fullatge: 'Fullatge'
               };
               const grupText = grupTexts[grup] || capitalitzar(grup);
               
               // Convertir a array si no ho és
               const valorsArray = Array.isArray(valors) ? valors : [valors];
               
               valorsArray.forEach(valor => {
                   if (valor) {
                       const valorStr = String(valor);
                       const valorText = capitalitzar(valorStr.replace(/_/g, ' '));
                       
                       const etiquetaHTML = `<span class="filtre-actiu" data-group="${grup}" data-filtre="${valorStr}">
                           ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                       </span>`;
                       
                       $contenidor.append(etiquetaHTML);
                   }
               });
           }
       });
       
       // Mostrar o amagar botó de neteja
       if (hiHaFiltresActius) {
           $('.mapa-botanica-contenidor .netejar-filtres').show();
       } else {
           $('.mapa-botanica-contenidor .netejar-filtres').hide();
       }
   } catch (error) {
       console.error("Error en mostrarFiltresActiusMapa:", error);
       $('.mapa-botanica-contenidor .netejar-filtres').hide();
   }
}

// Aplicar filtres als marcadors del mapa
function aplicarFiltresMapa() {
   try {
       console.log("Aplicant filtres del mapa:", JSON.stringify(window.mapa.filtresActius, null, 2));
       
       // Netejar tots els marcadors
       window.mapa.markers.clearLayers();
       
       // Obtenir text de cerca
       const textCerca = ($('#mapa-cerca').val() || '').toLowerCase().trim();
       
       let comptadorVisible = 0;
       let comptadorFiltrats = 0;
       
       window.mapa.totsElsMarcadors.forEach(marcador => {
           if (!marcador || !marcador.plantaData) {
               console.warn("Marcador sense dades:", marcador);
               return;
           }
           
           comptadorFiltrats++;
           const planta = marcador.plantaData;
           let passaFiltres = true;
           
           // Filtre de tipus de planta
           if (window.mapa.filtresActius.tipus !== 'tots') {
               const filtresArray = Array.isArray(window.mapa.filtresActius.tipus) ? 
                   window.mapa.filtresActius.tipus : [window.mapa.filtresActius.tipus];
               passaFiltres = passaFiltres && filtresArray.includes(planta.tipus);
           }
           
           // Filtre d'hàbitat (INCLUSIU)
           if (passaFiltres && window.mapa.filtresActius.habitat !== 'tots') {
               const filtresArray = Array.isArray(window.mapa.filtresActius.habitat) ? 
                   window.mapa.filtresActius.habitat : [window.mapa.filtresActius.habitat];
               
               const habitatsNorm = planta.habitat_norm || [];
               
               if (habitatsNorm.length === 0) {
                   passaFiltres = false;
               } else {
                   let passaHabitat = false;
                   for (const hab of habitatsNorm) {
                       if (filtresArray.includes(hab)) {
                           passaHabitat = true;
                           break;
                       }
                   }
                   passaFiltres = passaFiltres && passaHabitat;
               }
           }
           
           // Filtre de floració
           if (passaFiltres && window.mapa.filtresActius.floracio !== 'tots') {
               const filtresArray = Array.isArray(window.mapa.filtresActius.floracio) ? 
                   window.mapa.filtresActius.floracio : [window.mapa.filtresActius.floracio];
               
               const floracioNorm = planta.floracio_norm || [];
               
               if (floracioNorm.length === 0) {
                   passaFiltres = false;
               } else {
                   let passaFloracio = false;
                   for (const fl of floracioNorm) {
                       if (filtresArray.includes(fl)) {
                           passaFloracio = true;
                           break;
                       }
                   }
                   passaFiltres = passaFiltres && passaFloracio;
               }
           }
           
           // Filtre d'usos
           if (passaFiltres && window.mapa.filtresActius.usos !== 'tots') {
               const filtresArray = Array.isArray(window.mapa.filtresActius.usos) ? 
                   window.mapa.filtresActius.usos : [window.mapa.filtresActius.usos];
               
               const usosNorm = planta.usos_norm || [];
               
               if (usosNorm.length === 0) {
                   passaFiltres = false;
               } else {
                   let passaUsos = false;
                   for (const us of usosNorm) {
                       if (filtresArray.includes(us)) {
                           passaUsos = true;
                           break;
                       }
                   }
                   passaFiltres = passaFiltres && passaUsos;
               }
           }
           
           // Filtre de fullatge (comportament excloent)
           if (passaFiltres && window.mapa.filtresActius.fullatge !== 'tots') {
               const fullatge = planta.caracteristiques && planta.caracteristiques.fullatge;
               
               if (!fullatge) {
                   passaFiltres = false;
               } else {
                   const filtresArray = Array.isArray(window.mapa.filtresActius.fullatge) ? 
                       window.mapa.filtresActius.fullatge : [window.mapa.filtresActius.fullatge];
                   passaFiltres = passaFiltres && filtresArray.includes(fullatge);
               }
           }
           
           // Filtre de cerca per text
           if (passaFiltres && textCerca) {
               const textPlanta = (planta.info_completa || '').toLowerCase();
               passaFiltres = passaFiltres && textPlanta.includes(textCerca);
           }
           
           // Mostrar el marcador si passa tots els filtres
           if (passaFiltres) {
               window.mapa.markers.addLayer(marcador);
               comptadorVisible++;
           }
       });
       
       console.log(`Filtres del mapa aplicats: ${comptadorVisible} marcadors visibles de ${window.mapa.totsElsMarcadors.length} totals`);
   } catch (error) {
       console.error("Error en aplicarFiltresMapa:", error);
       // En cas d'error, mostrar tots els marcadors
       window.mapa.totsElsMarcadors.forEach(m => window.mapa.markers.addLayer(m));
   }
}

// Eliminar un filtre individual del mapa
function eliminarFiltreMapa($element) {
   try {
       const $etiqueta = $element.parent();
       const grup = $etiqueta.data('group');
       const valor = $etiqueta.data('filtre');
       
       if (!grup || valor === undefined) {
           console.warn("Etiqueta sense atributs necessaris:", $etiqueta);
           return;
       }
       
       console.log(`Eliminant filtre del mapa: grup=${grup}, valor=${valor}`);
       
       // Desactivar el botó corresponent
       $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`).removeClass('actiu');
       
       // Si no queden filtres actius en aquest grup, activar el "tots"
       if ($(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"].actiu`).length === 0) {
           $(`.mapa-botanica-contenidor .filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
       }
       
       actualitzarFiltresActiusMapa();
       aplicarFiltresMapa();
       mostrarFiltresActiusMapa();
   } catch (error) {
       console.error("Error en eliminar filtre del mapa:", error);
   }
}

// Netejar tots els filtres del mapa
function netejarTotsFiltresMapa() {
   try {
       console.log("Netejant tots els filtres del mapa");
       
       $('.mapa-botanica-contenidor .filtre-boto').removeClass('actiu');
       $('.mapa-botanica-contenidor .filtre-boto[data-filtre="tots"]').addClass('actiu');
       
       // Restablir objecte de filtres actius
       Object.keys(window.mapa.filtresActius).forEach(key => {
           window.mapa.filtresActius[key] = 'tots';
       });
       
       // Netejar camp de cerca
       $('#mapa-cerca').val('');
       
       // Aplicar filtres
       aplicarFiltresMapa();
       
       // Actualitzar vista de filtres actius
       mostrarFiltresActiusMapa();
       
   } catch (error) {
       console.error("Error en netejar filtres del mapa:", error);
   }
}

// Gestió de deep-link a planta específica
$(window).on('load', function() {
   try {
       const urlParams = new URLSearchParams(window.location.search);
       const plantaId = urlParams.get('planta');
       
       if (!plantaId) return;
       
       setTimeout(() => {
           let trobat = false;
           window.mapa.totsElsMarcadors.some((marcador) => {
               if (marcador.plantaData && marcador.plantaData.id === plantaId) {
                   window.mapa.map.setView(marcador.getLatLng(), 18);
                   marcador.openPopup();
                   trobat = true;
                   return true;
               }
               return false;
           });
           
           if (!trobat) {
               console.warn(`No s'ha trobat cap planta amb ID '${plantaId}' al mapa`);
           }
       }, 500);
   } catch (error) {
       console.error("Error en processar deep-link del mapa:", error);
   }
});

// Control d'errors global per al mapa
window.addEventListener('error', function(event) {
   if (event.filename && (event.filename.includes('mapa-botanica.js') || event.filename.includes('leaflet'))) {
       console.error("Error captat globalment al mapa:", event.message, "a", event.filename, "línia", event.lineno);
   }
});