import base64
import json
import os
from datetime import datetime

def create_angular_image_data(png_path):
    """Crée l'objet exact pour Angular"""
    
    print("🔍 Traitement de l'image...")
    # Lire et convertir l'image
    with open(png_path, 'rb') as f:
        base64_str = base64.b64encode(f.read()).decode('utf-8')
    print("✅ Image convertie en base64.")

    # Générer un nom unique
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"photo_{timestamp}.png"
    
    # Structure exacte pour Angular
    angular_data = {
        "data": f"data:image/png;base64,{base64_str}",
        "name": filename,
        "type": "image/png"
    }
    
    print("traitement terminé, préparation du JSON...")
    # Sauvegarder en JSON
    with open('image_data.json', 'w') as f:
        json.dump(angular_data, f, indent=2)
    
    print(f"✅ Fichier JSON créé : image_data.json")
    print(f"📋 Copiez ceci dans votre code Angular :")
    print(json.dumps(angular_data, indent=2))
    
    return angular_data

# Utilisation
if __name__ == "__main__":
    create_angular_image_data("login.png")