import os
import json
from collections import defaultdict

# Carpeta on es troba aquest script
directori_script = os.path.dirname(os.path.abspath(__file__))

# Carpeta 'imatges' dins del mateix directori que el script
dir_imatges = os.path.join(directori_script, 'imatges')

# Fitxer de sortida a la mateixa carpeta que el script
fitxer_sortida = os.path.join(directori_script, 'diccionari-imatges.json')

# Crear estructura per guardar dades
plantes = defaultdict(lambda: {"principal": None, "detalls": []})

# Obtenir fitxers .jpg, .png, .jpeg, .webp
try:
    tots_els_fitxers = sorted(os.listdir(dir_imatges))
except FileNotFoundError:
    print(f"Directori no trobat: {dir_imatges}")
    exit(1)

fitxers_imatge = [f for f in tots_els_fitxers if f.lower().endswith(('.jpg', '.png', '.jpeg', '.webp'))]

# Processar fitxers
for fitxer in fitxers_imatge:
    try:
        nom_sense_extensio = os.path.splitext(fitxer)[0]
        parts = nom_sense_extensio.split('_')

        if len(parts) < 4:
            continue  # Ignorar si el format no es correspon

        genus = parts[0].lower()
        species = parts[1].lower()
        planta_id = f"{genus}_{species}"
        tipus = parts[-1].lower()

        if plantes[planta_id]["principal"] is None:
            plantes[planta_id]["principal"] = fitxer
        else:
            plantes[planta_id]["detalls"].append({"nom": fitxer, "tipus": tipus})

    except Exception as e:
        print(f"Error processant el fitxer {fitxer}: {e}")

# Ordenar diccionari final
imatges_ordenades = {
    k: {
        "principal": v["principal"],
        "detalls": sorted(v["detalls"], key=lambda x: x["nom"])
    } for k, v in sorted(plantes.items())
}

# Crear directori de sortida si cal
os.makedirs(os.path.dirname(fitxer_sortida), exist_ok=True)

# Escriure fitxer JSON
with open(fitxer_sortida, 'w', encoding='utf-8') as f:
    json.dump(imatges_ordenades, f, ensure_ascii=False, indent=2)

print(f"Fitxer generat: {fitxer_sortida}")
