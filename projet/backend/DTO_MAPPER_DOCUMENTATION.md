# DTO and Mapper Pattern Documentation

## Overview

This project uses a clean, generic DTO (Data Transfer Object) pattern for API requests and responses. The pattern separates concerns between entities and DTOs using dedicated mapper classes.

## Architecture

### Core Components

1. **Base Interfaces**
   - `BaseDTO`: Marker interface for all DTOs
   - `RequestDTO`: Marker interface for request DTOs (create/update)
   - `ResponseDTO`: Marker interface for response DTOs

2. **Mapper Interfaces**
   - `EntityMapper<E, REQ, RES>`: Generic interface defining conversion methods
   - `BaseEntityMapper<E, REQ, RES>`: Abstract base class with utility methods

3. **DTOs**
   - `*CreateRequestDTO`: For creating new entities (all required fields)
   - `*UpdateRequestDTO`: For updating entities (all fields optional for partial updates)
   - `*ResponseDTO`: For API responses (includes nested summaries to avoid circular references)

## Benefits

✅ **Separation of Concerns**: Entities remain clean domain models  
✅ **Type Safety**: Generic mappers ensure compile-time type checking  
✅ **Immutability**: Java records provide immutable DTOs  
✅ **Validation**: Bean validation annotations on DTOs  
✅ **Flexibility**: Easy to add new DTOs without modifying entities  
✅ **API Stability**: DTOs decouple API from database structure

## Usage Example

### 1. Define DTOs

```java
// Create Request
public record SignalementCreateRequestDTO(
    @NotNull String dateCreation,
    @Positive Double surface,
    // ... other fields
) implements RequestDTO {}

// Update Request (all fields optional)
public record SignalementUpdateRequestDTO(
    String dateCreation,
    Double surface,
    // ... other fields
) implements RequestDTO {}

// Response
public record SignalementResponseDTO(
    Integer id,
    String dateCreation,
    UtilisateurSummaryDTO utilisateurCreateur,
    // ... other fields
) implements ResponseDTO {}
```

### 2. Create Mapper

```java
@Component
public class SignalementMapper
    extends BaseEntityMapper<Signalement, SignalementCreateRequestDTO, SignalementResponseDTO> {

    @Override
    public SignalementResponseDTO toResponseDTO(Signalement entity) {
        // Convert entity to response DTO
    }

    @Override
    public Signalement toEntity(SignalementCreateRequestDTO requestDTO) {
        // Create new entity from request DTO
    }

    @Override
    public void updateEntityFromDTO(Signalement entity, SignalementCreateRequestDTO requestDTO) {
        // Update existing entity
    }

    // Optional: Add custom update method for UpdateRequestDTO
    public void updateEntityFromUpdateDTO(Signalement entity, SignalementUpdateRequestDTO updateDTO) {
        // Partial update logic
    }
}
```

### 3. Use in Controller

```java
@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    private final SignalementService service;
    private final SignalementMapper mapper;

    @PostMapping
    public ResponseEntity<SignalementResponseDTO> create(
            @Valid @RequestBody SignalementCreateRequestDTO requestDTO) {
        Signalement entity = service.create(requestDTO);
        return ResponseEntity.ok(mapper.toResponseDTO(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> update(
            @PathVariable Integer id,
            @Valid @RequestBody SignalementUpdateRequestDTO updateDTO) {
        Signalement entity = service.update(id, updateDTO);
        return ResponseEntity.ok(mapper.toResponseDTO(entity));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SignalementResponseDTO> getById(@PathVariable Integer id) {
        Signalement entity = service.findById(id);
        return ResponseEntity.ok(mapper.toResponseDTO(entity));
    }

    @GetMapping
    public ResponseEntity<List<SignalementResponseDTO>> getAll() {
        List<Signalement> entities = service.findAll();
        return ResponseEntity.ok(mapper.toResponseDTOList(entities));
    }
}
```

### 4. Use in Service

```java
@Service
public class SignalementService {

    private final SignalementRepository repository;
    private final SignalementMapper mapper;
    private final UtilisateurRepository utilisateurRepository;
    private final EntrepriseRepository entrepriseRepository;

    @Transactional
    public Signalement create(SignalementCreateRequestDTO requestDTO) {
        // Convert DTO to entity
        Signalement signalement = mapper.toEntity(requestDTO);

        // Fetch and set relationships (important!)
        Utilisateur utilisateur = utilisateurRepository.findById(requestDTO.utilisateurCreateurId())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
        signalement.setUtilisateurCreateur(utilisateur);

        Entreprise entreprise = entrepriseRepository.findById(requestDTO.entrepriseId())
            .orElseThrow(() -> new EntityNotFoundException("Enterprise not found"));
        signalement.setEntreprise(entreprise);

        return repository.save(signalement);
    }

    @Transactional
    public Signalement update(Integer id, SignalementUpdateRequestDTO updateDTO) {
        Signalement signalement = repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Signalement not found"));

        // Update only provided fields
        mapper.updateEntityFromUpdateDTO(signalement, updateDTO);

        // Update relationships if provided
        if (updateDTO.utilisateurCreateurId() != null) {
            Utilisateur utilisateur = utilisateurRepository.findById(updateDTO.utilisateurCreateurId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
            signalement.setUtilisateurCreateur(utilisateur);
        }

        if (updateDTO.entrepriseId() != null) {
            Entreprise entreprise = entrepriseRepository.findById(updateDTO.entrepriseId())
                .orElseThrow(() -> new EntityNotFoundException("Enterprise not found"));
            signalement.setEntreprise(entreprise);
        }

        return repository.save(signalement);
    }

    public Signalement findById(Integer id) {
        return repository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Signalement not found"));
    }

    public List<Signalement> findAll() {
        return repository.findAll();
    }
}
```

## Best Practices

### 1. DTO Structure

- **Create DTOs**: All required fields with `@NotNull` annotations
- **Update DTOs**: All fields optional for partial updates
- **Response DTOs**: Include nested summary DTOs to avoid circular references

### 2. Validation

- Add Bean Validation annotations to request DTOs
- Validate at controller level with `@Valid`
- Custom validation can be added in service layer

### 3. Relationships

- DTOs should reference related entities by ID
- Service layer is responsible for fetching and setting relationships
- Response DTOs should include summary objects, not full entities

### 4. Mapper Patterns

- One mapper per entity
- Extend `BaseEntityMapper` for utility methods
- Add custom methods for specific DTO types (e.g., `updateEntityFromUpdateDTO`)

### 5. Geometry Handling

- Accept GeoJSON or WKT format in request DTOs
- Always return GeoJSON in response DTOs (easier for frontend)
- Handle parsing errors with meaningful exceptions

## Adding New Entity DTOs

Follow this checklist:

1. ✅ Create `*CreateRequestDTO` with required fields
2. ✅ Create `*UpdateRequestDTO` with optional fields
3. ✅ Create `*ResponseDTO` with all output fields
4. ✅ Add nested summary DTOs for relationships
5. ✅ Create mapper extending `BaseEntityMapper`
6. ✅ Implement three core methods: `toResponseDTO`, `toEntity`, `updateEntityFromDTO`
7. ✅ Add custom `updateEntityFromUpdateDTO` if needed
8. ✅ Use in service and controller layers

## Example for New Entity

```java
// 1. DTOs
public record ProductCreateRequestDTO(
    @NotNull String name,
    @Positive BigDecimal price
) implements RequestDTO {}

public record ProductUpdateRequestDTO(
    String name,
    BigDecimal price
) implements RequestDTO {}

public record ProductResponseDTO(
    Integer id,
    String name,
    BigDecimal price
) implements ResponseDTO {}

// 2. Mapper
@Component
public class ProductMapper extends BaseEntityMapper<Product, ProductCreateRequestDTO, ProductResponseDTO> {
    @Override
    public ProductResponseDTO toResponseDTO(Product entity) {
        return new ProductResponseDTO(entity.getId(), entity.getName(), entity.getPrice());
    }

    @Override
    public Product toEntity(ProductCreateRequestDTO requestDTO) {
        Product product = new Product();
        product.setName(requestDTO.name());
        product.setPrice(requestDTO.price());
        return product;
    }

    @Override
    public void updateEntityFromDTO(Product entity, ProductCreateRequestDTO requestDTO) {
        entity.setName(requestDTO.name());
        entity.setPrice(requestDTO.price());
    }
}
```

## Common Pitfalls to Avoid

❌ Don't put DTO conversion logic in entities  
❌ Don't use entities directly in controllers  
❌ Don't forget to fetch relationships in service layer  
❌ Don't return full entity graphs in response DTOs  
❌ Don't skip validation on request DTOs  
❌ Don't use the same DTO for create and update

✅ Do keep entities and DTOs separate  
✅ Do use mappers for all conversions  
✅ Do handle relationships in service layer  
✅ Do use summary DTOs for nested objects  
✅ Do add comprehensive validation  
✅ Do differentiate create and update DTOs
