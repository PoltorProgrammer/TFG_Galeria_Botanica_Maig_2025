/**
 * Script de debug simplificat per identificar problemes dels popups
 * Afegir temporalment abans de popup-fixes.js per diagnosticar
 */

console.log('🔍 === DEBUG POPUP FIXES INICIAT ===');

// Funció per verificar l'estat del sistema
function verificarEstatSistema() {
    const resultats = {
        timestamp: new Date().toISOString(),
        jquery: typeof jQuery !== 'undefined',
        leaflet: typeof L !== 'undefined',
        dades_plantes: window.gb_plantes_data?.length || 0,
        modal_existent: document.querySelector('.planta-modal') !== null,
        popup_fixes_carregat: window.POPUP_FIXES_LOADED || false,
        funcions_globals: {
            obrirDetallsPlanta: typeof window.obrirDetallsPlanta,
            tancarModal: typeof window.tancarModal,
            mostrarGaleria: typeof window.mostrarGaleria,
            mostrarMapa: typeof window.mostrarMapa
        }
    };
    
    console.log('📊 ESTAT DEL SISTEMA:', resultats);
    return resultats;
}

// Verificar immediatament
verificarEstatSistema();

// Verificar després de 2 segons
setTimeout(() => {
    console.log('🕐 VERIFICACIÓ DESPRÉS DE 2 SEGONS:');
    verificarEstatSistema();
}, 2000);

// Verificar després de 5 segons
setTimeout(() => {
    console.log('🕔 VERIFICACIÓ DESPRÉS DE 5 SEGONS:');
    const estat = verificarEstatSistema();
    
    if (estat.dades_plantes === 0) {
        console.warn('⚠️ Les dades de plantes encara no s\'han carregat');
    }
    
    if (!estat.popup_fixes_carregat) {
        console.warn('⚠️ popup-fixes.js encara no s\'ha carregat');
    }
    
    // Test dels botons
    setTimeout(testClickBotons, 1000);
}, 5000);

// Funció per testejar els clicks dels botons
function testClickBotons() {
    console.log('🧪 TESTEJANT BOTONS DE DETALLS...');
    
    // Buscar botons de la galeria
    const botonsGaleria = document.querySelectorAll('.planta-obrir-detall');
    console.log(`   📋 Botons galeria trobats: ${botonsGaleria.length}`);
    
    // Buscar botons del mapa  
    const botonsMapa = document.querySelectorAll('.boto-veure-detalls');
    console.log(`   🗺️ Botons mapa trobats: ${botonsMapa.length}`);
    
    // Verificar modal
    const modal = document.querySelector('.planta-modal');
    if (modal) {
        console.log('   ✅ Modal trobat:', modal.id || 'sense ID');
        console.log('   📏 Estils modal:', {
            display: getComputedStyle(modal).display,
            position: getComputedStyle(modal).position,
            zIndex: getComputedStyle(modal).zIndex
        });
    } else {
        console.warn('   ❌ Modal NO trobat');
    }
}

// Monitor d'errors globals
window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('popup-fixes')) {
        console.error('❌ ERROR EN POPUP-FIXES:', {
            message: e.message,
            filename: e.filename,
            lineno: e.lineno,
            colno: e.colno
        });
    }
});

// Monitor de clicks per debuggar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('planta-obrir-detall') || 
        e.target.classList.contains('boto-veure-detalls')) {
        
        console.log('🖱️ CLICK DETECTAT:', {
            element: e.target.tagName + '.' + e.target.className,
            plantaId: e.target.dataset.planta || e.target.dataset.plantaId,
            coordenades: { x: e.clientX, y: e.clientY },
            prevented: e.defaultPrevented
        });
        
        // Verificar si la funció existeix
        if (typeof window.obrirDetallsPlanta === 'function') {
            console.log('   ✅ Funció obrirDetallsPlanta disponible');
        } else {
            console.error('   ❌ Funció obrirDetallsPlanta NO disponible');
        }
    }
}, true); // Capture fase per interceptar abans

// Test de modal manual
window.testModal = function() {
    console.log('🧪 TEST MANUAL DEL MODAL...');
    
    const modal = document.querySelector('.planta-modal');
    if (!modal) {
        console.error('❌ Modal no trobat per test');
        return;
    }
    
    // Mostrar modal amb contingut de test
    modal.innerHTML = `
        <div class="planta-modal-contingut">
            <span class="planta-modal-tancar">&times;</span>
            <div class="planta-modal-cos">
                <h2>🧪 Test Modal</h2>
                <p>Si pots veure això, el modal funciona correctament.</p>
                <button onclick="tancarModal()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tancar
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.classList.add('actiu');
    window.modalObert = true;
    document.body.classList.add('modal-obert');
    
    console.log('✅ Modal de test mostrat');
};

// Test d'una planta específica
window.testPlanta = function(nomCientific = 'Platanus hispanica') {
    console.log('🌱 TEST PLANTA:', nomCientific);
    
    if (!window.gb_plantes_data || window.gb_plantes_data.length === 0) {
        console.error('❌ Dades de plantes no disponibles');
        return;
    }
    
    const planta = window.gb_plantes_data.find(p => 
        p.nom_cientific.toLowerCase().includes(nomCientific.toLowerCase())
    );
    
    if (planta) {
        console.log('✅ Planta trobada:', planta);
        
        if (typeof window.obrirDetallsPlanta === 'function') {
            const plantaId = planta.id || planta.nom_cientific.toLowerCase().replace(/\s+/g, '_');
            window.obrirDetallsPlanta(plantaId);
        } else {
            console.error('❌ Funció obrirDetallsPlanta no disponible');
        }
    } else {
        console.error('❌ Planta no trobada');
        console.log('   🔍 Plantes disponibles:', window.gb_plantes_data.slice(0, 5).map(p => p.nom_cientific));
    }
};

// Funció d'ajuda
window.ajudaDebug = function() {
    console.log(`
🔧 FUNCIONS DE DEBUG DISPONIBLES:

• verificarEstatSistema() - Mostra l'estat actual del sistema
• testModal() - Obre un modal de test
• testPlanta('nom científic') - Obre els detalls d'una planta específica
• ajudaDebug() - Mostra aquesta ajuda

EXEMPLES:
testPlanta('Platanus hispanica')
testPlanta('Quercus ilex')
testModal()
    `);
};

console.log('🔧 Debug carregat. Escriu ajudaDebug() per veure les funcions disponibles.');
console.log('🔍 === DEBUG POPUP FIXES COMPLETAT ===');
