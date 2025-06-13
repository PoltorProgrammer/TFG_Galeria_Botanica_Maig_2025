/* =============================================================================
   MAIN CSS - Galeria Botànica UAB Local
   Estils base, layout i sistema de pestanyes
   ========================================================================== */

/* Variables CSS */
:root {
    --primary-green: #2d5a27;
    --secondary-green: #4a9960;
    --accent-green: #6ab04c;
    --light-green: #a8e6a3;
    --uab-blue: #003d6b;
    --uab-gold: #f5b800;
    --dark: #1a1a1a;
    --light: #f8f9fa;
    --white: #ffffff;
    --shadow-light: 0 4px 20px rgba(0,0,0,0.08);
    --shadow-medium: 0 8px 30px rgba(0,0,0,0.12);
    --shadow-heavy: 0 20px 60px rgba(0,0,0,0.15);
    --gradient-primary: linear-gradient(135deg, var(--primary-green) 0%, var(--secondary-green) 50%, var(--accent-green) 100%);
    --gradient-glass: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    --transition: all 0.3s ease;
    --border-radius: 8px;
    
    /* Variables de compatibilitat amb el sistema original */
    --primary-color: #4CAF50;
    --primary-dark: #388E3C;
    --secondary-color: #2196F3;
    --background-color: #f8f9fa;
    --text-color: #333;
    --border-color: #e0e0e0;
    --shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Reset i base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.7;
    color: var(--dark);
    overflow-x: hidden;
    scroll-behavior: smooth;
    background-color: var(--light);
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-track {
    background: var(--light);
}

::-webkit-scrollbar-thumb {
    background: var(--accent-green);
    border-radius: 10px;
    border: 2px solid var(--light);
}

::-webkit-scrollbar-thumb:hover {
    background: var(--primary-green);
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
}

/* =============================================================================
   ENHANCED HEADER DESIGN
   ========================================================================== */

.header {
    text-align: center;
    margin-bottom: 30px;
    padding: 80px 0;
    position: relative;
    overflow: hidden;
    border-radius: 25px;
    box-shadow: var(--shadow-heavy);
    background: 
        linear-gradient(135deg, rgba(45, 90, 39, 0.85) 0%, rgba(74, 153, 96, 0.75) 50%, rgba(106, 176, 76, 0.85) 100%),
        url('https://natura.ues.cat/sites/default/files/styles/imatge_ampliada/public/users/FonsDocumental/2021-04-18%20Rodal%20-%20UAB%20229.JPG?itok=1BfhuX6K') center/cover;
    background-attachment: scroll;
}

.header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
        url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="botanical-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><g opacity="0.15"><circle cx="10" cy="10" r="2" fill="white"/><circle cx="30" cy="30" r="1.5" fill="white"/><path d="M15,15 Q20,10 25,15 Q20,20 15,15" fill="white"/><path d="M35,5 C38,8 38,12 35,15" fill="white" stroke="white" stroke-width="0.5"/></g></pattern></defs><rect fill="url(%23botanical-pattern)" width="100" height="100"/></svg>');
    animation: headerPattern 30s ease-in-out infinite;
    z-index: 1;
}

@keyframes headerPattern {
    0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
    25% { transform: translateX(-10px) translateY(-5px) rotate(0.5deg); }
    50% { transform: translateX(10px) translateY(10px) rotate(-0.5deg); }
    75% { transform: translateX(-5px) translateY(5px) rotate(0.3deg); }
}

.header-content {
    position: relative;
    z-index: 2;
    color: white;
}

.centraleta-link {
    display: inline-block;
    margin-bottom: 2rem;
    transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    position: relative;
}

.centraleta-link::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 4px;
    background: var(--uab-gold);
    border-radius: 2px;
    opacity: 0;
    transition: all 0.5s ease;
}

.centraleta-link:hover {
    transform: scale(1.2) translateY(-10px);
}

.centraleta-link:hover::after {
    width: 70px;
    opacity: 1;
}

.centraleta-logo {
    width: 110px;
    height: 110px;
    object-fit: contain;
    filter: drop-shadow(0 10px 25px rgba(0,0,0,0.4));
    transition: all 0.5s ease;
    background: rgba(255,255,255,0.12) !important;
    border-radius: 50%;
    padding: 12px;
    position: relative;
    z-index: 2;
}

.centraleta-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(245, 184, 0, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.5s ease;
    z-index: 1;
}

.centraleta-link:hover .centraleta-logo {
    filter: drop-shadow(0 15px 35px rgba(245, 184, 0, 0.7));
    background: rgba(255,255,255,0.2) !important;
}

.centraleta-link:hover .centraleta-glow {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
}

.header-title {
    font-size: clamp(2.5rem, 6vw, 4.2rem);
    font-weight: 900;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
    position: relative;
}

.title-line {
    display: block;
    background: linear-gradient(45deg, #ffffff 0%, #a8e6a3 50%, #ffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 8px 30px rgba(0,0,0,0.3);
    animation: titleShimmer 3s ease-in-out infinite;
}

.title-accent {
    background: linear-gradient(45deg, var(--uab-gold) 0%, #ffd700 50%, var(--uab-gold) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 1.2em;
    animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titleShimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.9; }
}

@keyframes titlePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.header-subtitle {
    font-size: 1.3rem;
    opacity: 0.95;
    max-width: 800px;
    margin: 0 auto 2rem;
    font-weight: 300;
    text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    line-height: 1.6;
}

.header-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 1;
}

.decoration-leaf {
    position: absolute;
    font-size: 2rem;
    opacity: 0.3;
    animation: leafFloat 8s ease-in-out infinite;
}

.decoration-leaf-1 {
    top: 20%;
    left: 15%;
    animation-delay: 0s;
}

.decoration-leaf-2 {
    top: 60%;
    right: 20%;
    animation-delay: 2s;
}

.decoration-leaf-3 {
    bottom: 30%;
    left: 25%;
    animation-delay: 4s;
}

@keyframes leafFloat {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
    25% { transform: translateY(-15px) rotate(5deg); opacity: 0.5; }
    50% { transform: translateY(-8px) rotate(-3deg); opacity: 0.4; }
    75% { transform: translateY(-12px) rotate(2deg); opacity: 0.6; }
}

/* =============================================================================
   ENHANCED NAVIGATION TABS
   ========================================================================== */

.tabs-nav {
    display: flex;
    gap: 8px;
    margin-bottom: 30px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(15px);
    padding: 10px;
    border-radius: 20px;
    box-shadow: var(--shadow-medium);
    border: 2px solid rgba(76, 175, 80, 0.2);
    position: relative;
    overflow: hidden;
}

.tabs-nav::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.05), transparent);
    animation: tabsGlow 4s ease-in-out infinite;
}

@keyframes tabsGlow {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
}

.tab-button {
    flex: 1;
    padding: 18px 25px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    border-radius: 15px;
    transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--dark);
    position: relative;
    overflow: hidden;
    z-index: 2;
}

.tab-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--gradient-primary);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: -1;
}

.tab-icon {
    font-size: 1.5rem;
    transition: all 0.3s ease;
}

.tab-text {
    font-size: 0.9rem;
    transition: all 0.3s ease;
}

.tab-indicator {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: var(--uab-gold);
    border-radius: 2px;
    transition: all 0.4s ease;
}

.tab-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.tab-button:hover::before {
    opacity: 0.1;
}

.tab-button:hover .tab-icon {
    transform: scale(1.1);
}

.tab-button:hover .tab-indicator {
    width: 40px;
}

.tab-button.active {
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(76, 175, 80, 0.5);
}

.tab-button.active::before {
    opacity: 1;
}

.tab-button.active .tab-indicator {
    width: 60px;
    background: var(--uab-gold);
}

/* =============================================================================
   TAB CONTENT
   ========================================================================== */

.tab-content {
    position: relative;
}

.tab-panel {
    display: none;
    animation: fadeIn 0.5s ease-in;
}

.tab-panel.active {
    display: block;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* =============================================================================
   PÀGINA D'INICI - ESTILS ESPECÍFICS
   ========================================================================== */

.inici-content {
    padding: 2rem 0;
}

.inici-description {
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(20px);
    padding: 3rem;
    border-radius: 25px;
    border: 2px solid rgba(76, 175, 80, 0.3);
    margin: 0 auto 4rem;
    box-shadow: var(--shadow-medium);
    line-height: 1.8;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.inici-description::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-primary);
    border-radius: 25px 25px 0 0;
}

.inici-welcome {
    color: var(--primary-green);
    margin-bottom: 1.5rem;
    font-size: 2.2rem;
    font-weight: 800;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.inici-intro {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
    color: var(--secondary-green);
    font-weight: 600;
}

.inici-explanation {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
    color: #555;
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
}

.cta-buttons {
    display: flex;
    gap: 2rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 3rem;
}

.cta-button {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 35px;
    background: var(--gradient-primary);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
    font-size: 1rem;
    border: none;
    cursor: pointer;
    font-family: inherit;
    position: relative;
    overflow: hidden;
}

.cta-shine {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: transform 0.6s ease;
}

.cta-button:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.6);
}

.cta-button:hover .cta-shine {
    transform: translateX(200%);
}

.cta-icon {
    font-size: 1.2rem;
}

.cta-text {
    font-weight: 700;
}

/* =============================================================================
   ESTADÍSTIQUES PREVIEW
   ========================================================================== */

.stats-preview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 2rem;
    margin: 4rem 0;
}

.stat-item {
    text-align: center;
    padding: 2.5rem 2rem;
    background: rgba(255,255,255,0.98);
    border-radius: 20px;
    box-shadow: var(--shadow-light);
    transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    border: 1px solid rgba(76, 175, 80, 0.2);
    position: relative;
    overflow: hidden;
}

.stat-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient-primary);
    transform: scaleX(0);
    transition: transform 0.4s ease;
}

.stat-item:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--shadow-medium);
    border-color: var(--accent-green);
}

.stat-item:hover::before {
    transform: scaleX(1);
}

.stat-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    display: block;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1));
}

.stat-number {
    font-size: 2.8rem;
    font-weight: 900;
    color: var(--primary-green);
    display: block;
    margin-bottom: 0.5rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.stat-label {
    color: #666;
    font-weight: 500;
    font-size: 1rem;
}

/* =============================================================================
   FEATURES GRID
   ========================================================================== */

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2.5rem;
    margin-top: 4rem;
}

.feature-card {
    background: rgba(255,255,255,0.98);
    backdrop-filter: blur(15px);
    padding: 3rem 2.5rem;
    border-radius: 25px;
    box-shadow: var(--shadow-light);
    transition: all 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
    border: 1px solid rgba(76, 175, 80, 0.2);
    text-align: center;
    position: relative;
    overflow: hidden;
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--gradient-primary);
    transform: scaleX(0);
    transition: transform 0.4s ease;
}

.feature-card:hover {
    transform: translateY(-15px) scale(1.02);
    box-shadow: var(--shadow-heavy);
    border-color: var(--accent-green);
}

.feature-card:hover::before {
    transform: scaleX(1);
}

.feature-icon {
    font-size: 3.5rem;
    margin-bottom: 1.5rem;
    display: block;
    filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));
    transition: all 0.4s ease;
}

.feature-card:hover .feature-icon {
    transform: scale(1.1) translateY(-5px);
}

.feature-title {
    color: var(--primary-green);
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
}

.feature-card:hover .feature-title {
    color: var(--accent-green);
}

.feature-description {
    color: #555;
    line-height: 1.7;
    font-size: 1rem;
}

/* =============================================================================
   PAGE LOADER
   ========================================================================== */

.page-loader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--white);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.8s ease, visibility 0.8s ease;
}

.page-loader.hidden {
    opacity: 0;
    visibility: hidden;
}

.loader-animation {
    width: 120px;
    height: 120px;
    position: relative;
}

.loader-circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 6px solid transparent;
    border-radius: 50%;
    border-top-color: var(--primary-green);
    animation: spin 1.5s linear infinite;
}

.loader-circle:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: var(--accent-green);
    animation-duration: 2s;
    animation-direction: reverse;
}

.loader-circle:nth-child(3) {
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border-top-color: var(--uab-gold);
    animation-duration: 1.2s;
}

.loader-logo {
    position: absolute;
    width: 35%;
    height: 35%;
    top: 32.5%;
    left: 32.5%;
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z"/></svg>');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.8; }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* =============================================================================
   LOADING INDICATOR (ORIGINAL COMPATIBILITY)
   ========================================================================== */

.loading {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9998;
    backdrop-filter: blur(5px);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20px;
}

.loading p {
    font-size: 1.1rem;
    color: var(--text-color);
}

/* =============================================================================
   FOOTER
   ========================================================================== */

.footer {
    background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
    color: white;
    text-align: center;
    padding: 4rem 0;
    position: relative;
    margin-top: 5rem;
}

.footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--gradient-primary);
}

.footer-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
}

.footer-logo-link {
    display: inline-block;
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
    transition: all 0.5s ease;
    text-decoration: none;
    position: relative;
}

.footer-logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 5px 15px rgba(255,255,255,0.4));
    transition: all 0.5s ease;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
}

.footer-logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100px;
    height: 100px;
    background: radial-gradient(circle, rgba(245, 184, 0, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.5s ease;
    z-index: -1;
}

.footer-logo-link:hover {
    transform: scale(1.2) rotateY(360deg);
}

.footer-logo-link:hover .footer-logo-img {
    filter: drop-shadow(0 10px 25px rgba(245, 184, 0, 0.8));
}

.footer-logo-link:hover .footer-logo-glow {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
}

.footer-copyright {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}

.footer-info {
    opacity: 0.8;
    font-size: 1rem;
}

.footer-title {
    font-size: 1.2rem;
    margin-top: 1rem;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 600;
}

/* =============================================================================
   BACK TO TOP BUTTON
   ========================================================================== */

.back-to-top {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px) scale(0.8);
    transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
    border: none;
    cursor: pointer;
    z-index: 9999;
    font-size: 1.5rem;
    font-weight: bold;
    position: fixed;
    overflow: hidden;
}

.back-to-top-ripple {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transition: all 0.6s ease;
    pointer-events: none;
}

.back-to-top.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
}

.back-to-top:hover {
    transform: translateY(-8px) scale(1.1);
    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.6);
    background: linear-gradient(135deg, var(--accent-green), var(--primary-green));
}

.back-to-top:hover .back-to-top-ripple {
    width: 80px;
    height: 80px;
}

.back-to-top:active {
    transform: translateY(-6px) scale(1.05);
}

.back-to-top-icon {
    font-size: 1.5rem;
    transition: transform 0.3s ease;
    z-index: 2;
    position: relative;
    pointer-events: none;
}

.back-to-top:hover .back-to-top-icon {
    transform: translateY(-3px);
}

/* =============================================================================
   ERROR MESSAGE
   ========================================================================== */

.error-message {
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, #ffe0e0, #ffebeb);
    border: 2px solid #d32f2f;
    border-radius: var(--border-radius);
    color: #d32f2f;
    margin: 40px 0;
    box-shadow: var(--shadow-light);
}

.error-message h3 {
    margin-bottom: 10px;
    font-size: 1.5rem;
}

/* =============================================================================
   MODAL BASE (COMPARTIT ENTRE GALERIA I MAPA)
   ========================================================================== */

.planta-modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.7);
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(3px);
}

.planta-modal.actiu {
    opacity: 1;
}

.planta-modal-contingut {
    background-color: #fefefe;
    margin: 3% auto;
    padding: 0;
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 1000px;
    animation: modalSlideDown 0.4s ease;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

@keyframes modalSlideDown {
    from {
        transform: translateY(-50px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.planta-modal-tancar {
    position: absolute;
    top: 15px;
    right: 20px;
    color: #666;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    z-index: 1001;
    background: rgba(255, 255, 255, 0.9);
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.planta-modal-tancar:hover {
    background: rgba(255, 255, 255, 1);
    color: var(--primary-color);
    transform: scale(1.1);
}

.planta-modal-cos {
    padding: 20px;
    max-height: 80vh;
    overflow-y: auto;
}

/* Scrollbar personalitzat per modal */
.planta-modal-cos::-webkit-scrollbar {
    width: 8px;
}

.planta-modal-cos::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.planta-modal-cos::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: 4px;
}

.planta-modal-cos::-webkit-scrollbar-thumb:hover {
    background: var(--primary-dark);
}

/* =============================================================================
   RESPONSIVE DESIGN
   ========================================================================== */

@media (max-width: 992px) {
    .container {
        padding: 0 1.5rem;
    }

    .header {
        padding: 50px 20px;
    }

    .header-title {
        font-size: 2.8rem;
    }

    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 2rem;
    }

    .stats-preview {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .planta-modal-contingut {
        width: 95%;
        margin: 5% auto;
    }
    
    .planta-modal-cos {
        padding: 15px;
    }
}

@media (max-width: 768px) {
    .container {
        padding: 0 1rem;
    }

    .header {
        padding: 40px 20px;
        margin-bottom: 20px;
    }

    .header-title {
        font-size: 2.2rem;
    }

    .header-subtitle {
        font-size: 1.1rem;
        padding: 0 1rem;
    }

    .centraleta-logo {
        width: 90px !important;
        height: 90px !important;
    }

    .tabs-nav {
        padding: 8px;
        margin-bottom: 20px;
    }

    .tab-button {
        padding: 15px 20px;
        font-size: 14px;
    }

    .tab-text {
        font-size: 0.8rem;
    }

    .tab-icon {
        font-size: 1.3rem;
    }

    .inici-description {
        padding: 2rem 1.5rem;
        margin: 0 1rem 3rem;
    }

    .inici-welcome {
        font-size: 1.8rem;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .feature-card {
        padding: 2.5rem 2rem;
    }

    .cta-buttons {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .stats-preview {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin: 3rem 0;
    }

    .stat-item {
        padding: 2rem 1.5rem;
    }

    .stat-number {
        font-size: 2.2rem;
    }

    .footer {
        padding: 3rem 0;
        margin-top: 3rem;
    }

    .footer-logo-link {
        width: 70px;
        height: 70px;
    }

    .back-to-top {
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        font-size: 1.3rem;
    }
}

@media (max-width: 480px) {
    .header {
        padding: 30px 15px;
    }

    .header-title {
        font-size: 1.9rem;
    }

    .header-subtitle {
        font-size: 1rem;
    }

    .centraleta-logo {
        width: 80px !important;
        height: 80px !important;
    }

    .tabs-nav {
        padding: 6px;
        gap: 4px;
    }

    .tab-button {
        padding: 12px 15px;
        gap: 6px;
    }

    .tab-text {
        font-size: 0.75rem;
    }

    .tab-icon {
        font-size: 1.2rem;
    }

    .inici-description {
        padding: 1.8rem 1.2rem;
    }

    .inici-welcome {
        font-size: 1.6rem;
    }

    .cta-button {
        padding: 15px 30px;
        font-size: 0.9rem;
    }

    .feature-card {
        padding: 2rem 1.5rem;
    }

    .feature-icon {
        font-size: 3rem;
    }

    .stats-preview {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.8rem;
    }

    .stat-item {
        padding: 1.5rem 1rem;
    }

    .stat-number {
        font-size: 2rem;
    }

    .stat-icon {
        font-size: 2rem;
    }

    .footer {
        padding: 2.5rem 0;
    }

    .footer-logo-link {
        width: 60px;
        height: 60px;
    }

    .back-to-top {
        bottom: 15px;
        right: 15px;
        width: 45px;
        height: 45px;
        font-size: 1.2rem;
    }
}

/* =============================================================================
   ANIMATION UTILITIES
   ========================================================================== */

.fade-in {
    animation: fadeIn 1s ease-in;
}

.slide-up {
    animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

/* Force remove any unwanted backgrounds */
.centraleta-logo, 
.footer-logo-img {
    background: transparent !important;
    background-color: transparent !important;
}

.centraleta-logo::before, 
.centraleta-logo::after,
.footer-logo-img::before, 
.footer-logo-img::after {
    display: none !important;
}
