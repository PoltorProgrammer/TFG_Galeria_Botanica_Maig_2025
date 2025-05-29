/**
 * Galeria Botànica UAB - Adaptat per funcionar sense WordPress
 * Ara amb Sistema d'Imatges Optimitzat INTEGRAT
 * Basat en galeria-botanica.js original
 */

// ========================================================================
// SISTEMA D'IMATGES OPTIMITZAT (INTEGRAT)
// ========================================================================

/**
 * Sistema d'Imatges Optimitzat integrat dins la galeria
 * Gestiona la càrrega i agrupació d'imatges des del repositori GitHub
 */
class SistemaImatgesOptimitzat {
    constructor() {
        this.repositori = 'PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025';
        this.carpetaImatges = 'assets/imatges';
        this.imatgesCache = new Map();
        this.agrupacionsCache = new Map();
        
        // Tipus d'imatges reconeguts
        this.tipusImatges = {
            'flor': 'Flor',
            'fulla': 'Fulla', 
            'fruit': 'Fruit',
            'escorca': 'Escorça',
            'tija': 'Tija',
            'habit': 'Hàbit',
            'detall': 'Detall',
            'altre': 'Altre'
        };
    }

    /**
     * Llistar totes les imatges des de l'API de GitHub
     */
    async llistarImatgesRepositori() {
        console.log('🔍 Obtenint llista d\'imatges des del repositori GitHub...');
        
        try {
            const url = `https://api.github.com/repos/${this.repositori}/contents/${this.carpetaImatges}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error API GitHub: ${response.status} - ${response.statusText}`);
            }
            
            const fitxers = await response.json();
            
            // Filtrar només fitxers .jpg/.jpeg i parsejar informació
            const imatges = fitxers
                .filter(fitxer => 
                    fitxer.type === 'file' && 
                    (fitxer.name.toLowerCase().endsWith('.jpg') || fitxer.name.toLowerCase().endsWith('.jpeg'))
                )
                .map(fitxer => this.parsejarNomImatge(fitxer.name))
                .filter(img => img !== null);
            
            console.log(`✅ Trobades ${imatges.length} imatges vàlides al repositori`);
            
            // Guardar al cache
            imatges.forEach(img => {
                this.imatgesCache.set(img.nomComplert, img);
            });
            
            return imatges;
            
        } catch (error) {
            console.error('❌ Error obtenint imatges del repositori:', error);
            console.log('🔄 Usant mètode fallback...');
            return await this.fallbackVerificacioLocal();
        }
    }

    /**
     * Parsejar informació d'un nom d'imatge
     * Format esperat: {nom_cientific}_{numero}_{tipus}.jpg
     */
    parsejarNomImatge(nomFitxer) {
        const regex = /^(.+?)_(\d{1,2})_([a-z]+)\.jpe?g$/i;
        const match = nomFitxer.match(regex);
        
        if (!match) {
            console.warn(`⚠️ Nom d'imatge no vàlid: ${nomFitxer}`);
            return null;
        }
        
        const [, nomCientificRaw, numeroStr, tipusRaw] = match;
        const nomCientific = this.normalitzarNomCientific(nomCientificRaw);
        const numero = parseInt(numeroStr, 10);
        const tipus = tipusRaw.toLowerCase();
        
        if (!this.tipusImatges[tipus]) {
            console.warn(`⚠️ Tipus d'imatge desconegut: ${tipus} en ${nomFitxer}`);
        }
        
        return {
            nomComplert: nomFitxer,
            nomCientific: nomCientific,
            nomCientificOriginal: nomCientificRaw,
            numero: numero,
            tipus: tipus,
            tipusFormatat: this.tipusImatges[tipus] || tipus,
            url: `https://raw.githubusercontent.com/${this.repositori}/main/${this.carpetaImatges}/${nomFitxer}`,
            urlLocal: `assets/imatges/${nomFitxer}`
        };
    }

    /**
     * Normalitzar nom científic per comparació
     */
    normalitzarNomCientific(nom) {
        return nom.toLowerCase()
                  .replace(/[_\s]+/g, '_')
                  .replace(/[^a-z0-9_]/g, '')
                  .trim();
    }

    /**
     * Agrupar imatges per nom científic
     */
    agruparImatgesPerEspecie(imatges, nomsPlantesJSON) {
        console.log('🗂️ Agrupant imatges per espècie...');
        
        const agrupacions = new Map();
        const nomsNormalitzats = nomsPlantesJSON.map(nom => ({
            original: nom,
            normalitzat: this.normalitzarNomCientific(nom)
        }));
        
        imatges.forEach(imatge => {
            const coincidencia = nomsNormalitzats.find(planta => 
                planta.normalitzat === imatge.nomCientific ||
                imatge.nomCientific.startsWith(planta.normalitzat) ||
                planta.normalitzat.startsWith(imatge.nomCientific)
            );
            
            if (coincidencia) {
                const nomClau = coincidencia.original;
                
                if (!agrupacions.has(nomClau)) {
                    agrupacions.set(nomClau, []);
                }
                
                agrupacions.get(nomClau).push(imatge);
            } else {
                console.warn(`⚠️ Imatge sense coincidència: ${imatge.nomComplert}`);
            }
        });
        
        // Ordenar imatges dins de cada grup per número
        agrupacions.forEach((grupImatges, nomEspecie) => {
            grupImatges.sort((a, b) => a.numero - b.numero);
            console.log(`📸 ${nomEspecie}: ${grupImatges.length} imatges`);
        });
        
        console.log(`✅ Agrupades imatges per ${agrupacions.size} espècies`);
        this.agrupacionsCache = agrupacions;
        
        return agrupacions;
    }

    /**
     * Assignar imatges a una planta específica
     */
    assignarImatgesPlanta(nomCientific, agrupacionsImatges) {
        const imatges = agrupacionsImatges.get(nomCientific) || [];
        
        if (imatges.length === 0) {
            return {
                principal: null,
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: [],
                totes: [],
                total: 0
            };
        }
        
        const principal = imatges[0];
        const detalls = imatges.slice(1);
        
        return {
            principal: principal.nomComplert,
            principal_tipus: principal.tipus,
            principal_url: principal.urlLocal,
            detalls: detalls.map(img => img.nomComplert),
            detalls_tipus: detalls.map(img => img.tipus),
            detalls_urls: detalls.map(img => img.urlLocal),
            totes: imatges,
            total: imatges.length
        };
    }

    /**
     * Processar totes les plantes amb les seves imatges
     */
    async processarTotesLesPlantes(plantes) {
        console.log('🚀 Iniciant processament optimitzat d\'imatges integrat...');
        
        try {
            const imatgesRepositori = await this.llistarImatgesRepositori();
            
            if (imatgesRepositori.length === 0) {
                console.warn('⚠️ No s\'han trobat imatges al repositori');
                return plantes.map(p => ({ ...p, imatges: this.imatgesBuiles() }));
            }
            
            const nomsPlantes = plantes.map(planta => planta.nom_cientific);
            console.log(`📋 Processant ${nomsPlantes.length} espècies del JSON`);
            
            const agrupacions = this.agruparImatgesPerEspecie(imatgesRepositori, nomsPlantes);
            
            const plantesAmbImatges = plantes.map(planta => {
                const imatgesAssignades = this.assignarImatgesPlanta(planta.nom_cientific, agrupacions);
                return {
                    ...planta,
                    imatges: imatgesAssignades
                };
            });
            
            // Estadístiques finals
            const plantesAmbImatges_count = plantesAmbImatges.filter(p => p.imatges.total > 0).length;
            const totalImatges = plantesAmbImatges.reduce((sum, p) => sum + p.imatges.total, 0);
            
            console.log(`✅ Processament completat integrat:`);
            console.log(`   📸 ${totalImatges} imatges assignades`);
            console.log(`   🌱 ${plantesAmbImatges_count}/${plantes.length} plantes amb imatges`);
            console.log(`   📊 Mitjana: ${(totalImatges / plantesAmbImatges_count || 0).toFixed(1)} imatges per planta`);
            
            // Actualitzar estadístiques a la pàgina d'inici si la funció està disponible
            if (typeof window.mostrarEstadistiquesImatges === 'function') {
                const stats = this.obtenirEstadistiques(plantesAmbImatges);
                window.mostrarEstadistiquesImatges(stats);
            }
            
            return plantesAmbImatges;
            
        } catch (error) {
            console.error('❌ Error en processament d\'imatges integrat:', error);
            return plantes.map(p => ({ ...p, imatges: this.imatgesBuiles() }));
        }
    }

    /**
     * Objecte d'imatges buides per casos d'error
     */
    imatgesBuiles() {
        return {
            principal: null,
            principal_tipus: 'general',
            detalls: [],
            detalls_tipus: [],
            totes: [],
            total: 0
        };
    }

    /**
     * Obtenir estadístiques d'imatges
     */
    obtenirEstadistiques(plantesAmbImatges) {
        const stats = {
            totalPlantes: plantesAmbImatges.length,
            plantesAmbImatges: plantesAmbImatges.filter(p => p.imatges.total > 0).length,
            plantesSenesImatges: plantesAmbImatges.filter(p => p.imatges.total === 0).length,
            totalImatges: plantesAmbImatges.reduce((sum, p) => sum + p.imatges.total, 0),
            tipusImatges: {},
            imatgesPerPlanta: {}
        };
        
        plantesAmbImatges.forEach(planta => {
            if (planta.imatges.totes) {
                planta.imatges.totes.forEach(imatge => {
                    stats.tipusImatges[imatge.tipus] = (stats.tipusImatges[imatge.tipus] || 0) + 1;
                });
            }
            
            const numImatges = planta.imatges.total;
            stats.imatgesPerPlanta[numImatges] = (stats.imatgesPerPlanta[numImatges] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Mètode fallback local (més limitat)
     */
    async fallbackVerificacioLocal() {
        console.log('🔄 Usant verificació local limitada...');
        // Per ara retornem array buit, es pot implementar si cal
        return [];
    }
}

// ========================================================================
// FUNCIONS PRINCIPALS DE LA GALERIA (MODIFICADES)
// ========================================================================

// Assegurar-se que les funcions són globals
window.generarGaleriaHTML = generarGaleriaHTML;

// Funció per generar el HTML de la galeria (MODIFICADA per usar el sistema integrat)
async function generarGaleriaHTML(plantes) {
    const galeriaContainer = document.getElementById('galeria-section');
    if (!galeriaContainer || !plantes) return;
    
    console.log('🎨 Generant HTML de la galeria amb sistema integrat...');
    
    // PROCESSAR IMATGES AMB EL SISTEMA INTEGRAT
    const sistemaImatges = new SistemaImatgesOptimitzat();
    const plantesAmbImatges = await sistemaImatges.processarTotesLesPlantes(plantes);
    
    // Actualitzar variable global
    gb_plantes_data = plantesAmbImatges;
    
    let html = '';
    
    // Generar filtres
    html += generarHTMLFiltres(plantesAmbImatges);
    
    // Generar graella de plantes
    html += '<div class="plantes-grid">';
    
    plantesAmbImatges.forEach(planta => {
        html += generarHTMLPlantaItem(planta);
    });
    
    html += '</div>';
    
    // Modal per a mostrar els detalls
    html += `<div class="planta-modal" style="display: none;">
        <div class="planta-modal-contingut">
            <span class="planta-modal-tancar">&times;</span>
            <div class="planta-modal-cos"></div>
        </div>
    </div>`;
    
    galeriaContainer.innerHTML = html;
    
    // Inicialitzar funcionalitat després de generar el HTML
    inicialitzarGaleria();
    
    console.log('✅ Galeria generada amb sistema integrat');
}

// ========================================================================
// RESTA DE FUNCIONS DE LA GALERIA (SENSE CANVIS MAJORS)
// ========================================================================

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

// Generar HTML d'un item de planta (ACTUALITZAT per usar les noves dades d'imatges)
function generarHTMLPlantaItem(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    const imatges = planta.imatges || { principal: null, principal_tipus: 'general', detalls: [], detalls_tipus: [] };
    
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

// Preparar atributs de dades per als filtres (ACTUALITZAT)
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
    
    // Dades d'imatges en JSON (ACTUALITZAT)
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

// ========================================================================
// FUNCIONS D'UTILITAT (SENSE CANVIS)
// ========================================================================

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

// ========================================================================
// EVENTS I FUNCIONALITAT DE LA GALERIA (SENSE CANVIS MAJORS)
// ========================================================================

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

// ========================================================================
// RESTA DE FUNCIONS DE FILTRES I MODAL (MANTENINT CODI ORIGINAL)
// ========================================================================

// [Les funcions de gestió de filtres, modal, lightbox etc. es mantenen igual que l'original]
// Per brevetat, no les incloc totes aquí, però estan disponibles en el fitxer original

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

// Aplicar filtres a les plantes (COMPLET)
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

// ========================================================================
// MODAL I LIGHTBOX (FUNCIONS COMPLETES)
// ========================================================================

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

// Generar HTML dels detalls de planta (reutilitzable)
function generarHTMLDetallsPlanta(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    const imatges = planta.imatges || { principal: null, principal_tipus: 'general', detalls: [], detalls_tipus: [] };
    
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

// Més funcions... (eliminarFiltre, netejarTotsFiltres, etc.)

// ========================================================================
// FUNCIONS AUXILIARS I INICIALITZACIÓ (COMPATIBILITAT COMPLETA)
// ========================================================================

// Al final del fitxer, després de totes les funcions
jQuery(document).ready(function() {
    verificarHashURL();
    console.log("🌿 Galeria carregada i llesta amb sistema integrat");
});
                                 
// Cridar verificarHashURL quan es carregui la pàgina
jQuery(window).on('load', verificarHashURL);

// Assegurar funcions globals per compatibilitat
window.generarGaleriaHTML = generarGaleriaHTML;
window.mostrarFiltresActius = mostrarFiltresActius;
window.obrirDetallsPlanta = obrirDetallsPlanta;
window.tancarModal = tancarModal;
window.SistemaImatgesOptimitzat = SistemaImatgesOptimitzat;
