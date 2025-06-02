/**
 * Correccions dels Popups - VERSIÓ ROBUSTA
 * Soluciona definitivamente tots els problemes de popups i modals
 * IMPORTANT: Aquest script prevé duplicats i conflictes
 */

(function() {
    'use strict';
    
    // Prevenir execució múltiple
    if (window.POPUP_FIXES_LOADED) {
        console.warn('⚠️ popup-fixes.js ja està carregat, evitant duplicat');
        return;
    }
    window.POPUP_FIXES_LOADED = true;
    
    console.log('🔧 === INICIANT CORRECCIONS ROBUSTES DELS POPUPS ===');
    
    // Variables globals
    window.modalObert = false;
    let modalElement = null;
    
    // ========================================================================
    // APLICAR ESTILS CSS CRÍTICS IMMEDIATAMENT
    // ========================================================================
    
    function aplicarEstilsImportants() {
        const estilsId = 'popup-fixes-critical-styles';
        
        // Eliminar estils anteriors
        const estilAnterior = document.getElementById(estilsId);
        if (estilAnterior) {
            estilAnterior.remove();
        }
        
        const estils = document.createElement('style');
        estils.id = estilsId;
        estils.innerHTML = `
            /* ESTILS CRÍTICS PER CORRECCIONS DE POPUP */
            .planta-modal {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.85) !important;
                display: none !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 999999 !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
                backdrop-filter: blur(5px) !important;
                padding: 2vh !important;
                box-sizing: border-box !important;
                overflow: auto !important;
            }
            
            .planta-modal.actiu {
                display: flex !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .planta-modal-contingut {
                position: relative !important;
                max-width: 90vw !important;
                width: 900px !important;
                max-height: 90vh !important;
                background: white !important;
                border-radius: 12px !important;
                overflow: hidden !important;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
                transform: scale(0.9) !important;
                transition: transform 0.3s ease !important;
                margin: auto !important;
            }
            
            .planta-modal.actiu .planta-modal-contingut {
                transform: scale(1) !important;
            }
            
            .planta-modal-tancar {
                position: absolute !important;
                top: 15px !important;
                right: 20px !important;
                font-size: 28px !important;
                font-weight: bold !important;
                color: #666 !important;
                cursor: pointer !important;
                z-index: 1000000 !important;
                transition: all 0.3s ease !important;
                line-height: 1 !important;
                width: 40px !important;
                height: 40px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
                background: rgba(255, 255, 255, 0.9) !important;
                backdrop-filter: blur(5px) !important;
            }
            
            .planta-modal-tancar:hover {
                color: #333 !important;
                background: rgba(255, 255, 255, 1) !important;
                transform: scale(1.1) !important;
            }
            
            .planta-modal-cos {
                padding: 2rem !important;
                max-height: calc(90vh - 4rem) !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
            }
            
            /* LIGHTBOX CORRECCIONS */
            .planta-lightbox {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.9) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 1000000 !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                padding: 2vh !important;
                box-sizing: border-box !important;
            }
            
            .planta-lightbox.actiu {
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            .planta-lightbox img,
            .planta-lightbox .lightbox-image {
                max-width: 90vw !important;
                max-height: 90vh !important;
                object-fit: contain !important;
                border-radius: 8px !important;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
                cursor: default !important;
                transform: scale(0.9) !important;
                transition: transform 0.3s ease !important;
            }
            
            .planta-lightbox.actiu img,
            .planta-lightbox.actiu .lightbox-image {
                transform: scale(1) !important;
            }
            
            .planta-lightbox-tancar {
                position: absolute !important;
                top: 30px !important;
                right: 30px !important;
                color: white !important;
                font-size: 40px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                z-index: 1000001 !important;
                transition: all 0.3s ease !important;
                line-height: 1 !important;
                width: 50px !important;
                height: 50px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
                background: rgba(0, 0, 0, 0.7) !important;
                backdrop-filter: blur(10px) !important;
            }
            
            .planta-lightbox-tancar:hover {
                background: rgba(0, 0, 0, 0.9) !important;
                transform: scale(1.1) !important;
            }
            
            .planta-lightbox-tipus {
                position: absolute !important;
                bottom: 30px !important;
                left: 30px !important;
                background: rgba(33, 150, 243, 0.9) !important;
                color: white !important;
                padding: 10px 20px !important;
                border-radius: 25px !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                text-transform: capitalize !important;
                z-index: 1000001 !important;
                backdrop-filter: blur(10px) !important;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
            }
            
            /* RESPONSIVE */
            @media (max-width: 768px) {
                .planta-modal {
                    padding: 1vh !important;
                }
                
                .planta-modal-contingut {
                    width: 95vw !important;
                    max-height: 95vh !important;
                }
                
                .planta-modal-cos {
                    padding: 1.5rem !important;
                    max-height: calc(95vh - 3rem) !important;
                }
                
                .planta-modal-tancar {
                    top: 10px !important;
                    right: 15px !important;
                    width: 35px !important;
                    height: 35px !important;
                    font-size: 24px !important;
                }
                
                .planta-lightbox {
                    padding: 1vh !important;
                }
                
                .planta-lightbox img,
                .planta-lightbox .lightbox-image {
                    max-width: 95vw !important;
                    max-height: 95vh !important;
                }
                
                .planta-lightbox-tancar {
                    top: 20px !important;
                    right: 20px !important;
                    width: 40px !important;
                    height: 40px !important;
                    font-size: 32px !important;
                }
                
                .planta-lightbox-tipus {
                    bottom: 20px !important;
                    left: 20px !important;
                    padding: 8px 16px !important;
                    font-size: 14px !important;
                }
            }
            
            /* OVERRIDES PER LEAFLET */
            .leaflet-container {
                z-index: 1 !important;
            }
            
            .leaflet-control-container {
                z-index: 1000 !important;
            }
            
            .leaflet-popup {
                z-index: 1010 !important;
            }
            
            /* ASSEGURAR COMPATIBILITAT */
            body.modal-obert {
                overflow: hidden !important;
            }
        `;
        
        // Afegir al head immediatament
        document.head.appendChild(estils);
        console.log('🎨 Estils crítics aplicats immediatament');
    }
    
    // Aplicar estils immediatament
    aplicarEstilsImportants();
    
    // ========================================================================
    // FUNCIONS PRINCIPALS
    // ========================================================================
    
    /**
     * Obrir modal de detalls de planta (VERSIÓ ROBUSTA)
     */
    window.obrirDetallsPlanta = function(plantaId) {
        console.log('🌱 [ROBUST] Obrint detalls de planta:', plantaId);
        
        // Buscar la planta
        if (!window.gb_plantes_data || window.gb_plantes_data.length === 0) {
            console.error('❌ gb_plantes_data no disponible');
            return false;
        }
        
        const planta = window.gb_plantes_data.find(p => 
            p.id === plantaId || 
            sanitizeTitle(p.nom_cientific) === plantaId ||
            p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
        );
        
        if (!planta) {
            console.error(`❌ Planta no trobada: ${plantaId}`);
            return false;
        }
        
        // Assegurar que el modal existeix
        modalElement = obtenirOCrearModal();
        
        // Generar contingut
        const htmlDetalls = generarHTMLDetallsPlanta(planta);
        
        // SEQÜÈNCIA ROBUSTA D'OBERTURA
        const modalCos = modalElement.querySelector('.planta-modal-cos');
        if (modalCos) {
            modalCos.innerHTML = htmlDetalls;
        }
        
        // Mostrar modal amb seqüència controlada
        modalElement.style.display = 'flex';
        modalElement.style.opacity = '0';
        modalElement.classList.remove('actiu');
        
        // Forçar reflow
        modalElement.offsetHeight;
        
        // Animar entrada amb timeout més llarg
        setTimeout(() => {
            modalElement.classList.add('actiu');
            modalElement.style.opacity = '1';
            window.modalObert = true;
            document.body.classList.add('modal-obert');
            
            console.log('✅ [ROBUST] Modal obert correctament');
            
            // Configurar lightbox
            configurarLightboxRobus();
            
            // Centrar modal
            setTimeout(() => centrarModalRobus(), 100);
        }, 100);
        
        return true;
    };
    
    /**
     * Tancar modal (VERSIÓ ROBUSTA)
     */
    window.tancarModal = function() {
        if (!modalElement || !window.modalObert) return false;
        
        console.log('🚪 [ROBUST] Tancant modal...');
        
        modalElement.classList.remove('actiu');
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
            modalElement.style.display = 'none';
            window.modalObert = false;
            document.body.classList.remove('modal-obert');
            
            // Netejar contingut
            const modalCos = modalElement.querySelector('.planta-modal-cos');
            if (modalCos) {
                modalCos.innerHTML = '';
            }
            
            // Eliminar event listeners del lightbox
            document.removeEventListener('keydown', lightboxEscapeHandler);
            
            console.log('✅ [ROBUST] Modal tancat correctament');
        }, 300);
        
        return true;
    };
    
    // ========================================================================
    // FUNCIONS D'UTILITAT ROBUSTES
    // ========================================================================
    
    /**
     * Obtenir o crear modal de manera robusta
     */
    function obtenirOCrearModal() {
        let modal = document.querySelector('.planta-modal');
        
        if (!modal) {
            console.log('🏗️ Creant modal nou...');
            modal = document.createElement('div');
            modal.className = 'planta-modal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="planta-modal-contingut">
                    <span class="planta-modal-tancar">&times;</span>
                    <div class="planta-modal-cos"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        return modal;
    }
    
    /**
     * Centrar modal de manera robusta
     */
    function centrarModalRobus() {
        if (!modalElement) return;
        
        try {
            const contingut = modalElement.querySelector('.planta-modal-contingut');
            const modalCos = modalElement.querySelector('.planta-modal-cos');
            
            if (!contingut || !modalCos) return;
            
            const windowHeight = window.innerHeight;
            const modalHeight = contingut.offsetHeight;
            
            console.log('📐 [ROBUST] Centrant modal:', { windowHeight, modalHeight });
            
            if (modalHeight > windowHeight * 0.85) {
                // Modal massa alt: scroll
                modalElement.style.alignItems = 'flex-start';
                modalElement.style.paddingTop = '2vh';
                modalCos.style.maxHeight = '85vh';
            } else {
                // Modal normal: centrat
                modalElement.style.alignItems = 'center';
                modalElement.style.paddingTop = '2vh';
                modalCos.style.maxHeight = '80vh';
            }
        } catch (error) {
            console.error('❌ Error centrant modal:', error);
        }
    }
    
    /**
     * Configurar lightbox robus
     */
    function configurarLightboxRobus() {
        try {
            // Eliminar event listeners anteriors
            const imatges = modalElement.querySelectorAll('.planta-imatge-detall img, .planta-imatge-principal img');
            
            imatges.forEach(img => {
                // Eliminar event listeners anteriors
                img.removeEventListener('click', lightboxClickHandler);
                // Afegir nou event listener
                img.addEventListener('click', lightboxClickHandler);
            });
            
            console.log('🖼️ [ROBUST] Lightbox configurat per', imatges.length, 'imatges');
        } catch (error) {
            console.error('❌ Error configurant lightbox:', error);
        }
    }
    
    /**
     * Handler per clic a imatge (lightbox)
     */
    function lightboxClickHandler(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const img = e.target;
        const imgSrc = img.src;
        const tipusImatge = img.dataset.tipus || img.parentElement.dataset.tipus || 'general';
        
        if (!imgSrc) {
            console.warn('⚠️ No src trobat per lightbox');
            return;
        }
        
        console.log('🖼️ [ROBUST] Obrint lightbox:', imgSrc);
        
        // Crear lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'planta-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-container">
                <img src="${imgSrc}" alt="Imatge ampliada" class="lightbox-image">
                <span class="planta-lightbox-tancar">&times;</span>
                ${tipusImatge !== 'general' ? 
                    `<div class="planta-lightbox-tipus">${tipusImatge.charAt(0).toUpperCase() + tipusImatge.slice(1)}</div>` : 
                    ''
                }
            </div>
        `;
        
        // Afegir al DOM
        document.body.appendChild(lightbox);
        
        // Animar entrada
        setTimeout(() => {
            lightbox.classList.add('actiu');
        }, 10);
        
        // Event listeners per tancar
        const tancarBtn = lightbox.querySelector('.planta-lightbox-tancar');
        tancarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tancarLightbox(lightbox);
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
                tancarLightbox(lightbox);
            }
        });
        
        // ESC key
        document.addEventListener('keydown', lightboxEscapeHandler);
        lightbox.lightboxEscapeHandler = lightboxEscapeHandler; // Guardar referència
    }
    
    /**
     * Handler per ESC key
     */
    function lightboxEscapeHandler(e) {
        if (e.key === 'Escape') {
            const lightbox = document.querySelector('.planta-lightbox.actiu');
            if (lightbox) {
                tancarLightbox(lightbox);
            }
        }
    }
    
    /**
     * Tancar lightbox
     */
    function tancarLightbox(lightbox) {
        try {
            console.log('🚪 [ROBUST] Tancant lightbox...');
            
            lightbox.classList.remove('actiu');
            setTimeout(() => {
                lightbox.remove();
                document.removeEventListener('keydown', lightboxEscapeHandler);
                console.log('✅ [ROBUST] Lightbox tancat');
            }, 300);
        } catch (error) {
            console.error('❌ Error tancant lightbox:', error);
            lightbox.remove();
        }
    }
    
    // ========================================================================
    // FUNCIONS D'UTILITAT NECESSÀRIES
    // ========================================================================
    
    function sanitizeTitle(text) {
        if (!text) return '';
        return text.toLowerCase()
                   .replace(/\s+/g, '-')
                   .replace(/[^a-z0-9\-]/g, '')
                   .replace(/\-+/g, '-')
                   .replace(/^-|-$/g, '');
    }
    
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Generar HTML dels detalls (versió robusta)
     */
    function generarHTMLDetallsPlanta(planta) {
        // Prioritzar funció global si existeix
        if (typeof window.generarHTMLDetallsPlanta === 'function' && window.generarHTMLDetallsPlanta !== generarHTMLDetallsPlanta) {
            return window.generarHTMLDetallsPlanta(planta);
        }
        
        // Versió fallback robusta
        const imatges = planta.imatges || { principal: null, detalls: [] };
        
        let html = '<div class="planta-detall-individual">';
        
        // Informació principal
        html += `<h2>${escapeHtml(planta.nom_comu || planta.nom_cientific)}</h2>`;
        html += `<h3 class="nom-cientific">${escapeHtml(planta.nom_cientific)}</h3>`;
        
        // Galeria d'imatges
        html += '<div class="planta-galeria-completa">';
        
        // Imatge principal
        if (imatges.principal) {
            html += '<div class="planta-imatge-principal">';
            html += `<img src="assets/imatges/${imatges.principal}" 
                         alt="${escapeHtml(planta.nom_comu)}" 
                         data-tipus="${escapeHtml(imatges.principal_tipus || 'general')}"
                         onerror="this.style.display='none'">`;
            html += '</div>';
        }
        
        // Imatges de detall
        if (imatges.detalls && imatges.detalls.length > 0) {
            html += '<div class="planta-imatges-detall-galeria">';
            imatges.detalls.forEach((imatge, i) => {
                const tipus = imatges.detalls_tipus ? imatges.detalls_tipus[i] : 'general';
                html += `<div class="planta-imatge-detall" data-tipus="${escapeHtml(tipus || 'general')}">`;
                html += `<img src="assets/imatges/${imatge}" 
                             alt="Detall de ${escapeHtml(planta.nom_comu)}" 
                             data-tipus="${escapeHtml(tipus || 'general')}"
                             onerror="this.style.display='none'">`;
                html += '</div>';
            });
            html += '</div>';
        }
        
        html += '</div>'; // Fi galeria
        
        // Informació bàsica
        html += '<div class="planta-info-completa">';
        
        if (planta.descripcio) {
            html += '<div class="planta-seccio">';
            html += '<h4>Descripció</h4>';
            html += `<p>${escapeHtml(planta.descripcio)}</p>`;
            html += '</div>';
        }
        
        html += '<div class="planta-seccio">';
        html += '<h4>Classificació</h4>';
        html += `<p><strong>Família:</strong> ${escapeHtml(planta.familia || 'No especificada')}</p>`;
        html += `<p><strong>Tipus:</strong> ${escapeHtml((planta.tipus || 'desconegut').charAt(0).toUpperCase() + (planta.tipus || 'desconegut').slice(1))}</p>`;
        html += '</div>';
        
        html += '</div>'; // Fi info-completa
        html += '</div>'; // Fi detall-individual
        
        return html;
    }
    
    // ========================================================================
    // EVENT LISTENERS GLOBALS ROBUSTOS
    // ========================================================================
    
    /**
     * Configurar event listeners globals
     */
    function configurarEventListenersRobusts() {
        // Eliminar event listeners anteriors
        document.removeEventListener('click', globalClickHandler);
        document.removeEventListener('keydown', globalKeyHandler);
        
        // Event listener global per clicks
        document.addEventListener('click', globalClickHandler);
        
        // Event listener global per teclat
        document.addEventListener('keydown', globalKeyHandler);
        
        console.log('✅ [ROBUST] Event listeners globals configurats');
    }
    
    /**
     * Handler global per clicks
     */
    function globalClickHandler(e) {
        // Tancar modal amb clic a overlay
        if (e.target.classList.contains('planta-modal')) {
            window.tancarModal();
            eliminarHashURL();
            return;
        }
        
        // Tancar modal amb botó X
        if (e.target.classList.contains('planta-modal-tancar')) {
            e.preventDefault();
            e.stopPropagation();
            window.tancarModal();
            eliminarHashURL();
            return;
        }
        
        // Botó "Veure detalls" del mapa
        if (e.target.classList.contains('boto-veure-detalls')) {
            e.preventDefault();
            e.stopPropagation();
            
            const plantaId = e.target.dataset.plantaId || e.target.dataset.planta;
            if (plantaId) {
                console.log("🌱 [ROBUST] Detalls des del mapa:", plantaId);
                
                // Tancar popup del mapa
                if (window.map && typeof window.map.closePopup === 'function') {
                    window.map.closePopup();
                }
                
                window.obrirDetallsPlanta(plantaId);
                window.location.hash = `planta-${plantaId}`;
            }
            return;
        }
        
        // Botó "Veure detalls" de la galeria
        if (e.target.classList.contains('planta-obrir-detall')) {
            e.preventDefault();
            e.stopPropagation();
            
            const plantaId = e.target.dataset.planta;
            if (plantaId) {
                console.log("🌱 [ROBUST] Detalls des de la galeria:", plantaId);
                window.obrirDetallsPlanta(plantaId);
                window.location.hash = `planta-${plantaId}`;
            }
            return;
        }
    }
    
    /**
     * Handler global per teclat
     */
    function globalKeyHandler(e) {
        if (e.key === 'Escape') {
            if (window.modalObert) {
                window.tancarModal();
                eliminarHashURL();
            }
        }
    }
    
    /**
     * Eliminar hash de l'URL
     */
    function eliminarHashURL() {
        if (window.location.hash.startsWith('#planta-')) {
            if (history.replaceState) {
                history.replaceState(null, null, window.location.pathname + window.location.search);
            } else {
                window.location.hash = '';
            }
        }
    }
    
    // ========================================================================
    // GESTIÓ D'HASH URLs
    // ========================================================================
    
    function gestionarHashURL() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#planta-')) {
            const plantaId = hash.substring(8);
            console.log('🔗 [ROBUST] Hash URL detectat:', plantaId);
            
            // Esperar que les dades estiguin disponibles
            let intents = 0;
            const maxIntents = 50; // 5 segons màxim
            
            const verificarDades = () => {
                if (window.gb_plantes_data && window.gb_plantes_data.length > 0) {
                    setTimeout(() => window.obrirDetallsPlanta(plantaId), 100);
                } else {
                    intents++;
                    if (intents < maxIntents) {
                        setTimeout(verificarDades, 100);
                    } else {
                        console.warn('⚠️ [ROBUST] Timeout esperant dades per hash URL');
                    }
                }
            };
            
            verificarDades();
        }
    }
    
    // Event listener per canvis d'hash
    window.addEventListener('hashchange', gestionarHashURL);
    
    // ========================================================================
    // INICIALITZACIÓ
    // ========================================================================
    
    /**
     * Inicialitzar correccions robustes
     */
    function inicialitzarCorreccionsRobustes() {
        console.log('🔧 [ROBUST] Inicialitzant correccions...');
        
        // Configurar event listeners
        configurarEventListenersRobusts();
        
        // Obtenir o crear modal
        modalElement = obtenirOCrearModal();
        
        // Gestionar hash URL inicial
        gestionarHashURL();
        
        console.log('✅ [ROBUST] Correccions inicialitzades correctament');
        
        // Informació de debug
        setTimeout(() => {
            if (window.gb_plantes_data) {
                console.log(`📊 [ROBUST] Dades disponibles: ${window.gb_plantes_data.length} plantes`);
            } else {
                console.warn('⚠️ [ROBUST] gb_plantes_data no disponible encara');
            }
        }, 1000);
    }
    
    // ========================================================================
    // PUNT D'ENTRADA
    // ========================================================================
    
    // Esperar que el DOM estigui llest
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicialitzarCorreccionsRobustes);
    } else {
        // DOM ja carregat
        setTimeout(inicialitzarCorreccionsRobustes, 100);
    }
    
    console.log('🔧 [ROBUST] Correccions dels popups carregades i llestes');
    
})();
