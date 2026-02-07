package web.backend.project.configs;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Arrays;

/**
 * Configuration Firebase pour la synchronisation avec Firestore
 */
@Configuration
public class FirebaseConfig {

    @Value("${firebase.database.url}")
    private String databaseUrl;

    @Value("${firebase.config.path}")
    private Resource firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // Créer les credentials avec les scopes nécessaires pour Firestore
                GoogleCredentials credentials = GoogleCredentials
                        .fromStream(firebaseConfigPath.getInputStream())
                        .createScoped(Arrays.asList(
                                "https://www.googleapis.com/auth/cloud-platform",
                                "https://www.googleapis.com/auth/datastore"));

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(credentials)
                        .setDatabaseUrl(databaseUrl)
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialized successfully");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase", e);
        }
    }

    @Bean
    Firestore firestore() {
        return FirestoreClient.getFirestore();
    }
}
