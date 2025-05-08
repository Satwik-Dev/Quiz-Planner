import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Materials.css';

const MaterialsList = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await api.get('/materials');
        setMaterials(response.data);
      } catch (err) {
        setError('Failed to fetch study materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      try {
        await api.delete(`/materials/${id}`);
        setMaterials(materials.filter(material => material._id !== id));
      } catch (err) {
        setError('Failed to delete study material');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading study materials...</div>;
  }

  return (
    <div className="materials-container">
      <div className="materials-header">
        <h1>Study Materials</h1>
        <Link to="/materials/create" className="btn btn-primary">
          Create New Material
        </Link>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {materials.length === 0 ? (
        <div className="empty-state">
          <p>You don't have any study materials yet.</p>
          <Link to="/materials/create" className="btn btn-primary">
            Create Your First Study Material
          </Link>
        </div>
      ) : (
        <div className="materials-list">
          {materials.map(material => (
            <div key={material._id} className="material-card">
              <h3>{material.title}</h3>
              <div className="date">
                Created: {new Date(material.created_at).toLocaleDateString()}
              </div>
              <div className="description">
                {material.description || 'No description provided'}
              </div>
              
              {material.tags && material.tags.length > 0 && (
                <div className="tags">
                  {material.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
              
              <div className="material-actions">
                <Link to={`/materials/${material._id}`} className="btn btn-sm btn-outline-primary">
                  View
                </Link>
                <div>
                  <Link 
                    to={`/quizzes/generate?material=${material._id}`} 
                    className="btn btn-sm btn-outline-success me-2"
                  >
                    Generate Quiz
                  </Link>
                  <button 
                    onClick={() => handleDelete(material._id)} 
                    className="btn btn-sm btn-outline-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsList;