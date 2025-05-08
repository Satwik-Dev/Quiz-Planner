import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Quizzes.css';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMaterial, setFilterMaterial] = useState('');
  const [materials, setMaterials] = useState([]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    // Fetch materials for the filter dropdown
    const fetchMaterials = async () => {
      try {
        const response = await api.get('/materials');
        setMaterials(response.data);
      } catch (err) {
        console.error('Failed to fetch study materials:', err);
      }
    };
    
    fetchMaterials();
  }, []);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterMaterial]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        
        // Build query params
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (debouncedSearch) {
          params.append('search', debouncedSearch);
        }
        
        if (filterMaterial) {
          params.append('material', filterMaterial);
        }
        
        const response = await api.get(`/quizzes?${params.toString()}`);
        setQuizzes(response.data.quizzes);
        setTotalPages(response.data.pagination.pages);
        setTotalQuizzes(response.data.pagination.total);
        setError('');
      } catch (err) {
        setError('Failed to fetch quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [page, limit, debouncedSearch, filterMaterial]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.delete(`/quizzes/${id}`);
        
        // Refresh quiz list after deletion
        const remainingQuizzes = quizzes.filter(quiz => quiz.id !== id);
        setQuizzes(remainingQuizzes);
        
        // If deleting the last quiz on the page, go to previous page (unless we're on page 1)
        if (remainingQuizzes.length === 0 && page > 1) {
          setPage(page - 1);
        } else {
          // Re-fetch current page
          const params = new URLSearchParams();
          params.append('page', page);
          params.append('limit', limit);
          
          if (debouncedSearch) {
            params.append('search', debouncedSearch);
          }
          
          if (filterMaterial) {
            params.append('material', filterMaterial);
          }
          
          const response = await api.get(`/quizzes?${params.toString()}`);
          setQuizzes(response.data.quizzes);
          setTotalPages(response.data.pagination.pages);
          setTotalQuizzes(response.data.pagination.total);
        }
      } catch (err) {
        setError('Failed to delete quiz');
      }
    }
  };

  const renderPagination = () => {
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
          Page {page} of {totalPages} ({totalQuizzes} total)
        </span>
        
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={page === totalPages || totalPages === 0}
          className="btn btn-sm btn-outline-primary"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && page === 1) {
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
      
      <div className="filters-container">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="col-md-6">
            <select 
              className="form-select"
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value)}
            >
              <option value="">Filter by study material</option>
              {materials.map(material => (
                <option key={material._id} value={material._id}>
                  {material.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading && <div className="loading mt-3">Loading quizzes...</div>}
      
      {!loading && quizzes.length === 0 ? (
        <div className="empty-state">
          <p>No quizzes found matching your filters.</p>
          {(debouncedSearch || filterMaterial) ? (
            <button 
              className="btn btn-outline-primary"
              onClick={() => {
                setSearchQuery('');
                setFilterMaterial('');
              }}
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/quizzes/generate" className="btn btn-primary">
              Generate Your First Quiz
            </Link>
          )}
        </div>
      ) : (
        <>
          {renderPagination()}
          
          <div className="quiz-list">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="quiz-card">
                <h3>{quiz.title}</h3>
                <div className="quiz-meta">
                  <div className="date">
                    Created: {new Date(quiz.created_at).toLocaleString()}
                  </div>
                  <div className="material">
                    Material: {quiz.material_title}
                  </div>
                </div>
                
                <p className="description">
                  {quiz.description || 'No description provided'}
                </p>
                
                <div className="stats">
                  <span>{quiz.num_questions} questions</span>
                  <span>{quiz.attempt_count} attempts</span>
                </div>
                
                <div className="quiz-actions">
                  <Link 
                    to={`/quizzes/${quiz.id}`} 
                    className="btn btn-primary"
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
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default QuizList;