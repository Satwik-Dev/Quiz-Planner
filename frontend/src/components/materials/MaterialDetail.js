import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Materials.css';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: ''
  });

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/materials/${id}`);
        const materialData = response.data;
        setMaterial(materialData);
        
        // Initialize form data
        setFormData({
          title: materialData.title,
          content: materialData.content,
          description: materialData.description || '',
          tags: materialData.tags ? materialData.tags.join(', ') : ''
        });
        
      } catch (err) {
        setError('Failed to fetch study material');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedMaterial = {
        title: formData.title,
        content: formData.content,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      await api.put(`/materials/${id}`, updatedMaterial);
      
      // Update local state
      setMaterial({
        ...material,
        ...updatedMaterial
      });
      
      setEditing(false);
    } catch (err) {
      setError('Failed to update study material');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      try {
        await api.delete(`/materials/${id}`);
        navigate('/materials');
      } catch (err) {
        setError('Failed to delete study material');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading study material...</div>;
  }

  if (!material) {
    return <div className="error-state">Study material not found</div>;
  }

  return (
    <div className="material-detail-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {editing ? (
        <div className="edit-material-form">
          <h2>Edit Study Material</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-control"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                name="content"
                className="form-control"
                rows="12"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="form-control"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="material-detail">
          <div className="material-header">
            <h1>{material.title}</h1>
            <div className="header-actions">
              <button 
                onClick={() => setEditing(true)} 
                className="btn btn-outline-primary me-2"
              >
                Edit
              </button>
              <button 
                onClick={handleDelete} 
                className="btn btn-outline-danger"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="material-meta">
            <div className="date">
              Created: {new Date(material.created_at).toLocaleDateString()}
            </div>
            
            {material.description && (
              <div className="description">
                <h3>Description</h3>
                <p>{material.description}</p>
              </div>
            )}
            
            {material.tags && material.tags.length > 0 && (
              <div className="tags-container">
                <h3>Tags</h3>
                <div className="tags">
                  {material.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="material-content">
            <h3>Content</h3>
            <div className="content-box">
              {material.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          
          <div className="material-actions-bar">
            <Link to="/materials" className="btn btn-secondary">
              Back to Materials
            </Link>
            <Link 
              to={`/quizzes/generate?material=${material._id}`}
              className="btn btn-primary"
            >
              Generate Quiz
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDetail;