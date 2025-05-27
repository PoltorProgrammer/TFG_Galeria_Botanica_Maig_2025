/**
* Galeria Botànica UAB - JavaScript adaptat
* Versió independent sense WordPress
* Basat en galeria-botanica.js original
*/

// Variables globals de la galeria
window.galeria = {
   filtresActius: {
       tipus: 'tots',
       imatge: 'tots',
       color: 'tots',
       habitat: 'tots',
       floracio: 'tots',
       fullatge: 'tots',
       usos: 'tots'
   },
   modalObert: false
};

// Inicialitzar la galeria
async function inicialitzarGaleria() {
   try {
       console.log("Inicialitzant galeria botànica...");
       
       if (window.app.galeriaInicialitzada) {
           console.log("La galeria ja està inicialitzada");
           return;
       }
       
       // Generar HTML de la galeria
       await generarHTMLGaleria();
       
       // Configurar esdeveniments
       configurarEventListenersGaleria();
       
       // Aplicar filtres inicials
       actualitzarFiltresActius();
       aplicarFiltres();
       mostrarFiltresActius();
       
       window.app.galeriaInicialitzada = true;
       console.log("Galeria inicialitzada correctament");
       
   } catch (error) {
       console.error("Error inicialitzant la galeria:", error);
       mostrarError("Error inicialitzant la galeria: " + error.message);
   }
}

// Generar HTML de la galeria
async function generarHTMLGaleria() {
   const galeriaContainer = document.getElementById('galeria-section');
   if (!galeriaContainer) return;
   
   let html = '';
   
   // Generar filtres
   html += await generarHTMLFiltres();
   
   // Generar graella de plantes
   html += await generarHTMLGraellaPlantes();
   
   galeriaContainer.innerHTML = html;
}

// Generar HTML dels filtres
async function generarHTMLFiltres() {
   let html = '<div class="filtres-contenidor">';
   html += '<div class="filtres-barra">';
   
   // Filtre per tipus de planta
   html += await generarFiltresTipus();
   
   // Filtre per tipus d'imatge
   html += await generarFiltresImatge();
   
   // Filtre per colors
   html += await generarFiltresColors();
   
   // Filtre per hàbitat
   html += await generarFiltresHabitat();
   
   // Filtre per floració
   html += await generarFiltresFloracio();
   
   // Filtre per fullatge
   html += await generarFiltresFullatge();
   
   // Filtre per usos
   html += await generarFiltresUsos();
   
   html += '</div>'; // Fi filtres-barra
   
   // Secció per mostrar filtres actius
   html += '<div class="filtres-actius-contenidor">';
   html += '<span class="etiqueta-filtres-actius">Filtres actius:</span>';
   html += '<div class="filtres-actius"></div>';
   html += '<button class="netejar-filtres" style="display: none;">Netejar tots els filtres</button>';
   html += '</div>';
   
   // Barra de cerca
   html += '<div class="cerca-contenidor">';
   html += '<input type="text" id="cerca-plantes" placeholder="Cercar per paraules clau..." class="cerca-input" />';
   html += '</div>';
   
   html += '</div>'; // Fi filtres-contenidor
   
   return html;
}

// Generar filtres de tipus
async function generarFiltresTipus() {
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

// Generar filtres d'imatge
async function generarFiltresImatge() {
   // Recopilar tots els tipus d'imatges disponibles
   const tipusImatges = new Set();
   
   for (const planta of window.app.plantes) {
       const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
       const imatges = obtenirImatgesPlanta(plantaId);
       
       if (imatges.principal_tipus && imatges.principal_tipus !== 'general') {
           tipusImatges.add(imatges.principal_tipus);
       }
       
       if (imatges.detalls_tipus) {
           imatges.detalls_tipus.forEach(tipus => {
               if (tipus !== 'general') {
                   tipusImatges.add(tipus);
               }
           });
       }
   }
   
   if (tipusImatges.size === 0) return '';
   
   let html = '<div class="grup-filtre tipus-imatge-filtre">';
   html += '<span class="etiqueta-filtre">Imatges:</span>';
   html += '<div class="botons-filtre botons-filtre-imatges">';
   html += '<button class="filtre-boto filtre-imatge actiu" data-group="imatge" data-filtre="tots">Totes</button>';
   
   [...tipusImatges].sort().forEach(tipus => {
       const nomTipus = capitalitzar(tipus);
       html += `<button class="filtre-boto filtre-imatge" data-group="imatge" data-filtre="${tipus}">${nomTipus}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres de colors
async function generarFiltresColors() {
   const colors = new Set();
   
   window.app.plantes.forEach(planta => {
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
   html += '<button class="filtre-boto actiu" data-group="color" data-filtre="tots">Tots</button>';
   
   [...colors].sort().forEach(color => {
       const nomColor = capitalitzar(color);
       html += `<button class="filtre-boto" data-group="color" data-filtre="${color}">${nomColor}</button>`;
   });
   
   html += '</div></div>';
   return html;
}

// Generar filtres d'hàbitat
async function generarFiltresHabitat() {
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

// Generar filtres de floració
async function generarFiltresFloracio() {
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

// Generar filtres de fullatge
async function generarFiltresFullatge() {
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

// Generar filtres d'usos
async function generarFiltresUsos() {
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

// Generar graella de plantes
async function generarHTMLGraellaPlantes() {
   let html = '<div class="plantes-grid">';
   
   for (const planta of window.app.plantes) {
       html += await generarHTMLPlantaItem(planta);
   }
   
   html += '</div>';
   return html;
}

// Generar HTML d'un item de planta
async function generarHTMLPlantaItem(planta) {
   const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
   const imatges = obtenirImatgesPlanta(plantaId);
   
   // Preparar atributs de dades per als filtres
   const dataAttrs = prepararDataAttributsPlanta(planta, imatges);
   
   let html = `<div class="planta-item" ${dataAttrs} id="planta-${plantaId}">`;
   
   // Imatge principal
   html += '<div class="planta-imatge">';
   html += `<a href="#" class="planta-obrir-detall" data-planta="${plantaId}">`;
   
   if (imatges.principal) {
       const imatgeUrl = obtenirURLImatge(imatges.principal);
       html += `<img class="planta-imatge-principal" src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" onerror="this.src='${CONFIG.imagesPath}default_planta.jpg'">`;
       
       if (imatges.principal_tipus !== 'general') {
           html += `<span class="planta-tipus-imatge">${capitalitzar(imatges.principal_tipus)}</span>`;
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
   if (planta.caracteristiques && planta.caracteristiques.floracio) {
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
   if (planta.caracteristiques && planta.caracteristiques.fullatge) {
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

// Construir informació completa per a la cerca
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

// Configurar event listeners de la galeria
function configurarEventListenersGaleria() {
   // Event listeners per als botons de filtre
   $(document).on('click', '.galeria-botanica .filtre-boto', function() {
       gestionarClicFiltre($(this));
   });
   
   // Event listener per al botó de neteja
   $(document).on('click', '.galeria-botanica .netejar-filtres', function() {
       netejarTotsFiltres();
   });
   
   // Event listeners per eliminar filtres individuals
   $(document).on('click', '.galeria-botanica .eliminar-filtre', function() {
       eliminarFiltre($(this));
   });
   
   // Event listener per al camp de cerca
   $(document).on('input', '#cerca-plantes', function() {
       aplicarFiltres();
   });
   
   // Event listeners per obrir detalls de planta
   $(document).on('click', '.galeria-botanica .planta-obrir-detall', function(e) {
       e.preventDefault();
       const plantaId = $(this).data('planta');
       if (plantaId) {
           obrirDetallsPlanta(plantaId);
           // Actualitzar URL amb hash
           window.location.hash = `planta-${plantaId}`;
       }
   });
   
   // Event listeners per tancar el modal
   $(document).on('click', '.planta-modal-tancar, .planta-modal', function(e) {
       if (e.target === this) {
           tancarModal();
           // Eliminar hash de l'URL
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
           $('.filtre-boto[data-group="imatge"]').removeClass('actiu');
           $boto.addClass('actiu');
           window.galeria.filtresActius.imatge = valorFiltre;
           
           aplicarCanviImatges(valorFiltre);
           aplicarFiltres();
           mostrarFiltresActius();
           return;
       }
       
       // Comportament especial per al filtre de fullatge (excloent)
       if (grupFiltre === 'fullatge') {
           $('.filtre-boto[data-group="fullatge"]').removeClass('actiu');
           $boto.addClass('actiu');
           window.galeria.filtresActius.fullatge = valorFiltre;
           
           aplicarFiltres();
           mostrarFiltresActius();
           return;
       }
       
       // Per a filtres multi-selecció
       if ($boto.hasClass('actiu') && valorFiltre !== 'tots') {
           // Desactivar si ja està actiu
           $boto.removeClass('actiu');
           
           // Si no queda cap filtre actiu, activar "tots"
           if ($(`.filtre-boto[data-group="${grupFiltre}"].actiu`).length === 0) {
               $(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
               window.galeria.filtresActius[grupFiltre] = 'tots';
           }
       } else {
           // Si es fa clic a "tots", desactivar la resta
           if (valorFiltre === 'tots') {
               $(`.filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
               $boto.addClass('actiu');
               window.galeria.filtresActius[grupFiltre] = 'tots';
           } else {
               // Desactivar el botó "tots" i activar el clicat
               $(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).removeClass('actiu');
               $boto.addClass('actiu');
               
               // Verificar si ara tenim totes les opcions seleccionades
               setTimeout(() => {
                   if (verificarTotesOpcionsSeleccionades(grupFiltre)) {
                       activarBotoTots(grupFiltre);
                   }
               }, 10);
           }
       }
       
       // Actualitzar objecte de filtres actius
       actualitzarFiltresActius();
       
       // Aplicar filtres
       aplicarFiltres();
       
       // Mostrar filtres actius
       mostrarFiltresActius();
       
   } catch (error) {
       console.error("Error en clic a botó de filtre:", error);
   }
}

// Verificar si s'han seleccionat totes les opcions d'un filtre
function verificarTotesOpcionsSeleccionades(grupFiltre) {
   try {
       // No aplicar aquesta lògica als filtres excloents
       if (grupFiltre === 'imatge' || grupFiltre === 'fullatge') {
           return false;
       }
       
       const botonsGrup = $(`.filtre-boto[data-group="${grupFiltre}"]:not([data-filtre="tots"])`);
       const botonsActius = $(`.filtre-boto[data-group="${grupFiltre}"].actiu:not([data-filtre="tots"])`);
       
       return botonsGrup.length > 0 && botonsGrup.length === botonsActius.length;
   } catch (error) {
       console.error("Error en verificarTotesOpcionsSeleccionades:", error);
       return false;
   }
}

// Activar el botó "Tots" d'un grup específic
function activarBotoTots(grupFiltre) {
   try {
       $(`.filtre-boto[data-group="${grupFiltre}"]`).removeClass('actiu');
       $(`.filtre-boto[data-group="${grupFiltre}"][data-filtre="tots"]`).addClass('actiu');
       window.galeria.filtresActius[grupFiltre] = 'tots';
   } catch (error) {
       console.error("Error en activarBotoTots:", error);
   }
}

// Actualitzar l'objecte de filtres actius
function actualitzarFiltresActius() {
   try {
       ['tipus', 'imatge', 'color', 'habitat', 'floracio', 'fullatge', 'usos'].forEach(grup => {
           if (grup === 'imatge' || grup === 'fullatge') {
               // Per als filtres excloents
               const filtreActiu = $(`.filtre-boto[data-group="${grup}"].actiu`);
               const valorFiltre = filtreActiu.data('filtre');
               window.galeria.filtresActius[grup] = valorFiltre || 'tots';
           } else {
               // Per als filtres multi-selecció
               if ($(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`).hasClass('actiu')) {
                   window.galeria.filtresActius[grup] = 'tots';
               } else {
                   const filtresGrup = $(`.filtre-boto[data-group="${grup}"].actiu:not([data-filtre="tots"])`);
                   
                   if (filtresGrup.length === 0) {
                       window.galeria.filtresActius[grup] = 'tots';
                   } else {
                       const valors = [];
                       filtresGrup.each(function() {
                           const valorFiltre = $(this).data('filtre');
                           if (valorFiltre) valors.push(valorFiltre);
                       });
                       window.galeria.filtresActius[grup] = valors.length > 0 ? valors : 'tots';
                   }
               }
           }
       });
       
       console.log("Filtres actius actualitzats:", window.galeria.filtresActius);
   } catch (error) {
       console.error("Error en actualitzarFiltresActius:", error);
       // Restablir a valors predeterminats
       Object.keys(window.galeria.filtresActius).forEach(key => {
           window.galeria.filtresActius[key] = 'tots';
       });
   }
}

// Mostrar filtres actius
function mostrarFiltresActius() {
   try {
       const $contenidor = $('.filtres-actius');
       $contenidor.empty();
       
       let hiHaFiltresActius = false;
       
       Object.entries(window.galeria.filtresActius).forEach(([grup, valors]) => {
           if (valors !== 'tots') {
               hiHaFiltresActius = true;
               
               // Establir text per al grup
               const grupTexts = {
                   tipus: 'Tipus',
                   imatge: 'Imatge',
                   color: 'Color',
                   habitat: 'Hàbitat',
                   floracio: 'Floració',
                   fullatge: 'Fullatge',
                   usos: 'Usos'
               };
               const grupText = grupTexts[grup] || capitalitzar(grup);
               
               // Afegir cada filtre actiu
               if (grup === 'imatge' || grup === 'fullatge') {
                   // Per als filtres excloents
                   if (valors) {
                       const valorText = capitalitzar(String(valors).replace(/_/g, ' '));
                       const etiqueta = $(`<span class="filtre-actiu" data-group="${grup}" data-filtre="${valors}">
                           ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                       </span>`);
                       $contenidor.append(etiqueta);
                   }
               } else if (Array.isArray(valors)) {
                   valors.forEach(valor => {
                       if (valor) {
                           const valorText = capitalitzar(String(valor).replace(/_/g, ' '));
                           const etiqueta = $(`<span class="filtre-actiu" data-group="${grup}" data-filtre="${valor}">
                               ${grupText}: ${valorText} <span class="eliminar-filtre">×</span>
                           </span>`);
                           $contenidor.append(etiqueta);
                       }
                   });
               }
           }
       });
       
       // Mostrar o amagar botó de neteja
       if (hiHaFiltresActius) {
           $('.netejar-filtres').show();
       } else {
           $('.netejar-filtres').hide();
       }
   } catch (error) {
       console.error("Error en mostrarFiltresActius:", error);
       $('.netejar-filtres').hide();
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
       
       // Desactivar el botó corresponent
       $(`.filtre-boto[data-group="${grup}"][data-filtre="${valor}"]`).removeClass('actiu');
       
       // Si no queden filtres actius en aquest grup, activar el "tots"
       if ($(`.filtre-boto[data-group="${grup}"].actiu`).length === 0) {
           $(`.filtre-boto[data-group="${grup}"][data-filtre="tots"]`).addClass('actiu');
       }
       
       // Comprovar si ara queden totes les altres opcions actives
       setTimeout(() => {
           if (verificarTotesOpcionsSeleccionades(grup)) {
               activarBotoTots(grup);
           }
       }, 10);
       
       // Actualitzar objecte de filtres actius
       actualitzarFiltresActius();
       
       // Aplicar filtres
       aplicarFiltres();
       
       // Actualitzar vista de filtres actius
       mostrarFiltresActius();
   } catch (error) {
       console.error("Error en eliminar filtre:", error);
   }
}

// Netejar tots els filtres
function netejarTotsFiltres() {
   try {
       console.log("Netejant tots els filtres");
       
       // Restablir tots els botons
       $('.filtre-boto').removeClass('actiu');
       $('.filtre-boto[data-filtre="tots"]').addClass('actiu');
       
       // Restablir objecte de filtres actius
       Object.keys(window.galeria.filtresActius).forEach(key => {
           window.galeria.filtresActius[key] = 'tots';
       });
       
       // Netejar camp de cerca
       $('#cerca-plantes').val('');
       
       // Restaurar imatges originals
       aplicarCanviImatges('tots');
       
       // Aplicar filtres
       aplicarFiltres();
       
       // Actualitzar vista de filtres actius
       mostrarFiltresActius();
       
   } catch (error) {
       console.error("Error en netejar filtres:", error);
   }
}

// Aplicar filtres a les plantes
function aplicarFiltres() {
   try {
       // Amagar totes les plantes
       $('.planta-item').fadeOut(300);
       
       // Obtenir text de cerca
       const textCerca = ($('#cerca-plantes').val() || '').toLowerCase().trim();
       
       setTimeout(() => {
           let plantesVisibles = 0;
           
           $('.planta-item').each(function() {
               const $planta = $(this);
               let passaFiltres = true;
               
               // Filtre de tipus de planta
               if (window.galeria.filtresActius.tipus !== 'tots') {
                   const tipusPlanta = $planta.data('tipus');
                   if (!tipusPlanta) {
                       passaFiltres = false;
                   } else if (Array.isArray(window.galeria.filtresActius.tipus)) {
                       passaFiltres = passaFiltres && window.galeria.filtresActius.tipus.includes(tipusPlanta);
                   } else {
                       passaFiltres = passaFiltres && (tipusPlanta === window.galeria.filtresActius.tipus);
                   }
               }
               
               // Filtre de colors (EXCLOENT - ha de tenir TOTS els colors seleccionats)
               if (passaFiltres && window.galeria.filtresActius.color !== 'tots') {
                   const colorsPlanta = $planta.data('colors');
                   if (colorsPlanta) {
                       const arrColors = String(colorsPlanta).split(' ');
                       if (Array.isArray(window.galeria.filtresActius.color)) {
                           for (const colorFiltre of window.galeria.filtresActius.color) {
                               if (!arrColors.includes(colorFiltre)) {
                                   passaFiltres = false;
                                   break;
                               }
                           }
                       } else {
                           passaFiltres = passaFiltres && arrColors.includes(window.galeria.filtresActius.color);
                       }
                   } else {
                       passaFiltres = false;
                   }
               }
               
               // Filtre d'hàbitat
               if (passaFiltres && window.galeria.filtresActius.habitat !== 'tots') {
                   const habitatsPlanta = $planta.data('habitats');
                   if (habitatsPlanta) {
                       const arrHabitats = String(habitatsPlanta).split(' ');
                       let passaHabitat = false;
                       if (Array.isArray(window.galeria.filtresActius.habitat)) {
                           for (const habitat of arrHabitats) {
                               if (window.galeria.filtresActius.habitat.includes(habitat)) {
                                   passaHabitat = true;
                                   break;
                               }
                           }
                       } else {
                           passaHabitat = arrHabitats.includes(window.galeria.filtresActius.habitat);
                       }
                       passaFiltres = passaFiltres && passaHabitat;
                   } else {
                       passaFiltres = false;
                   }
               }
               
               // Filtre de floració
               if (passaFiltres && window.galeria.filtresActius.floracio !== 'tots') {
                   const floracioPlanta = $planta.data('floracio');
                   if (floracioPlanta) {
                       const arrFloracio = String(floracioPlanta).split(' ');
                       let passaFloracio = false;
                       if (Array.isArray(window.galeria.filtresActius.floracio)) {
                           for (const floracio of arrFloracio) {
                               if (window.galeria.filtresActius.floracio.includes(floracio)) {
                                   passaFloracio = true;
                                   break;
                               }
                           }
                       } else {
                           passaFloracio = arrFloracio.includes(window.galeria.filtresActius.floracio);
                       }
                       passaFiltres = passaFiltres && passaFloracio;
                   } else {
                       passaFiltres = false;
                   }
               }
               
               // Filtre de fullatge (comportament excloent)
               if (passaFiltres && window.galeria.filtresActius.fullatge !== 'tots') {
                   const fullatgePlanta = $planta.data('fullatge');
                   passaFiltres = passaFiltres && (fullatgePlanta === window.galeria.filtresActius.fullatge);
               }
               
               // Filtre d'usos
               if (passaFiltres && window.galeria.filtresActius.usos !== 'tots') {
                   const usosPlanta = $planta.data('usos');
                   if (usosPlanta) {
                       const arrUsos = String(usosPlanta).split(' ');
                       let passaUsos = false;
                       if (Array.isArray(window.galeria.filtresActius.usos)) {
                           for (const us of arrUsos) {
                               if (window.galeria.filtresActius.usos.includes(us)) {
                                   passaUsos = true;
                                   break;
                               }
                           }
                       } else {
                           passaUsos = arrUsos.includes(window.galeria.filtresActius.usos);
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
               
               // Mostrar o amagar la planta
               if (passaFiltres) {
                   $planta.fadeIn(300);
                   plantesVisibles++;
               }
           });
           
           console.log(`Filtres aplicats: ${plantesVisibles} plantes visibles`);
       }, 300);
       
   } catch (error) {
       console.error("Error en aplicarFiltres:", error);
       // En cas d'error, mostrar totes les plantes
       $('.planta-item').fadeIn(300);
   }
}

// Aplicar canvis d'imatges segons el filtre d'imatges seleccionat
function aplicarCanviImatges(tipusImatge) {
   try {
       $('.planta-item').each(function() {
           const $planta = $(this);
           const imatgesData = $planta.data('imatges');
           
           if (imatgesData && typeof imatgesData === 'object') {
               const $img = $planta.find('.planta-imatge-principal');
               const $indicator = $planta.find('.planta-tipus-imatge');
               
               let novaImatge = '';
               
               if (tipusImatge === 'tots') {
                   // Restaurar la imatge principal
                   novaImatge = imatgesData.principal;
               } else {
                   // Canviar a la imatge del tipus seleccionat
                   if (imatgesData[tipusImatge]) {
                       novaImatge = imatgesData[tipusImatge];
                   } else {
                       // Si no hi ha imatge d'aquest tipus, usar la principal
                       novaImatge = imatgesData.principal || '';
                   }
               }
               
               // Actualitzar la imatge
               if (novaImatge && $img.length) {
                   const src = $img.attr('src');
                   if (src) {
                       const urlBase = src.substring(0, src.lastIndexOf('/') + 1);
                       $img.attr('src', urlBase + novaImatge);
                   }
               }
               
               // Actualitzar l'indicador de tipus
               if (tipusImatge !== 'tots' && tipusImatge !== 'general') {
                   if ($indicator.length === 0) {
                       $planta.find('.planta-imatge a').append(`<span class="planta-tipus-imatge">${capitalitzar(tipusImatge)}</span>`);
                   } else {
                       $indicator.text(capitalitzar(tipusImatge));
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