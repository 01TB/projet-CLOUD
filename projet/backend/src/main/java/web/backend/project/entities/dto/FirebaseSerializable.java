package web.backend.project.entities.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Interface pour les DTOs pouvant être sérialisés/désérialisés depuis Firebase
 * Chaque DTO implémente sa propre logique de mapping
 */
public interface FirebaseSerializable {

    /*
     * Getters et Setters communs
     */
    Integer getId();

    void setId(Integer id);

    Boolean getSynchro();

    void setSynchro(Boolean synchro);

    LocalDateTime getLastModified();

    /**
     * Convertit les données Firebase (Map) vers ce DTO
     * 
     * @param data Map de données provenant de Firebase
     * @return this (fluent pattern)
     */
    FirebaseSerializable fromFirebaseMap(Map<String, Object> data);

    /**
     * Convertit ce DTO vers une Map pour Firebase
     * 
     * @return Map représentant les données pour Firebase
     */
    Map<String, Object> toFirebaseMap();

    // ========== Helpers statiques pour le parsing ==========

    static Integer extractInteger(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return null;
        if (value instanceof Integer)
            return (Integer) value;
        if (value instanceof Long)
            return ((Long) value).intValue();
        if (value instanceof Double)
            return ((Double) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    static Double extractDouble(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return null;
        if (value instanceof Number)
            return ((Number) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    static Boolean extractBoolean(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return false;
        if (value instanceof Boolean)
            return (Boolean) value;
        if (value instanceof String)
            return Boolean.parseBoolean((String) value);
        return false;
    }

    static String extractString(Map<String, Object> data, String key) {
        Object value = data.get(key);
        return value != null ? value.toString() : null;
    }

    static java.time.LocalDateTime extractLocalDateTime(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null)
            return null;
        if (value instanceof String) {
            String str = ((String) value).trim();
            try {
                // Format ISO standard: "2026-02-07T12:39:22"
                return java.time.LocalDateTime.parse(str);
            } catch (Exception e1) {
                try {
                    // Format avec espace au lieu de T: "2026-02-07 12:39:22"
                    return java.time.LocalDateTime.parse(str,
                            java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                } catch (Exception e2) {
                    return null;
                }
            }
        }
        return null;
    }
}
