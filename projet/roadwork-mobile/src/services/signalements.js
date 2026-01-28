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
      const response = await api.post('/createSignalement', signalementData);
      return response.data;
    } catch (error) {
      console.error('Error creating signalement:', error);
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
      // Utiliser le endpoint getSignalements avec le filtre approprié
      const response = await api.get('/getSignalements', { 
        params: { id_utilisateur_createur: 'current' } 
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
      return response.data;
    } catch (error) {
      console.error('Error fetching paginated signalements:', error);
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