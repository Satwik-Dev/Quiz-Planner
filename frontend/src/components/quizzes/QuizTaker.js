import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import quizService from '../../services/quizService';

const QuizTaker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const quizData = await quizService.getQuizById(id);
        setQuiz(quizData);
        // Initialize user answers object
        const initialAnswers = {};
        quizData.questions.forEach((_, index) => {
          initialAnswers[index] = null;
        });
        setUserAnswers(initialAnswers);
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load the quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      
      // Skip unanswered questions
      if (userAnswer === null) return;
      
      let isCorrect = false;
      
      switch (question.type) {
        case 'multiple_choice':
          isCorrect = userAnswer === question.correct_answer;
          break;
        case 'true_false':
          isCorrect = userAnswer === question.correct_answer;
          break;
        case 'short_answer':
          // Simple case-insensitive match for short answer
          // In a real app, you might want more sophisticated matching
          isCorrect = userAnswer.toLowerCase().trim() === 
                      question.correct_answer.toLowerCase().trim();
          break;
        default:
          break;
      }
      
      if (isCorrect) correctCount++;
    });
    
    setScore({
      correct: correctCount,
      total: quiz.questions.length,
      percentage: Math.round((correctCount / quiz.questions.length) * 100)
    });
    
    setShowResults(true);
  };

  const restartQuiz = () => {
    // Reset all states
    const initialAnswers = {};
    quiz.questions.forEach((_, index) => {
      initialAnswers[index] = null;
    });
    setUserAnswers(initialAnswers);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setScore({ correct: 0, total: 0 });
  };

  // Helper function to render a question
  const renderQuestion = (question, index) => {
    const userAnswer = userAnswers[index];
    const showFeedback = showResults;
    
    const isCorrect = (() => {
      if (userAnswer === null) return null;
      
      switch (question.type) {
        case 'multiple_choice':
          return userAnswer === question.correct_answer;
        case 'true_false':
          return userAnswer === question.correct_answer;
        case 'short_answer':
          return userAnswer.toLowerCase().trim() === 
                 question.correct_answer.toLowerCase().trim();
        default:
          return false;
      }
    })();

    switch (question.type) {
      case 'multiple_choice':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => !showResults && handleAnswer(option)}
                  disabled={showResults}
                  className={`w-full p-3 border rounded-md text-left ${
                    userAnswer === option
                      ? showFeedback
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-indigo-500 bg-indigo-50'
                      : showFeedback && option === question.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    {showFeedback && option === question.correct_answer && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    {showFeedback && userAnswer === option && !isCorrect && (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
            {showFeedback && (
              <div className={`mt-4 text-sm p-4 rounded-md ${
                isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="font-medium">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        );
      case 'true_false':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div className="space-y-2">
              {[true, false].map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  onClick={() => !showResults && handleAnswer(option)}
                  disabled={showResults}
                  className={`w-full p-3 border rounded-md text-left ${
                    userAnswer === option
                      ? showFeedback
                        ? isCorrect
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-indigo-500 bg-indigo-50'
                      : showFeedback && option === question.correct_answer
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    {showFeedback && option === question.correct_answer && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    {showFeedback && userAnswer === option && !isCorrect && (
                      <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span>{option ? 'True' : 'False'}</span>
                  </div>
                </button>
              ))}
            </div>
            {showFeedback && (
              <div className={`mt-4 text-sm p-4 rounded-md ${
                isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="font-medium">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>
        );
      case 'short_answer':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div>
              <textarea
                value={userAnswer || ''}
                onChange={(e) => !showResults && handleAnswer(e.target.value)}
                disabled={showResults}
                rows={3}
                className={`w-full p-3 border rounded-md ${
                  showFeedback
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                }`}
                placeholder="Type your answer here..."
              />
            </div>
            {showFeedback && (
              <div className={`mt-4 text-sm p-4 rounded-md ${
                isCorrect ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="font-medium">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
                <p className="font-medium mt-1">Expected answer: {question.correct_answer}</p>
                <p className="mt-2">{question.explanation}</p>
              </div>
            )}
          </div>
        );
      default:
        return <p>Unknown question type</p>;
    }
  };

  // Quiz Results Component
  const QuizResults = () => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 text-center">
        <AcademicCapIcon className="h-12 w-12 text-indigo-600 mx-auto" />
        <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
          Quiz Results
        </h3>
        <p className="max-w-2xl text-sm text-gray-500 mt-1">
          You've completed the quiz!
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-indigo-600">
            {score.correct} / {score.total}
          </p>
          <p className="text-xl text-gray-700 mt-1">
            {score.percentage}%
          </p>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
            <div 
              className={`h-2.5 rounded-full ${
                score.percentage >= 70 ? 'bg-green-600' : 
                score.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-600'
              }`}
              style={{ width: `${score.percentage}%` }}
            ></div>
          </div>
          
          <p className="mt-4 text-gray-700">
            {score.percentage >= 90 ? 'Excellent!' : 
             score.percentage >= 70 ? 'Good job!' :
             score.percentage >= 50 ? 'Not bad!' : 'Keep practicing!'}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <p className="text-center text-gray-700 font-medium">What would you like to do next?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={restartQuiz}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Retake Quiz
            </button>
            <Link
              to={`/quizzes/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              Review Quiz
            </Link>
            <Link
              to="/quizzes"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <HomeIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              All Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Quiz not found</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>The requested quiz could not be found.</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate('/quizzes')}
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show results page if quiz is completed
  if (showResults) {
    return <QuizResults />;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const hasAnswer = userAnswers[currentQuestionIndex] !== null;
  const questionsAnswered = Object.values(userAnswers).filter(a => a !== null).length;
  const allQuestionsAnswered = questionsAnswered === quiz.questions.length;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Progress:</span>
            <span className="text-sm font-medium text-indigo-600">{questionsAnswered} / {quiz.questions.length}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200">
          <div 
            className="h-1 bg-indigo-600" 
            style={{ width: `${(questionsAnswered / quiz.questions.length) * 100}%` }}
          ></div>
        </div>
        
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {currentQuestion.type.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          {renderQuestion(currentQuestion, currentQuestionIndex)}
          
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                currentQuestionIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChevronLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Previous
            </button>
            
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                type="button"
                onClick={submitQuiz}
                disabled={!allQuestionsAnswered}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  allQuestionsAnswered
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-indigo-400 cursor-not-allowed'
                }`}
              >
                <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Submit Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-indigo-600 hover:bg-gray-50"
              >
                Next
                <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Question navigation */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-10 w-10 flex items-center justify-center rounded-md text-sm font-medium 
                  ${currentQuestionIndex === index 
                    ? 'bg-indigo-600 text-white' 
                    : userAnswers[index] !== null
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' 
                      : 'bg-gray-100 text-gray-800 border border-gray-300'
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;