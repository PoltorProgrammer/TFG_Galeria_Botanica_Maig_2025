# 🌿 Galeria Botànica UAB

**Plataforma interactiva per explorar la flora del campus de la Universitat Autònoma de Barcelona**

[![GitHub](https://img.shields.io/badge/GitHub-Page-black)](https://poltorprogrammer.github.io/TFG_Galeria_Botanica_Maig_2025)
[![Versió](https://img.shields.io/badge/versió-2.0-green.svg)](https://github.com/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025)
[![Llicència MIT](https://img.shields.io/badge/llicència-MIT-blue.svg)](LICENSE.md)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black.svg)](https://github.com/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025)

---

## 📋 Descripció

La **Galeria Botànica UAB** és una aplicació web que converteix els 260 ha de zones verdes del campus de Bellaterra en un herbari digital interactiu. Combina una galeria filtrable amb un mapa geolocalitzat per facilitar la identificació i localització de les espècies vegetals presents al campus.

### ✨ Característiques principals

- 🔍 **Galeria filtrable** amb més de 250 espècies catalogades
- 🗺️ **Mapa interactiu** amb marcadors geolocalitzats
- 📸 **Sistema d'imatges intel·ligent** connectat a GitHub
- 🔎 **Cerca instantània** per nom científic o vulgar
- 📱 **Disseny responsive** adaptat a tots els dispositius
- ⚡ **Rendiment optimitzat** amb càrrega dinàmica

---

## 🚀 Instal·lació i ús

### Requisits previs
- Navegador web modern (Chrome, Firefox, Safari, Edge)
- Connexió a internet per carregar imatges des de GitHub

### Instal·lació ràpida

1. **Clona el repositori:**
   ```bash
   git clone https://github.com/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025.git
   cd TFG_Galeria_Botanica_Maig_2025
   ```

2. **Obre directament al navegador:**
   ```bash
   # Opció 1: Obrir fitxer directament
   open index.html
   
   # Opció 2: Servidor local (recomanat)
   python -m http.server 8000
   # O amb Node.js:
   npx serve .
   ```

3. **Accedeix a l'aplicació:**
   - Directament: `file:///path/to/index.html`
   - Servidor local: `http://localhost:8000`

### 🎯 Ús de l'aplicació

#### Galeria
- Filtra per **tipus de planta**, **color**, **hàbitat**, **època de floració**, etc.
- Utilitza la **barra de cerca** per trobar espècies específiques
- Clica **"Veure detalls"** per informació completa i galeria d'imatges

#### Mapa
- Explora les **zones del campus** amb marcadors interactius
- Filtra plantes per ubicació i característiques
- Clica els **marcadors** per veure informació ràpida

---

## 📁 Estructura del projecte

```
TFG_Galeria_Botanica_Maig_2025/
├── 📄 index.html                      # Pàgina principal
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── 📄 main.css                # Estils globals
│   │   ├── 📄 galeria-botanica.css    # Estils de la galeria
│   │   └── 📄 mapa-botanica.css       # Estils del mapa
│   ├── 📁 js/
│   │   ├── 📄 sistema-imatges-github.js # Sistema d'imatges intel·ligent
│   │   ├── 📄 galeria-botanica-original.js # Funcionalitat galeria
│   │   ├── 📄 mapa-botanica-original.js # Funcionalitat mapa
│   │   └── 📄 app-init.js             # Inicialització de l'app
│   └── 📁 imatges/                    # Fotografies de les plantes
├── 📁 dades/
│   ├── 📄 plantes.json                # Base de dades de plantes
│   └── 📁 geojson/                    # Dades geogràfiques
└── 📄 README.md                       # Aquest fitxer
```

---

## 🖼️ Sistema d'imatges

### Nomenclatura de fitxers
Les imatges segueixen el format estàndard:
```
{nom_cientific}_{numero:02d}_{estructura}.jpg
```

#### Exemples:
- `platanus_hispanica_00_flor.jpg`
- `quercus_ilex_01_fulla.jpg`
- `rosmarinus_officinalis_02_fruit.jpg`

#### Estructures vàlides:
- `flor` - Inflorescències i flors (prioritat 1)
- `habit` - Hàbit general de la planta (prioritat 2)
- `fulla` - Detalls del fullatge (prioritat 3)
- `fruit` - Fruits i llavors (prioritat 4)
- `tija` - Detalls de tija i escorça (prioritat 5)
- `altre` - Altres detalls (prioritat 6)

### Assignació automàtica
El sistema assigna automàticament:
1. **Imatge principal**: La de major prioritat disponible
2. **Imatges de detall**: La resta d'imatges ordenades per número

---

## 🛠️ Tecnologies utilitzades

### Frontend
- **HTML5** - Estructura semàntica
- **CSS3** - Estils moderns amb Flexbox i Grid
- **JavaScript ES6+** - Funcionalitat interactiva
- **jQuery 3.6** - Manipulació DOM i esdeveniments

### Mapa
- **Leaflet 1.9.4** - Cartografia interactiva
- **Leaflet.MarkerCluster** - Agrupació de marcadors
- **OpenStreetMap** - Capa de mapa base
- **ArcGIS World Imagery** - Capa satèl·lit

### Dades
- **JSON** - Emmagatzematge estructurat
- **GeoJSON** - Dades geogràfiques dels hàbitats
- **GitHub API** - Càrrega dinàmica d'imatges

---

## 📊 Dades de plantes

### Estructura JSON
```json
{
  "plantes": [
    {
      "id": "platanus_hispanica",
      "nom_comu": "Plàtan comú",
      "nom_cientific": "Platanus hispanica",
      "familia": "Platanaceae",
      "tipus": "arbre",
      "descripcio": "Arbre de gran port amb escorça que s'escama...",
      "caracteristiques": {
        "floracio": ["abril", "maig"],
        "fullatge": "caducifoli"
      },
      "colors": ["groc", "verd"],
      "habitat": ["eix_central", "zones_assolellades"],
      "usos": ["ornamental", "ombra"],
      "coordenades": [
        {
          "lat": 41.50085,
          "lng": 2.09342,
          "zona": "Eix Central"
        }
      ]
    }
  ]
}
```

### Camps obligatoris
- `nom_cientific` - Nom científic de l'espècie
- `nom_comu` - Nom comú en català
- `familia` - Família botànica
- `tipus` - Tipus de planta (arbre, arbust, herba, liana)
- `descripcio` - Descripció de l'espècie

### Camps opcionals
- `caracteristiques` - Detalls morfològics i fenològics
- `colors` - Colors de flors, fruits o fulles
- `habitat` - Zones del campus on es troba
- `usos` - Aplicacions de la planta
- `coordenades` - Localització GPS

---

## 🎨 Personalització

### Afegir noves plantes

1. **Edita `dades/plantes.json`:**
   ```json
   {
     "nom_cientific": "Nova especie",
     "nom_comu": "Nom comú",
     "familia": "Familia",
     "tipus": "arbre",
     "descripcio": "Descripció..."
   }
   ```

2. **Afegeix imatges seguint la nomenclatura:**
   ```
   nova_especie_00_flor.jpg
   nova_especie_01_fulla.jpg
   ```

3. **L'aplicació detectarà automàticament** les noves dades i imatges.

### Modificar estils
- **Colors globals**: Edita variables CSS a `assets/css/main.css`
- **Galeria**: Personalitza `assets/css/galeria-botanica.css`
- **Mapa**: Modifica `assets/css/mapa-botanica.css`

---

## 🔧 Desenvolupament

### Estructura del codi
- **Modular**: Cada funcionalitat en fitxers separats
- **Orientat a esdeveniments**: Sistema de listeners jQuery
- **Cache intel·ligent**: Optimització de càrrega d'imatges
- **Responsive**: Adaptat a dispositius mòbils

### APIs externes utilitzades
- **GitHub Contents API**: Llistat d'imatges
- **OpenStreetMap Tiles**: Mapa base
- **ArcGIS World Imagery**: Imatges satèl·lit

### Variables globals
```javascript
// Dades de plantes per la galeria
window.gb_plantes_data = [...];

// Configuració del mapa
window.mb_vars = {
    dades_plantes: [...],
    plugin_url: '.'
};
```

---

## 🐛 Resolució de problemes

### Problemes comuns

#### Les imatges no es carreguen
- **Verifica** que les imatges segueixen la nomenclatura correcta
- **Comprova** la connexió a internet (imatges des de GitHub)
- **Consulta** la consola del navegador per errors

#### El mapa no apareix
- **Assegura't** que Leaflet està carregat correctament
- **Verifica** les coordenades a `plantes.json`
- **Comprova** que el contenidor `#mapa-botanica` existeix

#### Filtres no funcionen
- **Revisa** que jQuery està carregat
- **Verifica** que les dades tenen els camps necessaris
- **Comprova** la consola per errors JavaScript

### Logs de desenvolupament
L'aplicació genera logs detallats a la consola:
```javascript
console.log('🔍 Filtres aplicats: X plantes visibles');
console.log('📍 Carregats X marcadors');
console.log('🖼️ Assignades X imatges a: Nom planta');
```

---

## 📝 Llicència

Aquest projecte està licenciat sota la **Llicència MIT**. Consulta [LICENSE.md](LICENSE.md) per més detalls.

### Permisos
- ✅ Ús comercial
- ✅ Modificació
- ✅ Distribució
- ✅ Ús privat

### Limitacions
- ❌ Responsabilitat
- ❌ Garantia

---

## 👥 Contribució

### Com contribuir

1. **Fork** el repositori
2. **Crea** una branca per la teva funcionalitat
3. **Realitza** els canvis i commits
4. **Envia** un Pull Request

### Tipus de contribucions benvingudes
- 🐛 Correccions d'errors
- ✨ Noves funcionalitats
- 📝 Millores de documentació
- 🌱 Noves espècies de plantes
- 📸 Fotografies de qualitat

### Directrius
- Segueix l'estil de codi existent
- Inclou comentaris descriptius
- Testa els canvis abans d'enviar

---

## 📞 Contacte i suport

### Informació del projecte
- **Autor**: Tomás González Bartomeu
- **Tutor acadèmic**: Ramon Pérez Obiol
- **Institució**: Facultat de Biociències - UAB

### Enllaços útils
- 🌐 [Repositori GitHub](https://github.com/PoltorProgrammer/TFG_Galeria_Botanica_Maig_2025)
- 📧 [Contacte del projecte](mailto:botanica@uab.cat)
- 🏫 [Universitat Autònoma de Barcelona](https://www.uab.cat)

### Reconeixements
- **OpenStreetMap** per les dades cartogràfiques
- **Leaflet** per la biblioteca de mapes
- **GitHub** per l'allotjament d'imatges
- **Comunitat UAB** per les fotografies i dades

---

## 🔄 Historial de versions

### v2.0.0 (Maig 2025)
- ✨ Sistema d'imatges intel·ligent amb GitHub API
- 🔧 Arquitectura modular millorada
- 📱 Millores en responsive design
- ⚡ Optimització de rendiment

### v1.0.0 (Desembre 2024)
- 🎉 Versió inicial
- 🖼️ Galeria bàsica amb filtres
- 🗺️ Mapa amb marcadors
- 📊 Sistema de dades JSON

---

**🌱 Ajuda'ns a fer créixer el coneixement de la flora local!**
