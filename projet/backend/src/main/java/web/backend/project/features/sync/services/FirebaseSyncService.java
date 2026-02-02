package web.backend.project.features.sync.services;

import com.google.cloud.firestore.*;

import web.backend.project.entities.dto.FirebaseSerializable;

import com.google.api.core.ApiFuture;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ExecutionException;

/**
 * Service pour gérer les opérations Firebase/Firestore
 */
@Service
public class FirebaseSyncService {

    private final Firestore firestore;

    public FirebaseSyncService(Firestore firestore) {
        this.firestore = firestore;
    }

    /**
     * Pousse une liste de DTOs vers Firebase
     */
    public <T extends FirebaseSerializable> int pushToFirebase(String collectionName, List<T> dtos) {
        int pushed = 0;
        CollectionReference collection = firestore.collection(collectionName);

        for (T dto : dtos) {
            try {
                Map<String, Object> data = convertDtoToMap(dto);

                if (dto.getId() != null) {
                    // Update ou création avec ID spécifique
                    collection.document(dto.getId().toString()).set(data).get();
                } else {
                    // Création avec ID auto-généré
                    DocumentReference docRef = collection.add(data).get();
                    dto.setId(Integer.parseInt(docRef.getId()));
                }

                pushed++;
            } catch (InterruptedException | ExecutionException e) {
                throw new RuntimeException("Failed to push to Firebase: " + e.getMessage(), e);
            }
        }

        return pushed;
    }

    /**
     * Récupère les données depuis Firebase
     */
    public <T extends FirebaseSerializable> List<Map<String, Object>> pullFromFirebase(String collectionName) {
        List<Map<String, Object>> results = new ArrayList<>();
        CollectionReference collection = firestore.collection(collectionName);

        try {
            ApiFuture<QuerySnapshot> future = collection.get();
            List<QueryDocumentSnapshot> documents = future.get().getDocuments();

            for (QueryDocumentSnapshot document : documents) {
                Map<String, Object> data = document.getData();
                data.put("id", document.getId()); // Ajouter l'ID du document
                results.add(data);
            }
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to pull from Firebase: " + e.getMessage(), e);
        }

        return results;
    }

    /**
     * Récupère un document spécifique depuis Firebase
     */
    public Optional<Map<String, Object>> getDocument(String collectionName, Integer id) {
        try {
            DocumentReference docRef = firestore.collection(collectionName).document(id.toString());
            ApiFuture<DocumentSnapshot> future = docRef.get();
            DocumentSnapshot document = future.get();

            if (document.exists()) {
                Map<String, Object> data = document.getData();
                if (data != null) {
                    data.put("id", document.getId());
                    return Optional.of(data);
                }
            }
            return Optional.empty();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to get document from Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Supprime un document de Firebase
     */
    public void deleteDocument(String collectionName, Integer id) {
        try {
            firestore.collection(collectionName).document(id.toString()).delete().get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to delete from Firebase: " + e.getMessage(), e);
        }
    }

    /**
     * Convertit un DTO en Map pour Firebase
     */
    private <T extends FirebaseSerializable> Map<String, Object> convertDtoToMap(T dto) {
        Map<String, Object> map = new HashMap<>();

        // Utilise reflection pour extraire tous les champs
        // Note: Pour une solution production, utilisez un mapper JSON comme Jackson
        try {
            java.lang.reflect.Field[] fields = dto.getClass().getDeclaredFields();
            for (java.lang.reflect.Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(dto);

                // Convertir LocalDateTime en timestamp
                if (value instanceof LocalDateTime) {
                    value = Date.from(((LocalDateTime) value).atZone(ZoneId.systemDefault()).toInstant());
                }

                map.put(field.getName(), value);
            }
        } catch (IllegalAccessException e) {
            throw new RuntimeException("Failed to convert DTO to Map: " + e.getMessage(), e);
        }

        return map;
    }

    /**
     * Compare les timestamps pour résoudre les conflits
     * Retourne true si le DTO Firebase est plus récent
     */
    public boolean isFirebaseNewer(Map<String, Object> firebaseData, LocalDateTime backendTimestamp) {
        if (firebaseData == null || backendTimestamp == null) {
            return false;
        }

        Object lastModifiedObj = firebaseData.get("lastModified");
        if (lastModifiedObj instanceof Date) {
            Date firebaseDate = (Date) lastModifiedObj;
            LocalDateTime firebaseTimestamp = firebaseDate.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
            return firebaseTimestamp.isAfter(backendTimestamp);
        }

        return false;
    }
}
