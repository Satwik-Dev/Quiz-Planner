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
    attemptsCount: 0,
    averageScore: 0
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination for attempts
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  // Filtering for attempts
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, startDate, endDate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data
        const dashboardResponse = await api.get('/quizzes/dashboard');
        const dashboardData = dashboardResponse.data;
        
        // Set stats using the actual material count from backend
        setStats({
          materialsCount: dashboardData.stats.total_materials,
          quizzesCount: dashboardData.stats.total_quizzes,
          attemptsCount: dashboardData.stats.total_attempts,
          averageScore: dashboardData.stats.average_score
        });
        
        // Set recent quizzes
        setRecentQuizzes(dashboardData.recentQuizzes);
        
        // Set recent materials if available
        if (dashboardData.recentMaterials) {
          setRecentMaterials(dashboardData.recentMaterials);
        } else {
          // Fallback to fetching materials
          const materialsResponse = await api.get('/materials');
          setRecentMaterials(materialsResponse.data.slice(0, 3));
        }
        
        // Fetch quiz attempts with pagination and filtering
        await fetchAttempts();
        
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const fetchAttempts = async () => {
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      
      if (startDate) {
        params.append('start_date', new Date(startDate).toISOString());
      }
      
      if (endDate) {
        params.append('end_date', new Date(endDate).toISOString());
      }
      
      const attemptsResponse = await api.get(`/quizzes/attempts?${params.toString()}`);
      setQuizAttempts(attemptsResponse.data.attempts);
      setTotalPages(attemptsResponse.data.pagination.pages);
      setTotalAttempts(attemptsResponse.data.pagination.total);
    } catch (err) {
      console.error('Failed to load quiz attempts:', err);
    }
  };
  
  // Load attempts when page or filters change
  useEffect(() => {
    fetchAttempts();
  }, [page, debouncedSearch, startDate, endDate]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };
  
  const renderPagination = () => {
    if (totalAttempts === 0) return null;
    
    return (
      <div className="pagination-controls">
        <button 
          onClick={() => setPage(page - 1)} 
          disabled={page === 1}
          className="btn btn-sm btn-outline-primary"
        >
          Previous
        </button>
        
        <span className="pagination-info">
          Page {page} of {totalPages} ({totalAttempts} total)
        </span>
        
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages}
          className="btn btn-sm btn-outline-primary"
        >
          Next
        </button>
      </div>
    );
  };

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
        
        <div className="stat-card">
          <div className="stat-number">{stats.averageScore}%</div>
          <div className="stat-label">Average Score</div>
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
                <div key={material._id || material.id} className="recent-item">
                  <h3>{material.title}</h3>
                  <p>{material.description || 'No description'}</p>
                  <Link to={`/materials/${material._id || material.id}`} className="btn btn-sm btn-outline-primary">
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
                <div key={quiz.id} className="recent-item">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.num_questions} questions</p>
                  <Link to={`/quizzes/${quiz.id}`} className="btn btn-sm btn-outline-primary">
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
      
      {/* Quiz Attempts Section */}
      <div className="dashboard-section mt-4 w-100">
        <div className="section-header">
          <h2>Quiz Attempts</h2>
          <Link to="/quizzes" className="btn btn-sm btn-primary">View All Quizzes</Link>
        </div>
        
        {/* Filters for quiz attempts */}
        <div className="filters-container">
          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by quiz title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={handleClearFilters}
                disabled={!searchQuery && !startDate && !endDate}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        
        {/* Render attempts */}
        {quizAttempts && quizAttempts.length > 0 ? (
          <>
            <div className="attempt-list">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th>Score</th>
                      <th>Date Taken</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizAttempts.map(attempt => (
                      <tr key={attempt._id}>
                        <td>{attempt.quiz_title || "Unknown Quiz"}</td>
                        <td>
                          {attempt.score}/{attempt.total_questions} ({attempt.percentage.toFixed(1)}%)
                        </td>
                        <td>{new Date(attempt.created_at).toLocaleString()}</td>
                        <td>
                          <Link 
                            to={`/quizzes/${attempt.quiz_id}`} 
                            className="btn btn-sm btn-outline-primary"
                          >
                            Retake Quiz
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {renderPagination()}
          </>
        ) : (
          <div className="empty-state">
            <p>
              {debouncedSearch || startDate || endDate
                ? 'No quiz attempts found matching your filters.'
                : 'No quiz attempts yet'}
            </p>
            {debouncedSearch || startDate || endDate ? (
              <button 
                className="btn btn-outline-primary"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            ) : (
              stats.quizzesCount > 0 ? (
                <Link to="/quizzes" className="btn btn-primary">
                  Take a Quiz
                </Link>
              ) : (
                <p>Generate quizzes first to take them</p>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;