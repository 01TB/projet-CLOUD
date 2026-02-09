import api from './api';

class SignalementService {
  
  // Récupérer tous les signalements avec pagination et filtres
  async getAllSignalements(params = {}) {
    try {
      const response = await api.get('/getSignalements', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all signalements:', error);
      throw error;
    }
  }

  // Récupérer un signalement par ID
  async getSignalementById(id) {
    try {
      const response = await api.get(`/getSignalement/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching signalement by ID:', error);
      throw error;
    }
  }

  // Créer un nouveau signalement
  async createSignalement(signalementData) {
    try {
      console.log(' Envoi à Firebase:', signalementData);
      
      const response = await api.post('/createSignalement', signalementData);
      
      console.log(' Réponse Firebase:', response.data);
      return response.data;
    } catch (error) {
      console.error(' Erreur Firebase:', error);
      
      // Logs détaillés pour le debug
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Error Message:', error.response.data?.error?.message || error.response.statusText);
      }
      
      throw error;
    }
  }

  // Mettre à jour un signalement (uniquement Manager)
  async updateSignalement(id, signalementData) {
    try {
      const response = await api.put(`/updateSignalement/${id}`, signalementData);
      return response.data;
    } catch (error) {
      console.error('Error updating signalement:', error);
      throw error;
    }
  }

  // Supprimer un signalement (uniquement Manager)
  async deleteSignalement(id) {
    try {
      const response = await api.delete(`/deleteSignalement/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting signalement:', error);
      throw error;
    }
  }

  // Récupérer les signalements de l'utilisateur connecté (utilise le filtre id_utilisateur_createur)
  async getMySignalements() {
    try {
      // Récupérer l'ID de l'utilisateur connecté depuis le localStorage ou token
      const { useAuthStore } = await import('@/store/modules/auth');
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Utiliser le endpoint getSignalements avec le filtre approprié
      const response = await api.get('/getSignalements', { 
        params: { id_utilisateur_createur: userId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my signalements:', error);
      throw error;
    }
  }

  // Récupérer les statuts disponibles
  async getStatuts() {
    try {
      const response = await api.get('/getStatuts');
      return response.data;
    } catch (error) {
      console.error('Error fetching statuts:', error);
      throw error;
    }
  }

  // Récupérer les statistiques
  async getStats() {
    try {
      const response = await api.get('/getStats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // Récupérer les signalements avec pagination
  async getSignalementsPaginated(page = 1, limit = 20, filters = {}) {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get('/getSignalements', { params });
      
      // Si le backend ne retourne pas id_entreprise, essayer de récupérer les détails complets
      if (response.data.success && response.data.data) {
        const signalementsWithEntreprise = await Promise.all(
          response.data.data.map(async (signalement) => {
            if (!signalement.id_entreprise) {
              try {
                console.log(`🔍 Récupération id_entreprise pour signalement ${signalement.id}`);
                const details = await this.getSignalementById(signalement.id);
                if (details.success && details.data.id_entreprise) {
                  console.log(`✅ id_entreprise trouvé: ${details.data.id_entreprise}`);
                  return { ...signalement, id_entreprise: details.data.id_entreprise };
                }
              } catch (error) {
                console.warn(`⚠️ Impossible de récupérer id_entreprise pour ${signalement.id}`);
              }
            }
            return signalement;
          })
        );
        
        response.data.data = signalementsWithEntreprise;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated signalements:', error);
      throw error;
    }
  }

  // Ajouter une photo à un signalement
  async addPhotoToSignalement(signalementId, photoData) {
    try {
      console.log('📸 Service - Appel addSignalementPhoto avec params:', { id_signalement: signalementId, photo: photoData });
      const response = await api.post('/addSignalementPhoto', {
        id_signalement: signalementId,
        photo: photoData
      });
      return response.data;
    } catch (error) {
      console.error('Error adding photo to signalement:', error);
      throw error;
    }
  }

  // Créer un signalement avec photos (méthode complète)
  async createSignalementWithPhotos(signalementData, photos = []) {
    try {
      // 1. Créer le signalement
      console.log('📝 Création du signalement:', signalementData);
      const signalementResponse = await this.createSignalement(signalementData);
      const createdSignalement = signalementResponse.data;
      
      console.log('✅ Signalement créé:', createdSignalement.id);
      
      // 2. Ajouter les photos si présentes
      if (photos && photos.length > 0) {
        console.log(`📸 Ajout de ${photos.length} photo(s) au signalement ${createdSignalement.id}`);
        
        const photoPromises = photos.map(async (photo, index) => {
          try {
            const photoResponse = await this.addPhotoToSignalement(createdSignalement.id, photo.data);
            console.log(`✅ Photo ${index + 1} ajoutée:`, photoResponse.data);
            return {
              ...photoResponse.data,
              // Garder les données originales de la photo
              data: photo.data,
              name: photo.name || `photo_${photoResponse.data.id}.jpg`,
              type: photo.type || 'image/jpeg'
            };
          } catch (error) {
            console.error(`❌ Erreur ajout photo ${index + 1}:`, error);
            throw error;
          }
        });
        
        const photoResults = await Promise.all(photoPromises);
        console.log('🎉 Toutes les photos ajoutées:', photoResults);
        
        // 3. Récupérer le signalement mis à jour avec les photos (avec fallback)
        try {
          const updatedSignalement = await this.getSignalementById(createdSignalement.id);
          console.log('🔄 Signalement mis à jour récupéré:', updatedSignalement);
          
          // Si le backend ne retourne pas id_entreprise, l'ajouter depuis les données originales
          if (!updatedSignalement.data.id_entreprise && signalementData.id_entreprise) {
            console.log('🏢 Ajout id_entreprise manquant:', signalementData.id_entreprise);
            updatedSignalement.data.id_entreprise = signalementData.id_entreprise;
          }
          
          return updatedSignalement;
        } catch (fetchError) {
          console.warn('⚠️ Impossible de récupérer le signalement mis à jour, retour du signalement original avec photos:', fetchError);
          // Retourner le signalement original avec les photos complètes
          return {
            ...createdSignalement,
            photos: photoResults,
            // S'assurer que id_entreprise est préservé
            id_entreprise: signalementData.id_entreprise
          };
        }
      }
      
      // S'assurer que id_entreprise est préservé même sans photos
      return {
        ...createdSignalement,
        id_entreprise: signalementData.id_entreprise
      };
    } catch (error) {
      console.error('❌ Erreur création signalement avec photos:', error);
      throw error;
    }
  }

  // Récupérer les signalements par créateur
  async getSignalementsByCreator(userId) {
    try {
      const response = await api.get('/getSignalements', { 
        params: { id_utilisateur_createur: userId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching signalements by creator:', error);
      throw error;
    }
  }
}

export default new SignalementService();