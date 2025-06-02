/**
 * Correccions dels Popups - Galeria Botànica UAB
 * Fitxer que soluciona els problemes dels modals i lightbox
 * 
 * PROBLEMES SOLUCIONATS:
 * 1. Galeria: Pantalla negra sense contingut del modal
 * 2. Mapa: Modal descentrat i mal posicionat
 * 3. Lightbox: Z-index incorrecte i problemes d'esdeveniments
 * 
 * INSTRUCCIONS:
 * - Afegir aquest script DESPRÉS dels altres scripts a index.html
 * - No modificar les funcions existents, aquest script les substitueix
 * 
 * @author Correccions per Claude AI
 * @version 2.0
 */

(function() {
    'use strict';
    
    console.log('🔧 === CARREGANT CORRECCIONS DELS POPUPS ===');
    
    // Variable global per controlar l'estat del modal
    window.modalObert = false;
    
    // ========================================================================
    // FUNCIONS CORREGIDES PRINCIPALS
    // ========================================================================
    
    /**
     * CORRECCIÓ PRINCIPAL: Obrir modal de detalls de planta
     * Funciona tant per galeria com per mapa
     */
    window.obrirDetallsPlanta = function(plantaId) {
        console.log('🌱 Obrint detalls de planta:', plantaId);
        
        // Buscar la planta a les dades globals
        if (!window.gb_plantes_data || window.gb_plantes_data.length === 0) {
            console.error('❌ gb_plantes_data no disponible');
            return;
        }
        
        const planta = window.gb_plantes_data.find(p => 
            p.id === plantaId || 
            sanitizeTitle(p.nom_cientific) === plantaId ||
            p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
        );
        
        if (!planta) {
            console.error(`❌ No s'ha trobat la planta amb ID: ${plantaId}`);
            return;
        }
        
        // Assegurar que el modal existeix
        let $modal = jQuery('.planta-modal');
        if ($modal.length === 0) {
            // Crear modal si no existeix
            crearModalPredefinit();
            $modal = jQuery('.planta-modal');
        }
        
        // Generar HTML dels detalls
        const htmlDetalls = generarHTMLDetallsPlanta(planta);
        
        // CORRECCIÓ: Seqüència correcta d'obertura
        $modal.find('.planta-modal-cos').html(htmlDetalls);
        $modal.css({
            'display': 'flex',
            'opacity': '0',
            'visibility': 'visible'
        }).removeClass('actiu');
        
        // Forçar reflow i després animar
        $modal[0].offsetHeight;
        
        setTimeout(() => {
            $modal.addClass('actiu').css('opacity', '1');
            window.modalObert = true;
            jQuery('body').css('overflow', 'hidden');
            
            console.log('✅ Modal obert correctament');
            
            // Activar lightbox millorat
            activarLightboxMillorat();
            
            // Centrar modal amb delay per assegurar que el contingut s'ha renderitzat
            setTimeout(() => centrarModal($modal), 100);
        }, 50);
        
        return true;
    };
    
    /**
     * Versió específica per al mapa (manté compatibilitat)
     */
    window.obrirDetallsPlantaMapa = function(plantaId, plantaNom) {
        console.log('🗺️ Obrint detalls des del mapa:', { plantaId, plantaNom });
        
        // Tancar popup del mapa primer
        if (window.map && typeof window.map.closePopup === 'function') {
            window.map.closePopup();
        }
        
        // Usar la funció principal
        return window.obrirDetallsPlanta(plantaId);
    };
    
    /**
     * CORRECCIÓ: Tancar modal
     */
    window.tancarModal = function() {
        const $modal = jQuery('.planta-modal');
        
        if ($modal.length === 0 || !window.modalObert) return;
        
        console.log('🚪 Tancant modal...');
        
        // Animar sortida
        $modal.removeClass('actiu').css('opacity', '0');
        
        setTimeout(() => {
            $modal.css({
                'display': 'none',
                'visibility': 'hidden'
            });
            window.modalObert = false;
            jQuery('body').css('overflow', 'auto');
            
            // Netejar contingut per alliberar memòria
            $modal.find('.planta-modal-cos').empty();
            
            // Eliminar event listeners del lightbox
            jQuery(document).off('keydown.lightbox');
            
            console.log('✅ Modal tancat correctament');
        }, 300);
    };
    
    // ========================================================================
    // FUNCIONS D'UTILITAT
    // ========================================================================
    
    /**
     * Crear modal predefinit si no existeix
     */
    function crearModalPredefinit() {
        if (jQuery('.planta-modal').length > 0) return;
        
        const modalHTML = `
            <div class="planta-modal" style="display: none;">
                <div class="planta-modal-contingut">
                    <span class="planta-modal-tancar">&times;</span>
                    <div class="planta-modal-cos"></div>
                </div>
            </div>
        `;
        
        jQuery('body').append(modalHTML);
        console.log('🏗️ Modal predefinit creat');
    }
    
    /**
     * Centrar modal correctament segons el contingut
     */
    function centrarModal($modal) {
        try {
            const $contingut = $modal.find('.planta-modal-contingut');
            const windowHeight = jQuery(window).height();
            const modalHeight = $contingut.outerHeight();
            
            // Si el modal és massa alt, alinear a dalt amb scroll
            if (modalHeight > windowHeight * 0.85) {
                $modal.css({
                    'align-items': 'flex-start',
                    'padding-top': '2vh',
                    'padding-bottom': '2vh'
                });
                $contingut.css({
                    'max-height': '96vh',
                    'overflow-y': 'auto'
                });
            } else {
                // Sinó, centrar verticalment
                $modal.css({
                    'align-items': 'center',
                    'padding-top': '2vh',
                    'padding-bottom': '2vh'
                });
                $contingut.css({
                    'max-height': '90vh',
                    'overflow-y': 'auto'
                });
            }
            
            console.log('📐 Modal centrat:', { modalHeight, windowHeight });
        } catch (error) {
            console.error('❌ Error centrant modal:', error);
        }
    }
    
    /**
     * CORRECCIÓ: Activar lightbox millorat
     */
    function activarLightboxMillorat() {
        try {
            // Eliminar event listeners anteriors per evitar duplicats
            jQuery('.planta-imatge-detall img, .planta-imatge-principal img').off('click.lightbox-millorat');
            
            jQuery('.planta-imatge-detall img, .planta-imatge-principal img').on('click.lightbox-millorat', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const $img = jQuery(this);
                const imgSrc = $img.attr('src');
                const tipusImatge = $img.data('tipus') || $img.parent().data('tipus') || 'general';
                
                if (!imgSrc) {
                    console.warn('⚠️ No s\'ha trobat src de la imatge');
                    return;
                }
                
                console.log('🖼️ Obrint lightbox per:', imgSrc, 'Tipus:', tipusImatge);
                
                // Crear lightbox amb estructura millor
                const lightboxHTML = `
                    <div class="planta-lightbox" style="z-index: 10001;">
                        <div class="lightbox-container">
                            <img src="${imgSrc}" alt="Imatge ampliada" class="lightbox-image">
                            <span class="planta-lightbox-tancar">&times;</span>
                            ${tipusImatge !== 'general' ? 
                                `<div class="planta-lightbox-tipus">${tipusImatge.charAt(0).toUpperCase() + tipusImatge.slice(1)}</div>` : 
                                ''
                            }
                        </div>
                    </div>
                `;
                
                const $lightbox = jQuery(lightboxHTML);
                
                // Afegir al DOM
                $lightbox.appendTo('body');
                
                // Animar entrada
                setTimeout(() => {
                    $lightbox.addClass('actiu');
                }, 10);
                
                // Event listeners per tancar
                configurarEventListenersLightbox($lightbox);
            });
            
            console.log('✅ Lightbox millorat activat');
        } catch (error) {
            console.error("❌ Error activant lightbox:", error);
        }
    }
    
    /**
     * Configurar event listeners del lightbox
     */
    function configurarEventListenersLightbox($lightbox) {
        // Tancar amb botó X
        $lightbox.find('.planta-lightbox-tancar').on('click', function(e) {
            e.stopPropagation();
            tancarLightbox($lightbox);
        });
        
        // Tancar amb clic a l'overlay (però no a la imatge)
        $lightbox.on('click', function(e) {
            if (e.target === this || e.target.classList.contains('lightbox-container')) {
                tancarLightbox($lightbox);
            }
        });
        
        // Evitar tancar quan es clica la imatge
        $lightbox.find('.lightbox-image').on('click', function(e) {
            e.stopPropagation();
        });
        
        // Tancar amb ESC
        jQuery(document).off('keydown.lightbox').on('keydown.lightbox', function(e) {
            if (e.key === "Escape") {
                tancarLightbox($lightbox);
            }
        });
    }
    
    /**
     * Tancar lightbox amb animació
     */
    function tancarLightbox($lightbox) {
        try {
            console.log('🚪 Tancant lightbox...');
            
            $lightbox.removeClass('actiu');
            setTimeout(() => {
                $lightbox.remove();
                jQuery(document).off('keydown.lightbox');
                console.log('✅ Lightbox tancat');
            }, 300);
        } catch (error) {
            console.error("❌ Error tancant lightbox:", error);
            $lightbox.remove();
            jQuery(document).off('keydown.lightbox');
        }
    }
    
    // ========================================================================
    // EVENT LISTENERS GLOBALS
    // ========================================================================
    
    /**
     * Configurar tots els event listeners necessaris
     */
    function configurarEventListenersGlobals() {
        // Eliminar event listeners anteriors per evitar duplicats
        jQuery(document).off('click.modal-global');
        jQuery(document).off('click.modal-close-global');
        jQuery(document).off('keydown.modal-global');
        jQuery(document).off('click.mapa-detalls-global');
        
        // Tancar modal amb clic a l'overlay
        jQuery(document).on('click.modal-global', '.planta-modal', function(e) {
            if (e.target === this) {
                window.tancarModal();
                eliminarHashURL();
            }
        });
        
        // Tancar modal amb botó X
        jQuery(document).on('click.modal-close-global', '.planta-modal-tancar', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.tancarModal();
            eliminarHashURL();
        });
        
        // Tancar modal amb ESC
        jQuery(document).on('keydown.modal-global', function(e) {
            if (e.key === "Escape" && window.modalObert) {
                window.tancarModal();
                eliminarHashURL();
            }
        });
        
        // Event listeners per als botons "Veure detalls" del mapa
        jQuery(document).on('click.mapa-detalls-global', '.boto-veure-detalls', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const plantaId = jQuery(this).data('planta-id') || jQuery(this).data('planta');
            const plantaNom = jQuery(this).data('planta-nom');
            
            if (!plantaId) {
                console.error('❌ plantaId no trobat en:', this);
                return;
            }
            
            console.log("🌱 Detalls des del mapa:", { plantaId, plantaNom });
            
            // Obrir modal
            window.obrirDetallsPlantaMapa(plantaId, plantaNom);
            
            // Actualitzar URL amb hash
            window.location.hash = `planta-${plantaId}`;
        });
        
        // Event listeners per als botons "Veure detalls" de la galeria
        jQuery(document).on('click.galeria-detalls-global', '.planta-obrir-detall', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const plantaId = jQuery(this).data('planta');
            
            if (!plantaId) {
                console.error('❌ plantaId no trobat en botó galeria:', this);
                return;
            }
            
            console.log("🌱 Detalls des de la galeria:", plantaId);
            
            // Obrir modal
            window.obrirDetallsPlanta(plantaId);
            
            // Actualitzar URL amb hash
            window.location.hash = `planta-${plantaId}`;
        });
        
        console.log('✅ Event listeners globals configurats');
    }
    
    /**
     * Eliminar hash de l'URL si és de planta
     */
    function eliminarHashURL() {
        if (window.location.hash.startsWith('#planta-')) {
            // Usar replaceState per no afegir entrada a l'historial
            if (history.replaceState) {
                history.replaceState(null, null, window.location.pathname + window.location.search);
            } else {
                window.location.hash = '';
            }
        }
    }
    
    // ========================================================================
    // FUNCIONS D'UTILITAT (necessàries per compatibilitat)
    // ========================================================================
    
    /**
     * Sanititzar títol per crear ID
     */
    function sanitizeTitle(text) {
        if (!text) return '';
        return text.toLowerCase()
                   .replace(/\s+/g, '-')
                   .replace(/[^a-z0-9\-]/g, '')
                   .replace(/\-+/g, '-')
                   .replace(/^-|-$/g, '');
    }
    
    /**
     * Escape HTML per seguretat
     */
    function escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Generar HTML dels detalls de planta
     * Utilitza la funció global si existeix, sinó versió simplificada
     */
    function generarHTMLDetallsPlanta(planta) {
        // Intentar usar la funció global primer
        if (typeof window.generarHTMLDetallsPlanta === 'function') {
            try {
                return window.generarHTMLDetallsPlanta(planta);
            } catch (error) {
                console.warn('⚠️ Error amb funció global, usant fallback:', error);
            }
        }
        
        // Fallback: versió simplificada
        console.warn('⚠️ Usant versió simplificada de generarHTMLDetallsPlanta');
        
        const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
        const imatges = planta.imatges || { principal: null, detalls: [] };
        
        let html = '<div class="planta-detall-individual">';
        
        // Informació principal
        html += `<h2>${escapeHtml(planta.nom_comu || planta.nom_cientific)}</h2>`;
        html += `<h3 class="nom-cientific">${escapeHtml(planta.nom_cientific)}</h3>`;
        
        // Imatge principal si està disponible
        if (imatges.principal) {
            html += `<div class="planta-imatge-principal">
                <img src="assets/imatges/${imatges.principal}" 
                     alt="${escapeHtml(planta.nom_comu)}" 
                     data-tipus="${escapeHtml(imatges.principal_tipus || 'general')}"
                     onerror="this.style.display='none'">
            </div>`;
        }
        
        // Descripció
        if (planta.descripcio) {
            html += `<div class="planta-seccio">
                <h4>Descripció</h4>
                <p>${escapeHtml(planta.descripcio)}</p>
            </div>`;
        }
        
        // Classificació
        html += `<div class="planta-seccio">
            <h4>Classificació</h4>
            <p><strong>Família:</strong> ${escapeHtml(planta.familia || 'No especificada')}</p>
            <p><strong>Tipus:</strong> ${escapeHtml((planta.tipus || 'desconegut').charAt(0).toUpperCase() + (planta.tipus || 'desconegut').slice(1))}</p>
        </div>`;
        
        // Imatges de detall si n'hi ha
        if (imatges.detalls && imatges.detalls.length > 0) {
            html += '<div class="planta-seccio"><h4>Més imatges</h4><div class="planta-imatges-detall-galeria">';
            imatges.detalls.forEach((img, i) => {
                const tipus = imatges.detalls_tipus ? imatges.detalls_tipus[i] : 'general';
                html += `<div class="planta-imatge-detall">
                    <img src="assets/imatges/${img}" 
                         alt="Detall ${tipus}" 
                         data-tipus="${escapeHtml(tipus)}"
                         onerror="this.style.display='none'">
                </div>`;
            });
            html += '</div></div>';
        }
        
        html += '</div>';
        
        return html;
    }
    
    // ========================================================================
    // CSS CORRECCIONS PROGRAMÀTIQUES
    // ========================================================================
    
    /**
     * Aplicar estils de correcció programàticament
     */
    function aplicarEstilsCorreccio() {
        const estilsId = 'popup-fixes-dynamic-styles';
        
        // Eliminar estils anteriors si existeixen
        jQuery(`#${estilsId}`).remove();
        
        const estils = `
            <style id="${estilsId}">
                /* Correccions crítiques del modal */
                .planta-modal {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0, 0, 0, 0.8) !important;
                    display: none !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 9999 !important;
                    opacity: 0 !important;
                    transition: opacity 0.3s ease !important;
                    backdrop-filter: blur(10px) !important;
                    padding: 2vh !important;
                    box-sizing: border-box !important;
                }
                
                .planta-modal.actiu {
                    display: flex !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                
                .planta-modal-contingut {
                    position: relative !important;
                    max-width: 900px !important;
                    width: 100% !important;
                    max-height: 90vh !important;
                    background: white !important;
                    border-radius: 12px !important;
                    overflow: hidden !important;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3) !important;
                    transform: scale(0.8) !important;
                    transition: transform 0.3s ease !important;
                }
                
                .planta-modal.actiu .planta-modal-contingut {
                    transform: scale(1) !important;
                }
                
                .planta-modal-cos {
                    max-height: 80vh !important;
                    overflow-y: auto !important;
                    padding: 2rem !important;
                }
                
                .planta-modal-tancar {
                    position: absolute !important;
                    top: 15px !important;
                    right: 15px !important;
                    font-size: 28px !important;
                    font-weight: bold !important;
                    color: #666 !important;
                    cursor: pointer !important;
                    z-index: 10001 !important;
                    width: 35px !important;
                    height: 35px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    background: rgba(255, 255, 255, 0.9) !important;
                    transition: all 0.3s ease !important;
                }
                
                .planta-modal-tancar:hover {
                    background: rgba(255, 255, 255, 1) !important;
                    color: #333 !important;
                    transform: scale(1.1) !important;
                }
                
                /* Correccions del lightbox */
                .planta-lightbox {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0, 0, 0, 0.9) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    z-index: 10001 !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
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
                    cursor: default !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
                }
                
                .planta-lightbox-tancar {
                    position: absolute !important;
                    top: 20px !important;
                    right: 20px !important;
                    color: white !important;
                    font-size: 32px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                    z-index: 10002 !important;
                    width: 40px !important;
                    height: 40px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    background: rgba(0, 0, 0, 0.7) !important;
                    transition: all 0.3s ease !important;
                }
                
                .planta-lightbox-tancar:hover {
                    background: rgba(0, 0, 0, 0.9) !important;
                    transform: scale(1.1) !important;
                }
                
                .planta-lightbox-tipus {
                    position: absolute !important;
                    bottom: 20px !important;
                    left: 20px !important;
                    background: rgba(33, 150, 243, 0.9) !important;
                    color: white !important;
                    padding: 8px 16px !important;
                    border-radius: 20px !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    text-transform: capitalize !important;
                    z-index: 10002 !important;
                }
                
                /* Responsive */
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
                        max-height: 85vh !important;
                    }
                    
                    .planta-modal-tancar {
                        top: 10px !important;
                        right: 10px !important;
                        width: 30px !important;
                        height: 30px !important;
                        font-size: 24px !important;
                    }
                }
            </style>
        `;
        
        jQuery('head').append(estils);
        console.log('🎨 Estils de correcció aplicats');
    }
    
    // ========================================================================
    // GESTIÓ D'HASH URLs
    // ========================================================================
    
    /**
     * Gestionar hash URL per obrir plantes directament
     */
    function gestionarHashURL() {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#planta-')) {
            const plantaId = hash.substring(8); // Eliminar '#planta-'
            console.log('🔗 Hash URL detectat:', plantaId);
            
            // Esperar que les dades estiguin carregades
            setTimeout(() => {
                if (window.gb_plantes_data && window.gb_plantes_data.length > 0) {
                    window.obrirDetallsPlanta(plantaId);
                } else {
                    console.warn('⚠️ Dades no disponibles per hash URL');
                }
            }, 1000);
        }
    }
    
    // Event listener per canvis d'hash
    jQuery(window).on('hashchange', function() {
        gestionarHashURL();
    });
    
    // ========================================================================
    // INICIALITZACIÓ
    // ========================================================================
    
    /**
     * Funció principal d'inicialització
     */
    function inicialitzarCorreccionsPopups() {
        console.log('🔧 Inicialitzant correccions dels popups...');
        
        // Aplicar estils de correcció
        aplicarEstilsCorreccio();
        
        // Configurar event listeners
        configurarEventListenersGlobals();
        
        // Crear modal si no existeix
        crearModalPredefinit();
        
        // Gestionar hash URL inicial
        gestionarHashURL();
        
        console.log('✅ Correccions dels popups inicialitzades correctament');
        
        // Test de funcionament
        if (typeof window.gb_plantes_data !== 'undefined') {
            console.log(`📊 Dades disponibles: ${window.gb_plantes_data.length} plantes`);
        } else {
            console.warn('⚠️ gb_plantes_data no disponible encara');
        }
    }
    
    // ========================================================================
    // PUNT D'ENTRADA
    // ========================================================================
    
    /**
     * Esperar que jQuery estigui disponible i inicialitzar
     */
    function esperarJQueryInicialitzar() {
        if (typeof jQuery !== 'undefined') {
            jQuery(document).ready(function() {
                inicialitzarCorreccionsPopups();
            });
        } else {
            setTimeout(esperarJQueryInicialitzar, 100);
        }
    }
    
    // Iniciar el procés
    esperarJQueryInicialitzar();
    
    console.log('🔧 Correccions dels popups carregades i llestes');
    
})();
