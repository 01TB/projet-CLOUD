# Intégration de la Synchronisation Bidirectionnelle

## Résumé des modifications

Les boutons de synchronisation du component map et du header de l'application appellent maintenant l'API bidirectional du SyncController et mettent à jour les signalements affichés après la synchronisation.

## Fichiers modifiés

### 1. Service de Synchronisation (NOUVEAU)
**Fichier :** `projet/frontend-web/src/app/services/sync.service.ts`

**Description :** Service Angular pour gérer toutes les opérations de synchronisation avec le backend.

**Fonctionnalités :**
- ✅ `synchronizeBidirectional()` - Synchronisation bidirectionnelle (PUSH + PULL)
- ✅ `push()` - Envoyer les données vers Firebase
- ✅ `pull()` - Récupérer les données depuis Firebase
- ✅ `synchronize()` - Synchronisation personnalisée avec SyncRequest
- ✅ `getSyncStatus()` - Obtenir le statut d'une entité
- ✅ `getSupportedEntities()` - Liste des entités supportées
- ✅ `health()` - Health check du service

**Interfaces :**
```typescript
export interface SyncResponse {
  success: boolean;
  message: string;
  details?: {
    entityType?: string;
    pushed?: number;
    pulled?: number;
    conflicts?: number;
  };
  errors?: string[];
}

export interface SyncRequest {
  entityTypes: string[];
  direction: 'PUSH' | 'PULL' | 'BIDIRECTIONAL';
  forceSync?: boolean;
}
```

### 2. Component Map
**Fichier :** `projet/frontend-web/src/app/components/map/map.component.ts`

**Changements :**
- ✅ Import de `SyncService`
- ✅ Injection de `SyncService` dans le constructeur
- ✅ Implémentation complète de la méthode `onSync()` :
  - Vérification que l'utilisateur est manager
  - Confirmation avant synchronisation
  - Appel de l'API `synchronizeBidirectional`
  - Gestion des réponses (succès/erreur)
  - Rechargement des signalements après succès

**Code de la méthode onSync() :**
```typescript
public onSync(): void {
  if (!this.isManager) {
    alert('Seuls les managers peuvent effectuer la synchronisation');
    return;
  }

  const confirmation = confirm(
    'Voulez-vous synchroniser les données avec Firebase?\n\n' +
    'Cela va :\n' +
    '- Envoyer les modifications locales vers Firebase (PUSH)\n' +
    '- Récupérer les nouvelles données depuis Firebase (PULL)\n' +
    '\nContinuer ?'
  );

  if (!confirmation) {
    return;
  }

  const syncEntities = ['Signalement', 'StatutAvancement', 'AvancementSignalement'];
  
  this.syncService.synchronizeBidirectional(syncEntities, false).subscribe({
    next: (response) => {
      if (response.success) {
        alert('✅ Synchronisation réussie !');
        this.loadData(); // Recharge les signalements
      } else {
        alert('❌ Erreur de synchronisation\n\n' + response.message);
      }
    },
    error: (error) => {
      console.error('Erreur lors de la synchronisation:', error);
      alert('❌ Erreur de synchronisation');
    }
  });
}
```

### 3. Component App (Header)
**Fichier :** `projet/frontend-web/src/app/app.component.ts`

**Changements :**
- ✅ Import de `SyncService`
- ✅ Injection de `SyncService` dans le constructeur
- ✅ Nouvelle méthode `onSync()` pour le bouton du header :
  - Confirmation avant synchronisation
  - Appel de l'API `synchronizeBidirectional`
  - Rechargement complet de la page après succès

**Code de la méthode onSync() :**
```typescript
onSync(): void {
  const confirmation = confirm(
    'Synchronisation avec Firebase\n\n' +
    'Cela va synchroniser toutes les données (Signalements, Statuts, Avancements).\n\n' +
    'Continuer ?'
  );

  if (!confirmation) {
    return;
  }

  const syncEntities = ['Signalement', 'StatutAvancement', 'AvancementSignalement'];
  
  this.syncService.synchronizeBidirectional(syncEntities, false).subscribe({
    next: (response) => {
      if (response.success) {
        alert('✅ Synchronisation réussie !');
        window.location.reload(); // Recharge toute la page
      } else {
        alert('❌ Erreur de synchronisation');
      }
    },
    error: (error) => {
      console.error('Erreur lors de la synchronisation:', error);
      alert('❌ Erreur de synchronisation');
    }
  });
}
```

### 4. Template App (HTML)
**Fichier :** `projet/frontend-web/src/app/app.component.html`

**Changement :**
- ✅ Remplacement du lien de navigation par un bouton :
```html
<button class="nav-link nav-btn" (click)="onSync()" title="Synchroniser avec Firebase">
  <span class="nav-icon">🔄</span> Synchroniser
</button>
```

### 5. Styles App (CSS)
**Fichier :** `projet/frontend-web/src/app/app.component.css`

**Changements :**
- ✅ Ajout de styles pour `.nav-btn` :
  - Border pour distinguer le bouton
  - Styles hover spécifiques
  - Reset des styles de bouton par défaut

```css
.nav-link {
  /* styles existants... */
  border: none;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.nav-btn {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
}
```

## Flux de synchronisation

### Depuis le Component Map

1. Manager clique sur le bouton "🔄 Synchroniser" dans les contrôles de la carte
2. Vérification du rôle (seuls les managers peuvent synchroniser)
3. Affichage d'une boîte de dialogue de confirmation
4. Si confirmé :
   - Appel de `syncService.synchronizeBidirectional(['Signalement', 'StatutAvancement', 'AvancementSignalement'])`
   - Envoi de la requête `POST /api/sync/bidirectional?entities=Signalement,StatutAvancement,AvancementSignalement&forceSync=false`
5. Réception de la réponse :
   - **Succès** : Affiche un message de succès + recharge les signalements avec `loadData()`
   - **Erreur** : Affiche un message d'erreur avec les détails

### Depuis le Header de l'App

1. Manager clique sur le bouton "🔄 Synchroniser" dans le header
2. Affichage d'une boîte de dialogue de confirmation
3. Si confirmé :
   - Appel de `syncService.synchronizeBidirectional(['Signalement', 'StatutAvancement', 'AvancementSignalement'])`
   - Envoi de la requête `POST /api/sync/bidirectional?entities=Signalement,StatutAvancement,AvancementSignalement&forceSync=false`
4. Réception de la réponse :
   - **Succès** : Affiche un message de succès + recharge toute la page avec `window.location.reload()`
   - **Erreur** : Affiche un message d'erreur avec les détails

## API utilisée

**Endpoint :** `POST /api/sync/bidirectional`

**Paramètres :**
- `entities` (optional) : Liste d'entités séparées par virgule (défaut: toutes)
- `forceSync` (optional, boolean, défaut: false) : Force la synchronisation même en cas de conflits

**Exemple de requête :**
```
POST http://localhost:8080/api/sync/bidirectional?entities=Signalement,StatutAvancement,AvancementSignalement&forceSync=false
```

**Exemple de réponse (succès) :**
```json
{
  "success": true,
  "message": "Synchronization completed successfully",
  "details": {
    "entityType": "Signalement",
    "pushed": 5,
    "pulled": 3,
    "conflicts": 0
  },
  "errors": []
}
```

**Exemple de réponse (erreur) :**
```json
{
  "success": false,
  "message": "Synchronization failed",
  "errors": [
    "Firebase connection timeout",
    "Unable to push entity: Signalement"
  ]
}
```

## Différences entre les deux implémentations

| Aspect | Component Map | Component App (Header) |
|--------|--------------|------------------------|
| **Portée** | Locale (carte seulement) | Globale (toute l'app) |
| **Vérification rôle** | ✅ Oui | ❌ Non (bouton déjà masqué si pas manager) |
| **Après succès** | Recharge uniquement les signalements | Recharge toute la page |
| **Message** | Détaillé avec informations de synchronisation | Simple avec info de rechargement |
| **Contexte** | Utilisé lors de travail sur la carte | Utilisé pour synchronisation globale |

## Avantages de cette implémentation

✅ **Réutilisable** : Le `SyncService` peut être utilisé partout dans l'application

✅ **Type-safe** : Interfaces TypeScript pour les requêtes et réponses

✅ **Feedback utilisateur** : Messages clairs de confirmation et de résultat

✅ **Gestion d'erreurs** : Capture et affiche les erreurs de manière appropriée

✅ **Rechargement intelligent** :
  - Map component : Recharge uniquement les données nécessaires
  - App component : Recharge toute la page pour cohérence globale

✅ **Sécurité** : Vérification du rôle manager avant synchronisation

## Test de la fonctionnalité

### Prérequis
1. Backend Spring Boot lancé
2. Firebase configuré
3. Utilisateur connecté en tant que MANAGER

### Tests à effectuer

1. **Test depuis la carte :**
   - Se connecter en tant que manager
   - Aller sur la page de carte
   - Cliquer sur le bouton "🔄" dans les contrôles
   - Vérifier le message de confirmation
   - Confirmer
   - Vérifier que la synchronisation s'effectue
   - Vérifier que les marqueurs se mettent à jour

2. **Test depuis le header :**
   - Se connecter en tant que manager
   - Cliquer sur "🔄 Synchroniser" dans le header
   - Vérifier le message de confirmation
   - Confirmer
   - Vérifier que la page se recharge après le succès

3. **Test avec utilisateur non-manager :**
   - Se connecter en tant qu'utilisateur normal
   - Vérifier que le bouton de synchronisation n'apparaît pas dans le header
   - Aller sur la carte (si accessible)
   - Cliquer sur le bouton de synchronisation
   - Vérifier qu'un message d'erreur s'affiche

4. **Test de gestion d'erreur :**
   - Arrêter le backend
   - Tenter une synchronisation
   - Vérifier qu'un message d'erreur approprié s'affiche

## Notes importantes

⚠️ **Synchronisation bidirectionnelle** : PUSH + PULL en une seule opération

⚠️ **Entités synchronisées** : Signalement, StatutAvancement, AvancementSignalement

⚠️ **Rechargement** : La page/données sont rechargées uniquement en cas de succès

⚠️ **Permissions** : Seuls les managers peuvent effectuer la synchronisation
