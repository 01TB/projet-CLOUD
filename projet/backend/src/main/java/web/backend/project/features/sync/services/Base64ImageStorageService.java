package web.backend.project.features.sync.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;

/**
 * Service pour décoder les images base64 provenant de Firebase
 * et les stocker localement sur le disque.
 */
@Service
public class Base64ImageStorageService {

    private static final Logger logger = LoggerFactory.getLogger(Base64ImageStorageService.class);

    /**
     * Répertoire de stockage des images (configurable via application.properties)
     */
    @Value("${app.upload.images-dir:uploads/images}")
    private String imagesDirPath;

    private Path imagesDir;

    // Signatures magiques pour la détection du format
    private static final byte[] PNG_SIGNATURE = { (byte) 0x89, 0x50, 0x4E, 0x47 }; // \x89PNG
    private static final byte[] JPEG_SIGNATURE = { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF };

    @PostConstruct
    public void init() {
        imagesDir = Paths.get(imagesDirPath).toAbsolutePath();
        try {
            Files.createDirectories(imagesDir);
            logger.info("Répertoire de stockage des images initialisé : {}", imagesDir);
        } catch (IOException e) {
            logger.error("Impossible de créer le répertoire de stockage des images : {}", imagesDir, e);
            throw new RuntimeException("Échec de l'initialisation du stockage d'images", e);
        }
    }

    /**
     * Décode une chaîne base64 en image et la stocke localement.
     *
     * @param base64Data    le contenu base64 (brut ou data-URI)
     * @param entityId      l'identifiant de l'entité SignalementPhoto
     * @param signalementId l'identifiant du signalement parent
     * @return le chemin relatif du fichier sauvegardé (ex:
     *         "uploads/images/photo_1_sig_2.jpg")
     * @throws IOException en cas d'erreur d'écriture
     */
    public String decodeAndStore(String base64Data, Integer entityId, Integer signalementId) throws IOException {
        if (base64Data == null || base64Data.isBlank()) {
            logger.warn("Données base64 vides pour SignalementPhoto id={}, signalement id={}", entityId,
                    signalementId);
            return null;
        }

        // Extraire le contenu base64 pur (supprimer le préfixe data-URI si présent)
        String pureBase64 = stripDataUriPrefix(base64Data);

        // Décoder
        byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(pureBase64);
        } catch (IllegalArgumentException e) {
            logger.error("Échec du décodage base64 pour SignalementPhoto id={}: {}", entityId, e.getMessage());
            throw new IOException("Données base64 invalides pour SignalementPhoto id=" + entityId, e);
        }

        if (imageBytes.length == 0) {
            logger.warn("Image décodée vide pour SignalementPhoto id={}", entityId);
            return null;
        }

        // Déterminer le format de l'image
        String extension = detectImageFormat(imageBytes, base64Data);

        // Construire le nom de fichier : photo_{entityId}_sig_{signalementId}.{ext}
        String fileName = String.format("photo_%d_sig_%d.%s",
                entityId != null ? entityId : System.currentTimeMillis(),
                signalementId != null ? signalementId : 0,
                extension);

        Path filePath = imagesDir.resolve(fileName);

        // Écrire le fichier sur le disque
        Files.write(filePath, imageBytes);
        logger.info("Image sauvegardée : {} ({} octets, format {})", filePath, imageBytes.length, extension);

        // Retourner le chemin relatif pour stockage en base de données
        return Paths.get(imagesDirPath, fileName).toString();
    }

    /**
     * Supprime un fichier image existant (utile lors d'une mise à jour).
     *
     * @param relativePath le chemin relatif précédemment stocké
     */
    public void deleteIfExists(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }
        try {
            Path filePath = Paths.get(relativePath).toAbsolutePath();
            if (Files.deleteIfExists(filePath)) {
                logger.info("Ancienne image supprimée : {}", filePath);
            }
        } catch (IOException e) {
            logger.warn("Impossible de supprimer l'ancienne image {} : {}", relativePath, e.getMessage());
        }
    }

    /**
     * Supprime le préfixe data-URI (ex: "data:image/jpeg;base64,") si présent.
     */
    private String stripDataUriPrefix(String base64Data) {
        if (base64Data.contains(",")) {
            // Format data-URI : "data:image/...;base64,<contenu>"
            return base64Data.substring(base64Data.indexOf(",") + 1);
        }
        return base64Data.trim();
    }

    /**
     * Détecte le format de l'image à partir des bytes décodés ou du préfixe
     * data-URI.
     * Retourne "png" ou "jpg".
     */
    private String detectImageFormat(byte[] imageBytes, String originalBase64) {
        // 1) Vérifier le préfixe data-URI
        if (originalBase64 != null) {
            String lower = originalBase64.toLowerCase();
            if (lower.startsWith("data:image/png")) {
                return "png";
            }
            if (lower.startsWith("data:image/jpeg") || lower.startsWith("data:image/jpg")) {
                return "jpg";
            }
        }

        // 2) Vérifier les signatures magiques des bytes
        if (imageBytes.length >= PNG_SIGNATURE.length && startsWith(imageBytes, PNG_SIGNATURE)) {
            return "png";
        }
        if (imageBytes.length >= JPEG_SIGNATURE.length && startsWith(imageBytes, JPEG_SIGNATURE)) {
            return "jpg";
        }

        // 3) Par défaut → JPEG
        logger.debug("Format d'image non détecté, utilisation de JPEG par défaut");
        return "jpg";
    }

    private boolean startsWith(byte[] data, byte[] signature) {
        for (int i = 0; i < signature.length; i++) {
            if (data[i] != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
