/**
 * Sistema d'assignació automàtica d'imatges des de GitHub
 * Fitxer: assets/js/sistema-imatges.js
 */

class SistemaImatgesGitHub {
    constructor() {
        this.cache = new Map();
        this.llistaImatges = null;
        this.githubAPI = 'https://api.github.com/repos/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025/contents/assets/imatges';
    }

    // Convertir nom científic a format de fitxer
    nomCientificAFitxer(nomCientific) {
        return nomCientific.toLowerCase()
                          .replace(/\s+/g, '_')
                          .replace(/[^a-z0-9_]/g, '');
    }

    // Carregar la llista completa d'imatges des de GitHub
    async carregarImatgesDeGitHub() {
        if (this.llistaImatges) {
            console.log('📋 Usant llista d\'imatges del cache');
            return this.llistaImatges;
        }

        try {
            console.log('🔍 Carregant llista d\'imatges des de GitHub...');
            
            const response = await fetch(this.githubAPI);
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const fitxers = await response.json();
            
            // Filtrar només fitxers JPG que segueixen el patró nom_cientific_XX_tipus.jpg
            this.llistaImatges = fitxers
                .filter(fitxer => {
                    // És un fitxer (no directori)
                    if (fitxer.type !== 'file') return false;
                    
                    // És JPG
                    if (!fitxer.name.endsWith('.jpg')) return false;
                    
                    // Segueix el patró: paraules_XX_tipus.jpg
                    const patro = /^[a-z_]+_\d{2}_[a-z]+\.jpg$/i;
                    return patro.test(fitxer.name);
                })
                .map(fitxer => fitxer.name)
                .sort();
            
            console.log(`✅ Carregades ${this.llistaImatges.length} imatges des de GitHub`);
            return this.llistaImatges;
            
        } catch (error) {
            console.error('❌ Error carregant imatges de GitHub:', error);
            
            // Fallback: retornar array buit
            this.llistaImatges = [];
            return this.llistaImatges;
        }
    }

    // Trobar totes les imatges per una planta específica
    async trobarImatgesPlanta(nomCientific) {
        // Verificar cache primer
        if (this.cache.has(nomCientific)) {
            return this.cache.get(nomCientific);
        }
        
        const nomFitxer = this.nomCientificAFitxer(nomCientific);
        
        // Carregar llista completa des de GitHub
        const llistaCompleta = await this.carregarImatgesDeGitHub();
        
        // FILTRAR: Buscar totes les imatges que comencin amb nom_cientific_
        const imatgesPlanta = llistaCompleta.filter(imatge => 
            imatge.startsWith(nomFitxer + '_')
        );
        
        console.log(`🔍 Trobades ${imatgesPlanta.length} imatges per "${nomCientific}":`, imatgesPlanta);
        
        // PROCESSAR: Extreure número i tipus de cada imatge
        const imatgesProcessades = imatgesPlanta.map(nomImatge => {
            // Dividir: acer_campestre_05_flor.jpg -> ['acer', 'campestre', '05', 'flor', 'jpg']
            const parts = nomImatge.replace('.jpg', '').split('_');
            
            // Els últims 2 elements són numero i tipus
            const numero = parseInt(parts[parts.length - 2]);
            const tipus = parts[parts.length - 1];
            
            return {
                nom: nomImatge,
                ruta: `assets/imatges/${nomImatge}`,
                numero: numero,
                tipus: tipus
            };
        }).sort((a, b) => {
            // Ordenar per número primer
            if (a.numero !== b.numero) {
                return a.numero - b.numero;
            }
            
            // Després per prioritat de tipus
            const prioritat = {
                'habit': 1,
                'flor': 2, 
                'fulla': 3,
                'fruit': 4,
                'tija': 5,
                'altre': 6
            };
            
            return (prioritat[a.tipus] || 10) - (prioritat[b.tipus] || 10);
        });
        
        // Guardar al cache
        this.cache.set(nomCientific, imatgesProcessades);
        
        return imatgesProcessades;
    }

    // Assignar imatges a una planta
    async assignarImatgesPlanta(planta) {
        console.log(`🔍 Buscant imatges per: ${planta.nom_cientific}`);
        
        const imatgesTrobades = await this.trobarImatgesPlanta(planta.nom_cientific);
        
        if (imatgesTrobades.length === 0) {
            console.log(`❌ No s'han trobat imatges per: ${planta.nom_cientific}`);
            return {
                principal: null,
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: []
            };
        }
        
        console.log(`✅ Assignant ${imatgesTrobades.length} imatges per: ${planta.nom_cientific}`);
        
        // Primera imatge com a principal
        const principal = imatgesTrobades[0];
        
        // Resta com a detalls
        const detalls = imatgesTrobades.slice(1);
        
        return {
            principal: principal.nom,
            principal_tipus: principal.tipus,
            detalls: detalls.map(img => img.nom),
            detalls_tipus: detalls.map(img => img.tipus)
        };
    }

    // Processar totes les plantes
    async processarTotesLesPlantes(plantes) {
        console.log('🚀 Iniciant assignació automàtica d\'imatges des de GitHub...');
        
        // Pre-carregar la llista completa des de GitHub
        await this.carregarImatgesDeGitHub();
        
        const plantesAmbImatges = [];
        const total = plantes.length;
        
        // Procesar cada planta
        for (let i = 0; i < plantes.length; i++) {
            const planta = plantes[i];
            
            // Mostrar progrés
            if (i % 5 === 0 || i === total - 1) {
                console.log(`📊 Progrés: ${i + 1}/${total} plantes processades (${Math.round((i + 1) / total * 100)}%)`);
            }
            
            const imatges = await this.assignarImatgesPlanta(planta);
            plantesAmbImatges.push({
                ...planta,
                imatges: imatges
            });
        }
        
        // Estadístiques finals
        const plantesAmbImatges_Count = plantesAmbImatges.filter(p => p.imatges.principal).length;
        const plantesSenseImatges_Count = plantesAmbImatges.filter(p => !p.imatges.principal).length;
        const totalImatges = plantesAmbImatges.reduce((acc, p) => 
            acc + (p.imatges.detalls?.length || 0) + (p.imatges.principal ? 1 : 0), 0
        );
        
        console.log('🎉 Assignació GitHub completada!');
        console.log(`📈 Estadístiques:`);
        console.log(`   - Plantes amb imatges: ${plantesAmbImatges_Count}`);
        console.log(`   - Plantes sense imatges: ${plantesSenseImatges_Count}`);
        console.log(`   - Total d'imatges assignades: ${totalImatges}`);
        console.log(`   - Imatges disponibles a GitHub: ${this.llistaImatges.length}`);
        console.log(`   - Cap error 404! 🎯`);
        
        return plantesAmbImatges;
    }

    // Mètodes de debug i utilitat
    async mostrarImatgesDisponibles() {
        const llista = await this.carregarImatgesDeGitHub();
        
        console.log('📁 Imatges disponibles a GitHub:');
        llista.forEach((imatge, index) => {
            console.log(`${index + 1}. ${imatge}`);
        });
        
        return llista;
    }

    async debugPlanta(nomCientific) {
        console.log(`🐛 Debug per planta: ${nomCientific}`);
        
        const nomFitxer = this.nomCientificAFitxer(nomCientific);
        console.log(`📝 Nom fitxer: ${nomFitxer}`);
        
        const imatges = await this.trobarImatgesPlanta(nomCientific);
        console.table(imatges);
        
        return imatges;
    }

    netejarCache() {
        this.cache.clear();
        this.llistaImatges = null;
        console.log('🧹 Cache netejat');
    }
}

// Exportar per a ús global
window.SistemaImatgesGitHub = SistemaImatgesGitHub;
