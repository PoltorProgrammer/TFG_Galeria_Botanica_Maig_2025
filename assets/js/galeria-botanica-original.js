/**
 * Galeria Botànica UAB - Versió Optimitzada amb Sistema Intel·ligent d'Imatges
 * Elimina les cerques innecessàries d'imatges i optimitza el rendiment
 */

/* ========================================================================
   SISTEMA OPTIMITZAT DE GESTIÓ D'IMATGES
   ======================================================================== */

// MAPA D'IMATGES DISPONIBLES - OMPLE AMB DADES REALS DEL REPOSITORI
const imatgesDisponibles = {
    // EXEMPLE D'ESTRUCTURA (substitueix amb dades reals):
    // "quercus_ilex": ["quercus_ilex_01_flor.jpg", "quercus_ilex_04_fruit.jpg", "quercus_ilex_03_tija.jpg"],
    // "rosa_canina": ["rosa_canina_01_fulla.jpg", "rosa_canina_00_flor.jpg"],
    // "platanus_hispanica": ["platanus_hispanica_01_escorca.jpg", "platanus_hispanica_03_tija.jpg"],
    
    // TODO: Executa l'script de descobriment per omplir automàticament aquesta secció
};

class GestorImatgesOptimitzat {
    
    /**
     * Obtenir totes les imatges disponibles per una espècie
     */
    static obtenirImatgesEspecie(nomCientific) {
        const clau = this.normalitzarNomCientific(nomCientific);
        return imatgesDisponibles[clau] || [];
    }
    
    /**
     * Normalitzar nom científic per fer de clau
     */
    static normalitzarNomCientific(nomCientific) {
        return nomCientific.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }
    
    /**
     * Obtenir la imatge principal d'una espècie
     */
    static obtenirImatgePrincipal(nomCientific) {
        const imatges = this.obtenirImatgesEspecie(nomCientific);
        if (imatges.length === 0) return null;
        
        const baseName = this.normalitzarNomCientific(nomCientific);
        
        // Ordre de preferència per a la imatge principal
        const prioritats = [
            `${baseName}_01.`,     // nom_cientific_01.jpg
            `${baseName}_1.`,      // nom_cientific_1.jpg  
            `${baseName}_general.`, // nom_cientific_general.jpg
            `${baseName}.`,        // nom_cientific.jpg
            `${baseName}_`         // qualsevol que comenci amb nom_cientific_
        ];
        
        // Buscar per ordre de prioritat
        for (const prioritat of prioritats) {
            const trobada = imatges.find(img => img.toLowerCase().startsWith(prioritat));
            if (trobada) return trobada;
        }
        
        // Si no troba cap amb les prioritats, retornar la primera disponible
        return imatges[0];
    }
    
    /**
     * Obtenir imatges per tipus específic
     */
    static obtenirImatgesPerTipus(nomCientific, tipus) {
        const imatges = this.obtenirImatgesEspecie(nomCientific);
        const baseName = this.normalitzarNomCientific(nomCientific);
        const tipusNormalitzat = tipus.toLowerCase();
        
        return imatges.filter(img => {
            const imgLower = img.toLowerCase();
            return imgLower.includes(`${baseName}_${tipusNormalitzat}`) || 
                   imgLower.includes(`_${tipusNormalitzat}_`) ||
                   imgLower.includes(`_${tipusNormalitzat}.`);
        });
    }
    
    /**
     * Determinar el tipus d'una imatge pel seu nom
     */
    static determinarTipusImatge(nomImatge) {
        if (!nomImatge) return 'general';
        
        const nom = nomImatge.toLowerCase();
        
        if (nom.includes('_flor')) return 'flor';
        if (nom.includes('_fruit')) return 'fruit';
        if (nom.includes('_fulla')) return 'fulla';
        if (nom.includes('_arrel')) return 'arrel';
        if (nom.includes('_escorca')) return 'escorça';
        if (nom.includes('_detall')) return 'detall';
        if (nom.includes('_habitat')) return 'habitat';
        if (nom.includes('_general')) return 'general';
        
        return 'general';
    }
    
    /**
     * Obtenir informació completa d'imatges per una espècie (FUNCIÓ PRINCIPAL)
     */
    static obtenirInfoCompletaImatges(nomCientific) {
        const imatges = this.obtenirImatgesEspecie(nomCientific);
        
        if (imatges.length === 0) {
            return {
                principal: 'default_planta.jpg', // Imatge per defecte
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: [],
                disponibles: false,
                total: 0
            };
        }
        
        const principal = this.obtenirImatgePrincipal(nomCientific);
        const tipusPrincipal = this.determinarTipusImatge(principal);
        
        // Separar imatge principal de les de detall
        const detalls = imatges.filter(img => img !== principal);
        const detallsTipus = detalls.map(img => this.determinarTipusImatge(img));
        
        return {
            principal: principal,
            principal_tipus: tipusPrincipal,
            detalls: detalls,
            detalls_tipus: detallsTipus,
            disponibles: true,
            total: imatges.length
        };
    }
    
    /**
     * Obtenir estadístiques d'imatges
     */
    static obtenirEstadistiques() {
        const especies = Object.keys(imatgesDisponibles);
        const totalImatges = Object.values(imatgesDisponibles)
            .reduce((sum, arr) => sum + arr.length, 0);
        
        return {
            totalEspecies: especies.length,
            totalImatges: totalImatges,
            mitjanaPerEspecie: especies.length > 0 ? (totalImatges / especies.length).toFixed(1) : 0,
            especiesAmbImatges: especies.filter(esp => imatgesDisponibles[esp].length > 0).length,
            especiesSenseImatges: especies.filter(esp => imatgesDisponibles[esp].length === 0).length
        };
    }
}

/* ========================================================================
   FUNCIONS PRINCIPALS DE LA GALERIA
   ======================================================================== */

// Assegurar-se que les funcions són globals
window.generarGaleriaHTML = generarGaleriaHTML;
window.GestorImatgesOptimitzat = GestorImatgesOptimitzat;

// Funció per generar el HTML de la galeria
async function generarGaleriaHTML(plantes) {
    const galeriaContainer = document.getElementById('galeria-section');
    if (!galeriaContainer || !plantes) return;
    
    console.log('🚀 Iniciant generació de galeria amb sistema optimitzat...');
    
    // OPTIMITZACIÓ: Actualitzar imatges de totes les plantes abans de generar HTML
    plantes = actualitzarSistemaImatges(plantes);
    
    let html = '';
    
    // Generar filtres
    html += generarHTMLFiltres(plantes);
    
    // Generar graella de plantes
    html += '<div class="plantes-grid">';
    
    plantes.forEach(planta => {
        html += generarHTMLPlantaItem(planta);
    });
    
    html += '</div>';
    
    galeriaContainer.innerHTML = html;
    
    // Inicialitzar funcionalitat després de generar el HTML
    inicialitzarGaleria();
    
    console.log('✅ Galeria generada amb èxit amb sistema optimitzat');
}

/**
 * NOVA FUNCIÓ: Actualitzar sistema d'imatges per totes les plantes
 */
function actualitzarSistemaImatges(plantes) {
    console.log('🔄 Actualitzant sistema d\'imatges optimitzat...');
    
    let actualitzades = 0;
    let noTrobades = 0;
    
    plantes.forEach(planta => {
        const infoImatges = GestorImatgesOptimitzat.obtenirInfoCompletaImatges(planta.nom_cientific);
        
        // Actualitzar sempre, encara que no hi hagi imatges (tindrà default)
        planta.imatges = infoImatges;
        
        if (infoImatges.disponibles) {
            actualitzades++;
        } else {
            noTrobades++;
            console.warn(`⚠️  No s'han trobat imatges per: ${planta.nom_cientific}`);
        }
    });
    
    console.log(`✅ Sistema d'imatges actualitzat:`);
    console.log(`   - Plantes amb imatges: ${actualitzades}`);
    console.log(`   - Plantes sense imatges: ${noTrobades}`);
    
    const stats = GestorImatgesOptimitzat.obtenirEstadistiques();
    console.log(`📊 Estadístiques d'imatges:`, stats);
    
    return plantes;
}

// Generar HTML dels filtres
function generarHTMLFiltres(plantes) {
    let html = '<div class="filtres-contenidor">';
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
    html += `<div class="filtres-actius-contenidor">
        <span class="etiqueta-filtres-actius">Filtres actius:</span>
        <div class="filtres-actius"></div>
        <button class="netejar-filtres" style="display: none;">Netejar tots els filtres</button>
    </div>`;
    
    // Barra de cerca
    html += `<div class="cerca-contenidor">
        <input type="text" id="cerca-plantes" placeholder="Cercar per paraules clau..." class="cerca-input" />
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
    html += '<button class="filtre-boto actiu" data-group="tipus" data-filtre="tots">Totes les plantes</button>';
    
    tipus.forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto" data-group="tipus" data-filtre="${tipus}">${nomTipus}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar filtres d'imatge (OPTIMITZAT)
function generarFiltresImatge(plantes) {
    const tipusImatges = new Set();
    
    plantes.forEach(planta => {
        // Usar el sistema optimitzat
        if (planta.imatges?.disponibles) {
            if (planta.imatges.principal_tipus && planta.imatges.principal_tipus !== 'general') {
                tipusImatges.add(planta.imatges.principal_tipus);
            }
            if (planta.imatges.detalls_tipus) {
                planta.imatges.detalls_tipus.forEach(tipus => {
                    if (tipus !== 'general') {
                        tipusImatges.add(tipus);
                    }
                });
            }
        }
    });
    
    if (tipusImatges.size === 0) return '';
    
    let html = '<div class="grup-filtre tipus-imatge-filtre">';
    html += '<span class="etiqueta-filtre">Imatges:</span>';
    html += '<div class="botons-filtre botons-filtre-imatges">';
    html += '<button class="filtre-boto filtre-imatge actiu" data-group="imatge" data-filtre="tots">Totes</button>';
    
    [...tipusImatges].sort().forEach(tipus => {
        const nomTipus = tipus.charAt(0).toUpperCase() + tipus.slice(1);
        html += `<button class="filtre-boto filtre-imatge" data-group="imatge" data-filtre="${tipus}">${nomTipus}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="color" data-filtre="tots">Tots</button>';
    
    [...colors].sort().forEach(color => {
        const nomColor = color.charAt(0).toUpperCase() + color.slice(1);
        html += `<button class="filtre-boto" data-group="color" data-filtre="${color}">${nomColor}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="habitat" data-filtre="tots">Tots</button>';
    
    [...habitats.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([habitatNorm, habitatNom]) => {
        const nomMostrar = habitatNom.replace(/_/g, ' ');
        const nomCapitalitzat = nomMostrar.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        html += `<button class="filtre-boto" data-group="habitat" data-filtre="${habitatNorm}">${nomCapitalitzat}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="floracio" data-filtre="tots">Totes</button>';
    
    [...floracions].sort().forEach(floracio => {
        const nomFloracio = floracio.charAt(0).toUpperCase() + floracio.slice(1);
        html += `<button class="filtre-boto" data-group="floracio" data-filtre="${floracio}">${nomFloracio}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="fullatge" data-filtre="tots">Tots</button>';
    
    [...fullatges].sort().forEach(fullatge => {
        const nomFullatge = fullatge.charAt(0).toUpperCase() + fullatge.slice(1);
        html += `<button class="filtre-boto" data-group="fullatge" data-filtre="${fullatge}">${nomFullatge}</button>`;
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
    html += '<button class="filtre-boto actiu" data-group="usos" data-filtre="tots">Tots</button>';
    
    [...usos.entries()].sort((a, b) => a[1].localeCompare(b[1])).forEach(([usNorm, usNom]) => {
        html += `<button class="filtre-boto" data-group="usos" data-filtre="${usNorm}">${usNom.charAt(0).toUpperCase() + usNom.slice(1)}</button>`;
    });
    
    html += '</div></div>';
    return html;
}

// Generar HTML d'un item de planta (OPTIMITZAT)
function generarHTMLPlantaItem(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    
    // OPTIMITZACIÓ: Usar sempre les imatges actualitzades pel sistema optimitzat
    const imatges = planta.imatges;
    
    // Preparar atributs de dades per als filtres
    const dataAttrs = prepararDataAttributsPlanta(planta, imatges);
    
    let html = `<div class="planta-item" ${dataAttrs} id="planta-${plantaId}">`;
    
    // Imatge principal (OPTIMITZAT - No més cerques innecessàries)
    html += '<div class="planta-imatge">';
    html += `<a href="#" class="planta-obrir-detall" data-planta="${plantaId}">`;
    
    if (imatges.disponibles && imatges.principal) {
        const imatgeUrl = `assets/imatges/${imatges.principal}`;
        html += `<img class="planta-imatge-principal" src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" onerror="this.src='assets/imatges/default_planta.jpg'; this.parentElement.innerHTML='<div class=planta-sense-imatge>Imatge no disponible</div>'">`;
        
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

// Preparar atributs de dades per als filtres (OPTIMITZAT I CORREGIT)
function prepararDataAttributsPlanta(planta, imatges) {
    let attrs = [];
    
    // Tipus de planta
    attrs.push(`data-tipus="${escapeHtml(planta.tipus)}"`);
    
    // Tipus d'imatge principal (OPTIMITZAT)
    if (imatges && imatges.principal_tipus) {
        attrs.push(`data-tipus-imatge="${escapeHtml(imatges.principal_tipus)}"`);
    } else {
        attrs.push(`data-tipus-imatge="general"`);
    }
    
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
    
    // Dades d'imatges en JSON (OPTIMITZAT)
    const imatgesJson = {
        principal: imatges.principal || 'default_planta.jpg'
    };
    
    // Afegir imatge principal per tipus
    if (imatges.principal_tipus) {
        imatgesJson[imatges.principal_tipus] = imatges.principal;
    }
    
    // Afegir imatges de detall agrupades per tipus
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
   EVENTS I FUNCIONALITAT DE LA GALERIA BOTÀNICA
   ======================================================================== */

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

// Aplicar canvis d'imatges segons el filtre d'imatges seleccionat (OPTIMITZAT)
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
                   novaImatge = imatgesData.principal || 'default_planta.jpg';
               } else {
                   if (imatgesData[tipusImatge]) {
                       novaImatge = imatgesData[tipusImatge];
                   } else {
                       novaImatge = imatgesData.principal || 'default_planta.jpg';
                   }
               }
               
               if (novaImatge && $img.length) {
                   const urlBase = 'assets/imatges/';
                   $img.attr('src', urlBase + novaImatge);
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

// Obrir modal de detalls de planta (OPTIMITZAT)
function obrirDetallsPlanta(plantaId) {
   // Buscar la planta a les dades globals
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
   
   // Generar HTML dels detalls amb sistema optimitzat
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

// Activar lightbox per a les imatges de detall
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

// Funció per generar HTML dels detalls de planta (OPTIMITZAT)
function generarHTMLDetallsPlanta(planta) {
   const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
   
   // OPTIMITZACIÓ: Usar sempre les imatges del sistema optimitzat
   const imatges = planta.imatges || {
       principal: 'default_planta.jpg',
       principal_tipus: 'general',
       detalls: [],
       detalls_tipus: [],
       disponibles: false
   };
   
   let html = '<div class="planta-detall-individual">';
   
   // Informació principal
   html += `<h2>${escapeHtml(planta.nom_comu)}</h2>`;
   html += `<h3 class="nom-cientific">${escapeHtml(planta.nom_cientific)}</h3>`;
   
   // Galeria d'imatges (OPTIMITZADA)
   html += '<div class="planta-galeria-completa">';
   
   // Imatge principal
   if (imatges.disponibles && imatges.principal) {
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
   if (imatges.disponibles && imatges.detalls && imatges.detalls.length > 0) {
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

/* ========================================================================
  FUNCIONS D'INICIALITZACIÓ I COMPATIBILITAT
  ======================================================================== */

// Al final del fitxer, després de totes les funcions
jQuery(document).ready(function() {
   verificarHashURL();
});

// Cridar verificarHashURL quan es carregui la pàgina
jQuery(window).on('load', verificarHashURL);

// Assegurar funcions globals per compatibilitat
window.generarGaleriaHTML = generarGaleriaHTML;
window.mostrarFiltresActius = mostrarFiltresActius;
window.GestorImatgesOptimitzat = GestorImatgesOptimitzat;
window.actualitzarSistemaImatges = actualitzarSistemaImatges;

/* ========================================================================
  SCRIPT D'DESCOBRIMENT D'IMATGES (EXECUTAR PRIMER)
  ======================================================================== */

/**
* IMPORTANT: Executa aquesta funció primer per obtenir la llista d'imatges reals
* Copia i enganxa aquest codi a la consola del navegador per obtenir les dades
*/
async function descobrirImatgesRepositori() {
   const repoUrl = 'https://api.github.com/repos/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025/contents/assets/imatges';
   
   try {
       console.log('🔍 Descobrint imatges del repositori...');
       
       const response = await fetch(repoUrl);
       if (!response.ok) {
           throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       
       const data = await response.json();
       
       // Filtrar només fitxers d'imatge
       const imatges = data
           .filter(item => item.type === 'file')
           .filter(item => {
               const ext = item.name.toLowerCase().split('.').pop();
               return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext);
           })
           .map(item => item.name);
       
       console.log(`✅ Trobades ${imatges.length} imatges`);
       
       // Agrupar per nom científic
       const agrupades = {};
       
       imatges.forEach(nomImatge => {
           // Extreure nom científic (tot fins al primer underscore seguit de número/paraula específica)
           const match = nomImatge.match(/^([a-zA-Z_]+?)(?=_\d|_flor|_fruit|_fulla|_arrel|_escorca|_detall|_general|_habitat|\.)/i);
           
           let nomCientific;
           if (match) {
               nomCientific = match[1].toLowerCase();
           } else {
               // Si no coincideix, agafar tot fins al primer punt
               nomCientific = nomImatge.split('.')[0].toLowerCase();
           }
           
           if (!agrupades[nomCientific]) {
               agrupades[nomCientific] = [];
           }
           
           agrupades[nomCientific].push(nomImatge);
       });
       
       // Mostrar resultats
       console.log('\n📂 IMATGES AGRUPADES PER ESPÈCIE:');
       console.log('================================');
       
       Object.entries(agrupades)
           .sort(([a], [b]) => a.localeCompare(b))
           .forEach(([nomCientific, llistaImatges]) => {
               console.log(`\n🌿 ${nomCientific.toUpperCase()} (${llistaImatges.length} imatges):`);
               llistaImatges.sort().forEach(img => {
                   console.log(`   - ${img}`);
               });
           });
       
       // Generar codi per reemplaçar
       console.log('\n\n📋 CODI PER REEMPLAÇAR A L\'OBJECTE imatgesDisponibles:');
       console.log('===========================================================');
       console.log('const imatgesDisponibles = ' + JSON.stringify(agrupades, null, 2) + ';');
       
       // Estadístiques
       const totalEspecies = Object.keys(agrupades).length;
       const totalImatges = Object.values(agrupades).reduce((sum, arr) => sum + arr.length, 0);
       
       console.log(`\n\n📊 ESTADÍSTIQUES:`);
       console.log(`   Total espècies: ${totalEspecies}`);
       console.log(`   Total imatges: ${totalImatges}`);
       console.log(`   Mitjana d'imatges per espècie: ${(totalImatges / totalEspecies).toFixed(1)}`);
       
       return agrupades;
       
   } catch (error) {
       console.error('❌ Error:', error);
       
       if (error.message.includes('403') || error.message.includes('rate limit')) {
           console.log('\n💡 SOLUCIÓ ALTERNATIVA:');
           console.log('El GitHub API té límits. Pots:');
           console.log('1. Esperar una mica i tornar a provar');
           console.log('2. Crear un token personal a GitHub');
           console.log('3. Executar aquest script localment amb Node.js');
       }
       
       return null;
   }
}

// Funció per omplir automàticament l'objecte imatgesDisponibles
async function inicialitzarSistemaImatges() {
   console.log('🚀 Inicialitzant sistema optimitzat d\'imatges...');
   
   // Si l'objecte està buit, intentar descobrir imatges
   if (Object.keys(imatgesDisponibles).length === 0) {
       console.log('⚠️  L\'objecte imatgesDisponibles està buit. Descobrint imatges...');
       
       const imatgesDescobertes = await descobrirImatgesRepositori();
       
       if (imatgesDescobertes) {
           // Copiar les dades descobertes a l'objecte global
           Object.assign(imatgesDisponibles, imatgesDescobertes);
           console.log('✅ Objecte imatgesDisponibles actualitzat automàticament');
       } else {
           console.warn('⚠️  No s\'han pogut descobrir les imatges automàticament');
           console.log('💡 Executa manualment: descobrirImatgesRepositori()');
       }
   } else {
       console.log('✅ Objecte imatgesDisponibles ja està configurat');
   }
   
   // Mostrar estadístiques del sistema
   const stats = GestorImatgesOptimitzat.obtenirEstadistiques();
   console.log('📊 Estadístiques del sistema:', stats);
}

/* ========================================================================
  INSTRUCCIONS FINALS
  ======================================================================== */

console.log(
// Inicialització automàtica quan es carrega el script
if (typeof window !== 'undefined') {
   // Esperar a que tot estigui carregat
   setTimeout(() => {
       inicialitzarSistemaImatges();
   }, 1000);
}
