import api from './api';

class StatsService {
  
  // Récupérer les statistiques globales
  async getGlobalStats() {
    try {
      const response = await api.get('/getStats');
      return response.data;
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw error;
    }
  }

  // Récupérer les statistiques par utilisateur
  async getUserStats(userId) {
    try {
      const response = await api.get('/getUserStats', { 
        params: { id_utilisateur: userId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Récupérer les statistiques par entreprise
  async getEntrepriseStats(entrepriseId) {
    try {
      const response = await api.get('/getEntrepriseStats', { 
        params: { id_entreprise: entrepriseId } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching entreprise stats:', error);
      throw error;
    }
  }

  // Récupérer les statistiques par période
  async getStatsByPeriod(startDate, endDate) {
    try {
      const response = await api.get('/getStatsByPeriod', { 
        params: { date_debut: startDate, date_fin: endDate } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stats by period:', error);
      throw error;
    }
  }
}

export default new StatsService();
