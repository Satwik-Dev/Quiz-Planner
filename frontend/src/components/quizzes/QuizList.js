import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Quizzes.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quizzes');
        setQuizzes(response.data);
      } catch (err) {
        setError('Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${id}`);
        setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      } catch (err) {
        setError('Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading quizzes...</div>;
  }

  return (
    <div className="quizzes-container">
      <div className="quizzes-header">
        <h1>Quizzes</h1>
        <Link to="/quizzes/generate" className="btn btn-primary">
          Generate New Quiz
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {quizzes.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any quizzes yet.</p>
          <Link to="/quizzes/generate" className="btn btn-primary">
            Generate Your First Quiz
          </Link>
        </div>
      ) : (
        <div className="quiz-list">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="quiz-card">
              <h3>{quiz.title}</h3>
              <div className="date">
                Created: {new Date(quiz.created_at).toLocaleDateString()}
              </div>
              <p className="description">
                {quiz.description || 'No description provided'}
              </p>
              
              <div className="stats">
                <span>{quiz.num_questions} questions</span>
              </div>
              
              <div className="quiz-actions">
                <Link 
                  to={`/quizzes/${quiz.id}`} 
                  className="btn btn-primary"
                  onClick={() => console.log('Navigating to quiz with ID:', quiz.id)} // Debug log
                >
                  Take Quiz
                </Link>
                <button 
                  onClick={() => handleDelete(quiz.id)} 
                  className="btn btn-outline-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;