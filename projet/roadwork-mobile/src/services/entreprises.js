import api from './api';

class EntrepriseService {
  
  // Récupérer toutes les entreprises
  async getAllEntreprises() {
    try {
      const response = await api.get('/getEntreprises');
      return response.data;
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      throw error;
    }
  }

  // Récupérer une entreprise par ID
  async getEntrepriseById(id) {
    try {
      const response = await api.get(`/getEntreprise/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching entreprise by ID:', error);
      throw error;
    }
  }

  // Créer une nouvelle entreprise (uniquement Manager)
  async createEntreprise(entrepriseData) {
    try {
      const response = await api.post('/createEntreprise', entrepriseData);
      return response.data;
    } catch (error) {
      console.error('Error creating entreprise:', error);
      throw error;
    }
  }

  // Mettre à jour une entreprise (uniquement Manager)
  async updateEntreprise(id, entrepriseData) {
    try {
      const response = await api.put(`/updateEntreprise/${id}`, entrepriseData);
      return response.data;
    } catch (error) {
      console.error('Error updating entreprise:', error);
      throw error;
    }
  }

  // Supprimer une entreprise (uniquement Manager)
  async deleteEntreprise(id) {
    try {
      const response = await api.delete(`/deleteEntreprise/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting entreprise:', error);
      throw error;
    }
  }
}

export default new EntrepriseService();
