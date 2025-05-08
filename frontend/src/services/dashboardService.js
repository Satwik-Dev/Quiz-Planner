// src/services/dashboardService.js
import api from './api';

const dashboardService = {
  async getDashboardStats() {
    try {
      // Fetch materials count
      const materialsResponse = await api.get('/api/materials');
      const materials = materialsResponse.data;
      
      // Fetch quizzes count
      const quizzesResponse = await api.get('/api/quizzes');
      const quizzes = quizzesResponse.data;
      
      // Fetch quiz attempts
      const attemptsResponse = await api.get('/api/quizzes/attempts');
      const attempts = attemptsResponse.data;
      
      // Calculate average score
      const averageScore = attempts.length > 0
        ? attempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / attempts.length
        : 0;
        
      // Get recent materials and quizzes
      const recentMaterials = materials.slice(0, 3);
      const recentQuizzes = quizzes.slice(0, 3);
      
      return {
        stats: {
          materialsCount: materials.length,
          quizzesCount: quizzes.length,
          attemptsCount: attempts.length,
          averageScore: parseFloat(averageScore.toFixed(1))
        },
        recentMaterials,
        recentQuizzes,
        quizAttempts: attempts
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
};

export default dashboardService;