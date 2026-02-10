import api from './api';

class EntrepriseService {
  
  // Récupérer toutes les entreprises depuis Firebase API
  async getAllEntreprises() {
    try {
      const response = await api.get('/getEntreprises');
      
      if (response.data.success) {
        console.log('✅ Entreprises récupérées:', response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur lors de la récupération des entreprises');
      }
    } catch (error) {
      console.error('❌ Erreur getAllEntreprises:', error);
      
      // Gérer les erreurs spécifiques
      if (error.response?.status === 500) {
        throw new Error('Erreur interne du serveur');
      } else if (error.response?.status === 404) {
        throw new Error('Endpoint getEntreprises non trouvé');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout - le serveur ne répond pas');
      } else {
        throw new Error('Erreur réseau ou serveur');
      }
    }
  }

  // Récupérer une entreprise par son ID
  async getEntrepriseById(id) {
    try {
      const allEntreprises = await this.getAllEntreprises();
      const entreprise = allEntreprises.data.find(e => e.id === id || e.id === parseInt(id));
      return {
        success: true,
        data: entreprise || null
      };
    } catch (error) {
      console.error('❌ Erreur getEntrepriseById:', error);
      throw error;
    }
  }

  // Créer une nouvelle entreprise
  async createEntreprise(entrepriseData) {
    try {
      const response = await api.post('/createEntreprise', entrepriseData);
      
      if (response.data.success) {
        console.log('✅ Entreprise créée:', response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur lors de la création de l\'entreprise');
      }
    } catch (error) {
      console.error('❌ Erreur createEntreprise:', error);
      throw error;
    }
  }

  // Mettre à jour une entreprise
  async updateEntreprise(id, entrepriseData) {
    try {
      const response = await api.put(`/updateEntreprise/${id}`, entrepriseData);
      
      if (response.data.success) {
        console.log('✅ Entreprise mise à jour:', response.data.data);
        return response.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur lors de la mise à jour de l\'entreprise');
      }
    } catch (error) {
      console.error('❌ Erreur updateEntreprise:', error);
      throw error;
    }
  }

  // Supprimer une entreprise
  async deleteEntreprise(id) {
    try {
      const response = await api.delete(`/deleteEntreprise/${id}`);
      
      if (response.data.success) {
        console.log('✅ Entreprise supprimée:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur lors de la suppression de l\'entreprise');
      }
    } catch (error) {
      console.error('❌ Erreur deleteEntreprise:', error);
      throw error;
    }
  }

  // Récupérer les entreprises avec pagination
  async getEntreprisesPaginated(page = 1, limit = 20, filters = {}) {
    try {
      const response = await api.get('/getEntreprises', {
        params: {
          page,
          limit,
          ...filters
        }
      });
      
      if (response.data.success) {
        console.log('✅ Entreprises paginées récupérées:', response.data);
        return response.data;
      } else {
        throw new Error(response.data.error?.message || 'Erreur lors de la récupération des entreprises paginées');
      }
    } catch (error) {
      console.error('❌ Erreur getEntreprisesPaginated:', error);
      throw error;
    }
  }
}

export default new EntrepriseService();
