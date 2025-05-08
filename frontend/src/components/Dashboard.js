import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    materialsCount: 0,
    quizzesCount: 0,
    attemptsCount: 0
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch materials
        const materialsResponse = await api.get('/materials');
        const materials = materialsResponse.data;
        
        // Fetch quizzes
        const quizzesResponse = await api.get('/quizzes');
        const quizzes = quizzesResponse.data;
        
        // Fetch quiz attempts
        const attemptsResponse = await api.get('/quizzes/attempts');
        const attempts = attemptsResponse.data;
        
        // Set stats
        setStats({
          materialsCount: materials.length,
          quizzesCount: quizzes.length,
          attemptsCount: attempts.length
        });
        
        // Set recent materials (last 3)
        setRecentMaterials(materials.slice(0, 3));
        
        // Set recent quizzes (last 3)
        setRecentQuizzes(quizzes.slice(0, 3));
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {currentUser?.name || 'User'}!</h1>
        <p>Here's an overview of your Quiz Planner activity</p>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{stats.materialsCount}</div>
          <div className="stat-label">Study Materials</div>
          <Link to="/materials" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.quizzesCount}</div>
          <div className="stat-label">Quizzes</div>
          <Link to="/quizzes" className="stat-link">View All</Link>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{stats.attemptsCount}</div>
          <div className="stat-label">Quiz Attempts</div>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Study Materials</h2>
            <Link to="/materials/create" className="btn btn-sm btn-primary">Create New</Link>
          </div>
          
          {recentMaterials.length > 0 ? (
            <div className="recent-items">
              {recentMaterials.map(material => (
                <div key={material._id} className="recent-item">
                  <h3>{material.title}</h3>
                  <p>{material.description || 'No description'}</p>
                  <Link to={`/materials/${material._id}`} className="btn btn-sm btn-outline-primary">
                    View Material
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No study materials yet</p>
              <Link to="/materials/create" className="btn btn-primary">
                Create Your First Study Material
              </Link>
            </div>
          )}
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Quizzes</h2>
            <Link to="/quizzes/generate" className="btn btn-sm btn-primary">Generate New</Link>
          </div>
          
          {recentQuizzes.length > 0 ? (
            <div className="recent-items">
              {recentQuizzes.map(quiz => (
                <div key={quiz._id} className="recent-item">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.question_count} questions</p>
                  <Link to={`/quizzes/${quiz._id}`} className="btn btn-sm btn-outline-primary">
                    Take Quiz
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No quizzes generated yet</p>
              {stats.materialsCount > 0 ? (
                <Link to="/quizzes/generate" className="btn btn-primary">
                  Generate Your First Quiz
                </Link>
              ) : (
                <p>Create study materials first to generate quizzes</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;