/**
 * MAIN.JS - Galeria Botànica UAB Local
 * Controlador principal de l'aplicació
 * Gestiona: càrrega de dades, pestanyes, inicialització global, funcionalitats d'inici
 */

class GaleriaBotanicaApp {
    constructor() {
        this.dades = {
            plantes: null,
            diccionariImatges: null,
            geojsonHabitats: {}
        };
        
        this.components = {
            galeria: null,
            mapa: null
        };
        
        this.ui = {
            isLoading: true,
            currentTab: 'inici',
            scrollPosition: 0
        };
        
        this.init();
    }

    async init() {
        console.log('🌿 Inicialitzant Galeria Botànica UAB...');
        
        try {
            // Configurar esdeveniments de la pàgina
            this.setupPageEvents();
            
            // Configurar pestanyes
            this.setupTabs();
            
            // Configurar funcionalitats d'inici
            this.setupHomePage();
            
            // Configurar animacions i efectes
            this.setupAnimations();
            
            // Configurar navegació
            this.setupNavigation();
            
            // Carregar dades essencials (només quan es necessiti)
            await this.loadEssentialDataLazy();
            
            // Amagar loading després d'un temps mínim per veure l'animació
            setTimeout(() => {
                this.hidePageLoader();
            }, 1200);
            
            console.log('✅ Aplicació inicialitzada correctament');
            
        } catch (error) {
            console.error('❌ Error inicialitzant l\'aplicació:', error);
            this.showError('Error carregant l\'aplicació. Comprova que tots els fitxers estiguin disponibles.');
        }
    }

    /**
     * Configurar esdeveniments de la pàgina
     */
    setupPageEvents() {
        // Page Loader
        window.addEventListener('load', () => {
            // Assegurar temps mínim de loading per UX
            if (this.ui.isLoading) {
                setTimeout(() => {
                    this.hidePageLoader();
                }, 800);
            }
        });

        // Back to top button
        this.setupBackToTop();

        // Scroll effects
        this.setupScrollEffects();

        // Responsive handlers
        this.setupResponsiveHandlers();

        // Error handling
        this.setupErrorHandling();
    }

    /**
     * Configuració del sistema de pestanyes
     */
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = button.dataset.tab;
                this.switchToTab(targetTab);
            });
        });

        // Configurar botons CTA de la pàgina d'inici
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-switch') || e.target.closest('.tab-switch')) {
                const button = e.target.matches('.tab-switch') ? e.target : e.target.closest('.tab-switch');
                const targetTab = button.dataset.target;
                if (targetTab) {
                    this.switchToTab(targetTab);
                }
            }
        });
    }

    /**
     * Canviar a una pestanya específica
     */
    switchToTab(targetTab) {
        console.log(`🔄 Canviant a pestanya: ${targetTab}`);
        
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        // Actualitzar botons
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === targetTab) {
                btn.classList.add('active');
            }
        });
        
        // Actualitzar panells
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `${targetTab}-tab`) {
                panel.classList.add('active');
            }
        });
        
        // Actualitzar estat
        this.ui.currentTab = targetTab;
        
        // Carregar component si cal
        this.loadTabComponent(targetTab);
        
        // Trigger resize en cas que el mapa necessiti reajustar-se
        if (targetTab === 'mapa' && this.components.mapa) {
            setTimeout(() => {
                if (this.components.mapa.map && this.components.mapa.map.invalidateSize) {
                    this.components.mapa.map.invalidateSize();
                }
            }, 100);
        }

        // Scroll suau a dalt
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Carregar component de pestanya si cal
     */
    async loadTabComponent(tab) {
        if (tab === 'galeria' && !this.components.galeria) {
            console.log('🌿 Inicialitzant galeria...');
            await this.loadEssentialData();
            if (typeof GaleriaBotanica !== 'undefined') {
                this.components.galeria = new GaleriaBotanica();
                console.log('✅ Galeria inicialitzada amb dades');
            }
        } else if (tab === 'mapa' && !this.components.mapa) {
            console.log('🗺️ Inicialitzant mapa...');
            await this.loadEssentialData();
            setTimeout(() => {
                if (typeof MapaBotanica !== 'undefined') {
                    this.components.mapa = new MapaBotanica();
                    console.log('✅ Mapa inicialitzat amb dades');
                }
            }, 100);
        }
    }

    /**
     * Configurar funcionalitats específiques de la pàgina d'inici
     */
    setupHomePage() {
        // Animació dels números de les estadístiques
        this.setupStatsAnimation();
        
        // Efectes hover personalitzats
        this.setupHoverEffects();
        
        // Efectes de paral·laxi
        this.setupParallaxEffects();
        
        // Efectes de scroll reveal
        this.setupScrollReveal();
    }

    /**
     * Configurar animació de les estadístiques
     */
    setupStatsAnimation() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStatNumbers(entry.target);
                    observer.unobserve(entry.target); // Animar només una vegada
                }
            });
        }, observerOptions);
        
        // Observar la secció d'estadístiques
        const statsSection = document.querySelector('.stats-preview');
        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    /**
     * Animar números de les estadístiques
     */
    animateStatNumbers(container) {
        const statNumbers = container.querySelectorAll('.stat-number');
        
        statNumbers.forEach(statNumber => {
            const text = statNumber.textContent;
            const number = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/\d/g, '');
            const duration = 2500; // 2.5 segons
            const increment = number / (duration / 16); // 60 FPS
            
            let current = 0;
            const updateNumber = () => {
                if (current < number) {
                    current += increment;
                    const value = Math.min(Math.floor(current), number);
                    statNumber.textContent = value + suffix;
                    requestAnimationFrame(updateNumber);
                } else {
                    statNumber.textContent = text; // Valor final
                }
            };
            
            updateNumber();
        });
    }

    /**
     * Configurar efectes hover personalitzats
     */
    setupHoverEffects() {
        // Feature cards amb efectes 3D
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-15px) scale(1.02)';
                card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Stat items amb efectes personalitzats
        document.querySelectorAll('.stat-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });

        // CTA buttons amb efectes brillants
        document.querySelectorAll('.cta-button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                const shine = button.querySelector('.cta-shine');
                if (shine) {
                    shine.style.transform = 'translateX(200%)';
                }
            });
            
            button.addEventListener('mouseleave', () => {
                const shine = button.querySelector('.cta-shine');
                if (shine) {
                    setTimeout(() => {
                        shine.style.transform = 'translateX(-100%)';
                    }, 200);
                }
            });
        });
    }

    /**
     * Configurar efectes de paral·laxi
     */
    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            // Parallax per la capçalera
            const header = document.querySelector('.header');
            if (header && scrolled < window.innerHeight) {
                const rate = scrolled * 0.3;
                header.style.transform = `translateY(${rate}px)`;
            }
            
            // Parallax per elements decoratius
            document.querySelectorAll('.decoration-leaf').forEach((leaf, index) => {
                const speed = 0.1 + (index * 0.05);
                leaf.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    /**
     * Configurar efectes de scroll reveal
     */
    setupScrollReveal() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observar elements per fade-in effect
        document.querySelectorAll('.feature-card, .stat-item, .inici-description').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }

    /**
     * Configurar animacions generals
     */
    setupAnimations() {
        // Animacions CSS personalitzades ja definides als estils
        console.log('🎨 Animacions configurades');
    }

    /**
     * Configurar navegació i scroll
     */
    setupNavigation() {
        // Smooth scrolling per enllaços interns
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const offset = 100;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Configurar botó back to top
     */
    setupBackToTop() {
        const backToTop = document.getElementById('backToTop');
        
        if (backToTop) {
            // Mostrar/amagar el botó segons el scroll
            window.addEventListener('scroll', () => {
                const currentScrollY = window.scrollY;
                
                if (currentScrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            });

            // Funcionalitat de scroll cap a dalt
            backToTop.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // Efecte ripple al clic
            backToTop.addEventListener('mousedown', (e) => {
                const ripple = backToTop.querySelector('.back-to-top-ripple');
                if (ripple) {
                    ripple.style.width = '0';
                    ripple.style.height = '0';
                    setTimeout(() => {
                        ripple.style.width = '100px';
                        ripple.style.height = '100px';
                    }, 50);
                }
            });

            console.log('⬆️ Botó back-to-top configurat correctament');
        } else {
            console.warn('⚠️ Element back-to-top no trobat');
        }
    }

    /**
     * Configurar efectes de scroll
     */
    setupScrollEffects() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            this.ui.scrollPosition = window.pageYOffset;
            
            // Aquí pots afegir més efectes de scroll si cal
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        });
    }

    /**
     * Configurar handlers responsive
     */
    setupResponsiveHandlers() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Reajustar mapa si està actiu
                if (this.ui.currentTab === 'mapa' && this.components.mapa && this.components.mapa.map) {
                    this.components.mapa.map.invalidateSize();
                }
            }, 250);
        });
    }

    /**
     * Configurar gestió d'errors
     */
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('❌ Error global captat:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('❌ Promise rebutjada:', e.reason);
        });
    }

    /**
     * Amagar loader de pàgina
     */
    hidePageLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('hidden');
            this.ui.isLoading = false;
            
            // Eliminar loader del DOM després de l'animació
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 800);
        }
    }

    /**
     * Càrrega lazy de dades essencials
     */
    async loadEssentialDataLazy() {
        // Només carregar dades quan sigui necessari
        console.log('🔄 Preparant càrrega lazy de dades...');
    }

    /**
     * Carregar dades essencials (quan es necessiti)
     */
    async loadEssentialData() {
        if (this.dades.plantes && this.dades.diccionariImatges) {
            console.log('📋 Dades ja carregades, reutilitzant...');
            return; // Ja carregades
        }

        console.log('📊 Carregant dades essencials...');
        
        try {
            const promises = [
                this.loadJSON('dades/plantes.json'),
                this.loadJSON('dades/diccionari-imatges.json')
            ];
            
            const [plantesData, diccionariData] = await Promise.all(promises);
            
            this.dades.plantes = plantesData.plantes || plantesData;
            this.dades.diccionariImatges = diccionariData;
            
            console.log(`✅ Carregades ${this.dades.plantes.length} plantes`);
            console.log(`✅ Diccionari d'imatges amb ${Object.keys(this.dades.diccionariImatges).length} entrades`);
            
            // Carregar GeoJSON files (opcional)
            await this.loadGeoJSONFiles();
            
            // Crear variables globals IMMEDIATAMENT després de carregar dades
            this.createGlobalVariables();
            
            console.log('🎯 Dades carregades i variables globals creades');
            
        } catch (error) {
            console.error('❌ Error carregant dades essencials:', error);
            throw error;
        }
    }

    /**
     * Crear variables globals per als components
     */
    createGlobalVariables() {
        // Assegurar que window.galeriaBotanicaApp estigui disponible
        window.galeriaBotanicaApp = this;
        
        window.gb_vars = {
            ajaxurl: null, // No necessari en versió local
            dades_plantes: this.dades.plantes,
            diccionari_imatges: this.dades.diccionariImatges,
            geojson_habitats: this.dades.geojsonHabitats
        };
        
        window.mb_vars = {
            plugin_url: '.',
            dades_plantes: this.prepareMapData(),
            geojson_habitats: this.dades.geojsonHabitats
        };
        
        console.log('🌐 Variables globals creades:', {
            plantes: this.dades.plantes?.length || 0,
            imatges: Object.keys(this.dades.diccionariImatges || {}).length,
            geojson: Object.keys(this.dades.geojsonHabitats).length
        });
    }

    /**
     * Càrrega de fitxers GeoJSON
     */
    async loadGeoJSONFiles() {
        const geojsonFiles = [
            'cami_ho_chi_minh.geojson',
            'torrent_can_domenech.geojson',
            'camins.geojson',
            'eix_central.geojson',
            'purament_assolellades.geojson',
            'vegetacio_ribera.geojson',
            'zones_ombrivoles.geojson'
        ];
        
        console.log(`🗺️ Intentant carregar ${geojsonFiles.length} fitxers GeoJSON...`);
        let fitxersCarregats = 0;
        
        for (const file of geojsonFiles) {
            try {
                const data = await this.loadJSON(`dades/geojson/${file}`);
                const key = file.replace('.geojson', '');
                this.dades.geojsonHabitats[key] = data;
                fitxersCarregats++;
                console.log(`✅ GeoJSON carregat: ${file}`);
            } catch (error) {
                console.log(`⚠️  GeoJSON no disponible: ${file} (normal si no tens fitxers d'hàbitat)`);
            }
        }
        
        console.log(`📊 GeoJSON carregats: ${fitxersCarregats}/${geojsonFiles.length}`);
    }

    /**
     * Preparar dades per al mapa
     */
    prepareMapData() {
        if (!this.dades.plantes) return [];
        
        return this.dades.plantes.map(planta => {
            const imatges = this.obtenirImatgesPlanta(planta.nom_cientific);
            const img_url = imatges.principal ? `dades/imatges/${imatges.principal}` : '';
            
            return {
                ...planta,
                imatge: img_url,
                colors_norm: this.normalizeArray(planta.colors),
                habitat_norm: this.normalizeArray(planta.habitat),
                floracio_norm: this.normalizeArray(planta.caracteristiques?.floracio),
                usos_norm: this.normalizeArray(planta.usos),
                info_completa: this.buildSearchText(planta)
            };
        });
    }

    /**
     * Obtenir imatges d'una planta
     */
    obtenirImatgesPlanta(nomCientific) {
        if (!this.dades.diccionariImatges) return { principal: null, principal_tipus: 'general', detalls: [], detalls_tipus: [] };
        
        const nomBase = nomCientific.toLowerCase().replace(/\s+/g, '_');
        const entrada = this.dades.diccionariImatges[nomBase];
        
        if (entrada) {
            return {
                principal: entrada.principal,
                principal_tipus: this.extractImageType(entrada.principal),
                detalls: entrada.detalls?.map(d => d.nom) || [],
                detalls_tipus: entrada.detalls?.map(d => d.tipus) || []
            };
        }
        
        // Fallback: buscar per coincidència parcial
        const claus = Object.keys(this.dades.diccionariImatges);
        const coincidencia = claus.find(clau => 
            clau.includes(nomBase) || nomBase.includes(clau)
        );
        
        if (coincidencia) {
            const entradaCoincidencia = this.dades.diccionariImatges[coincidencia];
            return {
                principal: entradaCoincidencia.principal,
                principal_tipus: this.extractImageType(entradaCoincidencia.principal),
                detalls: entradaCoincidencia.detalls?.map(d => d.nom) || [],
                detalls_tipus: entradaCoincidencia.detalls?.map(d => d.tipus) || []
            };
        }
        
        return {
            principal: null,
            principal_tipus: 'general',
            detalls: [],
            detalls_tipus: []
        };
    }

    /**
     * Extreure tipus d'imatge del nom del fitxer
     */
    extractImageType(filename) {
        if (!filename) return 'general';
        
        const match = filename.match(/_\d+_([a-zA-Z]+)\.(jpg|jpeg|png|webp)$/i);
        if (match && match[1]) {
            const tipus = match[1].toLowerCase();
            
            const tipusMapping = {
                'flor': 'flor', 'flower': 'flor',
                'fulla': 'fulla', 'leaf': 'fulla',
                'fruit': 'fruit',
                'tija': 'escorça', 'stem': 'escorça', 'bark': 'escorça',
                'habit': 'hàbit', 'habitus': 'hàbit',
                'escorca': 'escorça', 'escorça': 'escorça',
                'arrel': 'arrel', 'root': 'arrel',
                'llavor': 'llavor', 'seed': 'llavor',
                'altra': 'altre', 'other': 'altre'
            };
            
            return tipusMapping[tipus] || tipus;
        }
        
        return 'general';
    }

    /**
     * Normalitzar arrays per als filtres
     */
    normalizeArray(data) {
        if (!data) return [];
        
        const array = Array.isArray(data) ? data : [data];
        return array.map(item => 
            item.toString()
                .toLowerCase()
                .replace(/\s*\(.*?\)\s*/g, '')
                .replace(/\s+/g, '_')
        );
    }

    /**
     * Construir text per a cerca
     */
    buildSearchText(planta) {
        let text = [
            planta.nom_comu,
            planta.nom_cientific,
            planta.familia,
            planta.descripcio,
            planta.tipus
        ].join(' ');
        
        if (planta.caracteristiques) {
            Object.values(planta.caracteristiques).forEach(valor => {
                if (Array.isArray(valor)) {
                    text += ' ' + valor.join(' ');
                } else {
                    text += ' ' + valor;
                }
            });
        }
        
        ['usos', 'colors', 'habitat'].forEach(camp => {
            if (planta[camp]) {
                const values = Array.isArray(planta[camp]) ? planta[camp] : [planta[camp]];
                text += ' ' + values.map(v => 
                    v.replace(/\s*\(.*?\)\s*/g, '')
                ).join(' ');
            }
        });
        
        return text.toLowerCase();
    }

    /**
     * Carregar fitxer JSON
     */
    async loadJSON(url) {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error carregant ${url}: ${response.status}`);
        }
        
        return await response.json();
    }

    /**
     * Mostrar loading
     */
    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.hidePageLoader();
        
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.querySelector('p').textContent = message;
            errorEl.style.display = 'block';
        }
        
        console.error('❌ Error mostrat a l\'usuari:', message);
    }

    /**
     * Funcions d'utilitat per als components
     */
    static obtenirDetallsPlanta(plantaId) {
        console.log('🔍 Buscant detalls per:', plantaId);
        
        const app = window.galeriaBotanicaApp;
        if (!app) {
            console.error('❌ window.galeriaBotanicaApp no disponible');
            return null;
        }
        
        if (!app.dades.plantes) {
            console.error('❌ Dades de plantes no carregades');
            return null;
        }
        
        const planta = app.dades.plantes.find(p => 
            p.id === plantaId || 
            app.sanitizeTitle(p.nom_cientific) === plantaId
        );
        
        if (!planta) {
            console.error('❌ Planta no trobada:', plantaId);
            console.log('📋 Plantes disponibles:', app.dades.plantes.map(p => ({ id: p.id, nom: p.nom_cientific, sanitized: app.sanitizeTitle(p.nom_cientific) })));
            return null;
        }
        
        const imatges = app.obtenirImatgesPlanta(planta.nom_cientific);
        
        console.log('✅ Detalls trobats per:', planta.nom_comu);
        
        return {
            planta: planta,
            imatges: imatges
        };
    }

    /**
     * Sanititzar títol
     */
    sanitizeTitle(title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '');
    }
}

/**
 * Inicialització quan el DOM estigui carregat
 */
document.addEventListener('DOMContentLoaded', () => {
    // Crear la instància principal
    window.galeriaBotanicaApp = new GaleriaBotanicaApp();
    
    // Assegurar que la referència estigui disponible globalment
    console.log('🌍 Instància principal creada i disponible globalment');
});

/**
 * Easter eggs i funcionalitats extra
 */
document.addEventListener('DOMContentLoaded', () => {
    // Easter egg: click logo 5 vegades per efecte rainbow
    let clickCount = 0;
    const logos = document.querySelectorAll('.centraleta-logo, .footer-logo-img');
    
    logos.forEach(logo => {
        logo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                document.body.style.animation = 'rainbow 2s ease-in-out';
                setTimeout(() => {
                    document.body.style.animation = '';
                    clickCount = 0;
                }, 2000);
            }
        });
    });
    
    // Afegir animació rainbow
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            25% { filter: hue-rotate(90deg); }
            50% { filter: hue-rotate(180deg); }
            75% { filter: hue-rotate(270deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    console.log('🌈 Easter eggs activats! Fes clic 5 vegades al logo...');
});

console.log('🌿 Galeria Botànica UAB - Sistema carregat correctament');
