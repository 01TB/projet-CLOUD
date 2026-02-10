package web.backend.project.entities;

import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Générateur d'ID custom Hibernate qui :
 * - Utilise l'ID explicitement défini si présent (ex: depuis Firebase)
 * - Génère un ID aléatoire entre 1 et 100 000 sinon
 *
 * Cela permet aux entités d'accepter des IDs explicites de Firebase
 * tout en supportant l'auto-génération pour les entités créées localement.
 */
public class UseExistingOrGenerateId implements IdentifierGenerator {

    /**
     * ThreadLocal pour passer un ID explicite (Firebase) au générateur
     * sans le mettre sur le champ @Id de l'entité (ce qui causerait
     * "detached entity passed to persist" ou "StaleObjectStateException")
     */
    private static final ThreadLocal<Integer> FORCED_ID = new ThreadLocal<>();

    /**
     * Définit un ID à forcer lors du prochain appel à persist()
     */
    public static void setForcedId(Integer id) {
        FORCED_ID.set(id);
    }

    /**
     * Nettoie le ThreadLocal (à appeler dans un finally)
     */
    public static void clearForcedId() {
        FORCED_ID.remove();
    }

    @Override
    public Object generate(SharedSessionContractImplementor session, Object entity) {
        // 1. Vérifier si un ID forcé est défini via ThreadLocal (nouveau entity depuis
        // Firebase)
        Integer forcedId = FORCED_ID.get();
        if (forcedId != null) {
            FORCED_ID.remove();
            return forcedId;
        }

        // 2. Vérifier si l'entité a déjà un ID défini
        Object id = session.getEntityPersister(null, entity)
                .getIdentifier(entity, session);

        if (id != null) {
            return id;
        }

        // 3. Pas d'ID défini → générer un ID aléatoire entre 1 et 100 000
        return ThreadLocalRandom.current().nextInt(1, 100_001);
    }
}
