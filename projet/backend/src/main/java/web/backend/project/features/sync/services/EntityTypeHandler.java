package web.backend.project.features.sync.services;

import org.springframework.data.jpa.repository.JpaRepository;
import web.backend.project.entities.SyncableEntity;
import web.backend.project.entities.dto.FirebaseSerializable;

import java.util.Map;
import java.util.function.Supplier;

/**
 * Handler générique pour un type d'entité spécifique
 * Encapsule le repository, le factory et la logique de résolution des relations
 * 
 * @param <E> Type de l'entité
 * @param <D> Type du DTO
 */
public class EntityTypeHandler<E extends SyncableEntity<D>, D extends FirebaseSerializable> {

    private final String entityType;
    private final JpaRepository<E, Integer> repository;
    private final Supplier<E> entityFactory;
    private final Supplier<D> dtoFactory;
    private final RelationResolver<E, D> relationResolver;

    /**
     * Interface fonctionnelle pour résoudre les relations d'une entité
     */
    @FunctionalInterface
    public interface RelationResolver<E, D> {
        /**
         * Résout et assigne les relations de l'entité depuis le DTO
         * Par exemple: charge Utilisateur, Entreprise, etc. depuis leurs IDs
         */
        void resolveRelations(E entity, D dto);
    }

    public EntityTypeHandler(
            String entityType,
            JpaRepository<E, Integer> repository,
            Supplier<E> entityFactory,
            Supplier<D> dtoFactory,
            RelationResolver<E, D> relationResolver) {
        this.entityType = entityType;
        this.repository = repository;
        this.entityFactory = entityFactory;
        this.dtoFactory = dtoFactory;
        this.relationResolver = relationResolver;
    }

    /**
     * Constructeur simplifié pour les entités sans relations
     */
    public EntityTypeHandler(
            String entityType,
            JpaRepository<E, Integer> repository,
            Supplier<E> entityFactory,
            Supplier<D> dtoFactory) {
        this(entityType, repository, entityFactory, dtoFactory, (e, d) -> {
        });
    }

    public String getEntityType() {
        return entityType;
    }

    public JpaRepository<E, Integer> getRepository() {
        return repository;
    }

    /**
     * Crée une nouvelle instance de l'entité
     */
    public E createEntity() {
        return entityFactory.get();
    }

    /**
     * Crée un DTO depuis les données Firebase
     */
    public D createDTOFromFirebase(Map<String, Object> firebaseData) {
        D dto = dtoFactory.get();
        dto.fromFirebaseMap(firebaseData);
        return dto;
    }

    /**
     * Met à jour ou crée une entité depuis les données Firebase
     */
    public E updateOrCreate(Map<String, Object> firebaseData) {
        D dto = createDTOFromFirebase(firebaseData);
        Integer id = dto.getId();

        E entity;
        if (id != null && repository.existsById(id)) {
            entity = repository.findById(id).orElseThrow();
        } else {
            entity = createEntity();
            if (id != null) {
                entity.setId(id);
            }
        }

        // Met à jour les champs simples
        entity.updateFromDTO(dto);

        // Résout les relations
        relationResolver.resolveRelations(entity, dto);

        return repository.save(entity);
    }

    /**
     * Résout les relations de l'entité
     */
    public void resolveRelations(E entity, D dto) {
        relationResolver.resolveRelations(entity, dto);
    }
}
