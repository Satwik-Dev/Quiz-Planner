import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Materials.css';

const CreateMaterial = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const materialData = {
        title,
        content,
        description,
        tags: tagsArray
      };
      
      await api.post('/materials', materialData);
      navigate('/materials');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="material-form-container">
      <h2>Create Study Material</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            type="text"
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            className="form-control"
            rows="10"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            className="form-control"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="python, programming, tutorial"
          />
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/materials')}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMaterial;