import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  PlayIcon,
  TrashIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import quizService from '../../services/quizService';
import materialService from '../../services/materialService';

const QuizDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        setLoading(true);
        const quizData = await quizService.getQuizById(id);
        setQuiz(quizData);
        
        // Fetch associated material
        if (quizData.material_id) {
          try {
            const materialData = await materialService.getMaterialById(quizData.material_id);
            setMaterial(materialData);
          } catch (err) {
            console.error('Error fetching material:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching quiz:', error);
        setError('Failed to load the quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const handleDelete = async () => {
    try {
      await quizService.deleteQuiz(id);
      navigate('/quizzes');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      setError('Failed to delete the quiz. Please try again.');
    }
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

  // Helper function to render a question
  const renderQuestion = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-md ${
                    option === question.correct_answer 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {option === question.correct_answer && (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    )}
                    <span>{option}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm bg-gray-50 p-4 rounded-md">
              <p className="font-medium text-gray-900">Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
        );
      case 'true_false':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div className="space-y-2">
              <div 
                className={`p-3 border rounded-md ${
                  question.correct_answer 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {question.correct_answer && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <span>True</span>
                </div>
              </div>
              <div 
                className={`p-3 border rounded-md ${
                  !question.correct_answer 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {!question.correct_answer && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  <span>False</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm bg-gray-50 p-4 rounded-md">
              <p className="font-medium text-gray-900">Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
        );
      case 'short_answer':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
            <div className="p-3 border rounded-md border-green-300 bg-green-50">
              <p className="font-medium">Expected Answer:</p>
              <p>{question.correct_answer}</p>
            </div>
            <div className="mt-4 text-sm bg-gray-50 p-4 rounded-md">
              <p className="font-medium text-gray-900">Explanation:</p>
              <p className="text-gray-700">{question.explanation}</p>
            </div>
          </div>
        );
      default:
        return <p>Unknown question type</p>;
    }
  };

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

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const questionTypeCounts = quiz.questions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {quiz.title}
          </h2>
          {quiz.description && (
            <p className="mt-1 text-sm text-gray-500">
              {quiz.description}
            </p>
          )}
          {material && (
            <p className="mt-1 text-sm">
              Based on: {' '}
              <Link 
                to={`/materials/${material._id}`} 
                className="text-indigo-600 hover:text-indigo-900"
              >
                {material.title}
              </Link>
            </p>
          )}
        </div>
        <div className="mt-5 flex xl:mt-0">
          <span className="hidden sm:block ml-3">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <TrashIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
              Delete
            </button>
          </span>

          <span className="sm:ml-3">
            <Link
              to={`/quizzes/take/${id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Take Quiz
            </Link>
          </span>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quiz Details</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Total questions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {quiz.questions.length}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(quiz.created_at).toLocaleString()}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Last updated</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(quiz.updated_at).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg col-span-2">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Question Types</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-indigo-800">Multiple Choice</p>
                    <p className="text-lg font-semibold text-indigo-900">
                      {questionTypeCounts['multiple_choice'] || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-2">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-blue-800">True/False</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {questionTypeCounts['true_false'] || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                    <AcademicCapIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4">
                    <p className="text-xs font-medium text-purple-800">Short Answer</p>
                    <p className="text-lg font-semibold text-purple-900">
                      {questionTypeCounts['short_answer'] || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Preview */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {currentQuestion.type.replace('_', ' ')}
          </span>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          {renderQuestion(currentQuestion)}
          
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
            <div className="flex-1 text-center">
              <Link
                to={`/quizzes/take/${id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Take Full Quiz
              </Link>
            </div>
            <button
              type="button"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === quiz.questions.length - 1}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                currentQuestionIndex === quiz.questions.length - 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
              <ChevronRightIcon className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Delete quiz
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this quiz? All of your data will be permanently
                      removed. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizDetail;