import api from './api';

const quizService = {
  async getAllQuizzes() {
    const response = await api.get('/quizzes');
    return response.data;
  },

  async getQuizById(id) {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  async generateQuiz(quizParams) {
    const response = await api.post('/quizzes/generate', quizParams);
    return response.data;
  },

  async deleteQuiz(id) {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  },
  
  // Helper function to format quiz results for display
  formatQuizForDisplay(quiz) {
    if (!quiz) return null;
    
    return {
      ...quiz,
      formattedDate: new Date(quiz.created_at).toLocaleDateString(),
      questionCountByType: quiz.questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
};

export default quizService;