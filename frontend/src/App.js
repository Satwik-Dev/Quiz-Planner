import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import MaterialsList from './components/materials/MaterialsList';
import CreateMaterial from './components/materials/CreateMaterial';
import MaterialDetail from './components/materials/MaterialDetail';
import QuizList from './components/quizzes/QuizList';
import GenerateQuiz from './components/quizzes/GenerateQuiz';
import TakeQuiz from './components/quizzes/TakeQuiz';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// PrivateRoute component to protect routes that require authentication
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/materials" 
                element={
                  <PrivateRoute>
                    <MaterialsList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/materials/create" 
                element={
                  <PrivateRoute>
                    <CreateMaterial />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/materials/:id" 
                element={
                  <PrivateRoute>
                    <MaterialDetail />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/quizzes" 
                element={
                  <PrivateRoute>
                    <QuizList />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/quizzes/generate" 
                element={
                  <PrivateRoute>
                    <GenerateQuiz />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/quizzes/:id" 
                element={
                  <PrivateRoute>
                    <TakeQuiz />
                  </PrivateRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;