package web.backend.project.entities.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.cloud.firestore.GeoPoint;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * DTO pour la synchronisation de Signalement
 */
public class SignalementDTO implements FirebaseSerializable {

    @JsonProperty("id")
    private Integer id;

    @JsonProperty("date_creation")
    private String dateCreation;

    @JsonProperty("surface")
    private Double surface;

    @JsonProperty("budget")
    private Integer budget;

    @JsonProperty("localisation")
    private String localisationWkt; // Format WKT pour la géométrie

    @JsonProperty("synchro")
    private Boolean synchro;

    @JsonProperty("id_utilisateur_createur")
    private Integer utilisateurCreateurId;

    @JsonProperty("id_entreprise")
    private Integer entrepriseId;

    @JsonProperty("last_modified")
    private LocalDateTime lastModified;

    // Constructeurs
    public SignalementDTO() {
        this.lastModified = LocalDateTime.now();
    }

    // ========== FirebaseSerializable Implementation ==========

    @Override
    public FirebaseSerializable fromFirebaseMap(Map<String, Object> data) {
        this.id = FirebaseSerializable.extractInteger(data, "id");
        this.dateCreation = FirebaseSerializable.extractString(data, "date_creation");
        this.surface = FirebaseSerializable.extractDouble(data, "surface");
        this.budget = FirebaseSerializable.extractInteger(data, "budget");
        this.localisationWkt = extractGeoPointToWkt(data, "localisation");
        this.synchro = FirebaseSerializable.extractBoolean(data, "synchro");
        this.utilisateurCreateurId = FirebaseSerializable.extractInteger(data, "id_utilisateur_createur");
        this.entrepriseId = FirebaseSerializable.extractInteger(data, "id_entreprise");
        this.lastModified = FirebaseSerializable.extractLocalDateTime(data, "last_modified");
        return this;
    }

    @Override
    public Map<String, Object> toFirebaseMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("date_creation", dateCreation);
        map.put("surface", surface);
        map.put("budget", budget);
        map.put("localisation", convertWktToGeoPoint(localisationWkt));
        // Lors du push vers Firebase, synchro est toujours true (donnée synchronisée)
        map.put("synchro", true);
        map.put("id_utilisateur_createur", utilisateurCreateurId);
        map.put("id_entreprise", entrepriseId);
        map.put("last_modified", lastModified != null ? lastModified.toString() : null);
        return map;
    }

    // ========== GeoPoint Helpers ==========

    /**
     * Convertit un GeoPoint Firebase en format WKT (Well-Known Text)
     * Supporte les formats: GeoPoint natif, Map avec latitude/longitude, ou String
     */
    private String extractGeoPointToWkt(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            return null;
        }

        // Si c'est un GeoPoint natif Firebase
        if (value instanceof GeoPoint) {
            GeoPoint geoPoint = (GeoPoint) value;
            return String.format("POINT(%f %f)", geoPoint.getLongitude(), geoPoint.getLatitude());
        }

        // Si c'est une Map (format JSON désérialisé)
        if (value instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> geoMap = (Map<String, Object>) value;
            Double latitude = extractDoubleFromMap(geoMap, "latitude", "_latitude");
            Double longitude = extractDoubleFromMap(geoMap, "longitude", "_longitude");
            if (latitude != null && longitude != null) {
                return String.format("POINT(%f %f)", longitude, latitude);
            }
        }

        // Si c'est déjà une String (format WKT ou autre)
        if (value instanceof String) {
            String strValue = (String) value;
            // Vérifier si c'est un format "GeoPoint { latitude=X, longitude=Y }"
            if (strValue.startsWith("GeoPoint")) {
                return parseGeoPointString(strValue);
            }
            // Sinon retourner tel quel (probablement déjà en WKT)
            return strValue;
        }

        return null;
    }

    /**
     * Parse une chaîne "GeoPoint { latitude=X, longitude=Y }" en WKT
     */
    private String parseGeoPointString(String geoPointStr) {
        try {
            // Format: "GeoPoint { latitude=18.92, longitude=47.52 }"
            String content = geoPointStr.replace("GeoPoint", "").replace("{", "").replace("}", "").trim();
            String[] parts = content.split(",");
            Double latitude = null;
            Double longitude = null;

            for (String part : parts) {
                String[] keyValue = part.trim().split("=");
                if (keyValue.length == 2) {
                    String k = keyValue[0].trim();
                    Double v = Double.parseDouble(keyValue[1].trim());
                    if (k.equals("latitude")) {
                        latitude = v;
                    } else if (k.equals("longitude")) {
                        longitude = v;
                    }
                }
            }

            if (latitude != null && longitude != null) {
                return String.format("POINT(%f %f)", longitude, latitude);
            }
        } catch (Exception e) {
            // En cas d'erreur de parsing, retourner null
        }
        return null;
    }

    /**
     * Extrait un Double depuis une Map en essayant plusieurs clés possibles
     */
    private Double extractDoubleFromMap(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
        }
        return null;
    }

    /**
     * Convertit un format WKT en GeoPoint Firebase
     * Supporte le format: POINT(longitude latitude)
     */
    private GeoPoint convertWktToGeoPoint(String wkt) {
        if (wkt == null || wkt.isEmpty()) {
            return null;
        }

        try {
            // Format WKT: POINT(longitude latitude)
            String coordsStr = wkt.replace("POINT(", "").replace("POINT (", "").replace(")", "").trim();
            String[] coords = coordsStr.split("\\s+");
            if (coords.length >= 2) {
                double longitude = Double.parseDouble(coords[0]);
                double latitude = Double.parseDouble(coords[1]);
                return new GeoPoint(latitude, longitude);
            }
        } catch (Exception e) {
            // En cas d'erreur de parsing, retourner null
        }
        return null;
    }

    // Getters et Setters
    @Override
    public Integer getId() {
        return id;
    }

    @Override
    public void setId(Integer id) {
        this.id = id;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Double getSurface() {
        return surface;
    }

    public void setSurface(Double surface) {
        this.surface = surface;
    }

    public Integer getBudget() {
        return budget;
    }

    public void setBudget(Integer budget) {
        this.budget = budget;
    }

    public String getLocalisationWkt() {
        return localisationWkt;
    }

    public void setLocalisationWkt(String localisationWkt) {
        this.localisationWkt = localisationWkt;
    }

    @Override
    public Boolean getSynchro() {
        return synchro;
    }

    @Override
    public void setSynchro(Boolean synchro) {
        this.synchro = synchro;
    }

    public Integer getUtilisateurCreateurId() {
        return utilisateurCreateurId;
    }

    public void setUtilisateurCreateurId(Integer utilisateurCreateurId) {
        this.utilisateurCreateurId = utilisateurCreateurId;
    }

    public Integer getEntrepriseId() {
        return entrepriseId;
    }

    public void setEntrepriseId(Integer entrepriseId) {
        this.entrepriseId = entrepriseId;
    }

    @Override
    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }
}
