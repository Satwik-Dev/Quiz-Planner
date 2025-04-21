import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import materialService from '../../services/materialService';
import quizService from '../../services/quizService';

const QuizGenerator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMaterialId = queryParams.get('materialId');

  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(initialMaterialId || '');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    num_questions: 5,
    question_types: ['multiple_choice', 'true_false', 'short_answer']
  });
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setFetchingMaterials(true);
        const data = await materialService.getAllMaterials();
        setMaterials(data);
        
        // If there's a selected material ID, populate the form with its title
        if (initialMaterialId) {
          const selected = data.find(m => m._id === initialMaterialId);
          if (selected) {
            setFormData({
              ...formData,
              title: `Quiz on ${selected.title}`,
              description: `Generated quiz based on ${selected.title}`
            });
          }
        }
      } catch (error) {
        console.error('Error fetching materials:', error);
        setError('Failed to load study materials. Please try again.');
      } finally {
        setFetchingMaterials(false);
      }
    };

    fetchMaterials();
  }, [initialMaterialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        question_types: [...formData.question_types, value]
      });
    } else {
      setFormData({
        ...formData,
        question_types: formData.question_types.filter(type => type !== value)
      });
    }
  };

  const handleMaterialChange = (e) => {
    const materialId = e.target.value;
    setSelectedMaterial(materialId);
    
    // Update title and description based on selected material
    if (materialId) {
      const selected = materials.find(m => m._id === materialId);
      if (selected) {
        setFormData({
          ...formData,
          title: `Quiz on ${selected.title}`,
          description: `Generated quiz based on ${selected.title}`
        });
      }
    } else {
      setFormData({
        ...formData,
        title: '',
        description: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate the form
    if (!selectedMaterial) {
      setError('Please select a study material');
      return;
    }
    
    if (formData.question_types.length === 0) {
      setError('Please select at least one question type');
      return;
    }

    setGeneratingQuiz(true);
    
    try {
      const quizData = {
        material_id: selectedMaterial,
        title: formData.title,
        description: formData.description,
        num_questions: parseInt(formData.num_questions),
        question_types: formData.question_types
      };
      
      const response = await quizService.generateQuiz(quizData);
      setSuccess(`Quiz "${response.title}" generated successfully with ${response.num_questions} questions!`);
      
      // Navigate to the quiz after a brief delay
      setTimeout(() => {
        navigate(`/quizzes/${response.quiz_id}`);
      }, 1500);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Generate Quiz
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a quiz based on your study materials using AI.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">{success}</h3>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Study Material Selection */}
          <div>
            <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">
              Study Material *
            </label>
            <select
              id="materialId"
              name="materialId"
              value={selectedMaterial}
              onChange={handleMaterialChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={fetchingMaterials}
            >
              <option value="">Select a study material</option>
              {materials.map((material) => (
                <option key={material._id} value={material._id}>
                  {material.title}
                </option>
              ))}
            </select>
            {fetchingMaterials && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading materials...
              </div>
            )}
          </div>

          {/* Quiz Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Quiz Title *
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter a title for your quiz"
            />
          </div>

          {/* Quiz Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Brief description of the quiz"
            />
          </div>

          {/* Number of Questions */}
          <div>
            <label htmlFor="num_questions" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <select
              id="num_questions"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {[3, 5, 10, 15, 20].map((num) => (
                <option key={num} value={num}>
                  {num} questions
                </option>
              ))}
            </select>
          </div>

          {/* Question Types */}
          <div>
            <fieldset>
              <legend className="text-sm font-medium text-gray-700">Question Types</legend>
              <div className="mt-2 space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="multiple_choice"
                      name="question_types"
                      type="checkbox"
                      value="multiple_choice"
                      checked={formData.question_types.includes('multiple_choice')}
                      onChange={handleCheckboxChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="multiple_choice" className="font-medium text-gray-700">
                      Multiple Choice
                    </label>
                    <p className="text-gray-500">Questions with multiple options and one correct answer</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="true_false"
                      name="question_types"
                      type="checkbox"
                      value="true_false"
                      checked={formData.question_types.includes('true_false')}
                      onChange={handleCheckboxChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="true_false" className="font-medium text-gray-700">
                      True/False
                    </label>
                    <p className="text-gray-500">Questions with True or False answers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="short_answer"
                      name="question_types"
                      type="checkbox"
                      value="short_answer"
                      checked={formData.question_types.includes('short_answer')}
                      onChange={handleCheckboxChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="short_answer" className="font-medium text-gray-700">
                      Short Answer
                    </label>
                    <p className="text-gray-500">Questions that require a written response</p>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <LightBulbIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Tips for better quizzes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Choose study materials with clear and concise content</li>
                  <li>Include multiple question types for a diverse learning experience</li>
                  <li>If AI-generated questions aren't relevant, try editing your study material to be more focused</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/quizzes')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={generatingQuiz || fetchingMaterials}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {generatingQuiz ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Quiz...
              </>
            ) : (
              <>
                <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Generate Quiz
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizGenerator;