/**
 * Sistema d'Imatges Millorat - UAB Galeria Botànica
 * Utilitza l'API de GitHub per obtenir la llista real d'imatges
 * i les agrupa eficientment per nom científic
 */

class SistemaImatgesGitHub {
    constructor() {
        this.imatgesDisponibles = new Map(); // nom_cientific -> array d'objectes imatge
        this.tipusEstructures = ['flor', 'fulla', 'fruit', 'tija', 'habit', 'altre'];
        this.repositori = {
            owner: 'PoltorProgrammer',
            repo: 'TFG_Galeria_Botanica_Maig_2025',
            path: 'assets/imatges'
        };
        this.cacheImatges = null; // Cache per evitar peticions repetides
        this.estadistiques = {
            imatgesProcessades: 0,
            imatgesIgnorades: 0,
            especiesAmbImatges: 0,
            estructuresDistribuides: {}
        };
    }

    /**
     * Obté la llista completa d'imatges del repositori GitHub
     */
    async obtenirLlistaImatges() {
        if (this.cacheImatges) {
            console.log('📦 Utilitzant cache d\'imatges...');
            return this.cacheImatges;
        }

        try {
            console.log('🔗 Carregant llista d\'imatges des de GitHub API...');
            
            const url = `https://api.github.com/repos/${this.repositori.owner}/${this.repositori.repo}/contents/${this.repositori.path}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error API GitHub: ${response.status} ${response.statusText}`);
            }
            
            const files = await response.json();
            
            // Filtrar només els fitxers .jpg i .jpeg
            const imatges = files
                .filter(file => file.type === 'file' && /\.(jpg|jpeg)$/i.test(file.name))
                .map(file => ({
                    nom: file.name,
                    url: file.download_url,
                    mida: file.size,
                    path: file.path
                }));
            
            this.cacheImatges = imatges;
            console.log(`✅ Trobades ${imatges.length} imatges al repositori GitHub`);
            
            return imatges;
            
        } catch (error) {
            console.error('❌ Error obtenint llista d\'imatges:', error);
            
            // Fallback: intentar amb una llista predefinida o retornar array buit
            console.warn('⚠️ Utilitzant mode fallback sense imatges de GitHub');
            return this.obtenirImatgesFallback();
        }
    }

    /**
     * Fallback: llista d'imatges d'exemple en cas que l'API de GitHub falli
     */
    obtenirImatgesFallback() {
        console.log('🔄 Activant mode fallback amb imatges d\'exemple...');
        
        // Llista d'imatges d'exemple per testing
        const imatgesExample = [
            'platanus_hispanica_00_flor.jpg',
            'platanus_hispanica_01_fulla.jpg',
            'platanus_hispanica_02_fruit.jpg',
            'quercus_ilex_00_habit.jpg',
            'quercus_ilex_01_fulla.jpg',
            'rosmarinus_officinalis_00_flor.jpg',
            'rosmarinus_officinalis_01_habit.jpg',
            'default_planta.jpg'
        ];
        
        return imatgesExample.map(nom => ({
            nom: nom,
            url: `assets/imatges/${nom}`,
            mida: 0,
            path: `assets/imatges/${nom}`
        }));
    }

    /**
     * Converteix nom científic al format utilitzat en els noms de fitxer
     */
    nomCientificAFitxer(nomCientific) {
        return nomCientific.toLowerCase()
                          .replace(/\s+/g, '_')           // Espais -> guions baixos
                          .replace(/[^a-z0-9_]/g, '')     // Només lletres, números i _
                          .trim();
    }

    /**
     * Extreu informació d'un nom de fitxer d'imatge
     * Format esperat: {nom_cientific}_{numero}_{estructura}.jpg
     * Exemples: platanus_hispanica_00_flor.jpg, quercus_ilex_01_fulla.jpg
     */
    analitzarNomFitxer(nomFitxer) {
        // Ignorar fitxers que no siguin d'espècies
        if (nomFitxer === 'default_planta.jpg' || nomFitxer.startsWith('marge-')) {
            return null;
        }

        // Eliminar extensió
        const sensExtensio = nomFitxer.replace(/\.(jpg|jpeg)$/i, '');
        
        // Dividir per guions baixos
        const parts = sensExtensio.split('_');
        
        if (parts.length < 3) {
            console.debug(`⚠️ Format de fitxer no reconegut: ${nomFitxer} (parts: ${parts.length})`);
            return null;
        }
        
        // L'estructura és l'última part
        const estructura = parts[parts.length - 1].toLowerCase();
        
        // El número és la penúltima part
        const numeroStr = parts[parts.length - 2];
        const numero = parseInt(numeroStr, 10);
        
        // El nom científic són totes les parts menys les dues últimes
        const nomCientific = parts.slice(0, -2).join('_');
        
        // Validar estructura
        if (!this.tipusEstructures.includes(estructura)) {
            console.debug(`⚠️ Estructura '${estructura}' no reconeguda en: ${nomFitxer}. Acceptant igualment.`);
        }
        
        // Validar número
        if (isNaN(numero)) {
            console.debug(`⚠️ Número '${numeroStr}' no vàlid en: ${nomFitxer}`);
            return null;
        }
        
        return {
            nomCientificFitxer: nomCientific,
            numero: numero,
            estructura: estructura,
            nomFitxerOriginal: nomFitxer
        };
    }

    /**
     * Agrupa les imatges per nom científic
     */
    async agruparImatgesPerEspecie(llistaImatges, plantesJSON) {
        console.log('🔍 Agrupant imatges per espècie...');
        
        // Crear mapa de noms científics del JSON per comparació
        const nomsCientificsJSON = new Map();
        plantesJSON.forEach(planta => {
            const nomNormalitzat = this.nomCientificAFitxer(planta.nom_cientific);
            nomsCientificsJSON.set(nomNormalitzat, planta.nom_cientific);
        });
        
        console.log(`📋 Espècies al JSON: ${nomsCientificsJSON.size}`);
        console.log(`📸 Imatges a processar: ${llistaImatges.length}`);
        
        // Analitzar cada imatge i agrupar-la
        const agrupacio = new Map();
        let imatgesProcessades = 0;
        let imatgesIgnorades = 0;
        const especiesIgnorades = new Set();
        
        for (const imatge of llistaImatges) {
            const info = this.analitzarNomFitxer(imatge.nom);
            
            if (!info) {
                imatgesIgnorades++;
                continue;
            }
            
            // Verificar si aquesta espècie existeix al JSON
            if (!nomsCientificsJSON.has(info.nomCientificFitxer)) {
                especiesIgnorades.add(info.nomCientificFitxer);
                console.debug(`🚫 Imatge ignorada (espècie no al JSON): ${imatge.nom}`);
                imatgesIgnorades++;
                continue;
            }
            
            // Afegir a l'agrupació
            if (!agrupacio.has(info.nomCientificFitxer)) {
                agrupacio.set(info.nomCientificFitxer, []);
            }
            
            agrupacio.get(info.nomCientificFitxer).push({
                nomFitxer: imatge.nom,
                urlCompleta: `assets/imatges/${imatge.nom}`, // Ruta local
                urlGitHub: imatge.url, // URL directa de GitHub (backup)
                numero: info.numero,
                estructura: info.estructura,
                mida: imatge.mida
            });
            
            imatgesProcessades++;
            
            // Actualitzar estadístiques d'estructures
            this.estadistiques.estructuresDistribuides[info.estructura] = 
                (this.estadistiques.estructuresDistribuides[info.estructura] || 0) + 1;
        }
        
        // Ordenar imatges dins de cada espècie per número
        agrupacio.forEach((imatges, especie) => {
            imatges.sort((a, b) => a.numero - b.numero);
        });
        
        // Actualitzar estadístiques
        this.estadistiques.imatgesProcessades = imatgesProcessades;
        this.estadistiques.imatgesIgnorades = imatgesIgnorades;
        this.estadistiques.especiesAmbImatges = agrupacio.size;
        
        console.log('📊 RESUM AGRUPACIÓ:');
        console.log(`   ✅ ${imatgesProcessades} imatges processades`);
        console.log(`   ❌ ${imatgesIgnorades} imatges ignorades`);
        console.log(`   🌱 ${agrupacio.size} espècies amb imatges`);
        
        if (especiesIgnorades.size > 0) {
            console.log(`   🚫 Espècies ignorades (${especiesIgnorades.size}):`, [...especiesIgnorades].slice(0, 5));
        }
        
        this.imatgesDisponibles = agrupacio;
        return agrupacio;
    }

    /**
     * Assigna imatges a una planta específica
     */
    assignarImatgesPlanta(planta) {
        const nomNormalitzat = this.nomCientificAFitxer(planta.nom_cientific);
        const imatgesEspecie = this.imatgesDisponibles.get(nomNormalitzat) || [];
        
        if (imatgesEspecie.length === 0) {
            console.debug(`📷 No hi ha imatges per: ${planta.nom_cientific}`);
            return {
                principal: null,
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: []
            };
        }
        
        // Prioritzar per a la imatge principal: flor > habit > fulla > fruit > tija > altre
        const prioritatEstructures = {
            'flor': 1,
            'habit': 2, 
            'fulla': 3,
            'fruit': 4,
            'tija': 5,
            'altre': 6
        };
        
        // Trobar la millor imatge per a principal
        const imatgesSorted = [...imatgesEspecie].sort((a, b) => {
            const prioritatA = prioritatEstructures[a.estructura] || 999;
            const prioritatB = prioritatEstructures[b.estructura] || 999;
            
            if (prioritatA !== prioritatB) {
                return prioritatA - prioritatB;
            }
            
            // Si mateix tipus, prioritzar per número més baix
            return a.numero - b.numero;
        });
        
        const principal = imatgesSorted[0];
        const detalls = imatgesSorted.slice(1);
        
        const resultat = {
            principal: principal.nomFitxer,
            principal_tipus: principal.estructura,
            detalls: detalls.map(img => img.nomFitxer),
            detalls_tipus: detalls.map(img => img.estructura)
        };
        
        console.debug(`🖼️ ${planta.nom_cientific}: ${1 + detalls.length} imatges (principal: ${principal.estructura})`);
        return resultat;
    }

    /**
     * Actualitzar l'estat visual del carregament
     */
    actualitzarEstatCarregament(missatge, tipus = 'loading') {
        const elementEstat = document.getElementById('loading-status');
        if (elementEstat) {
            elementEstat.textContent = missatge;
            elementEstat.className = `loading-stats ${tipus}`;
        }
        console.log(`🔄 ${missatge}`);
    }

    /**
     * Generar informe detallat del processament
     */
    generarInforme(plantesAmbImatges) {
        const plantesAmbImatgePrincipal = plantesAmbImatges.filter(p => p.imatges.principal !== null);
        const totalImatges = plantesAmbImatges.reduce((total, p) => 
            total + (p.imatges.principal ? 1 : 0) + p.imatges.detalls.length, 0);
        
        const plantesAmbDetalls = plantesAmbImatges.filter(p => p.imatges.detalls.length > 0);
        const mitjanaImatgesPerPlanta = totalImatges / Math.max(plantesAmbImatgePrincipal.length, 1);
        
        return {
            totalPlantes: plantesAmbImatges.length,
            plantesAmbImatges: plantesAmbImatgePrincipal.length,
            plantesAmbDetalls: plantesAmbDetalls.length,
            totalImatges: totalImatges,
            mitjanaImatgesPerPlanta: Math.round(mitjanaImatgesPerPlanta * 10) / 10,
            cobertura: Math.round((plantesAmbImatgePrincipal.length / plantesAmbImatges.length) * 100),
            estructuresDistribuides: this.estadistiques.estructuresDistribuides
        };
    }

    /**
     * Processar totes les plantes del JSON
     */
    async processarTotesLesPlantes(plantesJSON) {
        try {
            console.log('🚀 === INICI PROCESSAMENT D\'IMATGES ===');
            this.actualitzarEstatCarregament('🔄 Obtenint llista d\'imatges des de GitHub...');
            
            // 1. Obtenir llista d'imatges des de GitHub
            const llistaImatges = await this.obtenirLlistaImatges();
            
            if (llistaImatges.length === 0) {
                console.warn('⚠️ No s\'han trobat imatges. Continuant sense imatges...');
                this.actualitzarEstatCarregament('⚠️ No s\'han trobat imatges al repositori', 'error');
                return plantesJSON.map(planta => ({
                    ...planta,
                    imatges: {
                        principal: null,
                        principal_tipus: 'general',
                        detalls: [],
                        detalls_tipus: []
                    }
                }));
            }
            
            this.actualitzarEstatCarregament(`🔍 Agrupant ${llistaImatges.length} imatges per espècie...`);
            
            // 2. Agrupar imatges per espècie
            await this.agruparImatgesPerEspecie(llistaImatges, plantesJSON);
            
            this.actualitzarEstatCarregament('📝 Assignant imatges a cada planta...');
            
            // 3. Assignar imatges a cada planta
            const plantesAmbImatges = plantesJSON.map(planta => ({
                ...planta,
                imatges: this.assignarImatgesPlanta(planta)
            }));
            
            // 4. Generar informe i estadístiques
            const informe = this.generarInforme(plantesAmbImatges);
            
            // 5. Actualitzar estadístiques a la interfície
            this.actualitzarEstadistiquesUI(informe);
            
            // 6. Log del resultat final
            console.log('📋 === RESULTAT FINAL ===');
            console.log(`   🌱 ${informe.totalPlantes} plantes processades`);
            console.log(`   🖼️ ${informe.plantesAmbImatges} plantes amb imatge principal (${informe.cobertura}%)`);
            console.log(`   📚 ${informe.plantesAmbDetalls} plantes amb imatges de detall`);
            console.log(`   📸 ${informe.totalImatges} imatges assignades en total`);
            console.log(`   📊 Mitjana: ${informe.mitjanaImatgesPerPlanta} imatges per planta`);
            console.log(`   🏗️ Estructures: ${Object.keys(informe.estructuresDistribuides).join(', ')}`);
            console.log('========================');
            
            this.actualitzarEstatCarregament(
                `✅ ${informe.plantesAmbImatges}/${informe.totalPlantes} plantes amb imatges (${informe.totalImatges} fotografies)`, 
                'success'
            );
            
            return plantesAmbImatges;
            
        } catch (error) {
            console.error('❌ Error processant imatges:', error);
            this.actualitzarEstatCarregament(`❌ Error carregant imatges: ${error.message}`, 'error');
            
            // Retornar plantes sense imatges en cas d'error
            return plantesJSON.map(planta => ({
                ...planta,
                imatges: {
                    principal: null,
                    principal_tipus: 'general', 
                    detalls: [],
                    detalls_tipus: []
                }
            }));
        }
    }

    /**
     * Actualitzar les estadístiques a la interfície d'usuari
     */
    actualitzarEstadistiquesUI(informe) {
        const estatEspecies = document.getElementById('stat-especies');
        const estatFotografies = document.getElementById('stat-fotografies');
        
        if (estatEspecies) {
            estatEspecies.textContent = informe.totalPlantes;
        }
        if (estatFotografies) {
            estatFotografies.textContent = informe.totalImatges;
        }
    }

    /**
     * Obtenir estadístiques detallades sobre les imatges disponibles
     */
    obtenirEstadistiques() {
        if (!this.imatgesDisponibles || this.imatgesDisponibles.size === 0) {
            return {
                especiesAmbImatges: 0,
                totalImatges: 0,
                estructuresDisponibles: [],
                imatgePerEstructura: {},
                distribucioPerEspecie: {}
            };
        }
        
        let totalImatges = 0;
        const estructuresCount = {};
        const distribucioPerEspecie = {};
        
        this.imatgesDisponibles.forEach((imatges, especie) => {
            totalImatges += imatges.length;
            distribucioPerEspecie[especie] = imatges.length;
            
            imatges.forEach(img => {
                estructuresCount[img.estructura] = (estructuresCount[img.estructura] || 0) + 1;
            });
        });
        
        return {
            especiesAmbImatges: this.imatgesDisponibles.size,
            totalImatges: totalImatges,
            estructuresDisponibles: Object.keys(estructuresCount),
            imatgePerEstructura: estructuresCount,
            distribucioPerEspecie: distribucioPerEspecie
        };
    }

    /**
     * Netejar cache per forçar una nova càrrega
     */
    netejarCache() {
        this.cacheImatges = null;
        this.imatgesDisponibles.clear();
        console.log('🧹 Cache d\'imatges netejat');
    }
}

// Fer accessible globalment
if (typeof window !== 'undefined') {
    window.SistemaImatgesGitHub = SistemaImatgesGitHub;
    console.log('🔧 Sistema d\'imatges GitHub carregat i disponible globalment');
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaImatgesGitHub;
}
