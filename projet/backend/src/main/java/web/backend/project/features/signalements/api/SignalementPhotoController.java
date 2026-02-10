package web.backend.project.features.signalements.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import web.backend.project.entities.SignalementPhoto;
import web.backend.project.repositories.SignalementPhotoRepo;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Contrôleur pour les photos de signalements.
 * 
 * - GET /api/signalements/{idSignalement}/photos → liste des noms d'images
 * - GET /images/{fileName} → sert le fichier image (pour <img [src]>)
 */
@RestController
public class SignalementPhotoController {

    private static final Logger logger = LoggerFactory.getLogger(SignalementPhotoController.class);

    @Autowired
    private SignalementPhotoRepo signalementPhotoRepo;

    @Value("${app.upload.images-dir:uploads/images}")
    private String imagesDirPath;

    // ==================== API endpoints ====================

    /**
     * Récupère la liste des noms de fichiers photo pour un signalement donné.
     * GET /api/signalements/{idSignalement}/photos
     * 
     * Réponse : ["photo_1_sig_3.jpg", "photo_2_sig_3.png"]
     * 
     * Usage Angular :
     * this.http.get<string[]>(`/api/signalements/${id}/photos`)
     * .subscribe(names => this.imageNames = names);
     * 
     * <img *ngFor="let name of imageNames" [src]="'http://localhost:8080/images/' +
     * name">
     */
    @GetMapping("/api/signalements/{idSignalement}/photos")
    public ResponseEntity<List<String>> getPhotosBySignalement(@PathVariable Integer idSignalement) {
        List<SignalementPhoto> photos = signalementPhotoRepo.findBySignalement_Id(idSignalement);

        List<String> fileNames = photos.stream()
                .map(SignalementPhoto::getPathPhoto)
                .filter(path -> path != null && !path.isBlank())
                .map(this::extractFileName)
                .collect(Collectors.toList());

        return ResponseEntity.ok(fileNames);
    }

    // ==================== Image serving ====================

    /**
     * Sert un fichier image depuis le répertoire de stockage local.
     * GET /images/{fileName}
     * 
     * Usage Angular : <img [src]="'http://localhost:8080/images/' + imageName">
     */
    @GetMapping("/api/images/{fileName:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String fileName) {
        try {
            Path baseDir = Paths.get(imagesDirPath).toAbsolutePath().normalize();
            Path filePath = baseDir.resolve(fileName).normalize();
            
            logger.info("Recherche image - Répertoire de base: {}", baseDir);
            logger.info("Recherche image - Chemin complet: {}", filePath);
            logger.info("Recherche image - Fichier existe: {}", Files.exists(filePath));

            // Sécurité : vérifier que le fichier est bien dans le répertoire autorisé
            if (!filePath.startsWith(baseDir)) {
                logger.warn("Tentative d'accès à un fichier hors du répertoire d'images : {}", fileName);
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                logger.warn("Image non trouvée - Chemin: {} - Existe: {} - Lisible: {}", 
                    filePath, resource.exists(), resource.isReadable());
                return ResponseEntity.notFound().build();
            }

            // Déterminer le content-type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = fileName.toLowerCase().endsWith(".png")
                        ? MediaType.IMAGE_PNG_VALUE
                        : MediaType.IMAGE_JPEG_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);

        } catch (IOException e) {
            logger.error("Erreur lors du chargement de l'image {} : {}", fileName, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== Helpers ====================

    /**
     * Extrait le nom de fichier depuis un chemin complet (ex:
     * "uploads/images/photo_1_sig_2.jpg" → "photo_1_sig_2.jpg")
     */
    private String extractFileName(String fullPath) {
        if (fullPath == null)
            return null;
        return Paths.get(fullPath).getFileName().toString();
    }
}
