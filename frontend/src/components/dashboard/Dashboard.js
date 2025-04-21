import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  DocumentPlusIcon,
  AcademicCapIcon,
  ClockIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AuthContext from '../../contexts/AuthContext';
import materialService from '../../services/materialService';
import quizService from '../../services/quizService';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalQuizzes: 0,
    recentMaterials: [],
    recentQuizzes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch materials and quizzes
        const materials = await materialService.getAllMaterials();
        const quizzes = await quizService.getAllQuizzes();
        
        // Sort by created date to get most recent
        const sortedMaterials = [...materials].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        const sortedQuizzes = [...quizzes].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        
        setStats({
          totalMaterials: materials.length,
          totalQuizzes: quizzes.length,
          recentMaterials: sortedMaterials.slice(0, 3),
          recentQuizzes: sortedQuizzes.slice(0, 3)
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Data for quiz types chart
  const quizTypesData = [
    { name: 'Multiple Choice', value: stats.recentQuizzes.reduce((acc, quiz) => {
      return acc + (quiz.num_questions || 0) * 0.6; // Assuming 60% are multiple choice
    }, 0)},
    { name: 'True/False', value: stats.recentQuizzes.reduce((acc, quiz) => {
      return acc + (quiz.num_questions || 0) * 0.2; // Assuming 20% are true/false
    }, 0)},
    { name: 'Short Answer', value: stats.recentQuizzes.reduce((acc, quiz) => {
      return acc + (quiz.num_questions || 0) * 0.2; // Assuming 20% are short answer
    }, 0)}
  ];

  const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe'];

  const StatCard = ({ title, value, icon: Icon, color, textColor }) => (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${color}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-10 w-10 ${textColor}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                <span className="sr-only">Increased by</span>
                New
              </div>
            </dd>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back, {user?.name || 'User'}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard 
          title="Total Study Materials" 
          value={stats.totalMaterials} 
          icon={DocumentPlusIcon}
          color="border-l-4 border-blue-500"
          textColor="text-blue-500"
        />
        <StatCard 
          title="Total Quizzes" 
          value={stats.totalQuizzes} 
          icon={AcademicCapIcon}
          color="border-l-4 border-purple-500"
          textColor="text-purple-500"
        />
      </div>

      {/* Quick actions */}
      <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/materials/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <DocumentPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Add Study Material
            </Link>
            <Link
              to="/quizzes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <AcademicCapIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Generate Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Materials</h2>
            <Link
              to="/materials"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {stats.recentMaterials.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.recentMaterials.map((material) => (
                  <li key={material._id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <DocumentPlusIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <Link
                        to={`/materials/${material._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {material.title}
                      </Link>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>{new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-3">No materials yet. Create your first one!</p>
            )}
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Quizzes</h2>
            <Link
              to="/quizzes"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              View all
            </Link>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {stats.recentQuizzes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {stats.recentQuizzes.map((quiz) => (
                  <li key={quiz.id} className="py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-6 w-6 text-gray-400 mr-3" />
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {quiz.title}
                      </Link>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                        {quiz.num_questions} Questions
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-3">No quizzes yet. Generate your first one!</p>
            )}
          </div>
        </div>
      </div>

      {/* Question Types Chart */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Question Types Distribution</h2>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stats.totalQuizzes > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quizTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {quizTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => Math.round(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">
              Generate quizzes to see question type statistics
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;