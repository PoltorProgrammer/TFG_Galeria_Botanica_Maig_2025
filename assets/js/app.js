/**
 * Aplicació principal - Galeria Botànica UAB
 * Versió independent sense WordPress
 */

// Variables globals de l'aplicació
window.app = {
    plantes: [],
    currentSection: 'galeria',
    mapaInicialitzat: false,
    galeriaInicialitzada: false,
    imatgesIndex: null,
    
    // Funcions públiques
    mostrarGaleria: null,
    mostrarMapa: null,
    obtenirDetallsPlanta: null
};

// Configuració de rutes
const CONFIG = {
    dataPath: 'dades/plantes.json',
    imagesPath: 'assets/imatges/',
    geojsonPath: 'dades/geojson/'
};

// Inicialització de l'aplicació
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Inicialitzant Galeria Botànica UAB...');
    
    try {
        // Mostrar loading
        mostrarLoading(true);
        
        // Carregar dades de plantes
        await carregarDadesPlantes();
        
        // Generar índex d'imatges
        await generarIndexImatges();
        
        // Inicialitzar la galeria per defecte
        await inicialitzarGaleria();
        
        // Configurar navegació
        configurarNavegacio();
        
        // Configurar gestors d'esdeveniments globals
        configurarEventHandlers();
        
        // Amagar loading
        mostrarLoading(false);
        
        console.log('Aplicació inicialitzada correctament');
        mostrarSuccess('Galeria botànica carregada correctament!');
        
    } catch (error) {
        console.error('Error inicialitzant l\'aplicació:', error);
        mostrarLoading(false);
        mostrarError('Error carregant les dades. Si us plau, recarrega la pàgina.');
    }
});

// Gestió del loading
function mostrarLoading(mostrar) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        if (mostrar) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }
}

// Carregar dades de plantes des del JSON
async function carregarDadesPlantes() {
    try {
        const response = await fetch(CONFIG.dataPath);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            // Si l'arrel del JSON és directament un array
            window.app.plantes = data;
        } else if (data && data.plantes && Array.isArray(data.plantes)) {
            // Si l'array està dins d'un objecte 'plantes'
            window.app.plantes = data.plantes;
        } else {
            throw new Error('Format de dades incorrecte - esperava un array de plantes');
        }
        
        console.log(`Carregades ${window.app.plantes.length} plantes`);
        
        if (window.app.plantes.length === 0) {
            throw new Error('No s\'han trobat plantes a les dades');
        }
        
    } catch (error) {
        console.error('Error carregant dades de plantes:', error);
        throw new Error(`No s'han pogut carregar les dades de plantes: ${error.message}`);
    }
}

// Generar índex d'imatges disponibles
async function generarIndexImatges() {
    console.log("Generant índex d'imatges...");
    
    try {
        window.app.imatgesIndex = await detectarTotesLesImatges();
        console.log('Índex d\'imatges generat:', window.app.imatgesIndex);
    } catch (error) {
        console.error('Error generant índex d\'imatges:', error);
        // Fallback: crear índex buit amb imatges per defecte
        window.app.imatgesIndex = {};
        for (const planta of window.app.plantes) {
            const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
            window.app.imatgesIndex[plantaId] = {
                principal: 'default_planta.jpg',
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: []
            };
        }
    }
}
// Detectar imatges disponibles per una planta
async function detectarImatgesPlanta(nomCientific) {
    // Normalitzar el nom científic
    const nomBase = nomCientific.toLowerCase().replace(/\s+/g, '_');
    const parts = nomBase.split('_');
    const nomCurt = parts.length >= 2 ? parts.slice(0, 2).join('_') : nomBase;
    
    const imatges = {
        principal: '',
        principal_tipus: 'general',
        detalls: [],
        detalls_tipus: []
    };
    
    // Llista de tipus d'imatge possibles i els seus patrons
    const tipusImatges = ['general', 'flor', 'fulla', 'fruit', 'escorça', 'hàbit'];
    const extensionsImatge = ['jpg', 'jpeg', 'png', 'webp'];
    
    // Intentar detectar imatges seguint el patró: nomcurt_XX_tipus.extensió
    for (let i = 1; i <= 10; i++) {
        const numeroFormatat = i.toString().padStart(2, '0');
        
        for (const tipus of tipusImatges) {
            for (const ext of extensionsImatge) {
                const nomImatge = `${nomCurt}_${numeroFormatat}_${tipus}.${ext}`;
                
                try {
                    // Comprovar si la imatge existeix (real)
                    const existeix = await comprovarImatgeExisteix(nomImatge);
                    
                    if (existeix) {
                        if (!imatges.principal) {
                            imatges.principal = nomImatge;
                            imatges.principal_tipus = tipus;
                        } else {
                            imatges.detalls.push(nomImatge);
                            imatges.detalls_tipus.push(tipus);
                        }
                    }
                } catch (error) {
                    // Ignorar errors de comprovació d'imatges
                    continue;
                }
            }
        }
    }
    
    // Si no hem trobat cap imatge amb el patró estàndard, buscar alternatives
    if (!imatges.principal) {
        // Provar patrons alternatius més simples
        const patronsAlternatius = [
            `${nomCurt}.jpg`,
            `${nomCurt}.jpeg`,
            `${nomCurt}.png`,
            `${nomCurt}_01.jpg`,
            `${nomCurt}_1.jpg`,
            `${nomBase}.jpg`,
            `${nomBase}.jpeg`,
            `${nomBase}.png`
        ];
        
        for (const nomImatge of patronsAlternatius) {
            try {
                const existeix = await comprovarImatgeExisteix(nomImatge);
                if (existeix) {
                    imatges.principal = nomImatge;
                    imatges.principal_tipus = 'general';
                    break;
                }
            } catch (error) {
                continue;
            }
        }
    }
    
    // Si encara no hem trobat cap imatge, usar la per defecte
    if (!imatges.principal) {
        imatges.principal = 'default_planta.jpg';
        imatges.principal_tipus = 'general';
    }
    
    return imatges;
}

// Comprovar si una imatge existeix (simulat per a aplicació estàtica)
async function comprovarImatgeExisteix(nomImatge) {
    try {
        const url = CONFIG.imagesPath + nomImatge;
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Funció alternativa per detectar totes les imatges disponibles d'un cop
async function detectarTotesLesImatges() {
    console.log("Detectant imatges disponibles...");
    
    // Si tens un manifest o index de les imatges, pots carregar-lo aquí
    // Alternativament, pots provar patrons coneguts
    
    const imatgesDetectades = {};
    
    for (const planta of window.app.plantes) {
        const nomCientific = planta.nom_cientific;
        const plantaId = planta.id || sanitizeTitle(nomCientific);
        
        try {
            const imatges = await detectarImatgesPlanta(nomCientific);
            imatgesDetectades[plantaId] = imatges;
            
            // Log per debug
            if (imatges.principal !== 'default_planta.jpg') {
                console.log(`Imatges trobades per ${nomCientific}:`, imatges);
            }
        } catch (error) {
            console.warn(`Error detectant imatges per ${nomCientific}:`, error);
            // Usar imatge per defecte
            imatgesDetectades[plantaId] = {
                principal: 'default_planta.jpg',
                principal_tipus: 'general',
                detalls: [],
                detalls_tipus: []
            };
        }
    }
    
    return imatgesDetectades;
}

// Configurar navegació
function configurarNavegacio() {
    // Navegació entre seccions
    window.app.mostrarGaleria = function() {
        document.getElementById('galeria-section').style.display = 'block';
        document.getElementById('mapa-section').style.display = 'none';
        
        document.getElementById('btn-galeria').classList.add('active');
        document.getElementById('btn-mapa').classList.remove('active');
        
        window.app.currentSection = 'galeria';
        
        // Inicialitzar galeria si no s'ha fet
        if (!window.app.galeriaInicialitzada) {
            inicialitzarGaleria();
        }
    };

    window.app.mostrarMapa = function() {
        document.getElementById('galeria-section').style.display = 'none';
        document.getElementById('mapa-section').style.display = 'block';
        
        document.getElementById('btn-galeria').classList.remove('active');
        document.getElementById('btn-mapa').classList.add('active');
        
        window.app.currentSection = 'mapa';
        
        // Inicialitzar el mapa si no s'ha fet encara
        if (!window.app.mapaInicialitzat) {
            inicialitzarMapa();
        }
    };
}

// Configurar gestors d'esdeveniments globals
function configurarEventHandlers() {
    // Gestió de tecles globals
    document.addEventListener('keydown', function(e) {
        // ESC per tancar modals
        if (e.key === 'Escape') {
            tancarModal();
        }
        
        // Navegació amb tecles
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    window.app.mostrarGaleria();
                    break;
                case '2':
                    e.preventDefault();
                    window.app.mostrarMapa();
                    break;
            }
        }
    });
    
    // Gestió de hash URL per deep linking
    window.addEventListener('hashchange', gestionarCanviHash);
    gestionarCanviHash(); // Comprovar hash inicial
}

// Gestionar canvis de hash per deep linking
function gestionarCanviHash() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#planta-')) {
        const plantaId = hash.substring(8); // Treure '#planta-'
        setTimeout(() => {
            obrirDetallsPlanta(plantaId);
        }, 500);
    } else if (hash === '#mapa') {
        window.app.mostrarMapa();
    } else if (hash === '#galeria' || hash === '') {
        window.app.mostrarGaleria();
    }
}

// Funcions d'utilitat
function obtenirURLImatge(nomImatge) {
    if (!nomImatge) return CONFIG.imagesPath + 'default_planta.jpg';
    return CONFIG.imagesPath + nomImatge;
}

function obtenirImatgesPlanta(plantaId) {
    return window.app.imatgesIndex[plantaId] || {
        principal: 'default_planta.jpg',
        principal_tipus: 'general',
        detalls: [],
        detalls_tipus: []
    };
}

// Mostrar missatges d'error
function mostrarError(missatge) {
    // Eliminar errors anteriors
    const errorsAnteriors = document.querySelectorAll('.app-error');
    errorsAnteriors.forEach(error => error.remove());
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'app-error';
    errorDiv.innerHTML = `<p>${missatge}</p>`;
    
    // Inserir l'error després del header
    const header = document.querySelector('.app-header');
    header.insertAdjacentElement('afterend', errorDiv);
    
    // Eliminar l'error després de 10 segons
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 10000);
}

// Mostrar missatges d'èxit
function mostrarSuccess(missatge) {
    const successDiv = document.createElement('div');
    successDiv.className = 'app-success';
    successDiv.innerHTML = `<p>${missatge}</p>`;
    
    // Inserir després del header
    const header = document.querySelector('.app-header');
    header.insertAdjacentElement('afterend', successDiv);
    
    // Eliminar després de 5 segons
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}

// Simulació de la funcionalitat AJAX de WordPress
window.app.obtenirDetallsPlanta = async function(plantaId) {
    try {
        // Buscar la planta per ID
        const planta = window.app.plantes.find(p => 
            p.id === plantaId || 
            sanitizeTitle(p.nom_cientific) === plantaId ||
            p.nom_cientific.toLowerCase().replace(/\s+/g, '_') === plantaId
        );
        
        if (!planta) {
            throw new Error(`No s'ha trobat la planta amb ID: ${plantaId}`);
        }
        
        // Generar HTML dels detalls
        const htmlDetalls = generarHTMLDetallsPlanta(planta);
        
        return {
            success: true,
            data: htmlDetalls
        };
    } catch (error) {
        console.error('Error obtenint detalls de planta:', error);
        return {
            success: false,
            data: error.message
        };
    }
};

// Generar HTML dels detalls d'una planta
function generarHTMLDetallsPlanta(planta) {
    const plantaId = planta.id || sanitizeTitle(planta.nom_cientific);
    const imatges = obtenirImatgesPlanta(plantaId);
    
    let html = '<div class="planta-detall-individual">';
    
    // Informació principal
    html += `<h2>${escapeHtml(planta.nom_comu)}</h2>`;
    html += `<h3 class="nom-cientific">${escapeHtml(planta.nom_cientific)}</h3>`;
    
    // Galeria d'imatges
    html += '<div class="planta-galeria-completa">';
    
    // Imatge principal
    if (imatges.principal) {
        const imatgeUrl = obtenirURLImatge(imatges.principal);
        html += '<div class="planta-imatge-principal">';
        html += `<img src="${imatgeUrl}" alt="${escapeHtml(planta.nom_comu)}" data-tipus="${escapeHtml(imatges.principal_tipus)}" onerror="this.src='${CONFIG.imagesPath}default_planta.jpg'">`;
        if (imatges.principal_tipus !== 'general') {
            html += `<span class="planta-tipus-imatge-detall">${capitalitzar(imatges.principal_tipus)}</span>`;
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
            const imatgeUrl = obtenirURLImatge(imatge);
            const tipus = imatges.detalls_tipus[i] || 'general';
            html += '<div class="planta-imatge-detall" data-tipus="' + escapeHtml(tipus) + '">';
            html += `<img src="${imatgeUrl}" alt="Detall de ${escapeHtml(planta.nom_comu)}" data-tipus="${escapeHtml(tipus)}" onerror="this.src='${CONFIG.imagesPath}default_planta.jpg'">`;
            if (tipus !== 'general') {
                html += `<span class="planta-tipus-imatge-detall">${capitalitzar(tipus)}</span>`;
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
    html += `<p><strong>Tipus:</strong> ${capitalitzar(planta.tipus)}</p>`;
    html += '</div>';
    
    // Característiques
    if (planta.caracteristiques && Object.keys(planta.caracteristiques).length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Característiques</h4>';
        html += '<ul>';
        
        for (const [clau, valor] of Object.entries(planta.caracteristiques)) {
            if (valor !== null && valor !== undefined && valor !== '') {
                const clauFormatada = formatarClau(clau);
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
        html += `<p>${planta.colors.map(c => capitalitzar(escapeHtml(c))).join(', ')}</p>`;
        html += '</div>';
    }
    
    // Hàbitat
    if (planta.habitat && planta.habitat.length > 0) {
        html += '<div class="planta-seccio">';
        html += '<h4>Hàbitat al campus</h4>';
        html += '<ul>';
        planta.habitat.forEach(habitat => {
            const textHabitat = formatarHabitat(habitat);
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

// Funcions d'utilitat per formatació
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalitzar(text) {
    if (typeof text !== 'string') return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatarClau(clau) {
    return clau.replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
}

function formatarHabitat(habitat) {
    const parts = habitat.split('(');
    let habitatPrincipal = parts[0].trim().replace(/_/g, ' ');
    let textHabitat = capitalitzar(habitatPrincipal);
    
    if (parts.length > 1) {
        const detalls = parts[1].replace(')', '').trim().replace(/_/g, ' ');
        textHabitat += ` (${detalls})`;
    }
    
    return textHabitat;
}

function sanitizeTitle(text) {
    return text.toLowerCase()
               .replace(/\s+/g, '-')
               .replace(/[^a-z0-9\-]/g, '')
               .replace(/\-+/g, '-')
               .replace(/^-|-$/g, '');
}

// Gestió del modal
function obrirDetallsPlanta(plantaId) {
    const modal = document.querySelector('.planta-modal');
    if (!modal) return;
    
    // Mostrar loading al modal
    const modalCos = modal.querySelector('.planta-modal-cos');
    modalCos.innerHTML = '<div class="planta-carregant">Carregant informació...</div>';
    
    // Mostrar el modal
    modal.style.display = 'block';
    modal.classList.add('actiu');
    document.body.style.overflow = 'hidden';
    
    // Carregar detalls
    window.app.obtenirDetallsPlanta(plantaId).then(response => {
        if (response.success) {
            modalCos.innerHTML = response.data;
            activarLightbox();
        } else {
            modalCos.innerHTML = `<div class="planta-error">Error: ${response.data}</div>`;
        }
    });
}

function tancarModal() {
    const modal = document.querySelector('.planta-modal');
    if (modal && modal.classList.contains('actiu')) {
        modal.classList.remove('actiu');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Activar lightbox per a les imatges de detall (implementació simplificada)
function activarLightbox() {
    const imatges = document.querySelectorAll('.planta-imatge-detall img, .planta-imatge-principal img');
    
    imatges.forEach(img => {
        img.addEventListener('click', function() {
            // Implementació simplificada del lightbox
            const lightbox = document.createElement('div');
            lightbox.className = 'planta-lightbox actiu';
            lightbox.innerHTML = `
                <img src="${this.src}" alt="${this.alt}">
                <span class="planta-lightbox-tancar">&times;</span>
            `;
            
            document.body.appendChild(lightbox);
            
            // Tancar lightbox
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox || e.target.classList.contains('planta-lightbox-tancar')) {
                    document.body.removeChild(lightbox);
                }
            });
        });
    });
}
