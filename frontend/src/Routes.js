import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AppLayout from './components/layout/AppLayout';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard components
import Dashboard from './components/dashboard/Dashboard';

// Material components
import MaterialsList from './components/materials/MaterialsList';
import MaterialForm from './components/materials/MaterialForm';
import MaterialDetail from './components/materials/MaterialDetail';

// Quiz components
import QuizzesList from './components/quizzes/QuizzesList';
import QuizGenerator from './components/quizzes/QuizGenerator';
import QuizDetail from './components/quizzes/QuizDetail';
import QuizTaker from './components/quizzes/QuizTaker';

// Profile component
import Profile from './components/auth/Profile';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Material routes */}
        <Route path="materials" element={<MaterialsList />} />
        <Route path="materials/new" element={<MaterialForm />} />
        <Route path="materials/:id" element={<MaterialDetail />} />
        <Route path="materials/edit/:id" element={<MaterialForm />} />

        {/* Quiz routes */}
        <Route path="quizzes" element={<QuizzesList />} />
        <Route path="quizzes/new" element={<QuizGenerator />} />
        <Route path="quizzes/:id" element={<QuizDetail />} />
        <Route path="quizzes/take/:id" element={<QuizTaker />} />

        {/* Profile route */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;