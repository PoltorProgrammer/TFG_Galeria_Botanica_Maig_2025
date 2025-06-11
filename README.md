# Galeria i Mapa Botànic del Campus UAB 🌿

> **Versió HTML estàtica d'un plugin WordPress desenvolupat per al TFG en Biologia Ambiental**

[![Deploy](https://img.shields.io/badge/🔗%20Visita-Galeria%20i%20Mapa-darkgreen)](https://poltorprogrammer.github.io/Memoria_TFG_Maig_2025/Eines_Centraleta.html)

Una aplicació web interactiva per descobrir i catalogar la flora del campus de la Universitat Autònoma de Barcelona. Aquest projecte combina una galeria visual filtrable amb un mapa geolocalitzat per oferir una experiència educativa i divulgativa sobre la biodiversitat del campus.

## 📋 Sobre Aquest Projecte

Aquest repositori conté la **versió HTML autònoma** del plugin WordPress que vaig desenvolupar com a part del meu **Treball de Fi de Grau en Biologia Ambiental** (UAB, Maig 2025). L'aplicació original va ser creada per integrar-se directament amb WordPress mitjançant shortcodes, però aquesta versió permet experimentar amb totes les funcionalitats de manera independent.

### 🎯 Objectius del Projecte

- **Educatiu**: Recurs complementari per a assignatures de Botànica, Ecologia i Educació Ambiental
- **Divulgatiu**: Facilitar rutes guiades i visites autònomes del campus
- **Científic**: Primera base de dades geolocalitzada de flora del campus UAB

## ✨ Característiques Principals

### 🖼️ Galeria Botànica
- **Filtres avançats**: Per tipus, colors, hàbitat, floració, fullatge i usos
- **Cerca intel·ligent**: Per paraules clau amb camp de neteja automàtica
- **Modal de detalls**: Informació completa de cada espècie amb galeria d'imatges
- **Lightbox**: Visualització ampliada d'imatges amb navegació

### 🗺️ Mapa Interactiu
- **Geolocalització**: Marcadors de plantes amb coordenades reals del campus
- **Clusters dinàmics**: Agrupació automàtica de marcadors per millor visualització
- **Capes GeoJSON**: Zones d'hàbitat amb control de visibilitat
- **Popups informatius**: Previsualització ràpida amb enllaç a detalls complets

### 🔧 Funcionalitats Tècniques
- **Responsive Design**: Optimitzat per desktop, tablet i mòbil
- **Filtres sincronitzats**: Coherència entre galeria i mapa
- **Sistema de pestanyes**: Navegació fluida entre vistes
- **Accessibilitat**: Compleix estàndards WCAG 2.1 AA

## 🏆 Validació d'Usabilitat

El projecte va ser avaluat mitjançant l'escala **System Usability Scale (SUS)** amb 90 participants:

- **Puntuació mitjana**: 94.9/100 (**Excel·lent**)
- **"Molt fàcil d'usar"**: 92% d'acord
- **Comentari més freqüent**: *"Filtrar per colors m'ha ajudat molt"*

## 🛠️ Stack Tecnològic

- **Frontend**: HTML5, CSS3 (Variables CSS), JavaScript (ES6+)
- **Mapa**: Leaflet 1.9 + MarkerCluster
- **Dades**: JSON estructurat amb diccionari d'imatges
- **Estils**: CSS modular amb sistema de variables
- **Responsive**: Mobile-first design

## 📁 Estructura del Projecte

```
galeria-botanica-uab/
├── index.html                 # Pàgina principal
├── assets/
│   ├── css/
│   │   ├── main.css          # Estils base i sistema de pestanyes
│   │   ├── galeria.css       # Estils específics de la galeria
│   │   └── mapa.css          # Estils específics del mapa
│   └── js/
│       ├── main.js           # Controlador principal i gestió de dades
│       ├── galeria.js        # Lògica de la galeria i filtres
│       └── mapa.js           # Lògica del mapa interactiu
└── dades/
    ├── plantes.json          # Base de dades de plantes
    ├── diccionari-imatges.json  # Índex d'imatges per espècie
    ├── imatges/              # Col·lecció d'imatges de plantes
    └── geojson/              # Fitxers de zones d'hàbitat
```

## 🚀 Com Executar Localment

1. **Clona el repositori**:
   ```bash
   git clone https://github.com/TuUsuari/galeria-botanica-uab.git
   cd galeria-botanica-uab
   ```

2. **Serveix l'aplicació** (recomanat per CORS):
   ```bash
   # Amb Python 3
   python -m http.server 8000
   
   # Amb Node.js
   npx http-server
   
   # Amb PHP
   php -S localhost:8000
   ```

3. **Obre el navegador**: `http://localhost:8000`

## 📖 Context Acadèmic

**Autor**: Tomás González Bartomeu  
**Tutor**: Ramon Pérez Obiol  
**Titulació**: Grau en Biologia Ambiental, UAB  
**Data**: Maig 2025  

Aquest projecte forma part d'una iniciativa més àmplia per posar en valor els **260 hectàrees de patrimoni natural** del campus UAB, alineant-se amb els **Objectius de Desenvolupament Sostenible** (ODS 4: Educació de Qualitat; ODS 15: Vida Terrestre).

## 🌍 Projecte Original WordPress

Aquest codi HTML és una adaptació de l'**plugin WordPress** original desenvolupat per la meva tesi. El plugin complet inclou:

- Integració nativa amb WordPress (shortcodes, hooks)
- Aplicació de gestió offline amb File System Access API
- Sistema de CRUD per a administradors
- Exportació a formats científics (GBIF, Darwin Core)

## 📊 Impacte i Resultats

- **300+ espècies** catalogades amb fitxes il·lustrades
- **90 usuaris** van participar en la validació
- **SUS 94.9/100** (classificació "Excel·lent")
- **Primera base de dades geolocalitzada** de flora del campus UAB

## 🤝 Contribucions

Aquest projecte té una clara vocació **educativa i divulgativa**. Si ets docent, estudiant o investigador interessat en la biodiversitat del campus UAB:

- 🐛 **Reporta errors**: Obre un issue si trobes algún problema
- 💡 **Suggereix millores**: Les teves idees són benvingudes
- 📚 **Utilitza per ensenyar**: Contacta per adaptar-lo a les teves necessitats

## 📜 Llicència

**Codi**: MIT License  
**Continguts**: Creative Commons CC-BY-SA 4.0  
**Imatges**: Propietat de l'autor, ús educatiu permès

## 📞 Contacte

Per a més informació sobre el projecte, col·laboracions o adaptacions:

[![Email](https://img.shields.io/badge/📧%20Contacta%20per%20Email-UAB-red?style=for-the-badge)](mailto:1642196@uab.cat)
[![LinkedIn](https://img.shields.io/badge/💼%20LinkedIn%20Profile-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/tom%C3%A1s-gonz%C3%A1lez-bartomeu-573a98222/)
[![Memòria TFG](https://img.shields.io/badge/📖%20Memòria%20Digital%20TFG-28a745?style=for-the-badge&logo=github&logoColor=white)](https://poltorprogrammer.github.io/Memoria_TFG_Maig_2025/Memoria_Digital.html)

---

*Desenvolupat amb 💚 per a la comunitat UAB i la divulgació de la biodiversitat local*
