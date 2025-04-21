import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  PlayIcon,
  TrashIcon,
  ClockIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import quizService from '../../services/quizService';

const QuizzesList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDelete = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      setQuizzes(quizzes.filter(quiz => quiz.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  // Filter quizzes based on search term
  const filteredQuizzes = quizzes.filter(quiz => 
    !searchTerm || 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
        <Link
          to="/quizzes/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create Quiz
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="relative rounded-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Quizzes list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredQuizzes.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredQuizzes.map(quiz => (
                <li key={quiz.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
                          <AcademicCapIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/quizzes/${quiz.id}`}
                            className="text-lg font-medium text-indigo-600 hover:text-indigo-900"
                          >
                            {quiz.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {quiz.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex space-x-2">
                          <Link
                            to={`/quizzes/take/${quiz.id}`}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <PlayIcon className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm(quiz.id)}
                            className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <TrashIcon className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                            {quiz.num_questions} questions
                          </span>
                          <ClockIcon className="flex-shrink-0 mr-1 h-4 w-4 text-gray-400" />
                          <span>{quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'Unknown date'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delete confirmation */}
                  {showDeleteConfirm === quiz.id && (
                    <div className="px-4 py-3 bg-red-50 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-red-700">
                          Are you sure you want to delete this quiz? This action cannot be undone.
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No quizzes found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Get started by creating a new quiz'}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link
                    to="/quizzes/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Create Quiz
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizzesList;