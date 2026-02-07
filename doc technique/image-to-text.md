# Transformation d'Images en Texte

## Vue d'ensemble

Dans l'application roadwork-mobile, les images sont transformées en texte (base64) pour être stockées et transmises via l'API Firebase. Ce processus permet de gérer les images sans nécessiter de stockage de fichiers séparés.

## Processus de Transformation

### 1. Capture de l'Image

Les images sont capturées via :
- **Appareil photo** : Utilisation de l'API Camera de Capacitor
- **Galerie** : Sélection depuis les photos de l'appareil

### 2. Compression et Redimensionnement

Les images subissent une réduction de taille pour optimiser le stockage et la transmission :

```javascript
// Exemple de fonction de compression
const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcul des nouvelles dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (maxHeight / height) * width;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessin de l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);
      
      // Conversion en base64 avec compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.src = file;
  });
};
```

### 3. Encodage en Base64

L'image compressée est convertie en chaîne de caractères base64 :

```javascript
// Format de sortie
const imageData = {
  data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  name: "photo_signalement_001.jpg",
  type: "image/jpeg",
  size: 245760 // taille en octets après compression
};
```

## Structure des Données d'Image

### Format Stocké

```javascript
{
  data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  name: "photo_2024-02-07_12-30-45.jpg",
  type: "image/jpeg"
}
```

### Champs Expliqués

- **`data`** : Chaîne base64 complète avec préfixe MIME
- **`name`** : Nom unique généré (timestamp + identifiant)
- **`type`** : Type MIME (image/jpeg, image/png, etc.)

## Avantages de cette Approche

### 1. **Pas de Stockage Externe**
- Images intégrées dans les documents Firestore
- Pas besoin de service de stockage séparé (comme Firebase Storage)

### 2. **Transmission Simplifiée**
- Images incluses dans les requêtes API JSON
- Pas de gestion de multipart/form-data

### 3. **Atomicité**
- Image et métadonnées du signalement sauvegardées ensemble
- Pas de risque de désynchronisation

## Inconvénients et Limites

### 1. **Taille des Documents**
- Firestore limite les documents à 1 MB
- Nécessite une compression agressive

### 2. **Performance**
- Les images base64 augmentent la taille (~33% plus grand)
- Temps de chargement plus longs

### 3. **Coûts**
- Stockage dans Firestore plus cher que Firebase Storage
- Bande passante augmentée

## Processus de Décodage

### 1. Réception des Données

```javascript
// Réception depuis l'API
const signalement = {
  id: 123,
  description: "Travaux sur la route",
  photos: [
    {
      data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
      name: "photo_001.jpg",
      type: "image/jpeg"
    }
  ]
};
```

### 2. Affichage dans l'Interface

```javascript
// Utilisation directe dans les templates Vue
<template>
  <img :src="photo.data" :alt="photo.name" />
</template>

// Ou manipulation JavaScript
const displayImage = (photo) => {
  const img = document.createElement('img');
  img.src = photo.data; // Le navigateur décode automatiquement
  img.alt = photo.name;
  document.body.appendChild(img);
};
```

### 3. Extraction pour Téléchargement

```javascript
const downloadImage = (photo) => {
  // Extraction du type et des données base64
  const [mimeInfo, base64Data] = photo.data.split(',');
  const mimeType = mimeInfo.match(/:(.*?);/)[1];
  
  // Conversion en Blob
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  
  // Création du lien de téléchargement
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = photo.name;
  link.click();
  
  // Nettoyage
  URL.revokeObjectURL(url);
};
```

## Optimisations Implémentées

### 1. **Compression Adaptive**

```javascript
const getCompressionSettings = (fileSize) => {
  if (fileSize > 5 * 1024 * 1024) { // > 5MB
    return { maxWidth: 600, maxHeight: 400, quality: 0.5 };
  } else if (fileSize > 2 * 1024 * 1024) { // > 2MB
    return { maxWidth: 800, maxHeight: 600, quality: 0.6 };
  } else {
    return { maxWidth: 1200, maxHeight: 900, quality: 0.8 };
  }
};
```

### 2. **Validation avant Upload**

```javascript
const validateImage = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (file.size > maxSize) {
    throw new Error('Image trop volumineuse (max 10MB)');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Type d\'image non supporté');
  }
  
  return true;
};
```

### 3. **Lazy Loading**

```javascript
// Affichage progressif des images
<template>
  <img 
    :src="photo.data" 
    :alt="photo.name"
    loading="lazy"
    @error="handleImageError"
  />
</template>
```

## Recommandations Futures

### 1. **Migration vers Firebase Storage**
- Pour les images > 1MB
- Réduction des coûts de stockage
- Meilleures performances

### 2. **WebP Support**
- Format plus efficace que JPEG
- Réduction de taille supplémentaire

### 3. **CDN Integration**
- Cache des images
- Distribution mondiale

## Sécurité

### 1. **Validation des Types MIME**
```javascript
const isValidImageType = (dataUrl) => {
  const validTypes = ['data:image/jpeg', 'data:image/png', 'data:image/webp'];
  return validTypes.some(type => dataUrl.startsWith(type));
};
```

### 2. **Limitation de Taille**
```javascript
const MAX_BASE64_SIZE = 900000; // ~900KB après encodage
if (photo.data.length > MAX_BASE64_SIZE) {
  throw new Error('Image trop grande pour Firestore');
}
```

## Conclusion

Le système actuel de transformation d'images en texte base64 fonctionne bien pour des besoins simples mais présente des limitations en termes de performance et de coûts. Pour une application en production avec beaucoup d'images, une migration vers Firebase Storage serait recommandée.
