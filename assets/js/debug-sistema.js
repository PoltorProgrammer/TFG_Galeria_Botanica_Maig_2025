/**
 * Script de debug per identificar i solucionar els problemes
 * Afegir temporalment a l'index.html per diagnosticar
 */

console.log('🔍 DEBUG: Iniciant diagnòstic del sistema...');

// 1. Verificar si els fitxers JavaScript s'han carregat correctament
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DEBUG: DOM carregat, verificant sistema...');
    
    // Verificar si les funcions clau existeixen
    const funcionsEsperades = [
        'mostrarInici',
        'mostrarGaleria', 
        'mostrarMapa',
        'generarGaleriaHTML',
        'SistemaImatgesOptimitzat'
    ];
    
    funcionsEsperades.forEach(nomFuncio => {
        if (typeof window[nomFuncio] !== 'undefined') {
            console.log(`✅ ${nomFuncio} està disponible`);
        } else {
            console.error(`❌ ${nomFuncio} NO està disponible`);
        }
    });
    
    // Verificar si jQuery està carregat
    if (typeof jQuery !== 'undefined') {
        console.log('✅ jQuery carregat correctament');
    } else {
        console.error('❌ jQuery NO està carregat');
    }
    
    // Verificar si les variables globals existeixen
    const variablesEsperades = ['gb_vars', 'mb_vars', 'gb_plantes_data'];
    variablesEsperades.forEach(nomVariable => {
        if (typeof window[nomVariable] !== 'undefined') {
            console.log(`✅ Variable global ${nomVariable} existeix`);
        } else {
            console.error(`❌ Variable global ${nomVariable} NO existeix`);
        }
    });
    
    // Verificar estructura de fitxers
    console.log('🔍 DEBUG: Verificant càrrega de fitxers...');
    
    // Comprovar si s'està utilitzant el sistema optimitzat
    setTimeout(() => {
        if (typeof SistemaImatgesOptimitzat !== 'undefined') {
            console.log('✅ Sistema optimitzat disponible, testant...');
            
            // Test ràpid del sistema
            const sistema = new SistemaImatgesOptimitzat();
            console.log('🧪 TEST: Sistema creat:', sistema);
            
            // Verificar configuració
            console.log('🔧 Repositori:', sistema.repositori);
            console.log('🔧 Carpeta imatges:', sistema.carpetaImatges);
            
        } else {
            console.error('❌ Sistema optimitzat NO està disponible - utilitzant sistema antic');
        }
    }, 1000);
});

// 2. Interceptar errors de càrrega d'imatges
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.error('❌ Error carregant imatge:', e.target.src);
        
        // Comptar errors d'imatges
        if (!window.imageErrors) {
            window.imageErrors = 0;
        }
        window.imageErrors++;
        
        if (window.imageErrors > 10) {
            console.error('🚨 MASSA ERRORS D\'IMATGES! Sistema antic encara actiu?');
        }
    }
}, true);

// 3. Detectar peticions fetch/AJAX
const originalFetch = window.fetch;
window.fetch = function(...args) {
    console.log('🌐 FETCH REQUEST:', args[0]);
    return originalFetch.apply(this, args)
        .then(response => {
            if (!response.ok) {
                console.error('❌ FETCH ERROR:', response.status, args[0]);
            } else {
                console.log('✅ FETCH SUCCESS:', response.status, args[0]);
            }
            return response;
        })
        .catch(error => {
            console.error('❌ FETCH EXCEPTION:', error, args[0]);
            throw error;
        });
};

// 4. Monitor del sistema optimitzat
setTimeout(() => {
    console.log('📊 RESUM DEBUG després de 5 segons:');
    console.log('   Errors d\'imatges:', window.imageErrors || 0);
    console.log('   Plantes carregades:', window.gb_plantes_data?.length || 0);
    console.log('   Sistema optimitzat actiu:', typeof window.SistemaImatgesOptimitzat !== 'undefined');
    
    if (window.imageErrors > 5) {
        console.log('🔧 SUGGERIMENT: El sistema antic encara està actiu. Comprova:');
        console.log('   1. Els fitxers JS s\'han actualitzat correctament');
        console.log('   2. La imatge default_planta.jpg existeix');
        console.log('   3. L\'ordre de càrrega dels scripts és correcte');
    }
}, 5000);

console.log('🔍 DEBUG: Script de diagnòstic carregat');
