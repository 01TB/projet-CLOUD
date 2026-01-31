import api from './api';

class ProfileService {
  
  // Récupérer le profil de l'utilisateur connecté
  async getMyProfile() {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  // Mettre à jour le profil de l'utilisateur
  async updateProfile(profileData) {
    try {
      const response = await api.put('/update', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/changePassword', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  // Supprimer le compte utilisateur
  async deleteAccount() {
    try {
      const response = await api.delete('/deleteAccount');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // Récupérer l'historique des activités de l'utilisateur
  async getActivityHistory() {
    try {
      const response = await api.get('/getActivityHistory');
      return response.data;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      throw error;
    }
  }
}

export default new ProfileService();
