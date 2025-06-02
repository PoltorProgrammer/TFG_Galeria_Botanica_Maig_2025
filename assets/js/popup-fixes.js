/**
 * Correccions dels Popups - VERSIÓ SIMPLIFICADA I ROBUSTA
 * Eliminat: injecció de CSS (ara va en modal-styles.css)
 * Millorat: gestió d'errors i compatibilitat
 */

(function() {
    'use strict';
    
    // Prevenir execució múltiple
    if (window.POPUP_FIXES_LOADED) {
        console.warn('⚠️ popup-fixes.js ja està carregat, evitant duplicat');
        return;
    }
    window.POPUP_FIXES_LOADED = true;
    
    console.log('🔧 Iniciant correccions simplificades dels popups...');
    
    // Variables globals
    window.modalObert = false;
    let modalElement = null;
    
    // ========================================================================
    // FUNCIONS PRINCIPALS
    // ========================================================================
    
    /**
     * Obrir modal de detalls de planta (VERSIÓ SIMPLIFICADA)
     */
    window.obrirDetallsPlanta = function(plantaId) {
        console.log('🌱 Obrint detalls de planta:', plantaId);
        
        try {
            // Verificar que les dades estiguin disponibles
            if (!window.gb_plantes_data || window.gb_plantes_data.length === 0) {
                console.error('❌ gb_plantes_data no disponible');
                mostrarErrorModal('Les dades de plantes no estan disponibles. Prova a recarregar la pàgina.');
                return false;
            }
            
            // Buscar la planta
            const planta = trobarPlanta(plantaId);
            if (!planta) {
                console.error(`❌ Planta no trobada: ${plantaId}`);
                mostrarErrorModal(`No s'ha trobat la planta amb ID: ${plantaId}`);
                return false;
            }
            
            // Assegurar que el modal existeix
            modalElement = obtenirOCrearModal();
            if (!modalElement) {
                console.error('❌ No s\'ha pogut crear el modal');
                return false;
            }
            
            // Generar contingut
            const htmlDetalls = generarHTMLDetallsPlanta(planta);
            
            // Inserir contingut
            const modalCos = modalElement.querySelector('.planta-modal-cos');
            if (modalCos) {
                modalCos.innerHTML = htmlDetalls;
            } else {
                console.error('❌ No s\'ha trobat .planta-modal-cos');
                return false;
            }
            
            // Mostrar modal amb seqüència controlada
            mostrarModal();
            
            // Configurar lightbox DESPRÉS que el contingut estigui al DOM
            setTimeout(() => {
                configurarLightbox();
            }, 100);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error obrint modal:', error);
            mostrarErrorModal('Error carregant els detalls de la planta. Prova a recarregar la pàgina.');
            return false;
        }
    };
    
    /**
     * Tancar modal (VERSIÓ SIMPLIFICADA)
     */
    window.tancarModal = function() {
        try {
            if (!modalElement || !window.modalObert) {
                return false;
            }
            
            console.log('🚪 Tancant modal...');
            
            // Amagar modal
            modalElement.classList.remove('actiu');
            modalElement.style.opacity = '0';
            
            // Després de l'animació, amagar completament
            setTimeout(() => {
                modalElement.style.display = 'none';
                window.modalObert = false;
                document.body.classList.remove('modal-obert');
                
                // Netejar contingut
                const modalCos = modalElement.querySelector('.planta-modal-cos');
                if (modalCos) {
                    modalCos.innerHTML = '';
                }
                
                // Eliminar lightbox si hi ha algun obert
                const lightboxes = document.querySelectorAll('.planta-lightbox');
                lightboxes.forEach(lightbox => lightbox.remove());
                
                console.log('✅ Modal tancat correctament');
            }, 300);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error tancant modal:', error);
            // Forçar tancament en cas d'error
            if (modalElement) {
                modalElement.style.display = 'none';
                window.modalObert = false;
                document.body.classList.remove('modal-obert');
            }
            return false;
        }
    };
    
    // ========================================================================
    // FUNCIONS D'UTILITAT
    // ========================================================================
    
    /**
     * Trobar planta per ID amb múltiples estratègies
     */
    function trobarPlanta(plantaId) {
        return window.gb_plantes_data.find(p => 
            p.id === plantaId || 
            sanitizeTitle(p.nom_cientific) === plantaId ||
            p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId ||
            p.nom_cientific.toLowerCase().replace(/\s+/g, '-') === plantaId
        );
    }
    
    /**
     * Obtenir o crear modal
     */
    function obtenirOCrearModal() {
        // Primer intentar trobar el modal existent
        let modal = document.querySelector('.planta-modal');
        
        if (!modal) {
            console.log('🏗️ Creant modal nou...');
            modal = document.createElement('div');
            modal.className = 'planta-modal';
            modal.id = 'modal-detalls-planta';
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
     * Mostrar modal amb seqüència controlada
     */
    function mostrarModal() {
        modalElement.style.display = 'flex';
        modalElement.style.opacity = '0';
        modalElement.classList.remove('actiu');
        
        // Forçar reflow
        modalElement.offsetHeight;
        
        // Animar entrada
        setTimeout(() => {
            modalElement.classList.add('actiu');
            modalElement.style.opacity = '1';
            window.modalObert = true;
            document.body.classList.add('modal-obert');
            
            console.log('✅ Modal obert correctament');
        }, 50);
    }
    
    /**
     * Mostrar error al modal
     */
    function mostrarErrorModal(missatge) {
        modalElement = obtenirOCrearModal();
        const modalCos = modalElement.querySelector('.planta-modal-cos');
        
        if (modalCos) {
            modalCos.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <h3>⚠️ Error</h3>
                    <p>${missatge}</p>
                    <button onclick="tancarModal()" style="
                        padding: 0.5rem 1rem; 
                        background: #4CAF50; 
                        color: white; 
                        border: none; 
                        border-radius: 4px; 
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Tancar
                    </button>
                </div>
            `;
        }
        
        mostrarModal();
    }
    
    /**
     * Configurar lightbox per a les imatges del modal
     */
    function configurarLightbox() {
        try {
            if (!modalElement) return;
            
            const imatges = modalElement.querySelectorAll('.planta-imatge-detall img, .planta-imatge-principal img');
            
            imatges.forEach(img => {
                // Eliminar event listeners anteriors per evitar duplicats
                img.removeEventListener('click', lightboxClickHandler);
                // Afegir nou event listener
                img.addEventListener('click', lightboxClickHandler);
            });
            
            console.log('🖼️ Lightbox configurat per', imatges.length, 'imatges');
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
        
        try {
            const img = e.target;
            const imgSrc = img.src;
            
            if (!imgSrc || imgSrc.includes('default_planta.jpg')) {
                console.warn('⚠️ No es pot obrir lightbox per aquesta imatge');
                return;
            }
            
            const tipusImatge = img.dataset.tipus || 
                               img.closest('[data-tipus]')?.dataset.tipus || 
                               'general';
            
            console.log('🖼️ Obrint lightbox:', imgSrc);
            
            obrirLightbox(imgSrc, tipusImatge);
            
        } catch (error) {
            console.error('❌ Error obrint lightbox:', error);
        }
    }
    
    /**
     * Obrir lightbox
     */
    function obrirLightbox(imgSrc, tipusImatge) {
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
        if (tancarBtn) {
            tancarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tancarLightbox(lightbox);
            });
        }
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-container')) {
                tancarLightbox(lightbox);
            }
        });
    }
    
    /**
     * Tancar lightbox
     */
    function tancarLightbox(lightbox) {
        try {
            console.log('🚪 Tancant lightbox...');
            
            lightbox.classList.remove('actiu');
            setTimeout(() => {
                if (lightbox.parentNode) {
                    lightbox.remove();
                }
                console.log('✅ Lightbox tancat');
            }, 300);
        } catch (error) {
            console.error('❌ Error tancant lightbox:', error);
            // Forçar eliminació en cas d'error
            if (lightbox.parentNode) {
                lightbox.remove();
            }
        }
    }
    
    /**
     * Generar HTML dels detalls de planta
     */
    function generarHTMLDetallsPlanta(planta) {
        // Prioritzar funció global si existeix i és diferent
        if (typeof window.generarHTMLDetallsPlanta === 'function' && 
            window.generarHTMLDetallsPlanta !== generarHTMLDetallsPlanta) {
            try {
                return window.generarHTMLDetallsPlanta(planta);
            } catch (error) {
                console.warn('⚠️ Error amb la funció global, usant fallback:', error);
            }
        }
        
        // Versió fallback
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
    // FUNCIONS D'UTILITAT BÀSIQUES
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
    
    // ========================================================================
    // EVENT LISTENERS GLOBALS
    // ========================================================================
    
    function configurarEventListeners() {
        // Event listener global per clicks (delegat)
        document.addEventListener('click', function(e) {
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
            
            // Botó "Veure detalls" (galeria i mapa)
            if (e.target.classList.contains('boto-veure-detalls') || 
                e.target.classList.contains('planta-obrir-detall')) {
                e.preventDefault();
                e.stopPropagation();
                
                const plantaId = e.target.dataset.plantaId || 
                               e.target.dataset.planta;
                
                if (plantaId) {
                    console.log("🌱 Obrint detalls per ID:", plantaId);
                    
                    // Tancar popup del mapa si existeix
                    if (window.map && typeof window.map.closePopup === 'function') {
                        window.map.closePopup();
                    }
                    
                    window.obrirDetallsPlanta(plantaId);
                    window.location.hash = `planta-${plantaId}`;
                }
                return;
            }
        });
        
        // Event listener per teclat
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (window.modalObert) {
                    window.tancarModal();
                    eliminarHashURL();
                }
                
                // Tancar lightbox si està obert
                const lightbox = document.querySelector('.planta-lightbox.actiu');
                if (lightbox) {
                    tancarLightbox(lightbox);
                }
            }
        });
        
        console.log('✅ Event listeners configurats');
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
            console.log('🔗 Hash URL detectat:', plantaId);
            
            // Esperar que les dades estiguin disponibles
            let intents = 0;
            const maxIntents = 50; // 5 segons màxim
            
            const verificarDades = () => {
                if (window.gb_plantes_data && window.gb_plantes_data.length > 0) {
                    setTimeout(() => window.obrirDetallsPlanta(plantaId), 200);
                } else {
                    intents++;
                    if (intents < maxIntents) {
                        setTimeout(verificarDades, 100);
                    } else {
                        console.warn('⚠️ Timeout esperant dades per hash URL');
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
    
    function inicialitzar() {
        console.log('🔧 Inicialitzant correccions...');
        
        // Configurar event listeners
        configurarEventListeners();
        
        // Obtenir o crear modal
        modalElement = obtenirOCrearModal();
        
        // Gestionar hash URL inicial
        setTimeout(gestionarHashURL, 500);
        
        console.log('✅ Correccions inicialitzades correctament');
    }
    
    // Inicialitzar quan el DOM estigui llest
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicialitzar);
    } else {
        setTimeout(inicialitzar, 100);
    }
    
    console.log('🔧 Popup fixes carregat (versió simplificada)');
    
})();
