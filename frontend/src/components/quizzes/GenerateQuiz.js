import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Quizzes.css';

const GenerateQuiz = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(3);
  const [questionTypes, setQuestionTypes] = useState({
    multiple_choice: true,
    true_false: true,
    short_answer: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get('/materials');
        setMaterials(response.data);
      } catch (err) {
        setError('Failed to fetch study materials');
      } finally {
        setFetchingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Convert question types object to array
      const selectedTypes = Object.keys(questionTypes).filter(type => questionTypes[type]);
      
      if (selectedTypes.length === 0) {
        throw new Error('Please select at least one question type');
      }
      
      const quizData = {
        material_id: selectedMaterialId,
        title: title || undefined,
        num_questions: numQuestions,
        question_types: selectedTypes
      };
      
      const response = await api.post('/quizzes/generate', quizData);
      navigate(`/quizzes/${response.data.quiz_id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (fetchingMaterials) {
    return <div className="loading">Loading study materials...</div>;
  }

  return (
    <div className="quiz-form-container">
      <h2>Generate Quiz</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {materials.length === 0 ? (
        <div className="alert alert-info">
          You don't have any study materials yet. 
          <button 
            className="btn btn-link" 
            onClick={() => navigate('/materials/create')}
          >
            Create one now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="material">Select Study Material</label>
            <select
              id="material"
              className="form-control"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              required
            >
              <option value="">-- Select a study material --</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.title}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="title">Quiz Title (Optional)</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leave blank to use material title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="numQuestions">Number of Questions</label>
            <input
              type="number"
              id="numQuestions"
              className="form-control"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              min="1"
              max="10"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Question Types</label>
            <div className="question-types">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="multipleChoice"
                  className="form-check-input"
                  checked={questionTypes.multiple_choice}
                  onChange={() => handleQuestionTypeChange('multiple_choice')}
                />
                <label className="form-check-label" htmlFor="multipleChoice">
                  Multiple Choice
                </label>
              </div>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="trueFalse"
                  className="form-check-input"
                  checked={questionTypes.true_false}
                  onChange={() => handleQuestionTypeChange('true_false')}
                />
                <label className="form-check-label" htmlFor="trueFalse">
                  True/False
                </label>
              </div>
              
              <div className="form-check">
                <input
                  type="checkbox"
                  id="shortAnswer"
                  className="form-check-input"
                  checked={questionTypes.short_answer}
                  onChange={() => handleQuestionTypeChange('short_answer')}
                />
                <label className="form-check-label" htmlFor="shortAnswer">
                  Short Answer
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/quizzes')}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !selectedMaterialId}
            >
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GenerateQuiz;