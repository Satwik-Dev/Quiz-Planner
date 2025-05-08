import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Quizzes.css';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        console.log('Fetching quiz with ID:', id); // Debug log
        const response = await api.get(`/quizzes/${id}`);
        setQuiz(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching quiz:', err);
        if (err.response?.status === 404) {
          setError('Quiz not found. It may have been deleted or you do not have access to it.');
        } else {
          setError('Failed to fetch quiz. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  const handleAnswerChange = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question before submitting.');
      return;
    }

    if (!window.confirm('Are you sure you want to submit this quiz? You cannot change your answers after submission.')) {
      return;
    }

    try {
      console.log('Submitting answers for quiz:', id); // Debug log
      const response = await api.post(`/quizzes/${id}/attempt`, {
        answers
      });
      
      setResults(response.data);
      setQuizSubmitted(true);
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again later.');
    }
  };

  if (loading) {
    return <div className="loading">Loading quiz...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="alert alert-danger">{error}</div>
        <Link to="/quizzes" className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="error-state">
        <div className="alert alert-danger">Quiz not found</div>
        <Link to="/quizzes" className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  // Render the question based on its type
  const renderQuestion = () => {
    const question = quiz.questions[currentQuestion];
    
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className="question-container">
            <div className="question-text">{question.question}</div>
            <div className="options-container">
              {question.options.map((option, index) => (
                <div 
                  key={index}
                  className={`option ${answers[currentQuestion] === option ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(option)}
                >
                  <span>{String.fromCharCode(65 + index)}.</span> {option}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'true_false':
        return (
          <div className="question-container">
            <div className="question-text">{question.question}</div>
            <div className="options-container">
              <div 
                className={`option ${answers[currentQuestion] === true ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(true)}
              >
                True
              </div>
              <div 
                className={`option ${answers[currentQuestion] === false ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(false)}
              >
                False
              </div>
            </div>
          </div>
        );
        
      case 'short_answer':
        return (
          <div className="question-container">
            <div className="question-text">{question.question}</div>
            <div className="short-answer">
              <textarea
                className="form-control"
                rows="3"
                value={answers[currentQuestion] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
              ></textarea>
            </div>
          </div>
        );
        
      default:
        return <div>Unknown question type</div>;
    }
  };

  const renderResults = () => {
    return (
      <div className="quiz-results">
        <h2>Quiz Results</h2>
        
        <div className="result-summary">
          <div>
            <span className="score">Score: {results.score}/{results.total_questions}</span>
            <span className="percentage">({results.percentage.toFixed(1)}%)</span>
          </div>
          <div>
            <Link to={`/quizzes/${id}`} className="btn btn-primary me-2">
              Retake Quiz
            </Link>
            <Link to="/quizzes" className="btn btn-outline-primary">
              Back to Quizzes
            </Link>
          </div>
        </div>
        
        <div className="results-details">
          {results.results.map((result, index) => (
            <div key={index} className={`result-item ${result.correct ? 'correct' : 'incorrect'}`}>
              <div className="result-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="result-status">{result.correct ? 'Correct' : 'Incorrect'}</span>
              </div>
              
              <div className="question-text">
                {quiz.questions[index].question}
              </div>
              
              <div className="answer-info">
                <div className="your-answer">
                  <strong>Your answer:</strong> {
                    typeof answers[index] === 'boolean' 
                      ? answers[index] ? 'True' : 'False' 
                      : answers[index] || 'No answer'
                  }
                </div>
                <div className="correct-answer">
                  <strong>Correct answer:</strong> {
                    typeof result.correct_answer === 'boolean'
                      ? result.correct_answer ? 'True' : 'False'
                      : result.correct_answer
                  }
                </div>
              </div>
              
              <div className="explanation">
                <strong>Explanation:</strong> {result.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="take-quiz-container">
      {error && <div className="alert alert-danger">{error}</div>}
      
      {quizSubmitted ? (
        renderResults()
      ) : (
        <>
          <div className="quiz-header">
            <h1>{quiz.title}</h1>
            <div className="quiz-progress">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>
          
          {renderQuestion()}
          
          <div className="quiz-navigation">
            <button 
              onClick={goToPreviousQuestion} 
              className="btn btn-secondary"
              disabled={currentQuestion === 0}
            >
              Previous
            </button>
            
            {currentQuestion < quiz.questions.length - 1 ? (
              <button 
                onClick={goToNextQuestion} 
                className="btn btn-primary"
              >
                Next
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                className="btn btn-success"
              >
                Submit Quiz
              </button>
            )}
          </div>
          
          <div className="question-navigation">
            {quiz.questions.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`question-dot ${currentQuestion === index ? 'active' : ''} ${answers[index] !== undefined ? 'answered' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TakeQuiz;