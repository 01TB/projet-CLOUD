package web.backend.project.features.users.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import web.backend.project.entities.Role;
import web.backend.project.entities.Utilisateur;
import web.backend.project.entities.UtilisateurBloque;
import web.backend.project.entities.dto.UtilisateurDTO;
import web.backend.project.entities.dto.UtilisateurResponseDTO;
import web.backend.project.repositories.RoleRepository;
import web.backend.project.repositories.UtilisateurBloqueRepo;
import web.backend.project.repositories.UtilisateurRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UtilisateurService {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurBloqueRepo utilisateurBloqueRepo;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Convertit un Utilisateur en UtilisateurResponseDTO avec les informations de blocage
     */
    public UtilisateurResponseDTO toResponseDTO(Utilisateur utilisateur) {
        UtilisateurResponseDTO response = new UtilisateurResponseDTO();
        response.setId(utilisateur.getId());
        response.setEmail(utilisateur.getEmail());
        response.setRole(utilisateur.getRole());
        
        // Vérifier si l'utilisateur est bloqué
        Optional<UtilisateurBloque> blocage = utilisateurBloqueRepo.findByUtilisateurId(utilisateur.getId());
        response.setEstBloque(blocage.isPresent());
        
        if (blocage.isPresent()) {
            response.setDateBlocage(blocage.get().getDateBlocage().format(DATE_FORMATTER));
        } else {
            response.setDateBlocage(null);
        }
        
        // Date de création - pour l'instant null car non disponible dans la base
        response.setDateCreation(null);
        
        return response;
    }

    /**
     * Récupère tous les utilisateurs avec leurs informations de blocage
     */
    public List<UtilisateurResponseDTO> getAllUtilisateursWithBlockInfo() {
        return utilisateurRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un utilisateur avec ses informations de blocage
     */
    public UtilisateurResponseDTO getUtilisateurWithBlockInfo(Integer id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("L'utilisateur avec l'ID " + id + " n'existe pas"));
        return toResponseDTO(utilisateur);
    }

    /**
     * Crée un nouvel utilisateur
     * 
     * @param utilisateurDTO Les données de l'utilisateur à créer
     * @return L'utilisateur créé
     * @throws IllegalArgumentException Si l'email existe déjà ou si le rôle
     *                                  n'existe pas
     */
    @Transactional
    public Utilisateur creerUtilisateur(UtilisateurDTO utilisateurDTO) {
        // Validation de l'email
        if (utilisateurDTO.getEmail() == null || utilisateurDTO.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("L'email ne peut pas être vide");
        }

        // Vérification que l'email n'existe pas déjà
        Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(utilisateurDTO.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }

        // Validation du mot de passe
        if (utilisateurDTO.getPassword() == null || utilisateurDTO.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe ne peut pas être vide");
        }

        System.out.println("check role");
        // Récupération du rôle
        Role role = roleRepository.findById(utilisateurDTO.getRoleId())
                .orElseThrow(() -> new IllegalArgumentException("Le rôle spécifié n'existe pas"));
        System.out.println("apres check role");

        // Création de l'utilisateur
        Utilisateur utilisateur = new Utilisateur();
        // L'ID sera généré automatiquement par la base de données
        utilisateur.setEmail(utilisateurDTO.getEmail().toLowerCase().trim());
        // Encodage du mot de passe
        utilisateur.setPassword(passwordEncoder.encode(utilisateurDTO.getPassword()));
        utilisateur.setSynchro(false);
        utilisateur.setRole(role);

        System.out.println("------------ efa tsy maka id tsony e");
        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Modifie un utilisateur existant
     * 
     * @param id             L'ID de l'utilisateur à modifier
     * @param utilisateurDTO Les nouvelles données de l'utilisateur
     * @return L'utilisateur modifié
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas ou si les
     *                                  données sont invalides
     */
    @Transactional
    public Utilisateur modifierUtilisateur(Integer id, UtilisateurDTO utilisateurDTO) {
        // Vérification que l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("L'utilisateur avec l'ID " + id + " n'existe pas"));

        // Vérification si l'utilisateur est bloqué
        if (estUtilisateurBloque(id)) {
            throw new IllegalStateException("Impossible de modifier un utilisateur bloqué");
        }

        // Modification de l'email si fourni et différent
        if (utilisateurDTO.getEmail() != null && !utilisateurDTO.getEmail().trim().isEmpty()) {
            String newEmail = utilisateurDTO.getEmail().toLowerCase().trim();
            if (!newEmail.equals(utilisateur.getEmail())) {
                // Vérifier que le nouvel email n'est pas déjà utilisé
                Optional<Utilisateur> existingUser = utilisateurRepository.findByEmail(newEmail);
                if (existingUser.isPresent()) {
                    throw new IllegalArgumentException("Un autre utilisateur utilise déjà cet email");
                }
                utilisateur.setEmail(newEmail);
            }
        }

        // Modification du mot de passe si fourni
        if (utilisateurDTO.getPassword() != null && !utilisateurDTO.getPassword().trim().isEmpty()) {
            utilisateur.setPassword(passwordEncoder.encode(utilisateurDTO.getPassword()));
        }

        // Modification du rôle si fourni
        if (utilisateurDTO.getRoleId() != null) {
            Role role = roleRepository.findById(utilisateurDTO.getRoleId())
                    .orElseThrow(() -> new IllegalArgumentException("Le rôle spécifié n'existe pas"));
            utilisateur.setRole(role);
        }

        utilisateur.setSynchro(false);

        return utilisateurRepository.save(utilisateur);
    }

    /**
     * Bloque un utilisateur
     * 
     * @param utilisateurId L'ID de l'utilisateur à bloquer
     * @return L'entrée de blocage créée
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas
     * @throws IllegalStateException    Si l'utilisateur est déjà bloqué
     */
    @Transactional
    public UtilisateurBloque bloquerUtilisateur(Integer utilisateurId) {
        // Vérification que l'utilisateur existe
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "L'utilisateur avec l'ID " + utilisateurId + " n'existe pas"));

        // Vérification que l'utilisateur n'est pas déjà bloqué
        if (estUtilisateurBloque(utilisateurId)) {
            throw new IllegalStateException("L'utilisateur est déjà bloqué");
        }

        // Création de l'entrée de blocage
        UtilisateurBloque utilisateurBloque = new UtilisateurBloque();
        utilisateurBloque.setUtilisateur(utilisateur);
        utilisateurBloque.setDateBlocage(LocalDateTime.now());
        utilisateurBloque.setSynchro(false);

        return utilisateurBloqueRepo.save(utilisateurBloque);
    }

    /**
     * Débloque un utilisateur
     * 
     * @param utilisateurId L'ID de l'utilisateur à débloquer
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas
     * @throws IllegalStateException    Si l'utilisateur n'est pas bloqué
     */
    @Transactional
    public void debloquerUtilisateur(Integer utilisateurId) {
        // Vérification que l'utilisateur existe
        if (!utilisateurRepository.existsById(utilisateurId)) {
            throw new IllegalArgumentException("L'utilisateur avec l'ID " + utilisateurId + " n'existe pas");
        }

        // Vérification que l'utilisateur est bloqué
        if (!utilisateurBloqueRepo.existsByUtilisateurId(utilisateurId)) {
            throw new IllegalStateException("L'utilisateur n'est pas bloqué");
        }

        // Suppression de l'entrée de blocage
        utilisateurBloqueRepo.deleteByUtilisateurId(utilisateurId);
    }

    /**
     * Vérifie si un utilisateur est bloqué
     * 
     * @param utilisateurId L'ID de l'utilisateur
     * @return true si l'utilisateur est bloqué, false sinon
     */
    public boolean estUtilisateurBloque(Integer utilisateurId) {
        return utilisateurBloqueRepo.existsByUtilisateurId(utilisateurId);
    }

    /**
     * Récupère un utilisateur par son ID
     * 
     * @param id L'ID de l'utilisateur
     * @return L'utilisateur
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas
     */
    public Utilisateur getUtilisateurById(Integer id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("L'utilisateur avec l'ID " + id + " n'existe pas"));
    }

    /**
     * Récupère un utilisateur par son email
     * 
     * @param email L'email de l'utilisateur
     * @return L'utilisateur
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas
     */
    public Utilisateur getUtilisateurByEmail(String email) {
        return utilisateurRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Aucun utilisateur avec l'email " + email + " n'a été trouvé"));
    }

    /**
     * Récupère tous les utilisateurs
     * 
     * @return La liste de tous les utilisateurs
     */
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    /**
     * Supprime un utilisateur
     * 
     * @param id L'ID de l'utilisateur à supprimer
     * @throws IllegalArgumentException Si l'utilisateur n'existe pas
     */
    @Transactional
    public void supprimerUtilisateur(Integer id) {
        if (!utilisateurRepository.existsById(id)) {
            throw new IllegalArgumentException("L'utilisateur avec l'ID " + id + " n'existe pas");
        }

        // Supprimer d'abord l'entrée de blocage si elle existe
        if (utilisateurBloqueRepo.existsByUtilisateurId(id)) {
            utilisateurBloqueRepo.deleteByUtilisateurId(id);
        }

        // Ensuite supprimer l'utilisateur
        utilisateurRepository.deleteById(id);
    }
}
