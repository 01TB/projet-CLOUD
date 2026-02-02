# Modifications du Modal de Signalement

## Résumé des modifications

Le modal "Modifier le statut" a été transformé en modal de modification complète du signalement, permettant de :
- Modifier les informations du signalement (surface, budget)
- Optionnellement changer le statut (ce qui crée un nouveau `AvancementSignalement`)
- Appeler l'API `PUT /api/signalements/{id}` du backend

## Modifications Backend

### 1. Entité `Signalement.java`
**Fichier :** `projet/backend/src/main/java/web/backend/project/entities/Signalement.java`

**Changements :**
- ✅ Ajout de la relation `@OneToMany` avec `AvancementSignalement` :
  ```java
  @OneToMany(mappedBy = "signalement", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<AvancementSignalement> avancements = new ArrayList<>();
  ```
- ✅ Ajout des getters/setters pour `avancements`
- ✅ Ajout des méthodes helper `addAvancement()` et `removeAvancement()`

### 2. DTO `SignalementDTO.java`
**Fichier :** `projet/backend/src/main/java/web/backend/project/features/signalements/dto/SignalementDTO.java`

**Changements :**
- ✅ Ajout du champ optionnel `idNouveauStatut` :
  ```java
  private Integer idNouveauStatut;
  ```
- ✅ Ajout du getter/setter pour ce champ

### 3. Service `SignalementService.java`
**Fichier :** `projet/backend/src/main/java/web/backend/project/features/signalements/services/SignalementService.java`

**Changements :**
- ✅ Ajout des dépendances injectées :
  - `AvancementSignalementRepo`
  - `StatutAvancementRepo`
- ✅ Modification de la méthode `updateSignalement()` pour :
  - Vérifier si `idNouveauStatut` est fourni
  - Si oui, créer un nouveau `AvancementSignalement` avec la date actuelle
  - Associer ce nouvel avancement au signalement
  - Sauvegarder le tout (cascade automatique)

**Logique :**
```java
if (signalementDTO.getIdNouveauStatut() != null) {
    // Récupérer le nouveau statut
    StatutAvancement nouveauStatut = statutAvancementRepo.findById(...)
    
    // Créer le nouvel avancement
    AvancementSignalement avancement = new AvancementSignalement();
    avancement.setDateModification(LocalDateTime.now());
    avancement.setStatutAvancement(nouveauStatut);
    avancement.setUtilisateur(utilisateur);
    
    // L'ajouter au signalement
    signalement.addAvancement(avancement);
}
```

## Modifications Frontend

### 4. Component Map HTML
**Fichier :** `projet/frontend-web/src/app/components/map/map.component.html`

**Changements :**
- ✅ Transformation complète du modal en formulaire d'édition
- ✅ Ajout des champs de saisie :
  - Surface (input number)
  - Budget (input number)
  - Entreprise (disabled, lecture seule)
  - Nouveau statut (select avec option "ne pas changer")
- ✅ Affichage du statut actuel
- ✅ Message informatif quand un nouveau statut est sélectionné
- ✅ Changement du titre : "✏️ Modifier le signalement"

### 5. Component Map TypeScript
**Fichier :** `projet/frontend-web/src/app/components/map/map.component.ts`

**Changements :**
- ✅ Ajout de la propriété `editForm` pour stocker les données du formulaire
- ✅ Modification de `onMarkerClick()` pour initialiser `editForm` avec :
  - Les valeurs actuelles du signalement
  - `idNouveauStatut` à `null` par défaut
- ✅ Nouvelle méthode `updateSignalement()` qui :
  - Valide les données (surface > 0, budget > 0)
  - Appelle `signalementService.updateSignalement(id, editForm)`
  - Affiche un message de confirmation
  - Recharge les données
- ✅ `closeStatusModal()` réinitialise aussi `editForm`

### 6. Component Map CSS
**Fichier :** `projet/frontend-web/src/app/components/map/map.component.css`

**Changements :**
- ✅ Ajout de styles pour `.edit-form`
- ✅ Ajout de styles pour `.form-group`, `.form-input`
- ✅ Styles pour états focus et disabled
- ✅ Ajout du style `.info-message` pour le message informatif bleu
- ✅ Correction des classes de badge (`.badge-status-0`, `.badge-status-1`, etc.)

## Flux de fonctionnement

### Cas 1 : Modification des infos sans changement de statut

1. Manager clique sur un marqueur
2. Modal s'ouvre avec formulaire pré-rempli
3. Manager modifie surface et/ou budget
4. Laisse "Nouveau statut" sur "-- Ne pas changer le statut --"
5. Clique sur "Enregistrer"
6. Frontend envoie : `PUT /api/signalements/{id}` avec `idNouveauStatut: null`
7. Backend met à jour uniquement les infos du signalement
8. Aucun `AvancementSignalement` n'est créé

### Cas 2 : Modification avec changement de statut

1. Manager clique sur un marqueur
2. Modal s'ouvre avec formulaire pré-rempli
3. Manager modifie surface/budget ET sélectionne un nouveau statut
4. Message bleu s'affiche : "ℹ️ Un nouveau statut d'avancement sera créé"
5. Clique sur "Enregistrer"
6. Frontend envoie : `PUT /api/signalements/{id}` avec `idNouveauStatut: 2` (par exemple)
7. Backend :
   - Met à jour les infos du signalement
   - Crée un nouvel `AvancementSignalement` avec :
     - `dateModification = LocalDateTime.now()`
     - `statutAvancement = nouveau statut`
     - `utilisateur = utilisateur connecté`
     - `signalement = signalement en cours`
   - Sauvegarde tout (cascade)
8. Le signalement a maintenant un nouvel avancement dans son historique

## Avantages de cette implémentation

✅ **Cohérence avec le modèle de données** : Utilise correctement `AvancementSignalement` pour l'historique
✅ **Flexibilité** : Permet de modifier les infos sans toucher au statut
✅ **Traçabilité** : Chaque changement de statut est daté et associé à un utilisateur
✅ **API RESTful** : Utilise l'endpoint existant `PUT /signalements/{id}`
✅ **UX intuitive** : Modal clair avec message informatif
✅ **Validation** : Contrôles côté frontend et backend

## Tests recommandés

1. ✅ Modifier uniquement la surface
2. ✅ Modifier uniquement le budget
3. ✅ Modifier surface + budget
4. ✅ Modifier surface + budget + statut
5. ✅ Modifier uniquement le statut
6. ✅ Vérifier que l'historique des avancements s'accumule correctement
7. ✅ Vérifier les validations (surface/budget > 0)
8. ✅ Vérifier que seuls les managers peuvent modifier

## Notes importantes

⚠️ **La relation bidirectionnelle** entre `Signalement` et `AvancementSignalement` est gérée via les méthodes helper `addAvancement()` et `removeAvancement()` pour maintenir la cohérence.

⚠️ **Le statut actuel** d'un signalement est déterminé par le dernier `AvancementSignalement` (trié par `dateModification DESC`), ce qui est géré dans `SignalementMapper.toResponseDTO()`.

⚠️ **L'utilisateur** qui effectue la modification est celui qui est authentifié côté backend (récupéré via `signalementDTO.getIdUtilisateurCreateur()`).
