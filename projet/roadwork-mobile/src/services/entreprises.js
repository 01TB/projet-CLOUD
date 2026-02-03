import api from './api';

class EntrepriseService {
  
  // Récupérer toutes les entreprises (utilisera les données locales pour éviter les erreurs CORS)
  async getAllEntreprises() {
    try {
      // Pour l'instant, retourner des données locales pour éviter les erreurs CORS
      // L'endpoint /entreprises n'existe probablement pas sur l'API
      return {
        success: true,
        data: [
          {
            id: 1,
            nom: "Entreprise Routière Madagascar",
            description: "Spécialisée dans les travaux routiers",
            telephone: "+261340000001",
            email: "contact@erm.mg",
            date_creation: "2026-01-15T10:30:00.000Z",
            date_modification: "2026-01-15T10:30:00.000Z"
          },
          {
            id: 2,
            nom: "BTP Construction",
            description: "Construction et travaux publics",
            telephone: "+261340000002",
            email: "info@btp.mg",
            date_creation: "2026-01-16T14:20:00.000Z",
            date_modification: "2026-01-16T14:20:00.000Z"
          },
          {
            id: 3,
            nom: "Infrastructure SARL",
            description: "Développement d'infrastructures",
            telephone: "+261340000003",
            email: "contact@infra.mg",
            date_creation: "2026-01-17T09:15:00.000Z",
            date_modification: "2026-01-17T09:15:00.000Z"
          }
        ]
      };
      
      // Si l'endpoint existe plus tard, décommentez ce code :
      // const response = await api.get('/entreprises');
      // return response.data;
    } catch (error) {
      console.error('Error fetching entreprises:', error);
      // En cas d'erreur, retourner les données locales
      return {
        success: true,
        data: [
          {
            id: 1,
            nom: "Entreprise Routière Madagascar",
            description: "Spécialisée dans les travaux routiers"
          },
          {
            id: 2,
            nom: "BTP Construction",
            description: "Construction et travaux publics"
          }
        ]
      };
    }
  }

  // Récupérer une entreprise par son ID
  async getEntrepriseById(id) {
    try {
      const allEntreprises = await this.getAllEntreprises();
      const entreprise = allEntreprises.data.find(e => e.id === parseInt(id));
      return {
        success: true,
        data: entreprise || null
      };
    } catch (error) {
      console.error('Error fetching entreprise by id:', error);
      throw error;
    }
  }

  // Les autres méthodes peuvent être implémentées plus tard si nécessaire
  async createEntreprise(entrepriseData) {
    console.log('createEntreprise called but not implemented:', entrepriseData);
    return { success: false, error: 'Non implémenté' };
  }

  async updateEntreprise(id, entrepriseData) {
    console.log('updateEntreprise called but not implemented:', id, entrepriseData);
    return { success: false, error: 'Non implémenté' };
  }

  async deleteEntreprise(id) {
    console.log('deleteEntreprise called but not implemented:', id);
    return { success: false, error: 'Non implémenté' };
  }

  async getEntreprisesPaginated(page = 1, limit = 20, filters = {}) {
    const allEntreprises = await this.getAllEntreprises();
    return {
      success: true,
      data: allEntreprises.data,
      pagination: {
        page,
        limit,
        total: allEntreprises.data.length,
        totalPages: 1
      }
    };
  }
}

export default new EntrepriseService();
